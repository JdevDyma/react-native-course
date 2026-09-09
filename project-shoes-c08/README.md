# Shoes : solution du chapitre 8

Ce dossier contient le projet à la fin du chapitre consacré à la navigation : listes de chaussures, fiche de détail, onglets et menu latéral. Les écrans du panier, des favoris, du profil et des notifications correspondent aux étapes pédagogiques de ce chapitre.

Les images, les polices et les données utilisées par les écrans sont incluses dans ce dossier.

## Démarrer

Depuis ce dossier, installez les dépendances puis démarrez Expo :

```bash
npm ci
npm start
```

Pour lancer une compilation locale Android ou iOS, préparez les outils natifs de la plateforme puis utilisez respectivement `npm run android` ou `npm run ios`. La compilation iOS nécessite macOS et Xcode. La commande `npm run web` démarre la version web.

Les fichiers SVG sont importés comme composants grâce à la configuration Metro et à `react-native-svg-transformer`. La configuration Babel utilise `babel-preset-expo`.
