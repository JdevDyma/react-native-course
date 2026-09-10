import { shoes as groups } from "../data/shoes";

const catalog = groups.flatMap((group) => group.stock);
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isId = (value) => typeof value === "string" && value.length > 0 && value === value.trim()
  && !/[.#$\[\]\/\u0000-\u001f\u007f]/.test(value);

function cents(price) {
  const value = Math.round(price * 100);
  if (!Number.isFinite(price) || price < 0 || !Number.isSafeInteger(value)
    || Math.abs(price * 100 - value) > 0.000001) throw new Error("Prix invalide.");
  return value;
}

function validateLine(line) {
  if (!isRecord(line) || !isId(line.id) || !isId(line.shoeId)
    || !Number.isInteger(line.variantIndex) || line.variantIndex < 0
    || !Number.isFinite(line.size) || line.size <= 0
    || !Number.isSafeInteger(line.quantity) || line.quantity < 1
    || typeof line.name !== "string" || !line.name.trim()) {
    throw new Error("Une ligne du panier est invalide.");
  }
  cents(line.price);
  // Seuls ces champs portables seront conservés et envoyés.
  return { id: line.id, shoeId: line.shoeId, variantIndex: line.variantIndex,
    size: line.size, price: line.price, quantity: line.quantity, name: line.name.trim() };
}

export function buildCart(lines) {
  if (!Array.isArray(lines)) throw new Error("La liste du panier est invalide.");
  const shoes = lines.map(validateLine);
  if (new Set(shoes.map((line) => line.id)).size !== shoes.length) {
    throw new Error("Deux lignes possèdent le même identifiant.");
  }
  const totalCents = shoes.reduce((sum, line) => {
    const next = sum + cents(line.price) * line.quantity;
    if (!Number.isSafeInteger(next)) throw new Error("Le montant du panier est trop élevé.");
    return next;
  }, 0);
  return { shoes, totalAmount: totalCents / 100 };
}

export function normalizeCart(value) {
  if (value == null) return { shoes: [], totalAmount: 0 };
  if (!isRecord(value)) throw new Error("Le panier est invalide.");
  const cart = buildCart(value.shoes ?? []);
  if (cents(value.totalAmount) !== cents(cart.totalAmount)) {
    throw new Error("Le montant ne correspond pas aux lignes du panier.");
  }
  return cart;
}

export function getCartImage(line) {
  return catalog.find((shoe) => shoe.id === line.shoeId)?.items?.[line.variantIndex]?.image;
}

export function createCartLine({ id, shoeId, variantIndex, size }) {
  const shoe = catalog.find((item) => item.id === shoeId);
  const variant = shoe?.items?.[variantIndex];
  const group = groups.find((item) => item.stock.some((entry) => entry.id === shoeId));
  if (!group || !variant || variant.image == null || !variant.sizes.includes(size)) {
    throw new Error("Cette variante ou cette taille n’est pas disponible.");
  }
  return validateLine({ id, shoeId, variantIndex, size, price: shoe.price, quantity: 1,
    name: group.brand.charAt(0).toUpperCase() + group.brand.slice(1) + " " + shoe.name });
}

export function removeCartLine(cart, id) {
  if (!cart.shoes.some((line) => line.id === id)) throw new Error("Cette ligne n’existe plus.");
  return buildCart(cart.shoes.filter((line) => line.id !== id));
}

export function changeCartQuantity(cart, id, increase) {
  if (typeof increase !== "boolean") throw new Error("Sens de modification invalide.");
  const target = cart.shoes.find((line) => line.id === id);
  if (!target) throw new Error("Cette ligne n’existe plus.");
  const quantity = target.quantity + (increase ? 1 : -1);
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("La quantité doit rester au moins égale à un.");
  return buildCart(cart.shoes.map((line) => line.id === id ? { ...line, quantity } : line));
}
