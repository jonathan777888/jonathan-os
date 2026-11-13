# Vérification Google Drive — Second Cerveau V53

Revue du 13 novembre 2026. Correctifs préparés uniquement dans la branche de la PR nº 9. **Décision : ne pas fusionner et ne pas déployer en production à ce stade.**

## Résultats vérifiés

| Élément | Résultat et preuve |
| --- | --- |
| Production | Le navigateur cloud affiche encore « Second Cerveau IA — V52 » sur le site public. Aucune authentification de production effectuée pendant cette revue. |
| Supabase | Projet `wuhbalxjpcfemsxdnggp` actif. L’endpoint public Auth indique Google activé. |
| Redirections OAuth | Callback Google vérifié dans la console : `https://wuhbalxjpcfemsxdnggp.supabase.co/auth/v1/callback`. Origine JavaScript : `https://jonathan777888.github.io`. Site URL et retour de production Supabase inchangés : `https://jonathan777888.github.io/jonathan-os/`. |
| Projet et client OAuth | Google Cloud ouvert dans Edge connecté : `My First Project`, ID `model-sphere-450818-k3`, numéro `568542524006`. Le client Web « Second Cerveau » est `568542524006-9u3dll4f32evqspdrke6oe929us55kvm.apps.googleusercontent.com` ; il correspond au Client ID affiché dans Supabase. Aucun secret lu. |
| API et scopes | Google Drive API est déjà activée dans ce projet. `https://www.googleapis.com/auth/drive.appdata` ajouté et enregistré comme seul scope déclaré ; aucun scope sensible ou restreint sélectionné. `email profile` restent les scopes de la connexion Google de base. |
| Règles de la table de synchronisation | `public.second_brain_sync` a RLS activé et une clé primaire `user_id`. SELECT, INSERT, UPDATE et DELETE sont limités à `auth.uid() = user_id`. UPDATE a aussi un `WITH CHECK`. Vérification des définitions uniquement, sans lire les sauvegardes personnelles. |
| Tests de comportement | 36 tests passent avec des données fictives et des réponses Supabase/Drive simulées. Ils ne constituent pas un test OAuth réel. |
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
- Bouton Drive demandant une autorisation Drive distincte de la simple connexion Google, même si celle-ci a fourni un jeton. Le retour OAuth est lié au compte et limité à dix minutes ; une vérification API réussie termine cette étape.
- Jetons Google API conservés en mémoire uniquement et retirés des enregistrements de session persistants du client. Les jetons Supabase nécessaires à la session restent gérés par le SDK. Un jeton Google expiré ou refusé provoque une demande de reconnexion.
- Retour OAuth en erreur signalé clairement dans l’interface, avec suppression des paramètres `error`, `error_code` et `error_description` de l’URL. Les détails du fournisseur ne sont pas affichés, car ils peuvent inclure des fragments de code d’autorisation.
- SDK Supabase fixé à `2.119.0` ; disponibilité HTTP 200 du bundle vérifiée.
- Constructeur local corrigé : insertion des modules avant la dernière fermeture HTML, à l’extérieur des chaînes d’export intégrées, et inclusion du module Drive.
- Contrôle mobile corrigé pour utiliser Ubuntu 24.04 : le journal précédent montrait que Playwright 1.56.1 refusait l’image Ubuntu 26.04 de `ubuntu-latest`. Le scénario de première sauvegarde exige maintenant un consentement explicite.

## Essai réel du 13 novembre 2026

Après autorisation de changer de navigateur, Google Cloud et Supabase sont accessibles dans Edge déjà connecté. Aucun mot de passe demandé ou saisi. L’application Google reste **Externe / Test** ; le compte propriétaire a été ajouté aux utilisateurs tests. Elle n’a pas été publiée et l’interface indique que sa présentation doit encore être complétée avant une publication publique.

Une page d’essai distincte a été préparée : `https://baseless-hole-3kbcs88.shipstatic.com/` (expiration automatique après trois jours). Elle reprend les modules V53 du commit `726399c`, utilise uniquement une donnée fictive et un fichier privé distinct, `second-cerveau-e2e-20261113-v53-726399c.json`. L’accès aux tables Supabase est bloqué par le harnais : aucun contenu personnel de `second_brain_sync` n’est chargé ou écrit. Son retour exact a été ajouté temporairement à la liste Supabase, sans wildcard ni changement du Site URL. À retirer quand les essais seront terminés.

L’essai a atteint le choix du compte Google et la confirmation des informations de profil. Le retour Supabase a ensuite échoué avec `server_error`. Une requête agrégée dans les journaux Auth entre 10 h 28 et 10 h 33 UTC confirme **1 `invalid_client` et 1 échec d’échange du code**, sans `invalid_grant` ni `redirect_uri_mismatch`. Aucun code d’autorisation, jeton ou secret n’a été inclus dans ce rapport.

