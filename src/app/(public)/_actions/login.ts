"use server";

import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor, insira um e-mail válido." })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .max(100, { message: "A senha deve ter no máximo 100 caracteres." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LogInResponse =
  | { success: true; message: string }
  | {
      success: false;
      error: {
        message: string;
        fieldErrors?: Partial<Record<keyof LoginFormData, string[]>>;
      };
    };

export async function logIn(data: LoginFormData): Promise<LogInResponse> {
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

  const { email, password } = result.data;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Login bem-sucedido!",
    };
  } catch (error) {
    console.error("Erro no login:", error);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (
        msg.includes("invalid") ||
        msg.includes("inválido") ||
        msg.includes("not found") ||
        msg.includes("incorrect")
      ) {
        return {
          success: false,
          error: {
            message: "E-mail ou senha inválidos.",
          },
        };
      }

      if (msg.includes("not verified") || msg.includes("não verificad")) {
        return {
          success: false,
          error: {
            message: "Verifique seu e-mail antes de fazer login.",
          },
        };
      }
    }

    return {
      success: false,
      error: {
        message: "Erro ao realizar login. Tente novamente.",
      },
    };
  }
}

