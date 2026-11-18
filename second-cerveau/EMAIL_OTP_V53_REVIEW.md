# Second Cerveau OS V53 — connexion par code e-mail / Supabase (18 novembre 2026)

## Portée
Branche de développement basée sur `feature/google-drive-sync-v53-20261112`. Aucune modification à la branche `main`, aucun déploiement et aucune importation de données personnelles.

## Nouveau parcours
1. Dans « Sauvegardes & Google », entrer l'adresse e-mail du **compte Supabase existant**.
2. Demander un code à usage unique. `signInWithOtp` utilise `shouldCreateUser:false` pour **ne pas créer de compte**.
3. Saisir le code reçu. `verifyOtp({email,token,type:'email'})` établit la session.
4. Supabase synchronise les données uniquement après la première autorisation explicite de l'envoi. Les changements ultérieurs sont détectés et synchronisés si le compte et la version distante concordent.
5. Si le cloud contient déjà des données, l'utilisateur doit choisir explicitement une restauration ou un envoi. Aucune restauration forcée.

## Réglages du tableau de bord Supabase à vérifier avant test
- Authentication → Providers → **Email** : fournisseur activé.
- Authentication → Email Templates → **Magic Link** : ajouter `{{ .Token }}` pour envoyer un **code OTP**. Sans cette variable, la méthode peut envoyer un lien magique au lieu d'un code.
- Configurer un service SMTP adapté pour la livraison des e-mails réels, au besoin.
- Authentication → URL Configuration : redirection autorisée `https://jonathan777888.github.io/jonathan-os/`, sans remplacer les redirections utilisées par les autres apps.
- Les identités liées à une adresse e-mail vérifiée ne sont pas automatiquement garanties identiques pour tous les parcours. Vérifier le **UUID de Supabase Auth** à l'ouverture. Le code refuse l'envoi de données locales si l'UID diffère du propriétaire connu.
- **Ne jamais recopier un code de connexion, un mot de passe ou un token dans un ticket GitHub.**

## Protections de données
- Les exports V13 du 14 et du 18 novembre restent dans « Second Cerveau OS - Sauvegardes » sur Google Drive ordinaire; ils ne sont pas ajoutés au dépôt.
- La table `second_brain_sync` et ses protections RLS existantes sont réutilisées.
- Les clés locales contenant des jetons, secrets et sessions sont exclues de la synchronisation.
- Les données personnelles ne sont jamais importées automatiquement à l'activation de l'OTP.
- Le module privé Google Drive `drive.appdata` est conservé **facultatif** : son utilisation exige toujours un flux d'autorisation Google opérationnel (actuellement bloqué par `invalid_client`). Les fichiers JSON ordinaires de My Drive ne sont pas accessibles par `drive.appdata`.
- La déconnexion d'un appareil ne change pas automatiquement l'identité propriétaire des données locales.

## Tests et critères avant publication
- Tests automatisés : absence de création de compte, bon e-mail, vérification OTP, rejet de code invalide et refus d'un UID différent.
- Exécuter tous les tests Drive/Supabase/V13 et vérifier la construction de l'application complète.
- **Faire le test humain en navigateur privé et sur données fictives** avec le compte existant, vérifier le même UUID, puis première sauvegarde, nouveau dispositif, conflit et restauration.
- Vérifier les e-mails entrants réellement reçus et les limites de délivrabilité.
- Des avis de sécurité préexistants sur les RPC partagées `get_session7_dashboard()` et `get_course_load_summary()` doivent être corrigés **sans interrompre Session7** avant déploiement, ainsi que `set_updated_at()` et le test dynamique de RLS.
- Ne pas fusionner ni mettre en production jusqu'à vérification de ces points.

Références officielles :
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/reference/javascript/auth-verifyotp
- https://supabase.com/docs/guides/auth/auth-identity-linking
