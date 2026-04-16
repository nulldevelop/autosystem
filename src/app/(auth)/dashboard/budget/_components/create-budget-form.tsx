"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/kibo-ui/combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  User,
  Car,
  ClipboardCheck,
  Camera,
  Wrench,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  UserPlus,
  PlusCircle,
} from "lucide-react";
import type { Customer, Product, Vehicle } from "@/generated/prisma/client";
import { getCustomers } from "../../customer/_data-access/get-customers";
import { getProducts } from "../../product/_data-access/get-products";
import { getVehicles } from "../../vehicle/_data-access/get-vehicles";
import { createBudget } from "../_actions/create-budget";
import { uploadBudgetPhotos } from "../_actions/upload-budget-photos";
import { CreateCustomerForm } from "../../customer/_components/create-customer-form";
import { CreateVehicleForm } from "../../vehicle/_components/create-vehicle-form";

const formSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente."),
  vehicleId: z.string().min(1, "Selecione um veículo."),
  observacoes: z.string().optional(),
  profitMargin: z.number().min(0, "A margem de lucro não pode ser negativa."),
  kilometers: z.number().default(0),
  fuelLevel: z.string().default("50"),
  checklist: z.any().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productName: z.string().optional(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      }),
    )
    .min(1, "Adicione pelo menos um item ao orçamento."),
});

const STEPS = [
  { id: 1, title: "Identificação", icon: User },
  { id: 2, title: "Anamnese", icon: ClipboardCheck },
  { id: 3, title: "Fotos", icon: Camera },
  { id: 4, title: "Itens e Serviços", icon: Wrench },
  { id: 5, title: "Revisão", icon: CheckCircle2 },
];

const CHECKLIST_ITEMS = [
  { id: "estepe", label: "Estepe" },
  { id: "macaco", label: "Macaco" },
  { id: "chave_roda", label: "Chave de Roda" },
  { id: "triangulo", label: "Triângulo" },
  { id: "extintor", label: "Extintor" },
  { id: "documento", label: "Documento" },
  { id: "radio", label: "Rádio/Painel" },
  { id: "tapetes", label: "Tapetes" },
];

