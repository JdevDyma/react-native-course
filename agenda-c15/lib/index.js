import axios from "axios";
import { getApiUrl } from "./config";

export async function createEvent(event, { signal } = {}) {
  const { id, ...data } = event;
  const response = await axios.post(`${getApiUrl()}/events.json`, data, { signal, timeout: 10000 });
  if (typeof response.data?.name !== "string" || !response.data.name) {
    throw new Error("La réponse ne contient pas la clé du nouvel événement.");
  }
  return response.data.name;
}

export async function getAllEvents({ signal } = {}) {
  const response = await axios.get(`${getApiUrl()}/events.json`, { signal, timeout: 10000 });
  if (response.data === null) return [];
  if (typeof response.data !== "object" || Array.isArray(response.data)) {
    throw new Error("La liste reçue n’a pas le format attendu.");
  }
  return Object.entries(response.data).map(([key, value]) => ({ ...value, id: key }));
}

export async function updateEvent({ id, ...event }, { signal } = {}) {
  if (typeof id !== "string" || !id) throw new Error("Identifiant manquant.");
  const response = await axios.patch(`${getApiUrl()}/events/${encodeURIComponent(id)}.json`, event, { signal, timeout: 10000 });
  return response.data;
}

export async function deleteEvent({ id }, { signal } = {}) {
  if (typeof id !== "string" || !id) throw new Error("Identifiant manquant.");
  const response = await axios.delete(`${getApiUrl()}/events/${encodeURIComponent(id)}.json`, { signal, timeout: 10000 });
  return response.status;
}
