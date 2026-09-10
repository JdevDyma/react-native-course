# Distribution iOS

Lancer les commandes depuis la racine du projet avec les comptes Expo et Apple
configurés pour la véritable identité de l'application. Le parcours EAS distant
est utilisable depuis Windows, Linux ou macOS. Le parcours Xcode et l'application
Transporter nécessitent macOS.

Le profil production hérite de la configuration de la leçon Play Store :
distribution store, environnement production, compteur distant et autoIncrement.
Le compteur iOS buildNumber est distinct de la version utilisateur.
Avant une migration de compteur, version-set permet de sélectionner iOS et
d'initialiser EAS avec la dernière valeur envoyée à Apple.

Pour cibler une fiche App Store Connect, ajouter sa véritable valeur ascAppId à
submit.production.ios dans eas.json. Conserver submit.production.android et les
profils existants. Aucun identifiant de compte ou de fiche fictif n'est fourni.
La soumission interactive permet de configurer la destination avec EAS.

Les identifiants de signature, la clé APNs et la clé API App Store Connect
remplissent des rôles distincts. Conserver les clés privées hors dépôt et hors
application mobile. Ne pas déclarer une exemption de chiffrement sans avoir
déterminé la situation réelle du binaire et de ses dépendances.

store/store.js charge ReactotronConfig uniquement dans la branche __DEV__ de ses
enhancers. Les reducers, middlewares et enhancers par défaut sont conservés.
App.js ne charge pas une seconde fois la configuration Reactotron.
Ce changement JavaScript ne nécessite pas de prebuild. La commande de génération
locale est fournie pour les changements natifs et peut effacer les modifications
manuelles des dossiers générés. Dans le parcours CNG avec dossiers natifs exclus,
EAS effectue la génération pendant le build distant.

Un envoi à App Store Connect, une distribution TestFlight et une publication
publique sont des étapes distinctes. Consulter l'état de traitement et associer
le build au groupe de test avant de préparer sa soumission publique à App Review.
