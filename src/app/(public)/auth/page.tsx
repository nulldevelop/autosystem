"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "../_components/loginForm";
import { SignUpForm } from "../_components/signUpForm";

export default function SignUpPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
      <div
        className={`w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative z-10 transition-all duration-700 ease-in-out ${
          isLogin ? "lg:translate-x-full" : "lg:translate-x-0"
        }`}
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Crie uma conta"}
            </h1>
            <p className="text-sm text-gray-400">
              {isLogin ? (
                <>
                  Não tem uma conta?{" "}
                  <Button
                    type="button"
                    onClick={handleToggleForm}
                    className="underline underline-offset-4 hover:text-[#22c55e] transition-colors p-2 text-white mx-1"
                  >
                    Cadastre-se
                  </Button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <Button
                    type="button"
                    onClick={handleToggleForm}
                    className="underline underline-offset-4 hover:text-[#22c55e] transition-colors p-2 text-white mx-1"
                  >
                    Entrar
                  </Button>
                </>
              )}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <SignUpForm />}

          {/* Divider */}
          <div className="space-y-4">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-[#1a1a1a] border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white font-medium uppercase text-sm tracking-wider"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Google</title>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLogin ? "Entrar" : "Inscrever-se"} com o Google
            </Button>
          </div>

          {/* Footer */}
          {!isLogin && (
            <p className="text-center text-xs text-gray-500">
              Ao se inscrever, você concorda com os{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 hover:text-gray-400"
              >
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-gray-400"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      <div
        className={`hidden lg:block lg:w-1/2 relative overflow-hidden transition-all duration-700 ease-in-out ${
          isLogin ? "lg:-translate-x-full" : "lg:translate-x-0"
        }`}
      >
        <Image
          src="/images/img-login.jpg"
          alt="Imagem de Login"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
    </div>
  );
}
