import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Linkedin, Instagram, Menu, X } from "lucide-react";
import logoAsset from "@/assets/ka-lab-logo.asset.json";

const LINKEDIN_URL = "https://www.linkedin.com/company/kalabgrowth";
const INSTAGRAM_URL = "https://www.instagram.com/kalabgrowth";

const navLinks = [
  { href: "#manifesto", label: "Essência" },
  { href: "#servicos", label: "Serviços" },
  { href: "#jornada", label: "Jornada" },
  { href: "#filosofia", label: "Filosofia" },
  { href: "#contato", label: "Contato" },
];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "KA LAB Growth — Consultoria em Growth e RevOps para líderes negros e LGBTQIA+" },
      {
        name: "description",
        content:
          "Consultoria B2B em Growth, RevOps e ABM para empresas lideradas por pessoas negras e LGBTQIA+. Diagnóstico, Sprint Revenue System e Advisory estratégico para escalar receita com dados.",
      },
      {
        name: "keywords",
        content:
          "consultoria growth, revops, consultoria b2b, ABM, CRM, funil comercial, diversidade, liderança negra, LGBTQIA+, KA Lab, KA Lab Growth",
      },
      { property: "og:title", content: "KA LAB Growth — Growth & RevOps para lideranças diversas" },
      {
        property: "og:description",
        content:
          "Escalamos empresas B2B lideradas por pessoas negras e LGBTQIA+ com inteligência em Growth, RevOps e ABM.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: logoAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "KA LAB Growth" },
      {
        name: "twitter:description",
        content: "Growth & RevOps para empresas B2B lideradas por pessoas negras e LGBTQIA+.",
      },
      { name: "twitter:image", content: logoAsset.url },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "KA LAB Growth",
          description:
            "Consultoria em Growth e RevOps para empresas B2B lideradas por pessoas negras e LGBTQIA+.",
          url: "https://www.kalabgrowth.com",
          logo: logoAsset.url,
          areaServed: "BR",
          serviceType: [
            "Consultoria em Growth",
            "RevOps",
            "ABM",
            "Estruturação de CRM",
            "Advisory Comercial",
          ],
        }),
      },
    ],
  }),
});

const services = [
  {
    title: "Diagnóstico Revenue Growth",
    description: "Diagnóstico completo de Growth, CRM, RevOps e operação comercial.",
    items: [
      "Diagnóstico Comercial",
      "Diagnóstico CRM",
      "Diagnóstico Growth",
      "Diagnóstico RevOps",
      "Roadmap de 90 dias",
    ],
  },
  {
    title: "Sprint Revenue System",
    description: "Estruturação completa de uma operação previsível de crescimento.",
    items: [
      "ICP",
      "Segmentação",
      "Estratégia ABM",
      "Estruturação CRM",
      "Funil Comercial",
      "Processo SDR",
      "Dashboard",
      "Governança Comercial",
    ],
  },
  {
    title: "Advisory Growth & RevOps",
    description: "Acompanhamento estratégico para acelerar crescimento e receita.",
    items: [
      "Reuniões quinzenais",
      "Revisão de pipeline",
      "Forecast",
      "Métricas",
      "Plano de ação",
    ],
  },
];

const journey = [
  {
    numeral: "I",
    title: "Alinhamento de Visão",
    body: "Iniciamos com um diagnóstico profundo para entender as particularidades da sua liderança e os desafios do seu nicho B2B atual.",
  },
  {
    numeral: "II",
    title: "Implementação Direta",
    body: "Foco em resultados imediatos. Executamos mudanças estruturais para que a operação ganhe tração com agilidade e precisão.",
  },
  {
    numeral: "III",
    title: "Soberania de Dados",
    body: "Capacitamos sua gestão com BI. Substituímos intuições por métricas sólidas que validam o sucesso da sua empresa inclusiva.",
  },
];

