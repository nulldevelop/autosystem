import {
  ArrowRight,
  BarChart3,
  Bell,
  Car,
  Check,
  ClipboardList,
  FileDown,
  Link2,
  MessageCircle,
  Moon,
  Package,
  Send,
  Smartphone,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Plate } from "@/components/app/plate";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const NAV = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#recursos", label: "Recursos" },
  { href: "#planos", label: "Planos" },
];

const STEPS = [
  {
    icon: Users,
    title: "Cadastre cliente e veículo",
    text: "Nome, documento, telefone e a placa. Tudo fica salvo para os próximos atendimentos.",
  },
  {
    icon: ClipboardList,
    title: "Monte o orçamento",
    text: "Escolha peças e serviços do estoque, anexe fotos do veículo e gere o PDF.",
  },
  {
    icon: MessageCircle,
    title: "Envie e colha a assinatura",
    text: "O cliente recebe o link no WhatsApp, confere os valores e assina na tela do celular.",
  },
  {
    icon: Wrench,
    title: "Execute e receba",
    text: "O orçamento aprovado vira ordem de serviço. Ao finalizar, a receita entra no financeiro.",
  },
];

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Orçamentos com assinatura digital",
    text: "Itens, fotos do veículo, PDF e um link para o cliente aprovar. Você acompanha o que está pendente, aprovado ou rejeitado.",
  },
  {
    icon: Wrench,
    title: "Ordens de serviço",
    text: "Geradas a partir do orçamento aprovado. Acompanhe o andamento, baixe o PDF e finalize quando o carro sair.",
  },
  {
    icon: Package,
    title: "Estoque com quantidade mínima",
    text: "Veja o que está baixo ou esgotado, registre entradas e saídas e exporte o relatório do inventário.",
  },
  {
    icon: Car,
    title: "Clientes e veículos",
    text: "Cada carro ligado ao seu proprietário, com placa no padrão Mercosul e busca por nome, placa ou documento.",
  },
  {
    icon: TrendingUp,
    title: "Financeiro com lucro real",
    text: "Receitas, despesas e custo de peças por serviço. O lucro líquido é calculado para você, com recibo em PDF.",
  },
  {
    icon: BarChart3,
    title: "Relatórios por período",
    text: "Faturamento, ticket médio, meios de pagamento e divisão por categoria. Exporte em PDF.",
  },
];

const ALSO = [
  { icon: Bell, label: "Notificações de atividade" },
  { icon: Smartphone, label: "Instalável no celular" },
  { icon: Moon, label: "Tema claro e escuro" },
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-3 text-base text-muted-foreground">{text}</p>}
    </div>
  );
}

