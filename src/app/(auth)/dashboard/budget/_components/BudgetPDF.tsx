import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
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
  technicalBadge: {
    backgroundColor: "#ECFDF5",
    color: "#059669",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    marginRight: 5,
    marginBottom: 5,
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

interface BudgetPDFProps {
  budget: BudgetWithRelations;
}

export function BudgetPDF({ budget }: BudgetPDFProps) {
  const subtotal =
    (budget as any).itemsAmount ||
    budget.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const marginValue =
    (budget as any).laborValue || budget.totalAmount - subtotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          organization={budget.organization}
          title="Orçamento Técnico"
          documentNumber={budget.id.substring(0, 8).toUpperCase()}
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
                  {budget.customer.phone || "N/A"}
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

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Anamnese de Entrada</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <View style={styles.technicalBadge}>
              <Text>KM: {budget.kilometers || 0}</Text>
            </View>
            <View style={styles.technicalBadge}>
              <Text>Combustível: {budget.fuelLevel}%</Text>
            </View>
            {budget.checklist ? (
              Object.entries(budget.checklist as Record<string, boolean>).map(
                ([key, value]) =>
                  value ? (
                    <View
                      key={key}
                      style={[
                        styles.technicalBadge,
                        { backgroundColor: "#F1F5F9", color: "#475569" },
                      ]}
                    >
                      <Text>{key.replace("_", " ").toUpperCase()}</Text>
                    </View>
                  ) : (
                    <View key={key} />
                  ),
              )
            ) : (
              <View />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços e Peças</Text>
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
                Subtotal
              </Text>
            </View>
            {budget.items.map((item, index) => (
              <View key={index} style={styles.tableRow} wrap={false}>
                <Text
                  style={[styles.tableCell, { flex: 4, fontWeight: "bold" }]}
                >
                  {item.product.name}
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 1, textAlign: "center" }]}
                >
                  {item.quantity}
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.unitPrice)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1.5, textAlign: "right", fontWeight: "bold" },
                  ]}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.quantity * item.unitPrice)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalsContainer} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal Itens</Text>
              <Text style={styles.totalValue}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Mão de Obra / Margem</Text>
              <Text style={styles.totalValue}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(marginValue)}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL DO ORÇAMENTO</Text>
              <Text style={styles.grandTotalValue}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(budget.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {budget.observacoes ? (
          <View style={{ marginTop: 20 }} wrap={false}>
            <Text style={styles.sectionTitle}>Observações Adicionais</Text>
            <Text style={{ fontSize: 8, color: "#64748B", lineHeight: 1.4 }}>
              {budget.observacoes}
            </Text>
          </View>
        ) : (
          <View />
        )}

        <View style={styles.signatureSection} wrap={false}>
          {/* Assinatura do Cliente */}
          <View style={styles.signatureBox}>
            {budget.signature ? (
              <View>
                <Image
                  src={budget.signature}
                  style={{ width: 100, height: 40 }}
                />
                <Text style={{ fontSize: 6, color: "#94A3B8", marginTop: 4 }}>
                  IP: {budget.id.substring(0, 12)} • Data:{" "}
                  {format(new Date(budget.signedAt!), "dd/MM/yyyy HH:mm")}
                </Text>
              </View>
            ) : (
              <View style={{ height: 40, justifyContent: "center" }}>
                <Text
                  style={{ fontSize: 7, color: "#CBD5E1", fontStyle: "italic" }}
                >
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
