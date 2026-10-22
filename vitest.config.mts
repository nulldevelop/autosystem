import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/utils/**/*.ts",
        "src/lib/abacatepay.ts",
        "src/lib/referral.ts",
        "src/lib/prisma-errors.ts",
        "src/lib/tenant.ts",
        "src/lib/files.ts",
        "src/lib/rate-limit.ts",
        "src/lib/admin/**/*.ts",
        "src/lib/utils.ts",
        "src/lib/email/**/*.ts",
        "src/app/(admin)/admin/_actions/admin-actions.ts",
        "src/app/api/checkout/route.ts",
        "src/app/api/webhooks/**/route.ts",
        "src/app/(public)/_actions/sign-up.ts",
        "src/app/(auth)/dashboard/_actions/create-organization.ts",
        "src/app/(auth)/dashboard/_actions/notifications.ts",
        "src/app/(auth)/dashboard/customer/_actions/delete-customer.ts",
        "src/app/(auth)/dashboard/vehicle/_actions/delete-vehicle.ts",
        "src/app/(auth)/dashboard/_data-access/get-vehicles-count.ts",
        "src/app/(auth)/dashboard/product/_data-access/get-products-count.ts",
        "src/app/(auth)/dashboard/service/_data-access/get-service-orders-count.ts",
        "src/app/(public)/budget/sign/[id]/_actions/sign-budget.ts",
        "src/app/(public)/service/sign/_actions/sign-service-order.ts",
      ],
      exclude: ["src/generated/**", "**/types.ts"],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 80,
      },
    },
  },
});
