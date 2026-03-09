import keycloak from "@/keycloak";

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = keycloak.token;
  return fetch(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
