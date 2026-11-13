# Vérification Google Drive — Second Cerveau V53

Revue du 13 novembre 2026. Correctifs préparés uniquement dans la branche de la PR nº 9. **Décision : ne pas fusionner et ne pas déployer en production à ce stade.**

## Résultats vérifiés

| Élément | Résultat et preuve |
| --- | --- |
| Production | Le navigateur cloud affiche encore « Second Cerveau IA — V52 » sur le site public. Aucune authentification de production effectuée pendant cette revue. |
| Supabase | Projet `wuhbalxjpcfemsxdnggp` actif. L’endpoint public Auth indique Google activé. |
| Redirection OAuth sortante | L’endpoint Supabase `/auth/v1/authorize` renvoie HTTP 302 vers `accounts.google.com` avec `redirect_uri=https://wuhbalxjpcfemsxdnggp.supabase.co/auth/v1/callback`. Cela ne prouve pas que Google accepte ce callback ni que le secret est valide. |
| Client OAuth utilisé par Supabase | `568542524006-9u3dll4f32evqspdrke6oe929us55kvm.apps.googleusercontent.com`. Identifié dans la requête publique de redirection, sans lire de secret. Le nom et l’identifiant du projet Google Cloud restent à vérifier dans la console. |
| Autorisations demandées | Seule autorisation Drive ajoutée : `https://www.googleapis.com/auth/drive.appdata`. Google reçoit aussi `email profile`, nécessaires à la connexion existante. Aucun scope Drive général ni `drive.file` ajouté. |
| Règles de la table de synchronisation | `public.second_brain_sync` a RLS activé et une clé primaire `user_id`. SELECT, INSERT, UPDATE et DELETE sont limités à `auth.uid() = user_id`. UPDATE a aussi un `WITH CHECK`. Vérification des définitions uniquement, sans lire les sauvegardes personnelles. |
| Tests de comportement | 33 tests passent avec des données fictives et des réponses Supabase/Drive simulées. Ils ne constituent pas un test OAuth réel. |
| Construction | Le même script construit la version de test et l’artefact Pages. Les 7 scripts intégrés passent `node --check`, ainsi que les contrôles de compatibilité Pages. Aucun déploiement exécuté. |

## Correctifs de la PR

- Premier envoi Supabase soumis à une action et à une confirmation explicites. Les modifications locales et la vérification périodique ne peuvent plus contourner ce consentement.
- Appartenance des données conservée lors d’un changement de compte. Un autre compte ne peut ni exporter, ni restaurer, ni modifier les données de l’ancien compte dans ce profil de navigateur. Les réponses devenues obsolètes après un changement de compte sont refusées.
- Écritures Supabase conditionnées par `updated_at`, au lieu d’un upsert qui pouvait écraser une modification concurrente. Une insertion simultanée déclenche un conflit.
- Sauvegardes Drive conservées sous forme de copies successives. Aucune requête PATCH ou DELETE utilisée par le module. Deux écritures simultanées conservent les deux copies et demandent une résolution explicite.
- Historique Drive parcouru sur toutes les pages avec le paramètre v3 correct `pageSize`. Sélection d’une ancienne version ou d’une version concurrente avant restauration.
- Validation du format, des clés autorisées, du propriétaire et de l’empreinte des sauvegardes. Les anciennes sauvegardes V53 sans propriétaire ni empreinte restent lisibles après confirmation explicite.
- Copie locale distincte avant chaque restauration. En cas de manque d’espace ou d’échec de remplacement, restauration interrompue et retour aux données précédentes. Les métadonnées sont également rétablies si leur écriture échoue.
- Synchronisation suspendue pendant une restauration ; rechargement immédiat après succès. Un onglet dont les données sont devenues obsolètes doit être rechargé avant de pouvoir réécrire le stockage local.
- Jetons Google API conservés en mémoire uniquement et retirés des enregistrements de session persistants du client. Les jetons Supabase nécessaires à la session restent gérés par le SDK. Un jeton Google expiré ou refusé provoque une demande de reconnexion.
- SDK Supabase fixé à `2.119.0` ; disponibilité HTTP 200 du bundle vérifiée.
- Constructeur local corrigé : insertion des modules avant la dernière fermeture HTML, à l’extérieur des chaînes d’export intégrées, et inclusion du module Drive.
- Contrôle mobile corrigé pour utiliser Ubuntu 24.04 : le journal précédent montrait que Playwright 1.56.1 refusait l’image Ubuntu 26.04 de `ubuntu-latest`. Le scénario de première sauvegarde exige maintenant un consentement explicite.

## Blocages réels

