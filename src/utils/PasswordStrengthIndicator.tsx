import { Check, X } from "lucide-react";

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    {
      label: "Mínimo de 8 caracteres",
      valid: password.length >= 8,
    },
    {
      label: "Uma letra maiúscula",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Uma letra minúscula",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Um número",
      valid: /[0-9]/.test(password),
    },
  ];

  return (
    <div className="space-y-2 mt-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-2">
          {check.valid ? (
            <Check className="w-4 h-4 text-[#16a34a]" />
          ) : (
            <X className="w-4 h-4 text-gray-600" />
          )}
          <span
            className={`text-xs ${
              check.valid ? "text-[#16a34a]" : "text-gray-500"
            }`}
          >
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}
