import { headers } from "next/headers";
import { auth } from "./auth";

// @lib: AUTH - Função utilitária para obter a sessão completa do usuário.
// @entrada: N/A
// @retorno: Objeto de Sessão completo (Ex: { session, user, userId, ... }).
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
