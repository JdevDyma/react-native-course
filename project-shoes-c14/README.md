# Project Shoes

Application React Native avec Expo : catalogue de chaussures, navigation, panier, favoris, notifications et formulaire de profil.

Installez les dépendances avec `npm ci`. Copiez `.env.example` vers `.env` et renseignez `EXPO_PUBLIC_API_URL` avec la racine HTTPS de votre base Firebase Realtime Database de démonstration. Utilisez uniquement des données fictives. Cette variable publique ne doit contenir aucun secret.

L’annuaire par email permet de sélectionner un profil de démonstration ; il ne constitue pas une authentification. Les mots de passe des formulaires restent locaux et ne sont ni envoyés ni enregistrés. Une correspondance par email ne protège pas des données privées.

Les favoris, les notifications vues et le panier appartiennent au profil distant. RTK Query conserve leur cache et les mutations mettent à jour la base. Le panier enregistre des références de chaussures et de variantes ; les images sont résolues depuis le catalogue de l’application. Le formulaire de profil modifie le nom complet et l’adresse. L’email y est affiché en lecture seule.

Utilisez une application de développement personnalisée avec `npm run android` ou `npm run ios`. Après une modification des dépendances natives, reconstruisez cette application.

Reactotron est chargé uniquement en développement. Son gestionnaire de stockage conserve l’identifiant client ; le plugin automatique de surveillance du stockage est désactivé. Les actions et l’état Redux restent observables avec le plugin Redux. Ce stockage local ne remplace pas la base des profils.
