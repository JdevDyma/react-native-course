# Project Shoes

Application React Native avec Expo : catalogue de chaussures, panier, favoris, notifications et profil associés à un utilisateur authentifié.

## Installation et configuration

Installez les dépendances avec `npm install`. Copiez `.env.example` vers `.env` et renseignez la racine HTTPS de votre base Firebase Realtime Database dans `EXPO_PUBLIC_API_URL`, ainsi que la clé publique Firebase dans `EXPO_PUBLIC_FIREBASE_API_KEY`. Conservez l’adresse Firebase Authentication fournie dans `EXPO_PUBLIC_AUTH_URL`.

Activez le fournisseur email/mot de passe dans Firebase Authentication. Les règles de démonstration de `firebase/database.rules.json` limitent chaque utilisateur au chemin `users/{uid}` correspondant à son identité. La clé publique configure le projet ; elle ne remplace pas ces règles d’autorisation. N’utilisez pas de données personnelles réelles pour les exercices.

Démarrez une application de développement personnalisée avec `npm run android` ou `npm run ios`. Après un changement de dépendance ou de configuration native, reconstruisez cette application. Le plugin SecureStore configure l’exclusion des données chiffrées de la sauvegarde Android.

## Fonctionnement

L’inscription et la connexion utilisent Firebase Authentication. Le profil distant est confirmé avant l’ouverture des écrans métier. Les favoris, notifications et références du panier sont associés au profil ; les images des chaussures restent issues du catalogue local.

Le jeton de renouvellement est conservé avec SecureStore, sous la clé `shoes.session`. Le jeton d’accès reste en mémoire. La restauration vérifie la session et le profil. Après un refus d’authentification, les requêtes concernées partagent un renouvellement puis effectuent au plus une reprise. Un renouvellement conserve l’identité de la session ; une déconnexion empêche une réponse tardive de rouvrir les écrans privés.

Les erreurs sont présentées dans l’interface. Si l’effacement local de la session échoue, la fermeture signale le problème et permet de réessayer. Les mots de passe ne sont pas persistés. Reactotron n’est pas importé au démarrage de cette application et les Redux DevTools sont désactivés ; le fichier de configuration conservé n’active aucune observation tant qu’il reste débranché.

Les fichiers de configuration locale et les dépendances installées sont exclus du dépôt. Les opérations sur les photos de produits ou le catalogue ne sont pas des appels à un service de vente réel.
