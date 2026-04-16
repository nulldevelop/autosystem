"use server";

import * as z from "zod";
import { auth } from "@/lib/auth";

const signUpSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres." })
    .trim(),
  email: z
    .email({ message: "Por favor, insira um e-mail válido." })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .max(100, { message: "A senha deve ter no máximo 100 caracteres." })
    .regex(/[A-Z]/, {
      message: "A senha deve conter pelo menos uma letra maiúscula.",
    })
    .regex(/[a-z]/, {
      message: "A senha deve conter pelo menos uma letra minúscula.",
    })
    .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número." }),
});

type SignUpResponse =
  | { success: true; message: string }
  | {
      success: false;
      error: {
        message: string;
        fieldErrors?: Partial<
          Record<keyof z.infer<typeof signUpSchema>, string[]>
        >;
      };
    };

export async function signUp(data: unknown): Promise<SignUpResponse> {
  const result = signUpSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        message: "Dados de cadastro inválidos.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const { name, email, password } = result.data;

    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    return { success: true, message: "Conta criada com sucesso!" };
  } catch (error) {
    console.error("Erro no cadastro:", error);
    if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes("already exists") ||
        error.message.toLowerCase().includes("já existe")
      ) {
        return {
          success: false,
          error: {
            message: "Este e-mail já está cadastrado.",
          },
        };
      }

      return {
        success: false,
        error: {
          message: "Não foi possível criar a conta. Tente novamente.",
        },
      };
    }

    return {
      success: false,
      error: {
        message: "Ocorreu um erro inesperado ao criar a conta.",
      },
    };
  }
}