export function CreateBudgetForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedProductQuantity, setSelectedProductQuantity] = useState<number>(1);
  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [customProductName, setCustomProductName] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState<number>(0);
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      observacoes: "",
      profitMargin: 0,
      kilometers: 0,
      fuelLevel: "50",
      checklist: {
        estepe: false,
        macaco: false,
        chave_roda: false,
        triangulo: false,
        extintor: false,
        documento: false,
        radio: false,
        tapetes: false,
      },
      items: [],
    },
  });

  const { append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [marginType, setMarginType] = useState<"percentage" | "manual">("percentage");
  const [manualLaborValue, setManualLaborValue] = useState<number>(0);

  const watchedItems = useWatch({ control: form.control, name: "items" }) || [];
  const profitMargin = useWatch({ control: form.control, name: "profitMargin" }) || 0;
  const customerId = useWatch({ control: form.control, name: "customerId" });
  const vehicleId = useWatch({ control: form.control, name: "vehicleId" });
  const kilometers = useWatch({ control: form.control, name: "kilometers" });

  const subtotal = useMemo(() => {
    return watchedItems.reduce((acc, item) => {
      const q = parseFloat(String(item.quantity)) || 0;
      const p = parseFloat(String(item.unitPrice)) || 0;
      return acc + (q * p);
    }, 0);
  }, [watchedItems]);

  const marginValue = useMemo(() => {
    if (marginType === "percentage") {
      return subtotal * (Number(profitMargin) / 100);
    }
    return manualLaborValue;
  }, [marginType, profitMargin, subtotal, manualLaborValue]);

  const totalGeral = subtotal + marginValue;

  // Sincronizar profitMargin quando manualLaborValue muda
  useEffect(() => {
    if (marginType === "manual" && subtotal > 0) {
      const percentage = (manualLaborValue / subtotal) * 100;
      form.setValue("profitMargin", Number(percentage.toFixed(2)));
    }
  }, [manualLaborValue, subtotal, marginType, form]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => v.customerId === customerId);
  }, [vehicles, customerId]);

  const customerOptions = useMemo(() => customers.map((c) => ({ value: c.id, label: c.name })), [customers]);
  const vehicleOptions = useMemo(() => filteredVehicles.map((v) => ({ value: v.id, label: `${v.marca} ${v.model} (${v.licensePlate})` })), [filteredVehicles]);
  const productOptions = useMemo(() => products.map((p) => ({ value: p.id, label: `${p.name} (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)})` })), [products]);

  const refreshData = useCallback(async () => {
    const [c, v, p] = await Promise.all([getCustomers(), getVehicles(), getProducts()]);
    setCustomers(c); setVehicles(v); setProducts(p);
  }, []);

  useEffect(() => {
    if (open) refreshData();
    else { setCurrentStep(1); form.reset(); setPhotos([]); setPhotoPreviews([]); }
  }, [open, form, refreshData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...files]);
      setPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleAddProduct = () => {
    if (showCustomProductForm) {
      if (!customProductName || customProductPrice <= 0) { toast.error("Preencha os dados do item"); return; }
      append({ productId: `custom-${Date.now()}`, productName: customProductName, quantity: Number(selectedProductQuantity), unitPrice: Number(customProductPrice) });
      setCustomProductName(""); setCustomProductPrice(0); setShowCustomProductForm(false);
    } else {
      const p = products.find(p => p.id === selectedProduct);
      if (!p) return;
      append({ productId: p.id, productName: p.name, quantity: Number(selectedProductQuantity), unitPrice: Number(p.price) });
      setSelectedProduct("");
    }
    setSelectedProductQuantity(1);
    toast.success("Item adicionado");
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const nextStep = async () => {
    if (currentStep === 1) {
      const ok = await form.trigger(["customerId", "vehicleId"]);
      if (!ok) { toast.error("Selecione cliente e veículo"); return; }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await createBudget(values);
      if (!res.success || !res.budgetId) { toast.error(res.message); setIsLoading(false); return; }
      if (photos.length > 0) {
        const fd = new FormData();
        fd.append("budgetId", res.budgetId);
        photos.forEach(f => fd.append("files", f));
        await uploadBudgetPhotos(fd);
      }
      toast.success("Orçamento criado!");
      onOpenChange(false);
      router.refresh();
    } catch (e) { toast.error("Erro ao salvar"); } finally { setIsLoading(false); }
  }

  const handleFinalSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      console.log(form.formState.errors);
      toast.error("Verifique os campos obrigatórios.");
      return;
    }
    form.handleSubmit(onSubmit)();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[95vh] flex flex-col p-0 overflow-hidden border-white/5 bg-zinc-950">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 mb-4">
              {STEPS.map((s) => (
                <div key={s.id} className={`flex items-center gap-2 transition-all ${currentStep === s.id ? "text-primary" : currentStep > s.id ? "text-green-500" : "text-white/20"}`}>
                  <div className={`size-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${currentStep === s.id ? "border-primary bg-primary/10" : currentStep > s.id ? "border-green-500 bg-green-500/10" : "border-white/10"}`}>
                    {currentStep > s.id ? <CheckCircle2 className="size-4" /> : s.id}
                  </div>
                  <span className="hidden md:block text-[10px] font-black uppercase tracking-tighter">{s.title}</span>
                  {s.id < 5 && <div className="hidden md:block w-4 h-px bg-white/10" />}
                </div>
              ))}
            </div>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">{STEPS[currentStep-1].title} <span className="text-primary">Orçamento</span></DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <Form {...form}>
              <form id="budget-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                    <FormField control={form.control} name="customerId" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Cliente</FormLabel>
                          <Button type="button" variant="link" size="sm" onClick={() => setIsCreateCustomerOpen(true)} className="h-auto p-0 text-[10px] font-black uppercase text-primary"><UserPlus className="size-3 mr-1" /> Novo</Button>
                        </div>
                        <Combobox data={customerOptions} onValueChange={field.onChange} value={field.value} type="cliente">
                          <FormControl><ComboboxTrigger className="bg-white/5 border-white/5 h-12 text-white" /></FormControl>
                          <ComboboxContent className="bg-zinc-900 border-white/10"><ComboboxInput placeholder="Pesquisar..." /><ComboboxEmpty>Nada encontrado</ComboboxEmpty><ComboboxList><ComboboxGroup>{customerOptions.map(o => <ComboboxItem key={o.value} value={o.value} className="text-white hover:bg-white/10">{o.label}</ComboboxItem>)}</ComboboxGroup></ComboboxList></ComboboxContent>
                        </Combobox>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleId" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Veículo</FormLabel>
                          <Button type="button" variant="link" size="sm" disabled={!customerId} onClick={() => setIsCreateVehicleOpen(true)} className="h-auto p-0 text-[10px] font-black uppercase text-primary"><PlusCircle className="size-3 mr-1" /> Novo</Button>
                        </div>
                        <Combobox data={vehicleOptions} onValueChange={field.onChange} value={field.value} type="veículo" disabled={!customerId}>
                          <FormControl><ComboboxTrigger className="bg-white/5 border-white/5 h-12 text-white" /></FormControl>
                          <ComboboxContent className="bg-zinc-900 border-white/10"><ComboboxInput placeholder="Pesquisar..." /><ComboboxEmpty>Nada encontrado</ComboboxEmpty><ComboboxList><ComboboxGroup>{vehicleOptions.map(o => <ComboboxItem key={o.value} value={o.value} className="text-white hover:bg-white/10">{o.label}</ComboboxItem>)}</ComboboxGroup></ComboboxList></ComboboxContent>
                        </Combobox>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField control={form.control} name="kilometers" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Quilometragem</FormLabel>
                          <FormControl><Input type="number" className="bg-white/5 border-white/5 h-12 text-white" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="fuelLevel" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Combustível ({field.value}%)</FormLabel>
                          <FormControl><Slider defaultValue={[Number(field.value)]} max={100} step={25} className="py-4" onValueChange={v => field.onChange(v[0].toString())} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Checklist de Entrada</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CHECKLIST_ITEMS.map(i => (
                          <FormField key={i.id} control={form.control} name={`checklist.${i.id}`} render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-xl bg-white/5 border border-white/5">
                              <FormControl><Checkbox checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel className="text-xs font-bold text-white cursor-pointer select-none">{i.label}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="group relative border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-primary/50 transition-all bg-white/[0.02]">
                      <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full" onChange={handlePhotoChange} />
                      <div className="flex flex-col items-center gap-4 relative z-0"><div className="p-4 rounded-2xl bg-primary/10 text-primary"><ImageIcon className="size-8" /></div><p className="text-sm font-bold text-white">Clique ou arraste fotos do veículo</p></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {photoPreviews.map((u, i) => (
                        <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                          <img src={u} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setPhotos(p => p.filter((_, idx) => idx !== i)); setPhotoPreviews(p => p.filter((_, idx) => idx !== i)); }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        {showCustomProductForm ? (
                          <><div className="flex-1"><FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Serviço/Peça Custom</FormLabel><Input value={customProductName} onChange={e => setCustomProductName(e.target.value)} className="bg-white/5 border-white/5 mt-1 text-white" /></div>
                            <div className="w-full md:w-32"><FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Valor</FormLabel><Input type="number" value={customProductPrice} onChange={e => setCustomProductPrice(Number(e.target.value))} className="bg-white/5 border-white/5 mt-1 text-white" /></div></>
                        ) : (
                          <div className="flex-1 flex flex-col"><FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Peça/Serviço</FormLabel>
                            <Combobox data={productOptions} onValueChange={setSelectedProduct} value={selectedProduct} type="produto">
                              <FormControl><ComboboxTrigger className="bg-white/5 border-white/5 h-12 text-white" /></FormControl>
                              <ComboboxContent className="bg-zinc-900 border-white/10"><ComboboxInput placeholder="Pesquisar..." /><ComboboxList><ComboboxGroup>{productOptions.map(o => <ComboboxItem key={o.value} value={o.value} className="text-white hover:bg-white/10">{o.label}</ComboboxItem>)}</ComboboxGroup></ComboboxList></ComboboxContent>
                            </Combobox>
                          </div>
                        )}
                        <div className="w-24"><FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Qtd.</FormLabel><Input type="number" value={selectedProductQuantity} onChange={e => setSelectedProductQuantity(Number(e.target.value))} className="bg-white/5 border-white/5 mt-1 text-white" /></div>
                        <div className="flex gap-2"><Button type="button" onClick={handleAddProduct} className="glow-primary"><Plus className="size-4" /></Button><Button type="button" variant="outline" onClick={() => setShowCustomProductForm(!showCustomProductForm)} className="border-white/10 text-white">{showCustomProductForm ? "Estoque" : "Custom"}</Button></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Itens Adicionados ({watchedItems.length})</FormLabel>
                      <ScrollArea className={cn(
                        "pr-4 transition-all",
                        watchedItems.length > 0 ? "h-[250px] border border-white/5 rounded-2xl bg-white/[0.01] p-3" : "h-auto"
                      )}>
                        <div className="space-y-2">
                          {watchedItems.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                              <div><p className="text-sm font-bold text-white">{item.productName}</p><p className="text-[10px] font-black text-white/40 uppercase">{item.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}</p></div>
                              <div className="flex items-center gap-4"><span className="text-sm font-black text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unitPrice)) || 0))}</span><Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-500/10"><Trash2 className="size-4" /></Button></div>
                            </div>
                          ))}
                          {watchedItems.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center py-8 text-white/20">
                              <Wrench className="size-8 mb-2 opacity-20" />
                              <p className="text-[10px] font-black uppercase italic">Nenhum item adicionado</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Mão de Obra / Margem</FormLabel>
                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/5">
                          <button
                            type="button"
                            onClick={() => setMarginType("percentage")}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all",
                              marginType === "percentage" ? "bg-primary text-black" : "text-white/40 hover:text-white"
                            )}
                          >
                            Porcentagem (%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMarginType("manual")}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all",
                              marginType === "manual" ? "bg-primary text-black" : "text-white/40 hover:text-white"
                            )}
                          >
                            Manual (R$)
                          </button>
                        </div>
                      </div>

                      {marginType === "percentage" ? (
                        <FormField control={form.control} name="profitMargin" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  className="bg-white/5 border-white/5 h-12 text-white pl-4 pr-10 font-bold" 
                                  placeholder="Ex: 20"
                                  {...field} 
                                  onChange={e => field.onChange(Number(e.target.value))} 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black">%</span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )} />
                      ) : (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black">R$</span>
                              <Input 
                                type="number" 
                                step="0.01" 
                                className="bg-white/5 border-white/5 h-12 text-white pl-10 font-bold" 
                                placeholder="0,00"
                                value={manualLaborValue}
                                onChange={e => setManualLaborValue(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                      
                      <p className="text-[9px] font-bold text-primary/50 uppercase italic">
                        Valor calculado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marginValue)}
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Resumo</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-white/40">Cliente:</span><span className="font-bold text-white">{customers.find(c => c.id === customerId)?.name}</span></div>
                          <div className="flex justify-between"><span className="text-white/40">Veículo:</span><span className="font-bold text-white">{filteredVehicles.find(v => v.id === vehicleId)?.marca} {filteredVehicles.find(v => v.id === vehicleId)?.model}</span></div>
                          <div className="flex justify-between"><span className="text-white/40">KM:</span><span className="font-bold text-white">{kilometers} KM</span></div>
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Financeiro</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/40">Subtotal:</span>
                            <span className="font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Margem ({profitMargin}%):</span>
                            <span className="font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marginValue)}</span>
                          </div>
                          <div className="pt-2 border-t border-white/10 flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase text-white">Total Geral:</span>
                            <span className="text-2xl font-black text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <FormField control={form.control} name="observacoes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest">Notas Adicionais</FormLabel>
                        <FormControl><Textarea placeholder="..." className="bg-white/5 border-white/5 min-h-[100px] text-white" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}
              </form>
            </Form>
          </ScrollArea>

          <div className="p-6 border-t border-white/5 flex justify-between bg-white/[0.02]">
            <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isLoading} className="text-white/40 hover:text-white">
              <ArrowLeft className="mr-2 size-4" /> Voltar
            </Button>
            {currentStep < 5 ? (
              <Button type="button" onClick={nextStep} className="glow-primary">Continuar <ArrowRight className="ml-2 size-4" /></Button>
            ) : (
              <Button type="button" onClick={handleFinalSubmit} disabled={isLoading} className="glow-primary px-8">
                {isLoading ? <><Loader2 className="mr-2 size-4 animate-spin" /> ...</> : "Finalizar e Abrir Orçamento"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <CreateCustomerForm open={isCreateCustomerOpen} onOpenChange={o => { setIsCreateCustomerOpen(o); if (!o) refreshData(); }} />
      <CreateVehicleForm open={isCreateVehicleOpen} onOpenChange={o => { setIsCreateVehicleOpen(o); if (!o) refreshData(); }} customers={customers} />
    </>
  );
}
