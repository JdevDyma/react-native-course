# Memory animé

Jeu de cartes réalisé avec Expo et React Native : distribution, retournement, recherche des paires, trophée animé et nouvelle partie.

Installez les dépendances avec `npm install`, puis lancez `npm start`. Le terminal propose les cibles Android, iOS et web. Les versions de React et de React Native restent associées au SDK Expo du projet.

Les illustrations se trouvent dans `assets`. Les animations utilisent `Animated` et `Easing` de React Native. La reprise recrée la partie et mélange une copie des cartes ; les minuteurs et animations sont nettoyés au démontage.
