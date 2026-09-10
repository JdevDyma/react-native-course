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
