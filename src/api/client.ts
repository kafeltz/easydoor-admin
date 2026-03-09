import keycloak from "@/keycloak";

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    await keycloak.updateToken(30);
  } catch {
    keycloak.login();
    throw new Error("Sessão expirada — redirecionando para login.");
  }
  const token = keycloak.token;
  return fetch(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
