# Agenda

Application React Native consacrée aux formulaires d’événements : saisie, dates et heures, validation, création, modification et suppression avec Redux Toolkit.

Le formulaire affiché utilise Formik et Yup. `components/modal/Form.js` conserve la variante avec validation manuelle ; `AgendaList` ouvre `FormWithFormik`.

## Installation

Depuis ce dossier, installez les dépendances avec `npm ci`.

Le sélecteur de date utilise un module natif. Utilisez une application de développement personnalisée contenant les dépendances du projet. Installer un paquet JavaScript ne remplace pas le module embarqué dans Expo Go.

Pour construire et démarrer l’application Android avec un environnement Android configuré :

```sh
npx expo run:android
```

Sur macOS avec Xcode configuré, pour iOS :

```sh
npx expo run:ios
```

Les événements sont conservés en mémoire dans Redux ; ils ne sont pas enregistrés sur un serveur. Les dates du formulaire deviennent des chaînes ISO lors de leur enregistrement dans le magasin.