1. **Google Cloud Console inaccessible dans le navigateur cloud.** La page `https://console.cloud.google.com/` affiche « Site Unavailable — Unable to access this site », y compris après un rechargement. Aucun formulaire Google n’est rendu : impossible de présenter un formulaire sécurisé de connexion valide. Aucun mot de passe demandé ou lu.
2. **Configuration Google non confirmée.** Le projet contenant le client « Second Cerveau », les URI autorisées côté Google, l’activation de Google Drive API, les scopes déclarés et le statut de publication/test de l’écran de consentement n’ont pas pu être inspectés ni modifiés. Le secret OAuth existant n’a pas été consulté ni changé.
3. **Tests réels Google non exécutés.** Connexion Google complète, autorisation Drive, sauvegarde réelle et restauration sur deux appareils restent à réaliser sur une version de test isolée et un compte de test. Aucun fichier Drive réel n’a été créé ou supprimé pendant cette revue.
4. **Autres fonctions du projet Supabase à sécuriser avant un lancement multiutilisateur.** L’advisor et la lecture de leurs définitions montrent que `public.get_session7_dashboard()` et `public.get_course_load_summary()` sont `SECURITY DEFINER`, exécutables par `anon` et `authenticated`, et ne filtrent pas les données par `auth.uid()`. Le tableau de bord agrège notamment notes, tâches, documents et journal. Cela constitue une voie d’accès distincte des bonnes règles RLS de `second_brain_sync`. Ces fonctions n’ont pas été appelées et aucune donnée renvoyée par elles n’a été lue. Ne pas les laisser ainsi pour une utilisation personnelle par plusieurs comptes. La correction doit tenir compte des autres applications utilisant ce même projet ; aucune modification SQL de production effectuée.

## Limites connues

- Un même profil de navigateur conserve un propriétaire local : pour un autre compte Google, utiliser un profil distinct. Le mode local de l’application reste disponible sans connexion ; le stockage local ne fournit pas une confidentialité face à une personne ayant accès au même profil du navigateur.
- Le journal `spiritual-ladder-local-v1` reste volontairement local, conformément à son interface existante. Les clés et codes d’accès sont exclus des sauvegardes.
- Les anciennes copies Drive ne sont pas purgées automatiquement. L’historique consomme progressivement de l’espace. Le module arrête la synchronisation si la liste dépasse 10 000 fichiers ou s’il faudrait résoudre plus de 28 versions concurrentes.
- Supabase ne renouvelle pas automatiquement le jeton Google API. Le choix de ne pas persister de jeton Google implique une nouvelle autorisation après rechargement de la page ou expiration ; la session de connexion Supabase peut rester active.
- L’empreinte SHA-256 détecte une altération accidentelle ; elle ne chiffre pas les données. Les copies résident dans le dossier privé de l’application Drive.

## Validation à terminer avant toute fusion

1. Rétablir l’accès à Google Cloud dans le navigateur cloud et utiliser le formulaire sécurisé de connexion lorsqu’il est rendu.
2. Identifier le projet du client indiqué ci-dessus et vérifier le callback Supabase exact, sans régénérer de secret.
3. Vérifier/activer Google Drive API et déclarer uniquement `drive.appdata` comme autorisation Drive. Conserver les autorisations d’identité nécessaires à Google Sign-In.
4. Sécuriser ou retirer les voies RPC publiques signalées, avec une vérification des applications qui les utilisent.
5. Exécuter la V53 sur une origine de test dédiée autorisée dans les redirections Supabase, sans modifier le site public ; importer uniquement des données fictives.
6. Tester sur deux profils/appareils : première autorisation, création d’une sauvegarde, reconnexion, lecture, restauration confirmée, annulation, deux écritures simultanées, changement de compte et refus/expiration d’autorisation.
7. Vérifier que les autres fichiers Drive et les données personnelles sont intacts, puis examiner les contrôles GitHub du commit final. Tant que ces vérifications restent bloquées, conserver la PR en brouillon.

## Commandes reproductibles

```sh
node --test second-cerveau/tests/*.test.cjs
python3 second-cerveau/tests/check_build.py
node second-cerveau/build_site.cjs /tmp/second-cerveau-v53
```

## Documentation utilisée

- [Google Drive : dossier privé et scope appdata](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Google Drive v3 : files.list et pagination](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list)
- [Google Drive : limites des propriétés privées](https://developers.google.com/workspace/drive/api/guides/properties)
- [Supabase : connexion Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Supabase : jetons des fournisseurs OAuth](https://supabase.com/docs/guides/auth/social-sign-in)
- [Supabase : fonctions SECURITY DEFINER exposées à anon](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
