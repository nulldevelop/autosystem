import type { Metadata } from "next";
import { company } from "@/config/company";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Exclusão de Dados | AutoSystem",
};

const subject = encodeURIComponent("Solicitação de exclusão de dados");

export default function DataDeletionPage() {
  return (
    <LegalPage title="Exclusão de Dados do Usuário">
      <p>
        Você tem direito de solicitar a eliminação dos seus dados pessoais, nos
        termos do art. 18 da Lei Geral de Proteção de Dados (Lei nº
        13.709/2018). Esta página explica como pedir a exclusão da sua conta e
        dos dados associados no {company.brand}.
      </p>

      <h2>1. Excluir pela sua conta</h2>
      <p>
        Com a conta ativa, acesse <strong>Configurações</strong> no painel e use
        a opção <strong>Excluir minha conta</strong>, na parte final da página.
        Antes de excluir, use <strong>Baixar meus dados</strong> para obter uma
        cópia em JSON. Você confirma com a senha e a exclusão é imediata. Se a
        oficina tiver outros membros, remova-os antes.
      </p>

      <h2>2. Solicitar por e-mail</h2>
      <p>
        Envie um e-mail para{" "}
        <a
          href={`mailto:${company.email}?subject=${subject}`}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {company.email}
        </a>{" "}
        com o assunto "Solicitação de exclusão de dados", a partir do e-mail
        cadastrado na conta, informando:
      </p>
      <ul>
        <li>seu nome completo e o e-mail da conta;</li>
        <li>o nome da oficina, se houver;</li>
        <li>
          se deseja excluir apenas seus dados pessoais ou a conta inteira da
          oficina, com todos os registros.
        </li>
      </ul>
      <p>
        Para sua segurança, podemos pedir uma confirmação adicional de
        identidade antes de executar a exclusão.
      </p>

      <h2>3. Prazo</h2>
      <p>
        Pedidos por e-mail são respondidos em até 15 (quinze) dias. A exclusão
        pela conta é imediata. A exclusão dos dados ativos é concluída logo após
        a confirmação, e as cópias de segurança são eliminadas no ciclo regular
        de rotação.
      </p>

      <h2>4. O que é excluído</h2>
      <ul>
        <li>dados de acesso e perfil (nome, e-mail, senha e sessões);</li>
        <li>
          dados da oficina e registros inseridos por ela, como clientes,
          veículos, orçamentos, ordens de serviço, estoque, financeiro, fotos e
          assinaturas, quando a exclusão da conta inteira for solicitada;
        </li>
        <li>arquivos enviados, como logotipo e imagens.</li>
      </ul>

      <h2>5. O que pode ser mantido</h2>
      <p>
        Alguns dados podem ser conservados quando houver obrigação legal ou
        regulatória, ou para o exercício regular de direitos em processos (art.
        16 da LGPD), como registros de pagamento e informações fiscais, pelo
        prazo exigido em lei. Esses dados ficam restritos a essa finalidade e
        são eliminados ao término do prazo.
      </p>

      <h2>6. Se você é cliente de uma oficina</h2>
      <p>
        Se seus dados foram cadastrados por uma oficina que usa o{" "}
        {company.brand} (por exemplo, como cliente ou proprietário de veículo),
        a oficina é a controladora desses dados. Solicite a exclusão diretamente
        a ela. Se preferir, escreva para {company.email} e encaminharemos o
        pedido à oficina responsável.
      </p>

      <h2>7. Consequências</h2>
      <p>
        A exclusão da conta é definitiva e irreversível. Antes de pedir, exporte
        ou guarde os documentos que você precisa manter, como orçamentos, ordens
        de serviço e relatórios. Assinaturas ativas devem ser canceladas; não há
        reembolso proporcional, salvo nos casos previstos nos Termos de Uso.
      </p>

      <h2>8. Dúvidas e reclamações</h2>
      <p>
        Se não ficar satisfeito com a resposta, você pode procurar a Autoridade
        Nacional de Proteção de Dados (ANPD) em gov.br/anpd.
      </p>
    </LegalPage>
  );
}
