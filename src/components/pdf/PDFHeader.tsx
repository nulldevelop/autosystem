import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const styles = StyleSheet.create({
  // Portrait Styles
  headerContainerPortrait: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
  },
  subHeaderContainerPortrait: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: "8 15",
    borderRadius: 8,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoPortrait: {
    width: 75,
    height: 75,
    marginRight: 20,
    borderRadius: 8,
    objectFit: "contain",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  brandSubtitle: {
    fontSize: 7,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  orgDetails: {
    fontSize: 7,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 1.6,
    maxWidth: 400,
  },
  docTitlePortrait: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0284C7",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  docInfoPortrait: {
    flexDirection: "row",
    gap: 15,
  },
  docNumberPortrait: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
  },
  docDatePortrait: {
    fontSize: 8,
    color: "#64748B",
  },

  // Landscape Styles
  headerLandscape: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 25,
    marginBottom: 30,
  },
  logoSectionLandscape: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    width: "60%",
  },
  systemLogoLandscape: {
    width: 45,
    height: 45,
  },
  orgLogoLandscape: {
    width: 55,
    height: 55,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    objectFit: "contain",
  },
  orgTextContainerLandscape: {
    flex: 1,
  },
  orgNameLandscape: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  orgDetailsLandscape: {
    fontSize: 8.5,
    color: "#64748B",
    lineHeight: 1.4,
  },
  titleSectionLandscape: {
    width: "35%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  reportTitleLandscape: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "right",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  reportMetaLandscape: {
    fontSize: 8,
    color: "#94A3B8",
    textAlign: "right",
  },
});

interface PDFHeaderProps {
  organization: any;
  title: string;
  subtitle?: string;
  documentNumber?: string;
  documentDate?: Date;
  layout?: "portrait" | "landscape";
}

export function PDFHeader({
  organization,
  title,
  subtitle = "Tecnologia e Performance Automotiva",
  documentNumber,
  documentDate = new Date(),
  layout = "portrait",
}: PDFHeaderProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL as string;

  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  };

  const orgLogoUrl = getFullUrl(organization?.logo);
  const systemLogoUrl = `${baseUrl.replace(/\/$/, "")}/images/logo.png`;

  const formatNA = (value: string | null | undefined) => {
    return value && value !== "N/A" ? value : "Não informado";
  };

  if (layout === "landscape") {
    return (
      <View style={styles.headerLandscape}>
        <View style={styles.logoSectionLandscape}>
          <Image src={systemLogoUrl} style={styles.systemLogoLandscape} />
          {orgLogoUrl ? (
            <Image src={orgLogoUrl} style={styles.orgLogoLandscape} />
          ) : (
            <View />
          )}
          <View style={styles.orgTextContainerLandscape}>
            <Text style={styles.orgNameLandscape}>
              {organization?.name || "AUTO SYSTEM"}
            </Text>
            <Text style={styles.orgDetailsLandscape}>
              {organization?.address}
            </Text>
            <Text style={styles.orgDetailsLandscape}>
              CNPJ: {organization?.cnpj} • TEL: {organization?.phone}
            </Text>
          </View>
        </View>

        <View style={styles.titleSectionLandscape}>
          <Text style={styles.reportTitleLandscape}>{title}</Text>
          <Text style={styles.reportMetaLandscape}>
            Gerado em:{" "}
            {format(documentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.headerContainerPortrait}>
        <View style={styles.brandContainer}>
          <Image
            src={orgLogoUrl || systemLogoUrl}
            style={styles.logoPortrait}
          />
          <View>
            <Text style={styles.brandName}>
              {organization?.name || "AUTO SYSTEM"}
            </Text>
            <Text style={styles.brandSubtitle}>{subtitle}</Text>
            {organization ? (
              <View style={styles.orgDetails}>
                <Text>CNPJ: {formatNA(organization.cnpj)}</Text>
                <Text>{formatNA(organization.address)}</Text>
                <Text>Tel: {formatNA(organization.phone)}</Text>
              </View>
            ) : (
              <View />
            )}
          </View>
        </View>
      </View>

      <View style={styles.subHeaderContainerPortrait}>
        <Text style={styles.docTitlePortrait}>{title}</Text>
        <View style={styles.docInfoPortrait}>
          {documentNumber && (
            <Text style={styles.docNumberPortrait}>Nº {documentNumber}</Text>
          )}
          <Text style={styles.docDatePortrait}>
            Emissão:{" "}
            {format(documentDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </Text>
        </View>
      </View>
    </View>
  );
}
