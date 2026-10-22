import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";
import { isUniqueViolation } from "@/lib/prisma-errors";
import { convertCurrency } from "@/utils/convertCurrency";
import { extractCnpj, formatCnpj } from "@/utils/formatCNPJ";
import { extractCpf, formatCpf } from "@/utils/formatCpf";
import {
  formatData,
  formatDataWithHours,
  parseDateString,
  toSaveFormat,
} from "@/utils/formatData";
import { extractPhoneNumber, formatPhone } from "@/utils/formatPhone";
import { isValidCnpj } from "@/utils/validateCNPJ";

describe("isValidCnpj", () => {
  it.each(["11.222.333/0001-81", "11222333000181", "11.444.777/0001-61"])(
    "aceita CNPJ válido %s",
    (cnpj) => {
      expect(isValidCnpj(cnpj)).toBe(true);
    },
  );

  it.each([
    ["dígito verificador errado", "11222333000182"],
    ["segundo dígito errado", "11222333000180"],
    ["sequência repetida", "00000000000000"],
    ["sequência repetida de 1", "11111111111111"],
    ["curto demais", "1122233300018"],
    ["longo demais", "112223330001811"],
    ["vazio", ""],
    ["letras", "abcdefghijklmn"],
  ])("rejeita CNPJ com %s", (_label, cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(false);
  });

  it("calcula o dígito como 0 quando o resto da divisão é menor que 2", () => {
    // 04.252.011/0001-10 tem os dois dígitos verificadores calculados com resto < 2
    expect(isValidCnpj("04.252.011/0001-10")).toBe(true);
  });
});

describe("formatCnpj / extractCnpj", () => {
  it("aplica a máscara progressivamente", () => {
    expect(formatCnpj("11")).toBe("11");
    expect(formatCnpj("112")).toBe("11.2");
    expect(formatCnpj("11222")).toBe("11.222");
    expect(formatCnpj("11222333")).toBe("11.222.333");
    expect(formatCnpj("112223330001")).toBe("11.222.333/0001");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("ignora caracteres não numéricos", () => {
    expect(formatCnpj("11.222.333/0001-81")).toBe("11.222.333/0001-81");
    expect(formatCnpj("ab11cd")).toBe("11");
  });

  it("limita o tamanho quando passa de 14 dígitos", () => {
    expect(formatCnpj("112223330001819999")).toBe("112223330001819999".slice(0, 18));
  });

  it("extrai somente os dígitos", () => {
    expect(extractCnpj("11.222.333/0001-81")).toBe("11222333000181");
  });
});

describe("formatCpf / extractCpf", () => {
  it("aplica a máscara de CPF", () => {
    expect(formatCpf("123")).toBe("123");
    expect(formatCpf("1234")).toBe("123.4");
    expect(formatCpf("123456789")).toBe("123.456.789");
    expect(formatCpf("12345678910")).toBe("123.456.789-10");
  });

  it("limita a 11 dígitos e ignora lixo", () => {
    expect(formatCpf("123.456.789-10 99")).toBe("123.456.789-10");
    expect(formatCpf("abc")).toBe("");
  });

  it("extrai somente os dígitos", () => {
    expect(extractCpf("123.456.789-10")).toBe("12345678910");
  });
});

describe("formatPhone / extractPhoneNumber", () => {
  it("formata celular e fixo", () => {
    expect(formatPhone("11999998888")).toBe("(11) 99999-8888");
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("formata parcialmente enquanto digita", () => {
    expect(formatPhone("1")).toBe("1");
    expect(formatPhone("11")).toBe("11");
    expect(formatPhone("119")).toBe("(11) 9");
  });

  it("corta quando passa de 11 dígitos", () => {
    expect(formatPhone("119999988889999")).toBe("119999988889999".slice(0, 15));
  });

  it("extrai somente os dígitos", () => {
    expect(extractPhoneNumber("(11) 99999-8888")).toBe("11999998888");
  });
});

describe("formatData", () => {
  it("formata data e data com hora", () => {
    const date = new Date(2026, 0, 5, 9, 7);
    expect(formatData(date)).toBe("05/01/2026");
    expect(formatDataWithHours(date)).toBe("05/01/2026 09:07");
  });

  it("aceita timestamp numérico", () => {
    expect(formatData(new Date(2026, 11, 25).getTime())).toBe("25/12/2026");
  });

  it("interpreta datas dd/mm/aaaa com e sem hora", () => {
    expect(parseDateString("05/01/2026")).toEqual(new Date(2026, 0, 5));
    expect(parseDateString("05/01/2026 14:30")).toEqual(
      new Date(2026, 0, 5, 14, 30),
    );
  });

  it("serializa em ISO", () => {
    const date = new Date("2026-01-05T12:00:00.000Z");
    expect(toSaveFormat(date)).toBe("2026-01-05T12:00:00.000Z");
  });
});

describe("convertCurrency", () => {
  it("formata em reais", () => {
    expect(convertCurrency(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
    expect(convertCurrency(0).replace(/\s/g, " ")).toBe("R$ 0,00");
  });
});

describe("cn", () => {
  it("junta classes e resolve conflitos do Tailwind", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});

describe("isUniqueViolation", () => {
  it("reconhece o código P2002 do Prisma", () => {
    expect(isUniqueViolation({ code: "P2002" })).toBe(true);
  });

  it("ignora outros erros", () => {
    expect(isUniqueViolation({ code: "P2025" })).toBe(false);
    expect(isUniqueViolation(new Error("x"))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("P2002")).toBe(false);
  });
});
