import { AuthCard } from "../_components/auth-card";
import { ForgotPasswordForm } from "../_components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Esqueceu a senha?"
      description="Informe seu e-mail e enviaremos um link para criar uma nova."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
