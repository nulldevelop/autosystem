"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ChevronRight, ChevronLeft, Check, Zap, Clock, ShieldCheck, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { extractCnpj, formatCnpj } from "@/utils/formatCNPJ";
import {
  checkOrganizationSlug,
  createOrganization,
  updateOrganizationLogo,
} from "../_actions/create-organization";
import { extractPhoneNumber, formatPhone } from "@/utils/formatPhone";
import { LogoDropzone } from "./LogoDropzone";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome da oficina deve ter pelo menos 2 caracteres." }),
  slug: z.string().min(2, { message: "O slug deve ter pelo menos 2 caracteres." }).regex(/^[a-z0-9-]+$/),
  logo: z.union([z.string(), z.instanceof(File)]).optional(),
  cep: z.string().min(8, { message: "CEP inválido." }),
  street: z.string().min(1, { message: "Rua é obrigatória." }),
  number: z.string().min(1, { message: "Número é obrigatório." }),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório." }),
  city: z.string().min(1, { message: "Cidade é obrigatória." }),
  state: z.string().min(2, { message: "Estado é obrigatório." }),
  phone: z.string().min(11, { message: "O telefone deve ter pelo menos 11 caracteres." }),
  cnpj: z.string().min(14, { message: "O CNPJ deve ter pelo menos 14 caracteres." }),
  plan: z.string().default("TRIAL"),
});

type Step = 1 | 2 | 3 | 4;

