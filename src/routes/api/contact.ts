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
          ...(mensagem || produto
            ? { message: [produto ? `Produto de interesse: ${produto}` : "", mensagem].filter(Boolean).join("\n\n") }
            : {}),
        };

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

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

          // Deal no pipeline "Novos Leads", associado ao contato.
          let dealId: string | null = null;
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
                stages?: Array<{ id: string; label: string; displayOrder: number }>;
              }>;
            };
            const pipeline =
              pipelines.results?.find(
                (p) => p.label.trim().toLowerCase() === "novos leads",
              ) ?? null;

            if (!pipeline) {
              throw new Error('pipeline "Novos Leads" não encontrado');
            }

            const firstStage = [...(pipeline.stages ?? [])].sort(
              (a, b) => a.displayOrder - b.displayOrder,
            )[0];

            const dealPayload = {
              properties: {
                dealname: `${empresa} - ${[nome, sobrenome].filter(Boolean).join(" ")}`,
                pipeline: pipeline.id,
                ...(firstStage ? { dealstage: firstStage.id } : {}),
              },
              ...(contactId
                ? {
                    associations: [
                      {
                        to: { id: contactId },
                        types: [
                          {
                            associationCategory: "HUBSPOT_DEFINED",
                            // deal_to_contact
                            associationTypeId: 3,
                          },
                        ],
                      },
                    ],
                  }
                : {}),
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
          } catch (dealErr) {
            // O contato já foi salvo — não falhamos o envio por causa do deal,
            // mas logamos o erro completo para diagnóstico.
            console.error("HubSpot deal creation failed", dealErr);
          }

          return json({ success: true, created, contactId, dealId });
        } catch (err) {
          return hubspotError("Falha de comunicação com o HubSpot.", err, 502);
        }
      },
    },
  },
});
