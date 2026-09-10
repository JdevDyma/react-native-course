import { Directory, File, Paths } from "expo-file-system";

const directory = new Directory(Paths.document, "marker-photos");
let sequence = 0;
const extensions = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "gif", "avif"]);
const mimeExtensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif", "image/gif": "gif", "image/avif": "avif" };

export function imageFile(name) {
  if (typeof name !== "string" || !/^photo-[a-z0-9-]+\.(jpg|jpeg|png|webp|heic|heif|gif|avif)$/.test(name)) {
    throw new Error("Nom de photo invalide.");
  }
  return new File(directory, name);
}

export async function copyMarkerImage(asset) {
  if (typeof asset?.uri !== "string" || !asset.uri.trim()) throw new Error("Photo absente.");
  const source = new File(asset.uri);
  const declared = asset.mimeType || source.type;
  const suffix = (asset.fileName || asset.uri.split(/[?#]/)[0]).split(".").pop().toLowerCase();
  const extension = mimeExtensions[declared] || (extensions.has(suffix) ? suffix : null);
  if (!extension) throw new Error("Format de photo non reconnu.");
  directory.create({ idempotent: true, intermediates: true });
  const name = `photo-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}.${extension}`;
  const destination = imageFile(name);
  await source.copy(destination, { overwrite: false });
  if (!destination.exists || destination.size <= 0) throw new Error("Copie de photo incomplète.");
  return name;
}
