# Agenda

Application React Native avec Expo pour consulter, créer, modifier et supprimer des événements avec RTK Query.

Installez avec npm ci. Copiez .env.example vers .env et renseignez EXPO_PUBLIC_API_URL avec la racine HTTPS de votre base Firebase Realtime Database de démonstration. Aucun secret dans les variables EXPO_PUBLIC.

Le cache RTK Query fournit les événements affichés ; les mutations invalident la liste. Formik et Yup valident les champs, dont la date de fin strictement postérieure au début. Les erreurs conservent la saisie.

Le sélecteur de date nécessite une application de développement personnalisée. Reconstruisez cette application après une modification des dépendances natives. Une exportation Metro ne constitue pas une validation native.
