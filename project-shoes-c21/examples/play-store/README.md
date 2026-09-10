# Publication Android

Ces fichiers montrent les commandes et réglages de la leçon Play Store.
Exécuter les commandes depuis la racine du projet, après configuration du compte,
de son véritable paquet Android et de ses identifiants EAS.

Le profil de build production génère un AAB. Le profil de soumission du même nom
cible la piste interne et laisse la release en brouillon. La disponibilité pour
les testeurs et la publication publique nécessitent les étapes Play Console.

Avant de passer au compteur distant pour une application déjà envoyée sur Play,
initialiser EAS avec le dernier versionCode utilisé via build:version:set.
autoIncrement incrémente le compteur de build, pas la version utilisateur.

firebase-client.fragment.json est un fragment à fusionner dans app.json uniquement
après téléchargement du vrai google-services.json client pour le paquet Android.
Conserver toutes les autres propriétés et les plugins. Ne pas utiliser ce fragment
comme remplacement complet du fichier app.json. Aucune configuration nominative
Firebase n'est fournie par ces exemples. La clé privée du compte de service reste
hors dépôt et hors application, dans les identifiants serveur prévus pour FCM.
La clé du compte de service autorisé à soumettre à Google Play reste également
hors dépôt et se configure dans les identifiants EAS de soumission.
