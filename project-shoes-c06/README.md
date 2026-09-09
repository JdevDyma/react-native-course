# Shoes : solution du chapitre 6

Ce dossier contient le projet à la fin du chapitre 6 : écran d’accueil adapté aux dimensions de la fenêtre, prise en compte du clavier et différences Android/iOS pour les ombres et les composants tactiles. La configuration finale conserve l’orientation portrait.

Les listes et la recherche du chapitre 5 sont conservées. Appuyer sur une carte affiche une alerte avec le nom de la chaussure. La navigation vers une fiche détaillée est introduite dans un chapitre ultérieur.

## Démarrer

Depuis ce dossier :

```bash
npm ci
npm start
```

Le verrou npm fixe les versions : Expo 57, React Native 0.86.3 et React 19.2.3. Les dépendances communes aux chapitres suivants sont déjà présentes ; leur présence n’ajoute pas ces fonctionnalités à cette étape. Les données, images et quatre polices Montserrat nécessaires sont incluses.

Ce dossier est indépendant de `project-shoes-c05`, qui conserve la fin du chapitre précédent, et de `project-shoes`, qui contient le projet avancé de la formation.
