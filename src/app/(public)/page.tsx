import {
  ArrowRight,
  BarChart3,
  Bell,
  Car,
  Check,
  ClipboardList,
  Moon,
  Package,
  Smartphone,
  TrendingUp,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Plate } from "@/components/app/plate";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { company, companyAddressLine } from "@/config/company";
import { cn } from "@/lib/utils";
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const NAV = [
  { href: "#demonstracao", label: "Demonstração" },
  { href: "#caminho", label: "O caminho do carro" },
  { href: "#bancada", label: "Na bancada" },
  { href: "#planos", label: "Preços" },
];

/** Cada etapa é uma "estação" por onde o carro passa: a ordem importa. */
const STATIONS = [
  {
    tag: "Balcão",
    title: "Cadastre cliente e veículo",
    text: "Nome, documento, telefone e a placa. Fica salvo para o próximo atendimento.",
  },
  {
    tag: "Orçamento",
    title: "Monte o orçamento",
    text: "Peças e serviços direto do estoque, fotos do veículo e PDF pronto para enviar.",
  },
  {
    tag: "Aprovação",
    title: "Cliente assina no celular",
    text: "O link vai pelo WhatsApp. Ele confere os valores e assina com o dedo, sem imprimir.",
  },
  {
    tag: "Bancada",
    title: "Execute e receba",
    text: "O orçamento aprovado vira ordem de serviço. Ao finalizar, a receita cai no financeiro.",
  },
];

const TOOLBOX = [
  {
    icon: ClipboardList,
    title: "Orçamento com assinatura",
    text: "Itens, fotos, PDF e link de aprovação. Veja o que está pendente, aprovado ou rejeitado.",
  },
  {
    icon: Wrench,
    title: "Ordens de serviço",
    text: "Nascem do orçamento aprovado. Acompanhe o andamento e finalize quando o carro sair.",
  },
  {
    icon: Package,
    title: "Estoque com mínimo",
    text: "Alerta de peça baixa ou esgotada, entradas e saídas e relatório do inventário.",
  },
  {
    icon: Car,
    title: "Clientes e veículos",
    text: "Cada carro ligado ao dono, com placa Mercosul e busca por nome, placa ou documento.",
  },
  {
    icon: TrendingUp,
    title: "Financeiro com lucro real",
    text: "Receitas, despesas e custo de peças. O lucro líquido sai calculado, com recibo em PDF.",
  },
  {
    icon: BarChart3,
    title: "Relatórios do período",
    text: "Faturamento, ticket médio, meios de pagamento e categorias. Exporta em PDF.",
  },
];

const BOARD = [
  {
    plate: "KDF5M78",
    car: "Chevrolet Onix LT 1.0",
    status: "Em andamento",
    chip: "bg-[#facc15]/15 text-[#facc15]",
  },
  {
    plate: "GKR4C12",
    car: "Honda Civic EXL 2.0",
    status: "Aberta",
    chip: "bg-sky-400/15 text-sky-300",
  },
  {
    plate: "JAP9L31",
    car: "Toyota Corolla XEI 2.0",
    status: "Concluída",
    chip: "bg-emerald-400/15 text-emerald-300",
  },
  {
    plate: "HBD7J40",
    car: "Volkswagen Saveiro CS 1.6",
    status: "Aberta",
    chip: "bg-sky-400/15 text-sky-300",
  },
];

const ALSO = [
  { icon: Bell, label: "Avisos de atividade" },
  { icon: Smartphone, label: "Instala como app" },
  { icon: Moon, label: "Tema claro e escuro" },
];

