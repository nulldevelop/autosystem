"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Image as ImageIcon,
  Loader2,
  MapPin,
  Save,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  updateOrganizationData,
  updateOrganizationLogo,
} from "../../_actions/create-organization";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  phone: z
    .string()
    .min(11, { message: "O telefone deve ter pelo menos 11 caracteres." }),
  cnpj: z
    .string()
    .min(14, { message: "O CNPJ deve ter pelo menos 14 caracteres." }),
  street: z.string().min(1, { message: "Rua é obrigatória." }),
  number: z.string().min(1, { message: "Número é obrigatório." }),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório." }),
  city: z.string().min(1, { message: "Cidade é obrigatória." }),
  state: z.string().min(2, { message: "Estado é obrigatório." }),
  cep: z.string().min(8, { message: "CEP inválido." }),
});

type FormValues = z.infer<typeof formSchema>;

interface ConfigFormProps {
  organization: {
    id: string;
    name: string;
    logo?: string | null;
    phone?: string | null;
    cnpj?: string | null;
    address?: string | null;
  } | null;
}

function parseAddress(address: string | null | undefined) {
  if (!address) {
    return {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      cep: "",
    };
  }

  const cepMatch = address.match(/CEP:\s*([\d-]+)/);
  const cep = cepMatch ? cepMatch[1] : "";

  const addressWithoutCep = address.replace(/,?\s*CEP:\s*[\d-]+/, "");

  const parts = addressWithoutCep.split(" - ");
  const streetNumberPart = parts[0] || "";
  const neighborhoodCityStatePart = parts[1] || "";

  const streetNumberMatch = streetNumberPart.match(/^(.+?),\s*(.+)$/);
  const street = streetNumberMatch
    ? streetNumberMatch[1].trim()
    : streetNumberPart;
  const number = streetNumberMatch ? streetNumberMatch[2].trim() : "";

  const neighborhoodCityMatch =
    neighborhoodCityStatePart.match(/^(.+?),\s*(.+)$/);
  const neighborhood = neighborhoodCityMatch
    ? neighborhoodCityMatch[1].trim()
    : "";
  const cityState = neighborhoodCityMatch
    ? neighborhoodCityMatch[2]
    : neighborhoodCityStatePart;

  const cityStateMatch = cityState.match(/^(.+?),\s*(.+)$/);
  const city = cityStateMatch ? cityStateMatch[1].trim() : cityState;
  const state = cityStateMatch ? cityStateMatch[2].trim() : "";

  return { street, number, neighborhood, city, state, cep };
}

export function ConfigForm({ organization }: ConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logo, setLogo] = useState<string | undefined>(
    organization?.logo ?? undefined,
  );

  const addressParts = parseAddress(organization?.address);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization?.name ?? "",
      phone: organization?.phone ?? "",
      cnpj: organization?.cnpj ?? "",
      street: addressParts.street,
      number: addressParts.number,
      neighborhood: addressParts.neighborhood,
      city: addressParts.city,
      state: addressParts.state,
      cep: addressParts.cep,
    },
  });

  async function onSubmit(values: FormValues) {
    if (!organization) return;

    setIsLoading(true);
    try {
      const fullAddress = `${values.street}, ${values.number} - ${values.neighborhood}, ${values.city} - ${values.state}, CEP: ${values.cep}`;
      const result = await updateOrganizationData(organization.id, {
        name: values.name,
        phone: values.phone,
        cnpj: values.cnpj,
        address: fullAddress,
      });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (_error) {
      toast.error("Erro ao atualizar dados.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !organization) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", organization.id);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.url) {
        await updateOrganizationLogo(organization.id, data.url);
        setLogo(data.url);
        toast.success("Logo atualizado com sucesso!");
      }
    } catch (_error) {
      toast.error("Erro ao fazer upload do logo.");
    } finally {
      setIsUploading(false);
    }
  }

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    form.setValue("cep", cleanCep);
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCep}/json/`,
        );
        const data = await response.json();
        if (!data.erro) {
          form.setValue("street", data.logradouro || "");
          form.setValue("neighborhood", data.bairro || "");
          form.setValue("city", data.localidade || "");
          form.setValue("state", data.uf || "");
        }
      } catch (e) {
        console.error("Erro ao buscar CEP:", e);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-10 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">
                Identidade Visual
              </h2>
              <p className="text-xs text-white/40 font-medium">
                Personalize a aparência da sua oficina
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 p-6 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="relative group">
              <div
                className={cn(
                  "w-32 h-32 rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed flex items-center justify-center transition-all",
                  logo
                    ? "border-transparent"
                    : "border-white/10 group-hover:border-primary/50",
                )}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-12 h-12 text-white/20" />
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <Loader2 className="size-8 text-primary animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Logo da Empresa</h3>
              <p className="text-sm text-white/40 mb-4">
                Envie uma imagem quadrada (PNG ou JPG)
              </p>
              <label>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  disabled={isUploading}
                  onClick={() => {
                    const input = document.getElementById("logo-input");
                    input?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logo ? "Alterar" : "Enviar"} Logo
                </Button>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Save className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">
                Informações da Empresa
              </h2>
              <p className="text-xs text-white/40 font-medium">
                Dados cadastrais da sua oficina
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 md:col-span-2 lg:col-span-2">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                Nome da Oficina
              </label>
              <Input
                {...form.register("name")}
                placeholder="Ex: Precision Motors"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                CNPJ
              </label>
              <Input
                {...form.register("cnpj")}
                placeholder="00.000.000/0001-00"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.cnpj && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.cnpj.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                WhatsApp
              </label>
              <Input
                {...form.register("phone")}
                placeholder="(11) 99999-9999"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">
                Endereço
              </h2>
              <p className="text-xs text-white/40 font-medium">
                Localização da sua oficina
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <div className="space-y-2 lg:col-span-3">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                CEP
              </label>
              <Input
                {...form.register("cep")}
                placeholder="00000-000"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
                onChange={(e) => handleCepChange(e.target.value)}
              />
              {form.formState.errors.cep && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.cep.message}
                </p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-6">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                Rua
              </label>
              <Input
                {...form.register("street")}
                placeholder="Rua/Avenida"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.street && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.street.message}
                </p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-3">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                Número
              </label>
              <Input
                {...form.register("number")}
                placeholder="123"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.number && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.number.message}
                </p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-4">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                Bairro
              </label>
              <Input
                {...form.register("neighborhood")}
                placeholder="Centro"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.neighborhood && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.neighborhood.message}
                </p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-5">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                Cidade
              </label>
              <Input
                {...form.register("city")}
                placeholder="São Paulo"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.city && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-3">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                Estado
              </label>
              <Input
                {...form.register("state")}
                placeholder="SP"
                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
              />
              {form.formState.errors.state && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.state.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </div>
  );
}