const philosophy = [
  {
    n: "01",
    title: "Ética e ROI",
    body: "Crescimento não é nada sem integridade. Medimos o sucesso pelo impacto financeiro e pela solidez da sua marca.",
  },
  {
    n: "02",
    title: "Agilidade Real",
    body: "Processos dinâmicos para quem não pode perder tempo. Iteramos rápido para garantir sua vantagem competitiva.",
  },
  {
    n: "03",
    title: "Inovação Tech",
    body: "IA e tecnologia de ponta a serviço da inclusão, removendo barreiras humanas e otimizando cada centavo investido.",
  },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3" onClick={closeMenu}>
            <img src={logoAsset.url} alt="KA LAB Growth" className="h-11 w-11 rounded-full" />
            <span className="font-display text-lg tracking-wide">
              KA <span className="text-gold-gradient">LAB</span>
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-gold transition">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <SocialIcon href={LINKEDIN_URL} label="LinkedIn da KA LAB Growth">
              <Linkedin size={16} />
            </SocialIcon>
            <SocialIcon href={INSTAGRAM_URL} label="Instagram da KA LAB Growth">
              <Instagram size={16} />
            </SocialIcon>
            <a href="#contato" className="btn-gold rounded-full px-5 py-2 text-sm font-medium">
              Falar com a KA
            </a>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 text-gold"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md">
            <ul className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={closeMenu}
                    className="block py-3 text-base text-foreground hover:text-gold border-b border-border/40"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 px-6 pb-6">
              <div className="flex items-center gap-3">
                <SocialIcon href={LINKEDIN_URL} label="LinkedIn da KA LAB Growth">
                  <Linkedin size={16} />
                </SocialIcon>
                <SocialIcon href={INSTAGRAM_URL} label="Instagram da KA LAB Growth">
                  <Instagram size={16} />
                </SocialIcon>
              </div>
              <a
                href="#contato"
                onClick={closeMenu}
                className="btn-gold rounded-full px-5 py-2 text-sm font-medium"
              >
                Falar com a KA
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60"
             style={{ background: "radial-gradient(ellipse at 20% 20%, oklch(0.78 0.14 85 / 20%), transparent 55%)" }} />
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-gold">
              Inteligência em crescimento para lideranças diversas
            </p>
            <h1 className="font-display text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
              Impulsionamos empresas B2B lideradas por{" "}
              <span className="text-gold-gradient italic">pessoas negras e LGBTQIA+</span>.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground">
              Consultoria em Growth e RevOps para negócios inclusivos. Trazemos escala e estrutura
              para quem pauta a inovação.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#manifesto" className="btn-gold rounded-full px-8 py-3 text-sm font-medium">
                O que fazemos
              </a>
              <a
                href="#contato"
                className="rounded-full border border-gold/60 px-8 py-3 text-sm font-medium text-foreground hover:bg-gold/10 transition"
              >
                Falar com a KA
              </a>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 -z-10 blur-3xl opacity-40"
                 style={{ background: "var(--gradient-gold)" }} />
            <img
              src={logoAsset.url}
              alt="Logo KA LAB Growth"
              className="w-72 md:w-96 rounded-full drop-shadow-[0_20px_80px_rgba(212,175,55,0.35)]"
            />
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section id="manifesto" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Conheça a essência da KA LAB</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">
            Escalando o potencial da <span className="text-gold-gradient">diversidade</span>.
          </h2>
          <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
            Focamos em acelerar negócios B2B com liderança negra e LGBTQIA+. Unimos RevOps e
            tecnologia para transformar complexidade em resultados sustentáveis, garantindo que o
            seu crescimento reflita a sua visão de mundo.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                t: "Propósito",
                b: "Gerar vantagem competitiva para lideranças sub-representadas, aliando inteligência de dados com processos comerciais eficientes para escalar empresas com forte impacto social.",
              },
              {
                t: "Direção",
                b: "Ser a principal parceira estratégica de empreendedores negros e LGBTQIA+ que buscam excelência operacional e liderança de mercado baseada em dados reais.",
              },
              {
                t: "Nosso Valor",
                b: "Aliamos o rigor técnico de RevOps ao compromisso com a diversidade. Transformamos dados em crescimento real, eliminando gargalos para quem está construindo o futuro corporativo.",
              },
            ].map((x) => (
              <article
                key={x.t}
                className="border-gold-gradient rounded-2xl p-8 hover:-translate-y-1 transition"
              >
                <h3 className="font-display text-2xl text-gold">{x.t}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">{x.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold">O que oferecemos</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Nossos Serviços</h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Três frentes complementares para diagnosticar, estruturar e sustentar a operação
              comercial da sua empresa.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {services.map((s, i) => (
              <article
                key={s.title}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-8 hover:border-gold/60 transition"
              >
                <span className="font-display text-6xl text-gold/20 leading-none">
                  0{i + 1}
                </span>
                <h3 className="mt-6 font-display text-2xl text-foreground">{s.title}</h3>
                <p className="mt-3 text-muted-foreground">{s.description}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <span className="mt-2 h-1 w-3 shrink-0 bg-gold" />
                      <span className="text-foreground/90">{it}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* JORNADA */}
      <section id="jornada" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Método</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            A jornada na <span className="text-gold-gradient">KA LAB Growth</span>
          </h2>

          <ol className="mt-16 grid gap-10 md:grid-cols-3">
            {journey.map((j) => (
              <li key={j.numeral} className="relative pl-6 border-l border-gold/40">
                <span className="absolute -left-4 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-gold text-gold font-display">
                  {j.numeral}
                </span>
                <h3 className="font-display text-2xl">{j.title}</h3>
                <p className="mt-3 text-muted-foreground">{j.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FILOSOFIA */}
      <section id="filosofia" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Fundamentos</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">Nossa Filosofia</h2>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Fundamentos que aplicamos para elevar o patamar de empresas lideradas por minorias.
          </p>

          <div className="mt-16 grid gap-px bg-border md:grid-cols-3 rounded-2xl overflow-hidden">
            {philosophy.map((p) => (
              <div key={p.n} className="bg-background p-10">
                <span className="font-display text-5xl text-gold-gradient">{p.n}</span>
                <h3 className="mt-6 font-display text-2xl">{p.title}</h3>
                <p className="mt-3 text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSICIONAMENTO */}
      <section className="border-t border-border/60 py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Posicionamento KA</p>
          <blockquote className="mt-8 font-display text-3xl md:text-4xl leading-tight">
            Aceleramos o agora para garantir que a{" "}
            <span className="text-gold-gradient">diversidade lidere o amanhã</span> do mercado B2B.
          </blockquote>
          <p className="mt-8 text-muted-foreground">
            Na KA LAB GROWTH, acreditamos que a tecnologia e os dados são ferramentas de
            emancipação. Nossa missão é oferecer a empresas de pessoas negras e LGBTQIA+ a mesma
            inteligência de grandes corporações. Unimos rigor analítico e consciência social para
            desmistificar o crescimento B2B. Estratégia, RevOps e ABM são os pilares que usamos
            para construir o seu espaço de destaque.
          </p>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gold text-center">Contato</p>
          <h2 className="mt-4 text-center font-display text-4xl md:text-5xl">
            Vamos escalar sua <span className="text-gold-gradient">visão de negócio</span> juntos
          </h2>
          <p className="mt-4 text-center text-muted-foreground">
            Seja você uma liderança negra ou LGBTQIA+, estamos prontos para otimizar sua jornada
            comercial agora.
          </p>

          <form
            className="mt-12 space-y-5 rounded-2xl border border-border bg-card p-8"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const data = new FormData(form);
              const subject = encodeURIComponent("Novo contato — KA LAB Growth");
              const body = encodeURIComponent(
                Array.from(data.entries())
                  .map(([k, v]) => `${k}: ${v}`)
                  .join("\n"),
              );
              window.location.href = `mailto:contato@kalabgrowth.com?subject=${subject}&body=${body}`;
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nome*" name="nome" required />
              <Field label="Sobrenome" name="sobrenome" />
              <Field label="Email*" name="email" type="email" required />
              <Field label="Telefone" name="telefone" type="tel" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted-foreground">
                Qual produto tem mais interesse?*
              </label>
              <select
                name="produto"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-gold focus:outline-none"
              >
                <option value="">Selecione…</option>
                <option>Diagnóstico Revenue Growth</option>
                <option>Sprint Revenue System</option>
                <option>Advisory Growth & RevOps</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted-foreground">
                Informações adicionais
              </label>
              <textarea
                name="mensagem"
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-gold focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-gold w-full rounded-full py-3 text-sm font-medium"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="" className="h-9 w-9 rounded-full" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} KA LAB Growth. Todos os direitos reservados.
            </span>
          </div>

          <nav aria-label="Rodapé" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-gold transition">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SocialIcon href={LINKEDIN_URL} label="LinkedIn da KA LAB Growth">
              <Linkedin size={16} />
            </SocialIcon>
            <SocialIcon href={INSTAGRAM_URL} label="Instagram da KA LAB Growth">
              <Instagram size={16} />
            </SocialIcon>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 text-gold hover:bg-gold hover:text-primary-foreground transition"
    >
      {children}
    </a>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-gold focus:outline-none"
      />
    </div>
  );
}

