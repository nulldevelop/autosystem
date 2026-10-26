export const company = {
  brand: "AutoSystem",
  legalName: "66.983.110 PEDRO HENRIQUE ANDRADE",
  responsible: "Pedro Henrique Andrade",
  cnpj: "66.983.110/0001-29",
  legalNature: "Microempreendedor Individual (MEI)",
  activity:
    "9511-8/00 - Reparação e manutenção de computadores e de equipamentos periféricos",
  openedAt: "26/05/2026",
  address: {
    street: "Rua Camilo Stelfeld, 149",
    district: "Jardim Santa Rosa",
    city: "Campina Grande do Sul",
    state: "PR",
    zip: "83433-540",
  },
  email: "contato@nulldev.com.br",
  legalUpdatedAt: "26 de outubro de 2026",
} as const;

export const companyAddressLine = `${company.address.street}, ${company.address.district}, ${company.address.city}/${company.address.state}, CEP ${company.address.zip}`;
