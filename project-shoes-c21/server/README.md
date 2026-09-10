# Serveur de paiement de test Shoes

Ce serveur prépare le paiement du panier de l'utilisateur connecté avec Firebase. Il utilise uniquement le mode test de Stripe. Le catalogue contient les mêmes chaussures, variantes, tailles et prix que l'application mobile.

## Configuration

Installez les dépendances dans ce dossier :

```bash
npm install
```

Créez une copie de `.env.example` nommée `.env`, puis renseignez les variables :

| Variable | Valeur à fournir |
| --- | --- |
| `STRIPE_SECRET_KEY` | Clé secrète du compte Stripe en mode test. Elle reste sur le serveur. |
| `STRIPE_PUBLISHABLE_KEY` | Clé publique du même compte et du même environnement de test. |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature de l'écoute locale ou de la destination de notifications configurée dans Stripe. |
| `FIREBASE_DATABASE_URL` | URL HTTPS de la Realtime Database utilisée par l'application Shoes. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Chemin absolu vers le fichier JSON du compte de service Firebase, conservé en dehors du dépôt. |

Dans les paramètres du projet Firebase, la section des comptes de service permet de créer les identifiants utilisés par le SDK Admin. Le compte de service doit appartenir au projet de l'application. Sous WSL, fournissez un chemin accessible depuis Linux ; un chemin Windows ne désigne pas directement le même fichier.

Les règles de la base autorisent chaque utilisateur à lire et modifier son propre profil sous `users/{uid}`. La branche `stripeOrders` doit rester inaccessible en lecture et en écriture aux clients. Les règles du projet, qui accordent des droits uniquement sous `users`, assurent déjà cette séparation. N'ajoutez pas de règle générale donnant accès à toute la base. Le SDK Admin du serveur utilise ses propres droits.

## Démarrage et notifications Stripe

Installez la CLI Stripe, connectez-la au compte de test puis lancez l'écoute des notifications dans un terminal :

```bash
stripe login
stripe listen --forward-to localhost:4242/webhook
```

Renseignez le secret affiché par cette écoute dans `STRIPE_WEBHOOK_SECRET`. Dans un autre terminal, démarrez le serveur :

```bash
npm start
```

La CLI Stripe et le serveur doivent pouvoir communiquer sur le même `localhost`. Les lancer tous deux dans WSL évite de confondre les adresses locales de Windows et de Linux. Gardez les deux terminaux ouverts pendant les paiements de test. Une nouvelle écoute peut nécessiter de recopier son secret puis de redémarrer le serveur.

Le serveur écoute par défaut sur `127.0.0.1:4242`. Pour que l'application mobile puisse le joindre, exposez ce port avec une URL HTTPS accessible depuis l'environnement de l'application, par exemple au moyen d'un tunnel de développement. Dans le fichier `.env` de l'application mobile, renseignez cette URL dans `EXPO_PUBLIC_STRIPE_URL`, puis redémarrez Metro. La commande `stripe listen` relaie uniquement les notifications Stripe ; elle ne fournit pas l'URL publique des autres routes du serveur.

Ne placez ni la clé secrète, ni le secret de notification, ni le fichier du compte de service dans les variables `EXPO_PUBLIC`. Les jetons Firebase et les secrets clients du paiement ne doivent pas être journalisés.

## Parcours du paiement

