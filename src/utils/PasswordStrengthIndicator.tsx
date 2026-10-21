import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "8 ou mais caracteres", valid: password.length >= 8 },
    { label: "Uma letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Uma letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Um número", valid: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.valid).length;
  const barColor =
    score <= 1 ? "bg-destructive" : score <= 3 ? "bg-warning" : "bg-success";

  return (
    <div className="mt-2 space-y-2.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {checks.map((check, i) => (
          <span
            key={check.label}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted transition-colors",
              i < score && barColor,
            )}
          />
        ))}
      </div>
      <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              check.valid ? "text-success" : "text-muted-foreground",
            )}
          >
            {check.valid ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Circle className="size-3.5" aria-hidden />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
