"use client";

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { BudgetWithRelations } from "@/types/budget";

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#22c55e",
    paddingBottom: 10,
  },
  headerInfo: {
    textAlign: "right",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22c55e",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#4a4a4a",
  },
  logo: {
    width: 80,
    height: 80,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#22c55e",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 5,
  },
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
  },
  table: {
    display: "flex",
    width: "auto",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    alignItems: "center",
  },
  tableRowHeader: {
    backgroundColor: "#f7f7f7",
    fontWeight: "bold",
  },
  tableColHeader: {
    padding: 8,
    fontWeight: "bold",
    fontSize: 10,
  },
  tableCol: {
    padding: 8,
  },
  colProduto: {
    width: "40%",
  },
  colQtd: {
    width: "15%",
    textAlign: "center",
  },
  colPreco: {
    width: "20%",
    textAlign: "right",
  },
  colTotal: {
    width: "25%",
    textAlign: "right",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#22c55e",
    marginLeft: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "grey",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signature: {
    width: "40%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    textAlign: "center",
    paddingTop: 5,
  },
});

interface ServiceOrderPDFProps {
  budget: BudgetWithRelations;
}

export function ServiceOrderPDF({ budget }: ServiceOrderPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {budget.organization?.logo ? (
            <Image
              style={styles.logo}
              src={budget.organization.logo}
            />
          ) : (
            <Text style={styles.headerTitle}>{budget.organization?.name}</Text>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{budget.organization?.name}</Text>
            <Text style={styles.headerSubtitle}>
              {budget.organization?.address}
            </Text>
            <Text style={styles.headerSubtitle}>
              CNPJ: {budget.organization?.cnpj}
            </Text>
            <Text style={styles.headerSubtitle}>
              Telefone: {budget.organization?.phone}
            </Text>
          </View>
        </View>

        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Ordem de Serviço</Text>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Nº:</Text>{" "}
              {budget.id.substring(0, 6)}
            </Text>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Data:</Text>{" "}
              {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text>{budget.customer.name}</Text>
            <Text>{budget.customer.email}</Text>
            <Text>
              {budget.customer.documentType}: {budget.customer.document}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Modelo:</Text>{" "}
            {budget.vehicle.marca} {budget.vehicle.model}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Ano:</Text> {budget.vehicle.year}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Placa:</Text>{" "}
            {budget.vehicle.licensePlate}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowHeader]}>
              <Text style={[styles.tableColHeader, styles.colProduto]}>
                Produto/Serviço
              </Text>
              <Text style={[styles.tableColHeader, styles.colQtd]}>Qtd.</Text>
              <Text style={[styles.tableColHeader, styles.colPreco]}>
                Preço Unit.
              </Text>
              <Text style={[styles.tableColHeader, styles.colTotal]}>
                Total
              </Text>
            </View>
            {budget.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? { backgroundColor: "#f7f7f7" } : {},
                ]}
              >
                <Text style={[styles.tableCol, styles.colProduto]}>
                  {item.product.name}
                </Text>
                <Text style={[styles.tableCol, styles.colQtd]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCol, styles.colPreco]}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCol, styles.colTotal]}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.quantity * item.unitPrice)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalText}>Valor Total:</Text>
          <Text style={styles.totalAmount}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(budget.totalAmount)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text>{budget.observacoes || "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cláusulas Contratuais</Text>
          <Text>
            1. O cliente autoriza a execução dos serviços e a substituição das
            peças descritas neste documento.
          </Text>
          <Text>
            2. A oficina não se responsabiliza por objetos deixados no interior
            do veículo.
          </Text>
          <Text>
            3. O pagamento deverá ser efetuado na retirada do veículo.
          </Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signature}>
            <Text>{budget.customer.name}</Text>
            <Text>Assinatura do Cliente</Text>
          </View>
          <View style={styles.signature}>
            <Text>{budget.organization?.name}</Text>
            <Text>Assinatura da Oficina</Text>
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
