"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const createVehicleSchema = z.object({
  marca: z
    .string()
    .min(2, { message: "A marca deve ter pelo menos 2 caracteres." }),
  model: z
    .string()
    .min(2, { message: "O modelo deve ter pelo menos 2 caracteres." }),
  year: z.coerce.number().min(1900, { message: "O ano deve ser válido." }),
  licensePlate: z
    .string()
    .min(7, { message: "A placa deve ter pelo menos 7 caracteres." }),
  customerId: z.string(),
});

interface CreateVehicleInput {
  marca: string;
  model: string;
  year: number;
  licensePlate: string;
  customerId: string;
}

interface CreateVehicleResponse {
  success: boolean;
  message: string;
  vehicleId?: string;
}

export async function createVehicle(
  input: CreateVehicleInput,
): Promise<CreateVehicleResponse> {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return {
        success: false,
        message: "Você precisa estar autenticado e ter uma organização ativa.",
      };
    }

    const validationResult = createVehicleSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError =
        errors.marca?.[0] ||
        errors.model?.[0] ||
        errors.year?.[0] ||
        errors.licensePlate?.[0] ||
        errors.customerId?.[0] ||
        "Dados inválidos";

      return {
        success: false,
        message: firstError,
      };
    }

    const { marca, model, year, licensePlate, customerId } =
      validationResult.data;

    // This query now works because of the @@unique([licensePlate, organizationId]) in the schema
    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        licensePlate_organizationId: {
          licensePlate,
          organizationId: session.session.activeOrganizationId,
        },
      },
    });

    if (existingVehicle) {
      return {
        success: false,
        message: "Já existe um veículo com esta placa nesta organização.",
      };
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        marca,
        model,
        year,
        licensePlate,
        customerId,
        organizationId: session.session.activeOrganizationId,
      },
    });

    revalidatePath("/dashboard/vehicle");
    return {
      success: true,
      message: "Veículo criado com sucesso!",
      vehicleId: vehicle.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ocorreu um erro ao criar o veículo.";
    console.error("Erro ao criar veículo:", error);

    return {
      success: false,
      message: errorMessage,
    };
  }
}
