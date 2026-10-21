import { cn } from "@/lib/utils";

/** Placa no padrão Mercosul: faixa azul no topo, caracteres em mono. */
export function Plate({
  value,
  className,
}: {
  value?: string | null;
  className?: string;
}) {
  if (!value) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-[5px] border-t-[5px] border-t-[#1e40af] bg-white px-2 py-0.5 font-mono text-[13px] font-semibold leading-5  text-zinc-900 shadow-sm",
        className,
      )}
    >
      {value.toUpperCase()}
    </span>
  );
}
