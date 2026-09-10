import { readSession, writeSession } from "./sessionStorage";
import { exchangeRefreshToken } from "./refreshSession";
import { getSessionTimes } from "./sessionTiming";
import { isSameProfileSession } from "./profileSession";
import { renewSession } from "../store/slices/authSlice";

const sessions = new WeakMap();
const closers = new WeakMap();

export function registerSessionCloser(store, close) {
  closers.set(store.dispatch, close);
  return () => { if (closers.get(store.dispatch) === close) closers.delete(store.dispatch); };
}

export function cancelSessionRenewal(store) {
  sessions.get(store.dispatch)?.flight?.controller.abort();
  sessions.delete(store.dispatch);
}

function stateFor(api, key) {
  let state = sessions.get(api.dispatch);
  if (!state || state.generation !== key.generation || state.userId !== key.userId) {
    state?.flight?.controller.abort();
    state = { ...key, flight: null };
    sessions.set(api.dispatch, state);
  }
  return state;
}

export function observeRenewal(api, key) {
  const flight = stateFor(api, key).flight;
  return { flight, pending: Boolean(flight?.pending) };
}

function waitForFlight(flight, signal) {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", abort);
      resolve(value);
    };
    const abort = () => finish(false);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    // Annuler cet appelant ne détruit pas le renouvellement partagé.
    flight.promise.then(finish, () => finish(false));
  });
}

export async function renewAfterUnauthorized(api, key, usedToken, observed) {
  if (api.signal.aborted || !isSameProfileSession(api.getState(), key)) return false;
  if (api.getState().auth.idToken !== usedToken) return true;
  const state = stateFor(api, key);
  let flight = state.flight;
  // Un 401 tardif rejoint aussi l'échec du vol qu'il a croisé.
  if (!flight || (!flight.pending && flight === observed.flight && !observed.pending)) {
    flight = { controller: new AbortController(), pending: true, promise: null };
    state.flight = flight;
    const current = () => !flight.controller.signal.aborted &&
      sessions.get(api.dispatch) === state && isSameProfileSession(api.getState(), key);
    const closeCurrent = async () => {
      if (!current()) return;
      const close = closers.get(api.dispatch);
      if (close) await close(key);
    };
    // Publier le vol avant de commencer la lecture asynchrone.
    flight.promise = Promise.resolve().then(async () => {
      try {
        if (!current()) return false;
        const refreshToken = await readSession();
        if (!current()) return false;
        if (!refreshToken) { await closeCurrent(); return false; }
        let data;
        try {
          data = await exchangeRefreshToken(refreshToken, flight.controller.signal);
        } catch (error) {
          if (error?.invalidRefresh && current()) await closeCurrent();
          return false;
        }
        if (!current() || data.localId !== key.userId) return false;
        const timing = getSessionTimes(data.expiresIn, data.requestStartedAt);
        const canInstall = () => current() && Date.now() < timing.expiresAt;
        if (!canInstall()) return false;
        return await writeSession(data.refreshToken, canInstall, () => {
          api.dispatch(renewSession({ ...key, idToken: data.idToken, ...timing }));
        });
      } catch {
        // Transport, lecture, décodage ou stockage : aucune révocation supposée.
        return false;
      } finally {
        flight.pending = false;
      }
    });
  }
  const confirmed = await waitForFlight(flight, api.signal);
  return confirmed && !api.signal.aborted && isSameProfileSession(api.getState(), key);
}
