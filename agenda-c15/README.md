# Agenda

Application Expo avec authentification Firebase et gestion des événements.

Installez les dépendances avec `npm ci`, copiez `.env.example` vers `.env`, puis renseignez les paramètres publics Firebase. Activez le fournisseur email/mot de passe et configurez les règles de votre base de démonstration. La clé publique du projet ne remplace pas une authentification.

Lancez le serveur avec `npm start`. Le sélecteur de date utilise une application de développement personnalisée ; reconstruisez celle-ci après une modification de dépendances natives.

Le mot de passe reste dans le formulaire. Le jeton de renouvellement est conservé dans SecureStore ; la session en mémoire pilote la navigation. La restauration et le renouvellement respectent les changements de session. La déconnexion ferme la session locale et traite un éventuel refus du nettoyage persistant.

Le cache RTK Query fournit les événements ; Formik et Yup valident les formulaires. Les fichiers de la variante manuelle conservés dans les sources ne sont pas importés par le parcours final.
