"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFFooter } from "@/components/pdf/PDFFooter";
import { PDFHeader } from "@/components/pdf/PDFHeader";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 100,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    color: "#1E293B",
  },
  statusBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  statusText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  infoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
  },
  divider: {
    marginVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  totalsContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#166534",
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#10B981",
  },
  highlightLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
    textTransform: "uppercase",
  },
  highlightValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#166534",
  },
});

interface ReceiptPDFProps {
  transaction: {
    id: string;
    description: string;
    amount: number;
    costAmount: number;
    netAmount: number;
    status: string;
    createdAt: Date;
    serviceOrder?: {
      customer: { name: string; document?: string };
      vehicle: { licensePlate?: string; marca?: string; model?: string };
    };
  };
  organization?: {
    id: string;
    name: string;
    logo?: string | null;
    phone?: string | null;
    cnpj?: string | null;
    address?: string | null;
  } | null;
}

export function ReceiptPDF({ transaction, organization }: ReceiptPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          organization={organization}
          title="Recibo de Pagamento"
          documentNumber={transaction.id.substring(0, 8).toUpperCase()}
          documentDate={new Date(transaction.createdAt)}
        />

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {transaction.status === "PAID" ? "PAGO" : "PENDENTE"}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>
              {transaction.serviceOrder?.customer?.name || "Não identificado"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Veículo</Text>
            <Text style={styles.infoValue}>
              {transaction.serviceOrder?.vehicle?.marca}{" "}
              {transaction.serviceOrder?.vehicle?.model} -{" "}
              {transaction.serviceOrder?.vehicle?.licensePlate || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Emissão</Text>
            <Text style={styles.infoValue}>
              {format(
                new Date(transaction.createdAt),
                "dd 'de' MMMM 'de' yyyy",
                { locale: ptBR },
              )}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descrição</Text>
            <Text style={styles.infoValue}>{transaction.description}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor Bruto</Text>
            <Text style={styles.totalValue}>
              R$ {transaction.amount.toFixed(2).replace(".", ",")}
            </Text>
          </View>

          {transaction.costAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ ...styles.totalLabel, color: "#B45309" }}>
                Custo de Peças
              </Text>
              <Text style={{ ...styles.totalValue, color: "#B45309" }}>
                -R$ {transaction.costAmount.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          )}

          <View style={styles.highlightRow}>
            <Text style={styles.highlightLabel}>Total Recebido</Text>
            <Text style={styles.highlightValue}>
              R$ {transaction.netAmount.toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        <PDFFooter documentId={transaction.id} />
      </Page>
    </Document>
  );
}
