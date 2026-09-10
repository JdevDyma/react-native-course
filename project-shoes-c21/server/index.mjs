import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import Stripe from "stripe";
import { CheckoutError } from "./checkout-domain.mjs";
import { createCheckoutService } from "./checkout-service.mjs";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`La variable ${name} est obligatoire.`);
  return value;
}

const secretKey = required("STRIPE_SECRET_KEY");
const publishableKey = required("STRIPE_PUBLISHABLE_KEY");
const webhookSecret = required("STRIPE_WEBHOOK_SECRET");
if (!secretKey.startsWith("sk_test_") || !publishableKey.startsWith("pk_test_")) {
  throw new Error("Ce serveur pédagogique accepte uniquement les clés Stripe de test.");
}
const databaseURL = new URL(required("FIREBASE_DATABASE_URL"));
if (databaseURL.protocol !== "https:" || databaseURL.username || databaseURL.password) {
  throw new Error("L'adresse Firebase doit être une URL HTTPS sans identifiants.");
}
const port = Number(process.env.PORT ?? 4242);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Port invalide.");
const app = initializeApp({ credential: applicationDefault(), databaseURL: databaseURL.href });
const auth = getAuth(app);
const stripe = new Stripe(secretKey, { timeout: 15000, maxNetworkRetries: 1 });
const catalog = JSON.parse(await readFile(new URL("./catalogue.json", import.meta.url), "utf8"));
const checkout = createCheckoutService({ stripe, database: getDatabase(app), catalog });

async function readBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 65536) throw new CheckoutError("La requête est trop volumineuse.", 413);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function send(response, status, data) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  response.end(JSON.stringify(data));
}

async function identify(request) {
  const header = request.headers.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ") || header.length > 8192) {
    throw new CheckoutError("Connectez-vous avant de payer.", 401);
  }
  try {
    const user = await auth.verifyIdToken(header.slice(7), true);
    if (!user.uid || user.uid.length > 128 || /[.#$\[\]\/\u0000-\u001f\u007f]/.test(user.uid)) {
      throw new Error("Identifiant invalide.");
    }
    return user;
  } catch {
    throw new CheckoutError("La session n'est pas confirmée. Reconnectez-vous.", 401);
  }
}

let activeRequests = 0;
const server = createServer(async (request, response) => {
  if (activeRequests >= 8) {
    send(response, 429, { error: "Le serveur est occupé. Réessayez dans un instant." });
    request.resume();
    return;
  }
  activeRequests += 1;
  request.setTimeout(10000, () => request.destroy());
  try {
    const path = new URL(request.url, "http://localhost").pathname;
    if (request.method === "GET" && path === "/stripe-key") {
      send(response, 200, { publishableKey });
      return;
    }
    if (request.method === "POST" && path === "/webhook") {
      const body = await readBody(request);
      let event;
      try {
        event = stripe.webhooks.constructEvent(body, request.headers["stripe-signature"], webhookSecret);
      } catch {
        throw new CheckoutError("Signature de notification invalide.", 400);
      }
      await checkout.receiveEvent(event);
      send(response, 200, { received: true });
      return;
    }
    const user = await identify(request);
    if (request.method === "POST" && path === "/payment-sheet") {
      let input;
      try { input = JSON.parse((await readBody(request)).toString("utf8")); }
      catch (error) {
        if (error instanceof CheckoutError) throw error;
        throw new CheckoutError("Le corps de la requête est invalide.");
      }
      send(response, 200, await checkout.prepare(user, input?.cart, input?.orderId));
      return;
    }
    const match = /^\/orders\/([a-f0-9]{64})(\/clear-cart)?$/.exec(path);
    if (match && !match[2] && request.method === "GET") {
      send(response, 200, await checkout.confirm(user.uid, match[1]));
    } else if (match?.[2] && request.method === "POST") {
      await readBody(request);
      send(response, 200, await checkout.clearPaidCart(user.uid, match[1]));
    } else {
      send(response, 404, { error: "Cette route n'existe pas." });
    }
  } catch (error) {
    const known = error instanceof CheckoutError;
    send(response, known ? error.status : 503, {
      error: known ? error.message : "L'opération n'est pas confirmée. Vérifiez son état avant de réessayer.",
    });
  } finally {
    activeRequests -= 1;
  }
});

server.headersTimeout = 10000;
server.requestTimeout = 20000;
server.keepAliveTimeout = 5000;
server.maxConnections = 16;
server.listen(port, process.env.HOST ?? "127.0.0.1", () => {
  console.log(`Serveur de paiement de test prêt sur le port ${port}.`);
});
