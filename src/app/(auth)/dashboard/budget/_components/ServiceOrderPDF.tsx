"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFFooter } from "@/components/pdf/PDFFooter";
import { PDFHeader } from "@/components/pdf/PDFHeader";
import type { BudgetWithRelations } from "@/types/budget";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 100,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    color: "#1E293B",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#0284C7",
    paddingLeft: 8,
  },
  grid: {
    flexDirection: "row",
  },
  gridCol: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  label: {
    fontSize: 7,
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  tableHeaderCol: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
    color: "#334155",
  },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 30,
  },
  totalsBox: {
    width: 250,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
    marginRight: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#E2E8F0",
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
    marginRight: 15,
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0284C7",
    textAlign: "right",
  },
  clauseSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  clauseTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#0284C7",
    paddingLeft: 8,
  },
  clauseText: {
    fontSize: 7,
    color: "#475569",
    lineHeight: 1.5,
    marginBottom: 6,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  signatureLabel: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 8,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  signatureName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 2,
  },
  digitalStamp: {
    padding: "4 8",
    borderWidth: 1,
    borderColor: "#059669",
    borderRadius: 4,
    color: "#059669",
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 5,
  },
});

interface ServiceOrderPDFProps {
  budget: BudgetWithRelations;
}

export function ServiceOrderPDF({ budget }: ServiceOrderPDFProps) {
  const serviceOrder = budget.serviceOrder;
  const items = budget.items || [];

  // Totais vindos do banco de dados (persistidos na criação/aprovação)
  const laborTotal =
    (serviceOrder as any)?.laborValue || (budget as any)?.laborValue || 0;
  const partsTotal =
    (serviceOrder as any)?.itemsAmount || (budget as any)?.itemsAmount || 0;
  const totalAmount = (serviceOrder as any)?.totalAmount || budget.totalAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatNA = (value: string | null | undefined) => {
    return value && value !== "N/A" ? value : "Não informado";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          organization={budget.organization}
          title="Ordem de Serviço"
          documentNumber={
            serviceOrder?.id?.substring(0, 8).toUpperCase() ||
            budget.id.substring(0, 8).toUpperCase()
          }
          documentDate={new Date(budget.createdAt)}
        />

        <View style={styles.section} wrap={false}>
          <View style={styles.grid}>
            <View style={styles.gridCol}>
              <Text style={styles.sectionTitle}>Proprietário</Text>
              <Text style={styles.label}>Nome Completo</Text>
              <Text style={styles.value}>{budget.customer.name}</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Contato</Text>
                <Text style={styles.value}>
                  {formatNA(budget.customer.phone)}
                </Text>
              </View>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.sectionTitle}>Veículo</Text>
              <Text style={styles.label}>Marca / Modelo</Text>
              <Text style={styles.value}>
                {budget.vehicle.marca} {budget.vehicle.model}
              </Text>
              <View style={{ marginTop: 8, flexDirection: "row" }}>
                <View style={{ marginRight: 15 }}>
                  <Text style={styles.label}>Placa</Text>
                  <Text style={styles.value}>
                    {budget.vehicle.licensePlate}
                  </Text>
                </View>
                <View>
                  <Text style={styles.label}>Ano</Text>
                  <Text style={styles.value}>{budget.vehicle.year}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Discriminação dos Serviços e Peças
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <Text style={[styles.tableHeaderCol, { flex: 4 }]}>
                Descrição do Item
              </Text>
              <Text
                style={[
                  styles.tableHeaderCol,
                  { flex: 1, textAlign: "center" },
                ]}
              >
                Qtd
              </Text>
              <Text
                style={[
                  styles.tableHeaderCol,
                  { flex: 1.5, textAlign: "right" },
                ]}
              >
                Unitário
              </Text>
              <Text
                style={[
                  styles.tableHeaderCol,
                  { flex: 1.5, textAlign: "right" },
                ]}
              >
                Total
              </Text>
            </View>
            {items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow} wrap={false}>
                <Text
                  style={[styles.tableCell, { flex: 4, fontWeight: "bold" }]}
                >
                  {item.product?.name || "Item não identificado"}
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 1, textAlign: "center" }]}
                >
                  {item.quantity}
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}
                >
                  {formatCurrency(item.unitPrice)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1.5, textAlign: "right", fontWeight: "bold" },
                  ]}
                >
                  {formatCurrency(item.unitPrice * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalsContainer} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Mão de Obra</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(laborTotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total de Peças</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(partsTotal)}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>VALOR TOTAL DA O.S.</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.clauseSection} wrap={false}>
          <Text style={styles.clauseTitle}>Termos e Condições</Text>
          <Text style={styles.clauseText}>
            1. O cliente autoriza a execução dos serviços acima descritos com
            validade técnica imediata.
          </Text>
          <Text style={styles.clauseText}>
            2. A garantia dos serviços realizados é de 90 dias conforme
            legislação vigente.
          </Text>
          <Text style={styles.clauseText}>
            3. A assinatura digital abaixo confirma a entrega e conformidade do
            veículo e serviços prestados.
          </Text>
        </View>

        <View style={styles.signatureSection} wrap={false}>
          {/* Assinatura do Cliente */}
          <View style={styles.signatureBox}>
            {serviceOrder?.signature ? (
              <View>
                <Image
                  src={serviceOrder.signature}
                  style={{ width: 100, height: 40 }}
                />
                <Text style={{ fontSize: 6, color: "#94A3B8", marginTop: 4 }}>
                  IP: {serviceOrder.id.substring(0, 12)} • Data:{" "}
                  {format(new Date(serviceOrder.signedAt!), "dd/MM/yyyy HH:mm")}
                </Text>
              </View>
            ) : (
              <View style={{ height: 40, justifyContent: "center" }}>
                <Text style={{ fontSize: 7, color: "#CBD5E1", italic: true }}>
                  Aguardando Assinatura Digital
                </Text>
              </View>
            )}
            <Text style={styles.signatureLabel}>Assinatura do Cliente</Text>
            <Text style={styles.signatureName}>{budget.customer.name}</Text>
          </View>

          {/* Assinatura da Oficina (Digital) */}
          <View style={styles.signatureBox}>
            <View style={styles.digitalStamp}>
              <Text>VALIDADO DIGITALMENTE</Text>
            </View>
            <Text style={{ fontSize: 6, color: "#94A3B8", marginBottom: 5 }}>
              AUTENTICAÇÃO:{" "}
              {budget.organization?.id.substring(0, 18).toUpperCase()}
            </Text>
            <Text style={styles.signatureLabel}>Assinatura da Oficina</Text>
            <Text style={styles.signatureName}>
              {budget.organization?.name}
            </Text>
          </View>
        </View>

        <PDFFooter documentId={budget.id} />
      </Page>
    </Document>
  );
}
