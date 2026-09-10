export function getApiUrl() {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!value) {
    throw new Error("Renseignez EXPO_PUBLIC_API_URL dans le fichier .env.");
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("EXPO_PUBLIC_API_URL doit être une adresse HTTPS valide.");
  }
  if (url.protocol !== "https:" || url.username || url.password ||
      url.search || url.hash || url.pathname !== "/") {
    throw new Error("Utilisez l'adresse HTTPS racine de la base, sans chemin ni paramètres.");
  }
  return url.origin;
}

export function getAuthConfig() {
  const authUrl = process.env.EXPO_PUBLIC_AUTH_URL?.trim();
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim();
  if (authUrl !== "https://identitytoolkit.googleapis.com/v1/accounts" || !apiKey || /\s/.test(apiKey)) {
    throw new Error("Renseignez la configuration publique Firebase Authentication.");
  }
  return { authUrl, apiKey };
}
