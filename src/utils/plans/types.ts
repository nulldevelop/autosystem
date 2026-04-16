// Tipos de planos que podem ser usados em client components
export type PlanSlug = "BASIC" | "PLUS" | "PROFESSIONAL";

export type PlanInfo = {
  name: string;
  maxServices: number | null;
};

export type PlansProps = {
  BASIC: PlanInfo;
  PLUS: PlanInfo;
  PROFESSIONAL: PlanInfo;
};
