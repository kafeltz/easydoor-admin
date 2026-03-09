import keycloak from "@/keycloak";

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30).catch(() => {
      console.warn("[auth] Falha ao renovar token — usando token atual.");
    });
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
