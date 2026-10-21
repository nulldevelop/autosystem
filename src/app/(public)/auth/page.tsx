import { Suspense } from "react";
import { AuthScreen } from "../_components/auth-screen";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthScreen />
    </Suspense>
  );
}
