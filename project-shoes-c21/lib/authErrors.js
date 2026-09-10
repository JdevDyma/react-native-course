export const AUTH_ERROR_FALLBACK = "Une erreur est survenue. Réessayez ultérieurement.";
export const errorMessages = Object.freeze({
  EMAIL_EXISTS: "Cet email est déjà utilisé.",
  INVALID_LOGIN_CREDENTIALS: "Ces identifiants sont incorrects.",
  EMAIL_NOT_FOUND: "Ces identifiants sont incorrects.",
  INVALID_PASSWORD: "Ces identifiants sont incorrects.",
});
const NETWORK_MESSAGE = "La requête n’a pas abouti. Vérifiez votre connexion et réessayez.";
const TIMEOUT_MESSAGE = "Le délai de réponse est dépassé. Réessayez ultérieurement.";
const allowedMessages = new Set([...Object.values(errorMessages), AUTH_ERROR_FALLBACK, NETWORK_MESSAGE, TIMEOUT_MESSAGE]);

export function toAuthError(response) {
  let message = AUTH_ERROR_FALLBACK;
  if (response?.status === "FETCH_ERROR") message = NETWORK_MESSAGE;
  else if (response?.status === "TIMEOUT_ERROR") message = TIMEOUT_MESSAGE;
  else {
    const code = response?.data?.error?.message;
    if (typeof code === "string" && Object.hasOwn(errorMessages, code)) message = errorMessages[code];
  }
  return { status: "CUSTOM_ERROR", error: message };
}

export function toAuthMessages(error) {
  const message = typeof error?.error === "string" && allowedMessages.has(error.error)
    ? error.error : AUTH_ERROR_FALLBACK;
  return { auth: message };
}
