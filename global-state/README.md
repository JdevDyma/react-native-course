# Global State

Exemples de navigation, favoris Redux et inspection Reactotron.

Installer avec `npm ci` après résolution du verrou, puis lancer `npm start`. Les dépendances natives nécessitent une application personnalisée : `npx expo run:android` ou, sur macOS, `npx expo run:ios`. Reconstruire et réinstaller après modification d’une dépendance native. Expo Go possède ses propres modules natifs.

La configuration Reactotron est chargée uniquement sous `__DEV__`. Le gestionnaire AsyncStorage réel conserve l’identifiant du client ; l’instrumentation automatique du stockage est désactivée, car elle attend aussi des méthodes absentes de cette API. Les inspections Redux, réseau et journaux restent distinctes. Aucun favori Redux n’est persisté par cette configuration.
