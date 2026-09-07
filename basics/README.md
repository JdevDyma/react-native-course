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