La documentation Google associe `invalid_client` à un secret client incorrect. Le Client ID affiché dans Supabase correspond au client Google vérifié. **Le réglage à corriger est donc le secret du fournisseur Google côté Supabase, en le faisant correspondre à un secret Google actif existant.** La consigne de ne pas modifier les secrets reste respectée : aucune valeur de secret n’a été lue, remplacée, régénérée ou supprimée. Le panneau Google de Supabase a été ouvert pour une intervention directe du propriétaire.

## Blocages réels

1. **Échange OAuth refusé (`invalid_client`).** La correction du secret côté Supabase exige de lever la consigne initiale ou une intervention directe du propriétaire dans l’interface sécurisée. Ne jamais transmettre ce secret dans la conversation.
2. **Essais Drive authentifiés encore impossibles.** La connexion n’ayant pas abouti, aucune sauvegarde Drive réelle n’a été créée ; restauration, refus d’accès, expiration et concurrence sur deux profils/appareils restent à tester après correction.
3. **Autres fonctions du projet Supabase à sécuriser avant un lancement multiutilisateur.** L’advisor et la lecture de leurs définitions montrent que `public.get_session7_dashboard()` et `public.get_course_load_summary()` sont `SECURITY DEFINER`, exécutables par `anon` et `authenticated`, et ne filtrent pas les données par `auth.uid()`. Le tableau de bord agrège notamment notes, tâches, documents et journal. Cela constitue une voie d’accès distincte des bonnes règles RLS de `second_brain_sync`. Ces fonctions n’ont pas été appelées et aucune donnée renvoyée par elles n’a été lue. Ne pas les laisser ainsi pour une utilisation personnelle par plusieurs comptes. La correction doit tenir compte des autres applications utilisant ce même projet ; aucune modification SQL de production effectuée.

## Limites connues

- Un même profil de navigateur conserve un propriétaire local : pour un autre compte Google, utiliser un profil distinct. Le mode local de l’application reste disponible sans connexion ; le stockage local ne fournit pas une confidentialité face à une personne ayant accès au même profil du navigateur.
- Le journal `spiritual-ladder-local-v1` reste volontairement local, conformément à son interface existante. Les clés et codes d’accès sont exclus des sauvegardes.
- Les anciennes copies Drive ne sont pas purgées automatiquement. L’historique consomme progressivement de l’espace. Le module arrête la synchronisation si la liste dépasse 10 000 fichiers ou s’il faudrait résoudre plus de 28 versions concurrentes.
- Supabase ne renouvelle pas automatiquement le jeton Google API. Le choix de ne pas persister de jeton Google implique une nouvelle autorisation après rechargement de la page ou expiration ; la session de connexion Supabase peut rester active.
- L’empreinte SHA-256 détecte une altération accidentelle ; elle ne chiffre pas les données. Les copies résident dans le dossier privé de l’application Drive.

## Validation à terminer avant toute fusion

1. Dans Supabase → Authentication → Sign In / Providers → Google, faire correspondre le Client Secret à un secret actif existant du client Google « Second Cerveau ». Le propriétaire doit saisir la valeur directement dans l’interface, sans la communiquer dans le chat. Ne pas régénérer ou supprimer les secrets Google existants sans accord distinct.
2. Refaire la connexion sur la page d’essai isolée ; vérifier le retour sur l’origine temporaire et l’état connecté.
3. Tester l’autorisation Drive, la première sauvegarde fictive, la modification, l’annulation d’une restauration et la restauration confirmée avec copie locale. Tester ensuite deux profils/appareils et leurs écritures concurrentes.
4. Retirer le retour Supabase temporaire après la fin des essais. Conserver le Site URL et le retour de production.
5. Sécuriser ou retirer les voies RPC publiques signalées, en tenant compte des autres applications de ce projet.
6. Compléter la présentation Google et décider séparément de la publication OAuth pour les utilisateurs non testeurs. Cette publication n’a pas été effectuée.
7. Vérifier les contrôles GitHub du commit final et conserver la PR en brouillon tant que les essais réels et la sécurité des comptes restent bloqués.

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
- [Google : diagnostic invalid_client](https://developers.google.com/identity/protocols/oauth2/web-server#errors)
- [Supabase : connexion Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Supabase : jetons des fournisseurs OAuth](https://supabase.com/docs/guides/auth/social-sign-in)
- [Supabase : fonctions SECURITY DEFINER exposées à anon](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