export function CreateOrganizationForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", slug: "", logo: undefined,
      cep: "", street: "", number: "", neighborhood: "", city: "", state: "",
      phone: "", cnpj: "", plan: "TRIAL",
    },
  });

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    form.setValue("cep", cleanCep);
    if (cleanCep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          form.setValue("street", data.logradouro);
          form.setValue("neighborhood", data.bairro);
          form.setValue("city", data.localidade);
          form.setValue("state", data.uf);
          form.clearErrors(["street", "neighborhood", "city", "state"]);
          document.getElementById("address-number")?.focus();
        }
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  const nextStep = async () => {
    const fieldsByStep: Record<number, any[]> = {
      1: ["name", "slug", "cnpj"],
      2: ["cep", "street", "number", "neighborhood", "city", "state", "phone"],
      3: ["logo"],
      4: ["plan"],
    };
    const isValid = await form.trigger(fieldsByStep[step]);
    if (isValid) setStep((s) => (s + 1) as Step);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const fullAddress = `${values.street}, ${values.number} - ${values.neighborhood}, ${values.city} - ${values.state}, CEP: ${values.cep}`;
      
      const result = await createOrganization({
        name: values.name,
        slug: values.slug,
        address: fullAddress,
        phone: extractPhoneNumber(values.phone),
        cnpj: extractCnpj(values.cnpj),
      });

      if (!result.success || !result.organizationId) {
        toast.error(result.message);
        return;
      }

      // Upload Logo se existir
      if (values.logo instanceof File) {
        const formData = new FormData();
        formData.append("file", values.logo);
        formData.append("organizationId", result.organizationId);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.url) await updateOrganizationLogo(result.organizationId, uploadData.url);
      }

      // AÇÃO CHAVE: Define a organização como ativa na sessão do Better Auth
      await authClient.organization.setActive({
        organizationId: result.organizationId,
      });

      toast.success("Sua oficina está pronta!");
      
      // Sincroniza a sessão do cliente e redireciona
      await authClient.getSession();
      onOpenChange(false);
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao configurar oficina.");
    } finally {
      setIsLoading(false);
    }
  }

  const prevStep = () => setStep((s) => (s - 1) as Step);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="flex h-full min-h-[500px]">
          <div className="hidden md:flex w-64 bg-white/[0.02] border-r border-white/5 p-8 flex-col gap-8">
            <div className="space-y-6">
              {[
                { s: 1, label: "Informações Básicas", icon: ShieldCheck },
                { s: 2, label: "Contato e Local", icon: Clock },
                { s: 3, label: "Identidade Visual", icon: Zap },
                { s: 4, label: "Plano e Ativação", icon: Check },
              ].map((item) => (
                <div key={item.s} className={cn("flex items-center gap-3 transition-colors", step >= item.s ? "text-primary" : "text-white/20")}>
                  <div className={cn("size-8 rounded-full border flex items-center justify-center text-xs font-black", step === item.s ? "border-primary bg-primary/10" : step > item.s ? "bg-primary border-primary text-black" : "border-white/10")}>
                    {step > item.s ? <Check size={14} /> : item.s}
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest leading-none">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col h-full">
            <DialogHeader className="mb-8 text-left">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {step === 1 && "Bem-vindo ao AutoSystem"}
                {step === 2 && "Localização"}
                {step === 3 && "Sua Marca"}
                {step === 4 && "Escolha seu Plano"}
              </DialogTitle>
              <DialogDescription className="text-white/40 font-medium">
                Passo {step} de 4
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Nome da Oficina</FormLabel>
                        <FormControl><Input placeholder="Ex: Precision Motors" className="bg-white/5 border-white/10 h-12" {...field} onChange={(e) => { field.onChange(e); form.setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="cnpj" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">CNPJ</FormLabel>
                        <FormControl><Input placeholder="00.000.000/0001-00" className="bg-white/5 border-white/10 h-12" {...field} onChange={(e) => field.onChange(formatCnpj(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Slug</FormLabel>
                        <FormControl><Input placeholder="meu-negocio" className="bg-white/5 border-white/10 h-12 opacity-50" {...field} disabled /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="cep" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">CEP</FormLabel>
                          <FormControl><Input placeholder="00000-000" className="bg-white/5 border-white/10 h-12" {...field} onChange={(e) => handleCepChange(e.target.value)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">WhatsApp</FormLabel>
                          <FormControl><Input placeholder="(11) 99999-9999" className="bg-white/5 border-white/10 h-12" {...field} onChange={(e) => field.onChange(formatPhone(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="street" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Endereço</FormLabel>
                        <FormControl><Input placeholder="Rua..." className="bg-white/5 border-white/10 h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField control={form.control} name="number" render={({ field }) => (
                        <FormItem><FormControl><Input id="address-number" placeholder="Nº" className="bg-white/5 border-white/10 h-12" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="neighborhood" render={({ field }) => (
                        <FormItem className="col-span-2"><FormControl><Input placeholder="Bairro" className="bg-white/5 border-white/10 h-12" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField control={form.control} name="logo" render={({ field }) => (
                      <FormItem>
                        <FormControl><LogoDropzone value={field.value} onChange={field.onChange} disabled={isLoading} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button type="button" onClick={() => form.setValue("plan", "TRIAL")} className={cn("w-full p-4 rounded-xl border text-left transition-all", form.watch("plan") === "TRIAL" ? "border-primary bg-primary/5" : "border-white/5 bg-white/2 hover:border-white/10")}>
                      <div className="flex justify-between items-center"><h4 className="font-black italic uppercase tracking-tighter">Teste Grátis (3 dias)</h4><Check className={cn("size-4 text-primary", form.watch("plan") === "TRIAL" ? "opacity-100" : "opacity-0")} /></div>
                    </button>
                    {subscriptionPlans.map((p) => (
                      <button key={p.slug} type="button" onClick={() => form.setValue("plan", p.slug)} className={cn("w-full p-4 rounded-xl border text-left transition-all", form.watch("plan") === p.slug ? "border-primary bg-primary/5" : "border-white/5 bg-white/2 hover:border-white/10")}>
                        <div className="flex justify-between items-center"><h4 className="font-black italic uppercase tracking-tighter">{p.name}</h4><Check className={cn("size-4 text-primary", form.watch("plan") === p.slug ? "opacity-100" : "opacity-0")} /></div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-8 flex items-center justify-between gap-4">
                  {step > 1 && <Button type="button" variant="outline" onClick={prevStep} className="h-12 bg-transparent border-white/10">Voltar</Button>}
                  {step < 4 ? (
                    <Button type="button" onClick={nextStep} className="h-12 flex-1 font-black uppercase tracking-widest text-xs">Próximo</Button>
                  ) : (
                    <Button type="submit" disabled={isLoading} className="h-12 flex-1 font-black uppercase tracking-widest text-xs shadow-primary/20 shadow-xl">{isLoading ? "Processando..." : "Finalizar Configuração"}</Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
