# Shoes : profil, paiement, notifications et liens profonds

Application React Native avec Expo, navigation, formulaires, profil utilisateur, stockage de photo et animation de lancement.

Copiez `.env.example` dans `.env` et renseignez la configuration de votre projet Firebase. Les variables publiques identifient le projet ; les règles Firebase déterminent les autorisations. Activez la connexion par e-mail et mot de passe et configurez les règles Database et Storage fournies dans `firebase/` pour votre projet. Les restrictions de type du Storage portent sur le type MIME déclaré, sans inspection des octets.

Installez les dépendances avec `npm ci` une fois le verrou présent. Utilisez une application de développement personnalisée (`npm run android` ou `npm run ios`). Reconstruisez cette application après un changement de dépendance native ou de plugin. Le splash natif se vérifie avec une application construite ; Expo Go n’en reproduit pas toutes les propriétés.

Le sélecteur système sert au choix d’une photo ; aucune permission caméra ni microphone n’est demandée par sa configuration. L’authentification utilise le SDK Firebase et son stockage persistant sécurisé. Les fichiers REST conservés comme étapes pédagogiques ne sont pas le chemin d’authentification actif. Reactotron reste débranché du graphe de l’application pour éviter l’exposition des identifiants et des jetons.

L’animation de lancement se termine aussi sur demande de l’utilisateur, en cas d’erreur ou lorsque la réduction des animations est activée. Elle n’interrompt pas la restauration de session.

## Paiement de test

Le dossier `server/` contient le serveur Stripe et son guide de configuration.
Suivez `server/README.md` pour préparer les variables privées et le relais des
notifications Stripe. Renseignez uniquement l'adresse HTTPS publique de ce serveur
dans `EXPO_PUBLIC_STRIPE_URL` côté mobile. Le serveur fournit la clé publique au
SDK ; les clés secrètes restent sur le serveur.

L'application distingue la présentation du formulaire de paiement, la confirmation
du paiement par le serveur et le nettoyage du panier. Une commande en attente peut
être reprise après redémarrage ; seul son identifiant est conservé localement.

## Notifications et destinations

Le profil `development` de `eas.json` prépare une application de développement.
Associez le projet à votre propre projet EAS et configurez les identifiants natifs
et les informations de notifications demandés par la plateforme. Le projectId EAS
doit être disponible dans la configuration Expo pour obtenir un jeton Expo Push.
L'écran Notifications propose les commandes de permission, de programmation locale
et d'inscription distante. Le jeton est affiché dans l'interface de développement.

Le schéma `dyma-shoes` permet de viser la racine, `cart`, `notifications` ou
`details/:id` avec un identifiant du catalogue `data/shoes.js`. Dans une notification,
placez cette destination dans `data.url`. Le lien attend la connexion et la fin de
la préparation des écrans. Une déconnexion abandonne le lien de la session quittée.
Le retour `stripe-redirect` conserve son traitement de paiement distinct.

## Exemples intermédiaires

Le dossier `examples/` conserve les extraits des étapes pédagogiques. Certains
illustrent une portion de composant à replacer dans son contexte ; ils ne sont pas
des points d'entrée autonomes de l'application. Le point d'entrée est `index.js`.

## Animations et chargement

Le panier confirme les ajouts réussis avec une animation dans l’en-tête.
Les squelettes Moti accompagnent la première lecture du panier et le chargement
de la photo de profil. Le contenu des onglets suit la progression du tiroir.
Les préférences de réduction des mouvements sont prises en compte.

Les écrans de listes appartiennent à la pile principale ; l’accueil est rendu
directement dans son onglet. Les notifications, liens entrants et paiements
restent raccordés à la session et aux services décrits ci-dessus.

## Construction et distribution

Les profils EAS distinguent développement, simulateur iOS, prévisualisation et
production. Le profil production génère les binaires de distribution store.
Les compteurs de build sont gérés à distance ; initialiser leur valeur depuis
les derniers builds envoyés aux stores avant de migrer une application existante.
La version utilisateur reste un choix explicite de la configuration Expo.

Configurer les véritables identifiants android.package, ios.bundleIdentifier
et le projet EAS pour votre application. L'icône Shoes est fournie dans assets.
Les identifiants nominaux des comptes et des stores ne sont pas inventés par
les exemples. Les clés privées restent hors dépôt et hors application mobile.

Les exemples play-store et app-store décrivent les commandes et leurs prérequis.
La soumission Android cible la piste interne en brouillon. Un envoi de binaire
ne constitue pas une publication publique. Le parcours iOS EAS est utilisable
sans Mac local ; le parcours Xcode/Transporter utilise macOS.

Les dossiers natifs sont exclus de l'archive EAS pour la génération CNG. Ne pas
effacer des changements natifs manuels non sauvegardés lors d'une régénération.
Le store initialise Reactotron uniquement en développement. Les exemples d'achats
intégrés ne remplacent pas le paiement Stripe des chaussures physiques.
