"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDFFooter } from "@/components/pdf/PDFFooter";
import { PDFHeader } from "@/components/pdf/PDFHeader";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 80,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 25,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    borderStyle: "solid",
  },
  metricLabel: {
    fontSize: 7,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
  contentRow: {
    flexDirection: "row",
    gap: 20,
  },
  tableSection: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderStyle: "solid",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 4,
    marginBottom: 2,
  },
  tableColHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#FFFFFF",
    padding: 6,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderStyle: "solid",
    alignItems: "center",
    minHeight: 25,
  },
  tableCol: {
    fontSize: 8,
    color: "#1E293B",
    padding: 6,
  },
});

interface ReportPDFProps {
  data: any;
  period: { start: Date; end: Date };
  organization?: any;
}

export function ReportPDF({ data, period, organization }: ReportPDFProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const categoryNames: Record<string, string> = {
    SERVICE: "Serviços",
    PRODUCT: "Produtos",
    OTHER: "Outros",
    "N/A": "Não informado",
    BRAINTREE: "Cartão de Crédito",
    PIX: "PIX",
    CASH: "Dinheiro",
    DEBIT: "Débito",
    CREDIT: "Crédito",
    TRANSFER: "Transferência",
    BOLETO: "Boleto",
  };

  const getFriendlyName = (key: string) => categoryNames[key] || key;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <PDFHeader
          organization={organization}
          title="Relatório de Performance"
          layout="landscape"
          documentDate={period.end}
        />

        {/* Top Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Faturamento Total</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(data.metrics.totalRevenue)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Lucro Líquido</Text>
            <Text style={[styles.metricValue, { color: "#16A34A" }]}>
              {formatCurrency(data.metrics.totalNet)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ticket Médio</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(data.metrics.averageTicket)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Novos Clientes</Text>
            <Text style={styles.metricValue}>{data.metrics.newCustomers}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ordens Concluídas</Text>
            <Text style={styles.metricValue}>{data.metrics.completedOS}</Text>
          </View>
        </View>

        {/* Split Tables Section */}
        <View style={styles.contentRow}>
          <View style={styles.tableSection}>
            <Text style={styles.sectionHeader}>Receita por Categoria</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableColHeader, { flex: 2 }]}>
                  Categoria
                </Text>
                <Text
                  style={[
                    styles.tableColHeader,
                    { flex: 1, textAlign: "right" },
                  ]}
                >
                  Participação
                </Text>
                <Text
                  style={[
                    styles.tableColHeader,
                    { flex: 1.5, textAlign: "right" },
                  ]}
                >
                  Valor
                </Text>
              </View>
              {Object.entries(data.revenueByCategory).map(([cat, val]: any) => (
                <View key={cat} style={styles.tableRow}>
                  <Text style={[styles.tableCol, { flex: 2 }]}>
                    {getFriendlyName(cat)}
                  </Text>
                  <Text
                    style={[styles.tableCol, { flex: 1, textAlign: "right" }]}
                  >
                    {((val / data.metrics.totalRevenue) * 100).toFixed(1)}%
                  </Text>
                  <Text
                    style={[
                      styles.tableCol,
                      { flex: 1.5, textAlign: "right", fontWeight: "bold" },
                    ]}
                  >
                    {formatCurrency(val)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tableSection}>
            <Text style={styles.sectionHeader}>Meios de Pagamento</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableColHeader, { flex: 2 }]}>
                  Meio de Pagamento
                </Text>
                <Text
                  style={[
                    styles.tableColHeader,
                    { flex: 1.5, textAlign: "right" },
                  ]}
                >
                  Valor Total
                </Text>
              </View>
              {Object.entries(data.revenueByPaymentMethod).map(
                ([method, val]: any) => (
                  <View key={method} style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>{method}</Text>
                    <Text
                      style={[
                        styles.tableCol,
                        { flex: 1.5, textAlign: "right", fontWeight: "bold" },
                      ]}
                    >
                      {formatCurrency(val)}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}
