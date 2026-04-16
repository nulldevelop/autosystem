"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDFFooter } from "@/components/pdf/PDFFooter";
import { PDFHeader } from "@/components/pdf/PDFHeader";
import type { Product } from "@/generated/prisma/client";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 80,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 4,
    marginBottom: 4,
  },
  tableColHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
    padding: 8,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
    minHeight: 35,
  },
  tableCol: {
    fontSize: 9,
    color: "#1E293B",
    padding: 8,
  },
  colSku: { width: "12%" },
  colName: { width: "38%" },
  colCat: { width: "15%" },
  colStock: { width: "10%", textAlign: "right" },
  colPrice: { width: "12.5%", textAlign: "right" },
  colTotal: { width: "12.5%", textAlign: "right" },

  summarySection: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
  },
  summaryItem: {
    alignItems: "right",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
});

interface InventoryReportPDFProps {
  products: Product[];
  organization: any;
  title: string;
}

export function InventoryReportPDF({
  products,
  organization,
  title,
}: InventoryReportPDFProps) {
  const totalValue = products.reduce(
    (acc, p) => acc + p.price * p.stockQuantity,
    0,
  );
  const totalItems = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <PDFHeader
          organization={organization}
          title={title}
          layout="landscape"
        />

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableColHeader, styles.colName]}>
              Produto / Descrição
            </Text>
            <Text style={[styles.tableColHeader, styles.colCat]}>
              Categoria
            </Text>
            <Text style={[styles.tableColHeader, styles.colStock]}>
              Estoque
            </Text>
            <Text style={[styles.tableColHeader, styles.colPrice]}>
              Preço Unit.
            </Text>
            <Text style={[styles.tableColHeader, styles.colTotal]}>
              Subtotal
            </Text>
          </View>

          {products.map((product) => (
            <View key={product.id} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.colSku]}>
                {product.sku}
              </Text>
              <Text style={[styles.tableCol, styles.colName]}>
                {product.name}
              </Text>
              <Text style={[styles.tableCol, styles.colCat]}>
                {product.category}
              </Text>
              <Text style={[styles.tableCol, styles.colStock]}>
                {product.stockQuantity} {product.unit}
              </Text>
              <Text style={[styles.tableCol, styles.colPrice]}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.price)}
              </Text>
              <Text style={[styles.tableCol, styles.colTotal]}>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.price * product.stockQuantity)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Itens Totais</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Valor Total em Estoque</Text>
            <Text style={[styles.summaryValue, { color: "#16A34A" }]}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalValue)}
            </Text>
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
}
