import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const HUBSPOT_API = "https://api.hubapi.com";

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

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.HUBSPOT_ACCESS_TOKEN;
        if (!token) {
          return json({ error: "Integração com HubSpot não configurada." }, 500);
        }

        let data: Payload;
        try {
          data = (await request.json()) as Payload;
        } catch {
          return json({ error: "Requisição inválida." }, 400);
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

        try {
          // Cria; se já existir (409), atualiza pelo e-mail — evita duplicados.
          const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
            method: "POST",
            headers,
            body: JSON.stringify({ properties }),
          });

          if (createRes.ok) {
            return json({ success: true, created: true });
          }

          const errorBody = await createRes.text();

          if (createRes.status === 409) {
            const updateRes = await fetch(
              `${HUBSPOT_API}/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`,
              { method: "PATCH", headers, body: JSON.stringify({ properties }) },
            );
            if (updateRes.ok) return json({ success: true, created: false });
            const updateError = await updateRes.text();
            console.error(`HubSpot update failed [${updateRes.status}]: ${updateError}`);
            return json({ error: "Não foi possível atualizar seu contato." }, 502);
          }

          console.error(`HubSpot create failed [${createRes.status}]: ${errorBody}`);
          return json({ error: "Não foi possível enviar seu contato." }, 502);
        } catch (err) {
          console.error("HubSpot request error", err);
          return json({ error: "Falha de comunicação com o HubSpot." }, 502);
        }
      },
    },
  },
});
