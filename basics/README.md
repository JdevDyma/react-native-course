# Les bases de React Native

L'application démarre avec `index.js` et reprend les composants du chapitre sur les bases.

```bash
npm install
npx expo start
```

Ouvrez le projet dans une application Expo compatible, sur un appareil ou un émulateur. Appuyez sur `w` pour ouvrir la version Web.

Le formulaire conserve son brouillon à la fermeture. La création retire les espaces au début et à la fin, refuse un texte vide et ajoute une ligne avec un identifiant distinct. Deux lignes peuvent donc avoir le même texte.

## Exemple Reactotron

Pour suivre la leçon consacrée à Reactotron, démarrez son application de bureau, remplacez temporairement `"main": "index.js"` par `"main": "index.reactotron.js"` dans `package.json`, puis redémarrez Expo. L'exemple se trouve dans `examples/chapter-3/` et charge Reactotron uniquement en développement.

Sur Android connecté par ADB, ajoutez `host: "localhost"` aux options de `configure`, exécutez `adb reverse tcp:9090 tcp:9090`, puis rechargez l'application. Avec un appareil physique sur le réseau, indiquez l'adresse de la machine dans l'option `host` de `configure`.

La configuration de stockage est un exemple facultatif dans `ReactotronConfig.storage.js`. Pour l'utiliser, adaptez le `require` dans `App.reactotron.js`. Revenez à `index.js` pour retrouver l'application du chapitre sur les bases.

La variante AsyncStorage conserve l’identifiant du client avec les vraies méthodes `getItem` et `setItem`. Son observation automatique est désactivée par `useReactNative({ asyncStorage: false })` ; les journaux et le réseau restent observables. Une observation manuelle utilise `Reactotron.display` après un appel de stockage attendu. Cette variante nécessite une application personnalisée embarquant la dépendance native, créée avec `npx expo run:android` ou `npx expo run:ios` sur macOS. Expo Go ne remplace pas ses modules natifs par ceux installés dans le projet.

Pour la démonstration du bouton « Tester le stockage », choisissez `"main": "index.reactotron.storage.js"` dans `package.json`. Cette entrée charge `examples/chapter-3/App.reactotron.storage.js` et sa configuration `ReactotronConfig.storage.js`. Le bouton attend une écriture fictive, puis transmet une observation manuelle avec `Reactotron.display`. Revenez à `"main": "index.js"` pour retrouver l’application des bases. Après une modification des dépendances natives, reconstruisez et réinstallez l’application personnalisée.
