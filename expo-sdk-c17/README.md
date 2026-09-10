# Carte et photos

Projet Expo du chapitre consacré aux fonctionnalités natives : carte, position, photos, orientations et persistance locale SQLite.

Installez les dépendances avec `npm install`, puis lancez `npm start`. Les commandes `npm run android` et `npm run ios` créent et lancent une application de développement ; iOS requiert macOS et Xcode.

Copiez `.env.example` vers `.env` et renseignez les clés Google Maps nécessaires à votre plateforme. Restreignez ces clés pour votre application et activez les services correspondants. La carte Apple est utilisée par défaut sur iOS. Les fichiers `.env` restent locaux.

Les permissions sont demandées pendant les actions concernées. La base SQLite et les photos copiées restent dans le stockage local de l’application. Une suppression de marqueur ne supprime pas automatiquement son fichier photo. En cas de retour incertain d’une écriture, rechargez les données avant une nouvelle modification.

La configuration native se trouve dans `app.config.js` ; ses modifications nécessitent un nouveau binaire. Les aperçus ne garantissent pas le rendu ni la disponibilité de tous les services sur chaque appareil.