1. `GET /stripe-key` renvoie la clé publique pour initialiser le SDK mobile.
2. `POST /payment-sheet` reçoit `{ "cart": ... }` et un en-tête `Authorization: Bearer ...` contenant le jeton Firebase. Le serveur confirme l'identité puis compare le panier affiché au panier enregistré. Il contrôle les articles et calcule le prix avec son propre catalogue.
3. Le serveur enregistre la commande sous `stripeOrders/{uid}/{orderId}`, puis crée un client Stripe et un `PaymentIntent`. Pour cet exemple, le client Stripe est associé à la commande et à l'utilisateur authentifié. Son adresse email vient du jeton vérifié, jamais d'une identité fournie librement dans le corps de la requête.
4. La réponse fournit `paymentIntentClientSecret`, `customerId` et `customerSessionClientSecret`. Le mobile les passe à `initPaymentSheet`, puis appelle `presentPaymentSheet()` pour afficher le formulaire. La session client donne au SDK un accès limité aux ressources du client Stripe.
5. `GET /orders/{orderId}` relit l'état du paiement auprès de Stripe. Le serveur vérifie également le propriétaire, le client Stripe, la devise et le montant. Seul un paiement dont le statut est `succeeded` et dont le montant reçu correspond à la commande produit `paid: true`.
6. `POST /orders/{orderId}/clear-cart` retire les lignes achetées qui n'ont pas changé. Une transaction Firebase conserve les autres lignes et recalcule le total. Le mobile relit ensuite le profil pour afficher le panier enregistré.

Le prix est calculé en centimes. Les frais de port suivent la règle de l'application : la partie entière du sous-total en euros divisé par quinze, exprimée en euros. Un sous-total de 438 € entraîne ainsi 29 € de frais et un paiement de 467 €. Le serveur accepte au plus cent lignes et une quantité comprise entre un et quatre-vingt-dix-neuf par ligne.

Une nouvelle demande pour le même panier retrouve la même commande. Ses clés d'idempotence sont conservées avant les appels de création Stripe. Si la réponse d'une création est perdue, la reprise utilise ces mêmes clés. Une création restée sans identifiant pendant plus de vingt-trois heures demande une vérification dans le Dashboard : le serveur ne recrée pas aveuglément un paiement après expiration possible de la protection d'idempotence.

Le mobile conserve uniquement l'identifiant de la commande en attente, séparément pour chaque utilisateur. Après une fermeture de l'application, il relit cette commande avec `GET /orders/{orderId}`. Pour reprendre son formulaire, `POST /payment-sheet` reçoit aussi `orderId`. Le serveur vérifie le propriétaire et retrouve le montant et les articles enregistrés lors de la préparation, même si le panier courant a changé. L'écran annonce ce montant avant la reprise ; la reprise ne crée pas un second paiement. Aucun secret client Stripe n'est conservé dans ce stockage local.

Fermer PaymentSheet sans payer laisse le panier intact. Une commande déjà payée renvoie son état, sans préparer un second formulaire. Si un paiement est annulé directement côté Stripe, le serveur refuse de le réutiliser ; pour une nouvelle commande de test, recréez les lignes concernées dans le panier.

## Panier modifié ou réponse incertaine

Chaque ajout de chaussures crée un nouvel identifiant de ligne dans l'application. Une ligne ajoutée pendant le paiement est donc distincte des lignes achetées. Si la quantité ou une autre propriété d'une ligne achetée a changé, le serveur conserve cette ligne intégralement et renvoie `cleanup.changed: true`. L'interface doit le signaler pour permettre à l'utilisateur d'ajuster son panier ; elle ne doit pas annoncer que tout le panier a été vidé.

Le nettoyage est réclamé une seule fois pour une commande. L'état `cleanup.state: "updated"` confirme l'enregistrement. Les états `started` et `unconfirmed` demandent une relecture du profil et de la commande ; ils ne confirment pas que le panier a été enregistré. Le serveur ne répète pas une modification dont la réponse pourrait avoir été perdue.

`POST /webhook` vérifie la signature sur le corps brut de la notification. Il relit le paiement pour traiter correctement les notifications répétées ou reçues hors ordre et conserve sa confirmation dans la commande. La réception de cette notification n'exige pas que l'application soit encore ouverte.

## Carte de test

Dans le formulaire de test, utilisez `4242 4242 4242 4242`, une date d'expiration future et un CVC de trois chiffres. Les erreurs et les annulations restent des états distincts du succès. Le serveur ne gère ni l'expédition physique, ni les remboursements, ni le passage à un encaissement réel : son rôle est l'intégration pédagogique du paiement du panier en mode test.
