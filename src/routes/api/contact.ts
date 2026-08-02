import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const HUBSPOT_API = "https://api.hubapi.com";

const isDev = process.env.NODE_ENV !== "production";

type Payload = {
  nome?: string;
  sobrenome?: string;
  empresa?: string;
  email?: string;
  telefone?: string;
  produto?: string;
  mensagem?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Loga o erro completo e monta a resposta JSON, detalhada em dev e genérica em prod. */
function hubspotError(message: string, err: unknown, status = 502) {
  const detail =
    (err as { response?: { data?: unknown } })?.response?.data ||
    (err instanceof Error ? err.message : undefined) ||
    err;
  console.error(message, detail);
  return json(
    isDev ? { error: message, detail: typeof detail === "string" ? detail : JSON.stringify(detail) } : { error: message },
    status,
  );
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Valida existência do token antes de qualquer chamada ao HubSpot.
        const token = process.env.HUBSPOT_ACCESS_TOKEN;
        console.log("Token carregado:", token?.slice(0, 12));
        console.log("Comprimento:", token?.length);
        if (!token) {
          const err = "HUBSPOT_ACCESS_TOKEN não definido nas variáveis de ambiente.";
          console.error(err);
          return json(isDev ? { error: err } : { error: "Integração com HubSpot não configurada." }, 500);
        }

        let data: Payload;
        try {
          data = (await request.json()) as Payload;
        } catch (err) {
          return hubspotError("Requisição inválida (JSON malformado).", err, 400);
        }

        const nome = (data.nome ?? "").trim().slice(0, 100);
        const sobrenome = (data.sobrenome ?? "").trim().slice(0, 100);
        const empresa = (data.empresa ?? "").trim().slice(0, 150);
        const email = (data.email ?? "").trim().toLowerCase().slice(0, 255);
        const telefone = (data.telefone ?? "").trim().slice(0, 40);
        const produto = (data.produto ?? "").trim().slice(0, 150);
        const mensagem = (data.mensagem ?? "").trim().slice(0, 2000);

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!nome || !emailOk || !empresa) {
          return json({ error: "Preencha nome, empresa e um e-mail válido." }, 400);
        }

        const properties: Record<string, string> = {
          email,
          firstname: nome,
          ...(sobrenome ? { lastname: sobrenome } : {}),
          company: empresa,
          ...(telefone ? { phone: telefone } : {}),
        };

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        /** Associação oficial v4 usando labels default entre dois objetos. */
        async function associateDefault(
          fromType: string,
          fromId: string,
          toType: string,
          toId: string,
        ) {
          const res = await fetch(
            `${HUBSPOT_API}/crm/v4/objects/${fromType}/${fromId}/associations/default/${toType}/${toId}`,
            { method: "PUT", headers },
          );
          if (!res.ok) {
            const body = await res.text();
            throw new Error(`association ${fromType}->${toType} [${res.status}]: ${body}`);
          }
        }

        let contactId: string | null = null;

        try {
          // Cria; se já existir (409), atualiza pelo e-mail — evita duplicados.
          const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
            method: "POST",
            headers,
            body: JSON.stringify({ properties }),
          });

          let created = false;

          if (createRes.ok) {
            const body = (await createRes.json()) as { id?: string };
            contactId = body.id ?? null;
            created = true;
          } else {
            const errorBody = await createRes.text();

            if (createRes.status === 409) {
              const updateRes = await fetch(
                `${HUBSPOT_API}/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`,
                { method: "PATCH", headers, body: JSON.stringify({ properties }) },
              );
              if (!updateRes.ok) {
                const updateError = await updateRes.text();
                return hubspotError(
                  `HubSpot update failed [${updateRes.status}]`,
                  { response: { data: updateError } },
                  502,
                );
              }
              const body = (await updateRes.json()) as { id?: string };
              contactId = body.id ?? null;
            } else {
              return hubspotError(
                `HubSpot create failed [${createRes.status}]`,
                { response: { data: errorBody } },
                502,
              );
            }
          }

          // Deal no pipeline "Novos Leads", associado ao contato via Associations API v4.
          let dealId: string | null = null;
          let dealError: string | null = null;
          try {
            const pipelinesRes = await fetch(`${HUBSPOT_API}/crm/v3/pipelines/deals`, { headers });
            if (!pipelinesRes.ok) {
              const body = await pipelinesRes.text();
              throw new Error(`pipelines [${pipelinesRes.status}]: ${body}`);
            }
            const pipelines = (await pipelinesRes.json()) as {
              results?: Array<{
                id: string;
                label: string;
                displayOrder?: number;
                stages?: Array<{ id: string; label: string; displayOrder: number }>;
              }>;
            };
            const all = pipelines.results ?? [];
            const norm = (s: string) =>
              s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
            // "Novos Leads" quando existir; senão o pipeline default da conta.
            const pipeline =
              all.find((p) => norm(p.label) === "novos leads") ??
              all.find((p) => p.id === "default") ??
              all[0];

            if (!pipeline) {
              throw new Error("nenhum pipeline de negócios encontrado");
            }
            if (norm(pipeline.label) !== "novos leads") {
              console.warn(
                `Pipeline "Novos Leads" não encontrado; usando "${pipeline.label}" como fallback.`,
              );
            }

            const firstStage = [...(pipeline.stages ?? [])].sort(
              (a, b) => a.displayOrder - b.displayOrder,
            )[0];

            const dealPayload = {
              properties: {
                dealname: `${empresa} - ${[nome, sobrenome].filter(Boolean).join(" ")}`,
                pipeline: pipeline.id,
                ...(firstStage ? { dealstage: firstStage.id } : {}),
                // "Qual produto tem mais interesse?" -> Descrição do negócio
                description: produto
                  ? `Produto de interesse: ${produto}`
                  : "Lead do formulário do site",
              },
            };

            const dealRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals`, {
              method: "POST",
              headers,
              body: JSON.stringify(dealPayload),
            });
            if (!dealRes.ok) {
              const body = await dealRes.text();
              throw new Error(`deal [${dealRes.status}]: ${body}`);
            }
            const dealBody = (await dealRes.json()) as { id?: string };
            dealId = dealBody.id ?? null;

            // Associação explícita Contato <-> Deal (não depende do payload de criação).
            if (dealId && contactId) {
              await associateDefault("deals", dealId, "contacts", contactId);
            }
          } catch (dealErr) {
            // O contato já foi salvo — não falhamos o envio por causa do deal.
            dealError = dealErr instanceof Error ? dealErr.message : String(dealErr);
            console.error("HubSpot deal creation failed", dealError);
          }


          // "Informações adicionais" -> Nota associada ao contato e ao deal.
          let noteId: string | null = null;
          if (mensagem) {
            try {
              const noteRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/notes`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  properties: {
                    hs_note_body: mensagem,
                    hs_timestamp: new Date().toISOString(),
                  },
                }),
              });
              if (!noteRes.ok) {
                const body = await noteRes.text();
                throw new Error(`note [${noteRes.status}]: ${body}`);
              }
              const noteBody = (await noteRes.json()) as { id?: string };
              noteId = noteBody.id ?? null;

              if (noteId && contactId) {
                await associateDefault("notes", noteId, "contacts", contactId);
              }
              if (noteId && dealId) {
                await associateDefault("notes", noteId, "deals", dealId);
              }
            } catch (noteErr) {
              console.error("HubSpot note creation failed", noteErr);
            }
          }

          return json({
            success: true,
            created,
            contactId,
            dealId,
            noteId,
            ...(dealError && isDev ? { dealError } : {}),
          });
        } catch (err) {
          return hubspotError("Falha de comunicação com o HubSpot.", err, 502);
        }

      },
    },
  },
});
