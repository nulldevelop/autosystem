import type { Metadata } from "next";
import { company, companyAddressLine } from "@/config/company";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Política de Privacidade | AutoSystem",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade">
      <p>
        Esta política explica como o {company.brand} trata dados pessoais, em
        conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 –
        LGPD).
      </p>

      <h2>1. Controlador dos dados</h2>
      <p>
        {company.legalName}, {company.legalNature}, inscrita no CNPJ sob o nº{" "}
        {company.cnpj}, com sede em {companyAddressLine}. Responsável:{" "}
        {company.responsible}. Contato para assuntos de privacidade:{" "}
        {company.email}.
      </p>
      <p>
        Em relação aos dados de clientes e veículos que a oficina cadastra no
        sistema, a oficina é a controladora e o {company.brand} atua como
        operador, tratando os dados apenas conforme as instruções dela.
      </p>

      <h2>2. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Conta:</strong> nome, e-mail, senha (armazenada de forma
          criptografada) e dados de acesso.
        </li>
        <li>
          <strong>Oficina:</strong> razão social/nome, documento (CNPJ/CPF),
          endereço, telefone e logotipo.
        </li>
        <li>
          <strong>Dados inseridos pela oficina:</strong> clientes, veículos,
          orçamentos, ordens de serviço, estoque, lançamentos financeiros, fotos
          e assinaturas digitais.
        </li>
        <li>
          <strong>Pagamento:</strong> status e identificadores de cobrança.
          Dados de cartão são tratados diretamente pelo gateway de pagamento e
          não ficam armazenados por nós.
        </li>
        <li>
          <strong>Técnicos:</strong> endereço IP, navegador e registros de
          acesso, para segurança e prevenção de abuso.
        </li>
      </ul>

      <h2>3. Finalidades e bases legais</h2>
      <ul>
        <li>Prestar o serviço contratado (execução de contrato).</li>
        <li>
          Processar cobranças e emitir comprovantes (execução de contrato).
        </li>
        <li>
          Garantir a segurança da plataforma e prevenir fraudes (legítimo
          interesse).
        </li>
        <li>Cumprir obrigações legais e regulatórias (obrigação legal).</li>
        <li>
          Enviar comunicações sobre a conta, como recuperação de senha e avisos
          do serviço.
        </li>
      </ul>

      <h2>4. Compartilhamento</h2>
      <p>
        Não vendemos dados pessoais. Compartilhamos apenas o necessário com
        provedores que viabilizam o serviço, como o gateway de pagamento
        AbacatePay, provedores de hospedagem, armazenamento e envio de e-mail.
        Também podemos divulgar dados por determinação legal ou judicial.
      </p>

      <h2>5. Segurança e retenção</h2>
      <p>
        Adotamos medidas técnicas e administrativas para proteger os dados,
        incluindo isolamento dos dados por oficina, controle de acesso e
        criptografia de senhas. Mantemos os dados enquanto a conta estiver ativa
        e, depois, pelo prazo necessário para cumprir obrigações legais ou
        exercer direitos em processos.
      </p>

      <h2>6. Seus direitos</h2>
      <p>
        Nos termos da LGPD, você pode solicitar confirmação de tratamento,
        acesso, correção, anonimização, portabilidade, eliminação, informações
        sobre compartilhamento e revogação de consentimento. Envie o pedido para{" "}
        {company.email}. Se você é cliente de uma oficina, solicite diretamente
        a ela, que é a controladora dos seus dados.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Utilizamos cookies essenciais para autenticação e funcionamento da
        sessão. Não usamos cookies de publicidade.
      </p>

      <h2>8. Alterações</h2>
      <p>
        Podemos atualizar esta política. A data da última atualização consta no
        topo desta página.
      </p>
    </LegalPage>
  );
}
