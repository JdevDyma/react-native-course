import { getAuthConfig } from "./config";
import { toAuthError } from "./authErrors";

const text = (value) => typeof value === "string" && value.trim().length > 0;
export async function exchangeRefreshToken(refreshToken, signal) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) controller.abort();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
  let mappedError;
  try {
    if (!text(refreshToken)) throw new Error("Session absente.");
    const { apiKey } = getAuthConfig();
    const requestStartedAt = Date.now();
    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      signal: controller.signal,
    });
    let data;
    try { data = await response.json(); } catch {
      mappedError = toAuthError({ status: timedOut ? "TIMEOUT_ERROR" : "PARSING_ERROR" });
      throw mappedError;
    }
    if (!response.ok) {
      const code = data?.error?.message;
      mappedError = { ...toAuthError({ status: response.status, data }),
        invalidRefresh: ["TOKEN_EXPIRED", "USER_DISABLED", "USER_NOT_FOUND", "INVALID_REFRESH_TOKEN"].includes(code) };
      throw mappedError;
    }
    const ttl = Number(data?.expires_in) * 1000;
    if (![data?.id_token, data?.refresh_token, data?.user_id, data?.expires_in].every(text) ||
        !/^\d+$/.test(data.expires_in) || !Number.isSafeInteger(ttl) || ttl <= 0 ||
        !Number.isSafeInteger(requestStartedAt + ttl) || Date.now() >= requestStartedAt + ttl) {
      mappedError = toAuthError({ status: "PARSING_ERROR" });
      throw mappedError;
    }
    return { idToken: data.id_token, refreshToken: data.refresh_token,
      localId: data.user_id, expiresIn: data.expires_in, requestStartedAt };
  } catch {
    throw mappedError || toAuthError({ status: timedOut ? "TIMEOUT_ERROR" : "FETCH_ERROR" });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}