/** Etiqueta de sinalização: texto em caixa alta sobre fundo amarelo. */
function Tape({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block bg-[#facc15] px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-[#18181b] uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Ordem de serviço de papel presa na prancheta, com a plaquinha do chaveiro. */
function ServiceOrderSheet() {
  const ink = "text-[#1e40af]";
  const line = "border-b border-[#1e40af]/35";

  return (
    <div
      role="img"
      aria-label="Exemplo de ordem de serviço preenchida à mão, aprovada e assinada pelo cliente"
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="relative rounded-2xl bg-[#3b4048] p-3 pt-8 shadow-2xl shadow-black/30 lg:rotate-[1.5deg]">
        <div
          aria-hidden
          className="absolute -top-2.5 left-1/2 h-9 w-28 -translate-x-1/2 rounded-md bg-gradient-to-b from-zinc-100 to-zinc-400 shadow-md"
        >
          <span className="absolute inset-x-4 top-2.5 h-1.5 rounded-full bg-zinc-600/40" />
        </div>

        <div className="relative rounded-md bg-[#f8f8f4] px-5 pt-5 pb-6 text-[#15171c]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-industrial text-3xl leading-none font-bold tracking-wide uppercase">
                Ordem de serviço
              </p>
              <p className={cn("mt-1 text-xs font-medium", ink)}>
                Auto Mecânica Exemplo
              </p>
            </div>
            <p className="text-right">
              <span
                className={cn("block text-xs font-semibold uppercase", ink)}
              >
                Nº
              </span>
              <span className="font-mono text-xl font-bold text-[#c1121f]">
                0047
              </span>
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2">
            {[
              ["Cliente", "Luciana Mendes", true],
              ["Veículo", "Chevrolet Onix LT 1.0", false],
              ["Placa", "KDF5M78", false],
              ["Quilometragem", "45.200 km", false],
              ["Entrada", "21/10", false],
            ].map(([label, value, wide]) => (
              <div key={String(label)} className={cn(wide && "col-span-2")}>
                <dt className={cn("text-xs font-semibold uppercase", ink)}>
                  {label}
                </dt>
                <dd
                  className={cn(
                    "font-hand text-2xl leading-7 font-semibold",
                    line,
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5">
            <div
              className={cn(
                "grid grid-cols-[2.5rem_1fr_5.5rem] gap-x-2 text-xs font-semibold uppercase",
                ink,
              )}
            >
              <span>Qtd</span>
              <span>Peças e serviços</span>
              <span className="text-right">Valor</span>
            </div>
            {[
              ["4", "Vela de ignição NGK", "131,60"],
              ["1", "M.O. troca de velas", "90,00"],
              ["", "", ""],
            ].map(([qty, desc, price], i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: linhas estáticas do formulário
                key={i}
                className={cn(
                  "grid h-8 grid-cols-[2.5rem_1fr_5.5rem] items-end gap-x-2 font-hand text-xl leading-7 font-semibold",
                  line,
                )}
              >
                <span>{qty}</span>
                <span className="truncate">{desc}</span>
                <span className="text-right">{price}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="relative flex-1">
              <svg
                viewBox="0 0 120 36"
                className="h-9 w-full text-[#1d4ed8]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <title>Assinatura do cliente</title>
                <path d="M4 26 C 12 4, 22 4, 26 22 S 40 34, 46 14 S 62 8, 68 24 S 88 30, 112 10" />
              </svg>
              <p
                className={cn("border-t border-[#15171c]/50 pt-1 text-xs", ink)}
              >
                Assinatura do cliente
              </p>
            </div>
            <div className="border-2 border-[#15171c] px-3 py-1 text-right">
              <p className="text-xs font-semibold uppercase">Total</p>
              <p className="font-industrial text-3xl leading-none font-bold">
                R$ 221,60
              </p>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute right-28 bottom-[4.25rem] -rotate-12 rounded-md border-[3px] border-[oklch(0.5_0.14_152)] px-3 py-1 text-center text-[oklch(0.5_0.14_152)] opacity-90 mix-blend-multiply"
          >
            <p className="font-industrial text-3xl leading-none font-bold tracking-widest uppercase">
              Aprovado
            </p>
            <p className="font-mono text-xs uppercase">pelo celular</p>
          </div>
        </div>
      </div>

      <div className="-mt-4 ml-6 w-44 -rotate-3 sm:ml-10">
        <div className="mx-auto -mb-3 size-6 rounded-full border-4 border-zinc-400" />
        <div className="rounded-xl bg-[#facc15] p-3 pt-5 text-[#18181b] shadow-xl shadow-black/25">
          <Plate value="KDF5M78" className="w-full justify-center" />
          <p className="mt-2 text-center font-mono text-xs font-semibold uppercase">
            Onix · baia 2
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/25">
      <div aria-hidden className="hazard h-1.5" />

      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="size-8" />
            <span className="font-industrial text-2xl font-bold tracking-wide uppercase">
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
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
              <Link href="/auth?mode=signup">
                Testar<span className="hidden sm:inline"> grátis</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Entrada da oficina */}
        <section className="pegboard relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-32">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Tape>Para oficinas mecânicas</Tape>
              <h1 className="font-industrial mt-5 text-5xl leading-[0.95] font-bold tracking-wide text-balance uppercase sm:text-6xl lg:text-7xl">
                Do orçamento à entrega, sem papel solto na bancada.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Cada carro com seu orçamento, sua ordem de serviço e seu recibo.
                O cliente aprova pelo WhatsApp e assina no celular.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/auth?mode=signup">
                    Testar por {TRIAL_DAYS} dias <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#caminho">Ver o passo a passo</a>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground uppercase">
                <li className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary" aria-hidden />
                  Celular ou computador
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary" aria-hidden />
                  Placa no padrão Mercosul
                </li>
              </ul>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 lg:pr-4">
              <ServiceOrderSheet />
              <p className="mt-4 text-center text-xs text-muted-foreground lg:text-left">
                Exemplo ilustrativo com dados fictícios.
              </p>
            </div>
          </div>
        </section>

        <div aria-hidden className="hazard h-3" />

        {/* Demonstração em vídeo */}
        <section
          id="demonstracao"
          className="scroll-mt-16 border-b py-16 sm:py-24"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Tape>Demonstração</Tape>
              <h2 className="font-industrial mt-4 text-4xl leading-none font-bold tracking-wide text-balance uppercase sm:text-5xl">
                Veja o AutoSystem funcionando
              </h2>
              <p className="mt-4 text-muted-foreground">
                Do cadastro do cliente ao orçamento assinado, em poucos minutos.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-xs overflow-hidden rounded-xl border-4 border-[#3b4048] bg-black shadow-xl md:hidden">
              {/* biome-ignore lint/a11y/useMediaCaption: demonstração sem áudio */}
              <video
                controls
                playsInline
                preload="none"
                poster="/videos/autosystem-demo-mobile-poster.jpg"
                className="aspect-[9/16] w-full"
              >
                <source
                  src="/videos/autosystem-demo-mobile.mp4"
                  type="video/mp4"
                />
              </video>
            </div>

            <div className="mt-10 hidden overflow-hidden rounded-xl border-4 border-[#3b4048] bg-black shadow-xl md:block">
              {/* biome-ignore lint/a11y/useMediaCaption: demonstração sem áudio */}
              <video
                controls
                playsInline
                preload="none"
                poster="/videos/autosystem-demo-poster.jpg"
                className="aspect-video w-full"
              >
                <source src="/videos/autosystem-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* O caminho do carro */}
        <section id="caminho" className="scroll-mt-16 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Tape>Passo a passo</Tape>
              <h2 className="font-industrial mt-4 text-4xl leading-none font-bold tracking-wide uppercase sm:text-5xl">
                O caminho do carro dentro da oficina
              </h2>
              <p className="mt-4 text-muted-foreground">
                O mesmo fluxo que você já faz no balcão, sem anotar duas vezes.
              </p>
            </div>

            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATIONS.map(({ tag, title, text }, i) => (
                <li
                  key={tag}
                  className="relative overflow-hidden rounded-lg border-2 bg-card"
                >
                  <div className="flex items-center justify-between bg-[#facc15] px-4 py-2 text-[#18181b]">
                    <span className="font-mono text-xs font-semibold tracking-wider uppercase">
                      {tag}
                    </span>
                    <span className="font-industrial text-2xl leading-none font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-industrial text-2xl leading-tight font-semibold tracking-wide uppercase">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Na bancada: quadro de serviços e caixa de ferramentas */}
        <section
          id="bancada"
          className="scroll-mt-16 border-t bg-surface py-16 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <Tape>Quadro da oficina</Tape>
                <h2 className="font-industrial mt-4 text-4xl leading-none font-bold tracking-wide text-balance uppercase sm:text-5xl">
                  Todos os carros da oficina numa olhada só
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Veja quem está aberto, em andamento ou pronto para entrega,
                  com a placa à vista. Nada de perguntar na bancada qual carro é
                  de quem.
                </p>
              </div>

              <div
                role="img"
                aria-label="Exemplo do quadro de ordens de serviço com placas, modelos e situação de cada carro"
                className="overflow-hidden rounded-xl border-4 border-[#3b4048] bg-[#1f2328] text-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span className="font-industrial text-xl font-bold tracking-widest uppercase">
                    Ordens de serviço
                  </span>
                  <span className="font-mono text-xs text-white/60 uppercase">
                    exemplo
                  </span>
                </div>
                <ul className="divide-y divide-white/10">
                  {BOARD.map((row) => (
                    <li
                      key={row.plate}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Plate value={row.plate} />
                        <span className="truncate text-sm text-white/80">
                          {row.car}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded px-2 py-1 font-mono text-xs font-semibold uppercase",
                          row.chip,
                        )}
                      >
                        {row.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-16">
              <h3 className="font-industrial text-3xl font-bold tracking-wide uppercase">
                Caixa de ferramentas
              </h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TOOLBOX.map(({ icon: Icon, title, text }) => (
                  <article
                    key={title}
                    className="rivets rounded-lg border bg-card p-7 transition-colors hover:border-primary/50"
                  >
                    <div className="flex size-10 items-center justify-center rounded-md border-2 border-foreground/80 text-foreground">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h4 className="font-industrial mt-4 text-2xl leading-tight font-semibold tracking-wide uppercase">
                      {title}
                    </h4>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {text}
                    </p>
                  </article>
                ))}
              </div>
              <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground uppercase">
                {ALSO.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2">
                    <Icon className="size-4 text-primary" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Preços */}
        <section id="planos" className="scroll-mt-16 border-t py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Tape>Preços</Tape>
              <h2 className="font-industrial mt-4 text-4xl leading-none font-bold tracking-wide uppercase sm:text-5xl">
                Escolha o plano da sua oficina
              </h2>
              <p className="mt-4 text-muted-foreground">
                Teste grátis por {TRIAL_DAYS} dias. No plano anual você paga 10
                meses e usa 12.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {subscriptionPlans.map((plan, index) => {
                const featured = index === 1;
                return (
                  <article
                    key={plan.slug}
                    className={cn(
                      "relative flex flex-col overflow-hidden rounded-lg border-2 bg-card",
                      featured && "border-primary",
                    )}
                  >
                    <div
                      aria-hidden
                      className={cn("h-2", featured ? "hazard" : "bg-border")}
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-industrial text-3xl font-bold tracking-wide uppercase">
                          {plan.name}
                        </h3>
                        {featured && (
                          <span className="rounded bg-primary px-2 py-1 font-mono text-xs font-semibold text-primary-foreground uppercase">
                            Mais escolhido
                          </span>
                        )}
                      </div>
                      <p className="mt-4 flex items-baseline gap-1">
                        <span className="num font-industrial text-5xl leading-none font-bold">
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
                          <li
                            key={feature}
                            className="flex items-start gap-2.5"
                          >
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
                        <Link href="/auth?mode=signup">
                          Começar teste grátis
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl bg-[#1f2328] text-white">
            <div aria-hidden className="hazard h-3" />
            <div className="flex flex-col items-start gap-6 px-6 py-12 sm:px-12 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-industrial text-4xl leading-none font-bold tracking-wide text-balance uppercase sm:text-5xl">
                  Abra a primeira ordem de serviço hoje
                </h2>
                <p className="mt-3 text-white/75">
                  Crie a conta, cadastre um cliente e faça o primeiro orçamento.
                  São {TRIAL_DAYS} dias para testar tudo.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link href="/auth?mode=signup">
                  Criar conta grátis <ArrowRight />
                </Link>
              </Button>
            </div>
            <div aria-hidden className="hazard h-3" />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Logo className="size-6" />
              <span className="font-semibold text-foreground">
                {company.brand}
              </span>
            </div>
            <p>
              © {year} {company.legalName}
            </p>
            <p>CNPJ {company.cnpj}</p>
            <p>{companyAddressLine}</p>
            <p>
              <a
                href={`mailto:${company.email}`}
                className="hover:text-foreground"
              >
                {company.email}
              </a>
            </p>
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
