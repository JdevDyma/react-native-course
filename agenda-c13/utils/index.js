function parseDate(value) {
  if (!(value instanceof Date) && (typeof value !== "string" || value.trim() === "")) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
const twoDigits = (value) => String(value).padStart(2, "0");

export const getFormattedDate = (value) => {
  const date = parseDate(value);
  return date ? `${twoDigits(date.getDate())} / ${twoDigits(date.getMonth() + 1)}` : "Date invalide";
};

export const getFormattedTime = (value) => {
  const date = parseDate(value);
  return date ? `${twoDigits(date.getHours())} : ${twoDigits(date.getMinutes())}` : "Heure invalide";
};

export const getFormattedFullDate = (value) => {
  const date = parseDate(value);
  return date ? `${twoDigits(date.getDate())} / ${twoDigits(date.getMonth() + 1)} / ${date.getFullYear()}` : "Date invalide";
};
