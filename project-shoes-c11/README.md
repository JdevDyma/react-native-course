# Project Shoes

Exemple du chapitre consacré à Redux : favoris, offres consultées et panier partagent le même store.

Installez les dépendances avec `npm ci` une fois le verrou fourni, puis construisez une application de développement avec `npm run android` ou `npm run ios`. Les dépendances natives de ce projet nécessitent cette application personnalisée ; Expo Go ne remplace pas leurs modules embarqués. Après un changement de dépendance native, reconstruisez l’application.

Reactotron est chargé uniquement en développement. Son handler AsyncStorage réel conserve l’identifiant du client ; l’instrumentation automatique du stockage est désactivée. Les actions et états Redux restent observables. Cette configuration ne sauvegarde pas automatiquement le panier ni les favoris après redémarrage.

Le bouton de commande est désactivé ; aucun paiement n’est implémenté dans cet exemple.