/** Exemplo ilustrativo do orçamento e da assinatura, montado com os mesmos componentes do sistema. */
function ProductMock() {
  return (
    <div
      role="img"
      aria-label="Exemplo de orçamento com placa, itens e total, e a assinatura do cliente aprovando"
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="rounded-2xl border bg-card shadow-xl shadow-foreground/5">
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <span className="font-mono text-xs text-muted-foreground">
            Orçamento #2cf9d72c
          </span>
          <Badge variant="warning">
            <span className="size-1.5 rounded-full bg-current" />
            Pendente
          </Badge>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="font-display text-xl font-semibold">Luciana Mendes</p>
          <div className="flex items-center gap-2.5">
            <Plate value="KDF5M78" />
            <span className="text-sm text-muted-foreground">
              Chevrolet Onix LT 1.0
            </span>
          </div>
        </div>

        <dl className="divide-y border-y text-sm">
          {[
            ["Vela de ignição NGK BKR6E", "4 × R$ 32,90", "R$ 131,60"],
            ["Mão de obra · troca de velas", "1 × R$ 90,00", "R$ 90,00"],
          ].map(([name, calc, total]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <dt className="truncate font-medium">{name}</dt>
                <dd className="num text-xs text-muted-foreground">{calc}</dd>
              </div>
              <dd className="num shrink-0 font-medium">{total}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="num font-display text-2xl font-semibold">
            R$ 221,60
          </span>
        </div>

        <div className="flex flex-wrap gap-2 rounded-b-2xl border-t bg-surface px-5 py-3">
          {[
            { icon: FileDown, label: "PDF" },
            { icon: Link2, label: "Link" },
            { icon: Send, label: "WhatsApp", accent: true },
          ].map(({ icon: Icon, label, accent }) => (
            <span
              key={label}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-sm font-medium"
            >
              <Icon
                className={cn("size-4", accent && "text-success")}
                aria-hidden
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border bg-card p-4 shadow-xl shadow-foreground/5 lg:absolute lg:-bottom-36 lg:-left-12 lg:mt-0 lg:w-64 lg:-rotate-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Assinatura do cliente
          </span>
          <Badge variant="success">
            <Check className="size-3" aria-hidden />
            Aprovado
          </Badge>
        </div>
        <svg
          viewBox="0 0 100 44"
          className="mt-2 h-14 w-full text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <title>Assinatura do cliente</title>
          <path d="M6 32 C 12 8, 20 8, 24 26 S 36 40, 42 18 S 56 12, 62 28 S 78 36, 94 14" />
        </svg>
        <p className="border-t pt-2 text-xs text-muted-foreground">
          Assinado pelo celular, sem imprimir nada
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/25">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="size-8" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Auto<span className="text-primary">System</span>
            </span>
          </Link>

          <nav
            aria-label="Seções"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth?mode=signup">Testar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in oklab, var(--foreground) 13%, transparent) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "linear-gradient(to bottom, black 20%, transparent 85%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 20%, transparent 85%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 right-0 size-[28rem] rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-32">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge variant="neutral" className="mb-5">
                Gestão para oficinas mecânicas
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Do orçamento ao recibo, sem papel e sem planilha.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Monte o orçamento, envie pelo WhatsApp e o cliente assina no
                celular. Aprovado, ele vira ordem de serviço e já entra no
                financeiro.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/auth?mode=signup">
                    Testar por {TRIAL_DAYS} dias <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                Funciona no celular e no computador. Você instala como app, sem
                loja.
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 lg:pb-32">
              <p className="mb-3 text-center text-xs text-muted-foreground lg:text-left">
                Exemplo ilustrativo com dados fictícios.
              </p>
              <ProductMock />
            </div>
          </div>
        </section>

        {/* Como funciona: a ordem importa, por isso os números */}
        <section
          id="como-funciona"
          className="scroll-mt-16 border-y bg-surface py-16 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Como funciona"
              title="Do balcão à aprovação em quatro passos"
              text="O mesmo caminho que você já faz, só que sem anotar duas vezes."
            />
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li
                  key={title}
                  className="relative rounded-xl border bg-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <span className="num font-display text-3xl font-semibold text-border">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="scroll-mt-16 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Recursos"
              title="Tudo o que a oficina usa no dia a dia"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {ALSO.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-primary" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Planos */}
        <section
          id="planos"
          className="scroll-mt-16 border-t bg-surface py-16 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Planos"
              title="Escolha o plano da sua oficina"
              text={`Teste grátis por ${TRIAL_DAYS} dias. No plano anual você paga 10 meses e usa 12.`}
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {subscriptionPlans.map((plan, index) => {
                const featured = index === 1;
                return (
                  <article
                    key={plan.slug}
                    className={cn(
                      "relative flex flex-col rounded-xl border bg-card p-6",
                      featured &&
                        "border-primary/60 shadow-lg shadow-primary/10",
                    )}
                  >
                    {featured && (
                      <Badge className="absolute -top-2.5 left-6">
                        Mais escolhido
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-4 flex items-baseline gap-1">
                      <span className="num font-display text-4xl font-semibold tracking-tight">
                        {brl(plan.price.monthly)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /mês
                      </span>
                    </p>
                    <p className="num mt-1 text-sm text-muted-foreground">
                      ou {brl(plan.price.yearly)} por ano
                    </p>
                    <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      size="lg"
                      variant={featured ? "default" : "outline"}
                      className="mt-6 w-full"
                    >
                      <Link href="/auth?mode=signup">Começar teste grátis</Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Sua próxima ordem de serviço já pode nascer aqui.
            </h2>
            <p className="max-w-xl text-primary-foreground/85">
              Crie sua conta e faça o primeiro orçamento hoje. São {TRIAL_DAYS}{" "}
              dias para testar tudo.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/auth?mode=signup">
                Criar conta grátis <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo className="size-6" />
            <span>© {year} AutoSystem</span>
          </div>
          <nav aria-label="Rodapé" className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Termos
            </Link>
            <Link href="/auth" className="hover:text-foreground">
              Entrar
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
