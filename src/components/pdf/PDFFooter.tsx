import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerAuthContainer: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 6,
    color: "#94A3B8",
    lineHeight: 1.2,
  },
  authHighlight: {
    fontWeight: "bold",
    color: "#64748B",
    fontSize: 7,
  },
  footerLogo: {
    width: 35,
  },
  pageNumber: {
    fontSize: 7,
    color: "#CBD5E1",
    width: 60,
    textAlign: "right",
  },
});

interface PDFFooterProps {
  documentId?: string;
}

export function PDFFooter({ documentId }: PDFFooterProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const systemLogoUrl = `${baseUrl.replace(/\/$/, "")}/images/logo.png`;

  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerRow}>
        <Image src={systemLogoUrl} style={styles.footerLogo} />
        <View style={styles.footerAuthContainer}>
          <Text style={[styles.footerText, styles.authHighlight]}>
            AUTENTICIDADE DIGITAL AUTOSYSTEM
          </Text>
          <Text style={styles.footerText}>
            Este documento foi gerado eletronicamente e é autêntico.
          </Text>
          {documentId ? (
            <Text style={[styles.footerText, { fontFamily: "Courier" }]}>
              CÓDIGO DE VERIFICAÇÃO: {documentId.toUpperCase()}
            </Text>
          ) : (
            <View />
          )}
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
      </View>
    </View>
  );
}
