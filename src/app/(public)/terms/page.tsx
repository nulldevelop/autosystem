import type { Metadata } from "next";
import { company, companyAddressLine } from "@/config/company";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Termos de Uso | AutoSystem",
};

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso">
      <h2>1. Quem somos</h2>
      <p>
        O {company.brand} é um sistema de gestão para oficinas, oferecido por{" "}
        {company.legalName}, {company.legalNature}, CNPJ {company.cnpj}, com
        sede em {companyAddressLine}.
      </p>

      <h2>2. Aceitação</h2>
      <p>
        Ao criar uma conta ou usar o {company.brand}, você declara ter lido e
        concordado com estes Termos e com a Política de Privacidade. Se não
        concordar, não utilize o serviço.
      </p>

      <h2>3. O serviço</h2>
      <p>
        O {company.brand} oferece ferramentas para cadastro de clientes e
        veículos, orçamentos, ordens de serviço, controle de estoque e
        financeiro, relatórios e assinatura digital. Funcionalidades podem
        variar conforme o plano contratado.
      </p>

      <h2>4. Conta e segurança</h2>
      <p>
        Você deve fornecer informações verdadeiras e é responsável por manter a
        confidencialidade de sua senha e por toda atividade realizada na conta,
        inclusive por usuários que você convidar.
      </p>

      <h2>5. Período de teste, planos e pagamento</h2>
      <p>
        Novas contas podem ter um período de teste gratuito. Após esse período,
        o uso continuado depende da contratação de um plano pago. Os valores
        estão descritos na página de planos, e a cobrança é processada pelo
        gateway de pagamento AbacatePay. A falta de pagamento pode resultar na
        limitação ou suspensão do acesso.
      </p>

      <h2>6. Cancelamento e reembolso</h2>
      <p>
        Você pode cancelar a assinatura a qualquer momento, sem multa; o acesso
        permanece até o fim do período já pago. Em contratações feitas pela
        internet, é garantido o direito de arrependimento em até 7 (sete) dias
        corridos após a contratação, nos termos do art. 49 do Código de Defesa
        do Consumidor. Solicite pelo e-mail {company.email}.
      </p>

      <h2>7. Uso aceitável</h2>
      <p>É proibido:</p>
      <ul>
        <li>usar o sistema para fins ilícitos ou fraudulentos;</li>
        <li>
          tentar acessar dados de outras oficinas, burlar limites ou comprometer
          a segurança da plataforma;
        </li>
        <li>inserir dados de terceiros sem base legal para tratá-los;</li>
        <li>revender ou sublicenciar o acesso sem autorização.</li>
      </ul>

      <h2>8. Dados inseridos por você</h2>
      <p>
        Os dados de clientes, veículos, orçamentos e demais registros são de
        responsabilidade da oficina contratante, que deve garantir que sejam
        legítimos e que possui base legal para tratá-los. Você pode solicitar a
        exportação ou exclusão dos seus dados conforme a Política de
        Privacidade.
      </p>

      <h2>9. Disponibilidade e limitação de responsabilidade</h2>
      <p>
        Empenhamo-nos em manter o serviço disponível, mas não garantimos
        funcionamento ininterrupto ou livre de erros. Manutenções e falhas de
        terceiros podem ocorrer. Na extensão permitida pela lei, não respondemos
        por lucros cessantes ou danos indiretos, e nossa responsabilidade total
        fica limitada ao valor pago nos últimos 12 meses. Recomendamos que você
        mantenha cópias dos documentos importantes.
      </p>

      <h2>10. Propriedade intelectual</h2>
      <p>
        O software, a marca {company.brand} e seus elementos pertencem ao
        titular do serviço. Você mantém a titularidade dos dados que insere.
      </p>

      <h2>11. Alterações e encerramento</h2>
      <p>
        Podemos atualizar estes Termos; mudanças relevantes serão comunicadas
        pelo sistema ou por e-mail. Podemos suspender ou encerrar contas que
        violem estes Termos.
      </p>

      <h2>12. Foro e contato</h2>
      <p>
        Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro do
        domicílio do consumidor ou, para pessoas jurídicas, o da Comarca de
        Campina Grande do Sul/PR. Contato: {company.email}.
      </p>
    </LegalPage>
  );
}
