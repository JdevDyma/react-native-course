import * as SQLite from "expo-sqlite";
import { copyMarkerImage, imageFile } from "./imageFiles";

let connectionPromise;
let initializationPromise;
export function getDatabase() {
  if (!connectionPromise) {
    connectionPromise = SQLite.openDatabaseAsync("mapProject.db").catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  return connectionPromise;
}

export function initDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const db = await getDatabase();
      await db.execAsync(`CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        imageSource TEXT NOT NULL
      );`);
      return db;
    })().catch((error) => { initializationPromise = undefined; throw error; });
  }
  return initializationPromise;
}

function validCoordinate(coordinate) {
  return Number.isFinite(coordinate?.latitude) && Math.abs(coordinate.latitude) <= 90
    && Number.isFinite(coordinate?.longitude) && Math.abs(coordinate.longitude) <= 180;
}

function toMarker(row) {
  const coordinate = { latitude: row.latitude, longitude: row.longitude };
  if (!Number.isSafeInteger(row.id) || row.id <= 0 || !validCoordinate(coordinate)) {
    throw new Error("Marqueur enregistré invalide.");
  }
  const photo = imageFile(row.imageSource);
  if (!photo.exists) throw new Error("Une photo enregistrée est introuvable.");
  return { id: row.id, coordinate, imageSource: { uri: photo.uri }, isDragging: false };
}

export async function getAllMarkers() {
  const db = await initDatabase();
  const rows = await db.getAllAsync("SELECT id, latitude, longitude, imageSource FROM markers ORDER BY id");
  return rows.map(toMarker);
}

export async function insertMarker({ coordinate, imageFileName }) {
  if (!validCoordinate(coordinate)) throw new Error("Coordonnées invalides.");
  imageFile(imageFileName);
  const db = await initDatabase();
  try {
    const result = await db.runAsync(
      "INSERT INTO markers (latitude, longitude, imageSource) VALUES (?, ?, ?)",
      coordinate.latitude, coordinate.longitude, imageFileName,
    );
    if (result.changes !== 1 || !Number.isSafeInteger(result.lastInsertRowId) || result.lastInsertRowId <= 0) {
      throw new Error("Résultat d’insertion inattendu.");
    }
    return result.lastInsertRowId;
  } catch (error) {
    // Une erreur de retour ne prouve pas à elle seule l’absence de la ligne.
    try {
      const rows = await db.getAllAsync(
        "SELECT id FROM markers WHERE imageSource = ? ORDER BY id", imageFileName,
      );
      if (rows.length === 1 && Number.isSafeInteger(rows[0].id) && rows[0].id > 0) return rows[0].id;
      if (rows.length > 0) throw new Error("Résultat ambigu.");
    } catch {
      const uncertain = new Error("Ajout non confirmé. Rechargez les marqueurs avant une nouvelle tentative.");
      uncertain.reloadRequired = true;
      throw uncertain;
    }
    throw error;
  }
}

export async function persistMarker(coordinate, asset) {
  if (!validCoordinate(coordinate)) throw new Error("Coordonnées invalides.");
  const imageFileName = await copyMarkerImage(asset);
  const id = await insertMarker({ coordinate, imageFileName });
  try {
    return toMarker({ id, latitude: coordinate.latitude, longitude: coordinate.longitude, imageSource: imageFileName });
  } catch {
    const error = new Error("Ligne enregistrée, mais photo indisponible. Rechargez les marqueurs.");
    error.reloadRequired = true;
    throw error;
  }
}

function assertMarkerId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Identifiant de marqueur invalide.");
}
function uncertainWrite() {
  const error = new Error("Écriture non confirmée. Rechargez les marqueurs avant de recommencer.");
  error.reloadRequired = true;
  return error;
}
export async function removeMarker({ id }) {
  assertMarkerId(id);
  const db = await initDatabase();
  try {
    const result = await db.runAsync("DELETE FROM markers WHERE id = ?", id);
    if (result.changes === 1) return { removed: true };
    if (result.changes === 0) {
      const rows = await db.getAllAsync("SELECT id FROM markers WHERE id = ?", id);
      if (rows.length === 0) return { removed: false };
    }
    throw uncertainWrite();
  } catch { throw uncertainWrite(); }
}
export async function updateMarkerCoordinate({ id, coordinate }) {
  assertMarkerId(id);
  if (!validCoordinate(coordinate)) throw new Error("Coordonnées invalides.");
  const db = await initDatabase();
  try {
    const result = await db.runAsync(
      "UPDATE markers SET latitude = ?, longitude = ? WHERE id = ?",
      coordinate.latitude, coordinate.longitude, id,
    );
    if (result.changes !== 1) throw uncertainWrite();
  } catch { throw uncertainWrite(); }
}
