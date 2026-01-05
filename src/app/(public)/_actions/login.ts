"use server";

import * as z from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const loginSchema = z.object({
  email: z
    .email({ message: "Por favor, insira um e-mail válido." })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .max(100, { message: "A senha deve ter no máximo 100 caracteres." }),
});

type LogInResponse =
  | { success: true; message: string }
  | {
      success: false;
      error: {
        message: string;
        fieldErrors?: Partial<
          Record<keyof z.infer<typeof loginSchema>, string[]>
        >;
      };
    };

export async function logIn(data: unknown): Promise<LogInResponse> {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        message: "Dados de login inválidos.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const { email, password } = result.data;

    await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: false,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    return { success: true, message: "Login bem-sucedido!" };
  } catch (error) {
    // Log do erro para debug (sem expor ao cliente)
    console.error("Erro no login:", error);

    // Tratamento de erros específicos
    if (error instanceof Error) {
      // Verifica se é erro de credenciais inválidas
      if (
        error.message.toLowerCase().includes("invalid") ||
        error.message.toLowerCase().includes("inválido") ||
        error.message.toLowerCase().includes("not found") ||
        error.message.toLowerCase().includes("incorrect")
      ) {
        return {
          success: false,
          error: {
            message: "E-mail ou senha inválidos.",
          },
        };
      }

      // Verifica se a conta não foi verificada
      if (
        error.message.toLowerCase().includes("not verified") ||
        error.message.toLowerCase().includes("não verificad")
      ) {
        return {
          success: false,
          error: {
            message: "Por favor, verifique seu e-mail antes de fazer login.",
          },
        };
      }

      return {
        success: false,
        error: {
          message: "Não foi possível realizar o login. Tente novamente.",
        },
      };
    }

    return {
      success: false,
      error: {
        message: "Ocorreu um erro inesperado ao fazer login.",
      },
    };
  }
}
