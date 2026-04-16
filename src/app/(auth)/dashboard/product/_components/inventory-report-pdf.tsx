"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Product } from "@/generated/prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 25,
    marginBottom: 30,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    width: "60%",
  },
  systemLogo: {
    width: 45,
    height: 45,
  },
  orgLogo: {
    width: 55,
    height: 55,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  orgTextContainer: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  orgDetails: {
    fontSize: 8.5,
    color: "#64748B",
    lineHeight: 1.4,
  },
  titleSection: {
    width: "35%",
    alignItems: "right",
    justifyContent: "center",
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "right",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  reportMeta: {
    fontSize: 9,
    color: "#94A3B8",
    textAlign: "right",
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
  // Colunas específicas para Landscape
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
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94A3B8",
  },
});

interface InventoryReportPDFProps {
  products: Product[];
  organization: any;
  title: string;
}

export function InventoryReportPDF({ products, organization, title }: InventoryReportPDFProps) {
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stockQuantity), 0);
  const totalItems = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const systemLogoUrl = `${origin}/images/logo.png`;
  const orgLogoUrl = organization?.logo 
    ? (organization.logo.startsWith('http') ? organization.logo : `${origin}${organization.logo}`)
    : null;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Cabeçalho Profissional */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={systemLogoUrl} style={styles.systemLogo} />
            
            {orgLogoUrl && (
              <Image 
                src={orgLogoUrl} 
                style={[styles.orgLogo, { objectFit: 'contain' }]} 
              />
            )}
            
            <View style={styles.orgTextContainer}>
              <Text style={styles.orgName}>{organization?.name || "Oficina Mecânica"}</Text>
              <Text style={styles.orgDetails}>{organization?.address}</Text>
              <Text style={styles.orgDetails}>
                CNPJ: {organization?.cnpj}  •  TEL: {organization?.phone}
              </Text>
            </View>
          </View>
          
          <View style={styles.titleSection}>
            <Text style={styles.reportTitle}>{title}</Text>
            <Text style={styles.reportMeta}>
              Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
          </View>
        </View>

        {/* Tabela Técnica */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableColHeader, styles.colName]}>Produto / Descrição</Text>
            <Text style={[styles.tableColHeader, styles.colCat]}>Categoria</Text>
            <Text style={[styles.tableColHeader, styles.colStock]}>Estoque</Text>
            <Text style={[styles.tableColHeader, styles.colPrice]}>Preço Unit.</Text>
            <Text style={[styles.tableColHeader, styles.colTotal]}>Subtotal</Text>
          </View>

          {products.map((product) => (
            <View key={product.id} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.colSku]}>{product.sku}</Text>
              <Text style={[styles.tableCol, styles.colName]}>{product.name}</Text>
              <Text style={[styles.tableCol, styles.colCat]}>{product.category}</Text>
              <Text style={[styles.tableCol, styles.colStock]}>
                {product.stockQuantity} {product.unit}
              </Text>
              <Text style={[styles.tableCol, styles.colPrice]}>
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
              </Text>
              <Text style={[styles.tableCol, styles.colTotal]}>
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price * product.stockQuantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Resumo Consolidado */}
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Itens Totais</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Valor Total em Estoque</Text>
            <Text style={[styles.summaryValue, { color: "#16A34A" }]}>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)}
            </Text>
          </View>
        </View>

        {/* Rodapé Institucional */}
        <View style={styles.footer}>
          <Text>AutoSystem - Tecnologia Automotiva de Alta Performance</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
