# Google Drive V53 — revue du 14 novembre 2026

**Décision : conserver la PR nº 9 en brouillon. Aucune fusion ni aucun déploiement en production.**

## Vérifications effectuées

| Élément | Résultat |
| --- | --- |
| Version actuelle | Les onglets de l’application affichent V49. La branche principale reste inchangée. |
| Client OAuth | Client Web « Second Cerveau » du projet `model-sphere-450818-k3`. Le Client ID Google correspond à celui de Supabase. |
| Callback Google | `https://wuhbalxjpcfemsxdnggp.supabase.co/auth/v1/callback` présent. |
| Origine autorisée | `https://jonathan777888.github.io` présente. |
| Redirections Supabase | Site URL et retour de production : `https://jonathan777888.github.io/jonathan-os/`. Le retour exact du précédent essai isolé reste présent ; aucun wildcard ajouté. |
| Autorisations Drive | `https://www.googleapis.com/auth/drive.appdata` est le seul scope Drive déclaré. Aucun scope sensible ou restreint déclaré. La connexion Google de base fournit aussi le profil et l’e-mail. |
| Audience Google | Externe / Test, compte propriétaire présent parmi les testeurs. Publication désactivée tant que le branding reste incomplet. |
| Google Drive API | Activée lors de la revue du 13 novembre. Nouvelle ouverture de sa console le 14, mais lecture interrompue par un délai du navigateur : activation non revérifiée pendant cette reprise. |
| Sauvegarde V13 | JSON du 14 novembre retrouvé dans le dossier Drive de sauvegardes, lu sans modification. Copie de travail privée hors dépôt ; aucun contenu personnel ajouté à GitHub. |
| Données Supabase | Définitions de la table et des politiques inspectées, sans lecture des contenus personnels. |

## Blocage OAuth confirmé

L’essai a utilisé la page isolée déjà créée le 13 novembre, avec un fichier et des données fictives distincts. Il a atteint le choix du compte et la confirmation du profil, puis est revenu sans session connectée.

Les journaux Auth agrégés du **14 novembre, 22 h 28 à 22 h 35 UTC**, indiquent **1 `invalid_client` et 1 échec d’échange du code**. Aucun secret, code d’autorisation ni jeton n’est reproduit ici.

Google affiche deux secrets existants actifs et précise que leur valeur ne peut plus être affichée ni téléchargée. Le Client ID et le callback correspondant, le secret configuré dans Supabase doit être vérifié contre un secret actif conservé par le propriétaire. Aucun secret n’a été révélé, remplacé, régénéré, désactivé ou supprimé pendant cette reprise.

Le panneau Google de Supabase a été ouvert pour une saisie directe du propriétaire. S’il possède le secret actif, il doit le saisir dans **Client Secret (for OAuth)** et enregistrer, sans le transmettre dans la conversation. S’il a perdu les deux secrets, une rotation nécessite une préparation distincte pour préserver les autres consommateurs du client OAuth.

## Corrections supplémentaires préparées

- Une nouvelle version Supabase n’est plus restaurée automatiquement en arrière-plan, même si l’appareil semble ne pas avoir de modifications locales. L’utilisateur doit vérifier puis confirmer le remplacement.
- Les détails d’erreur OAuth sont retirés de la requête **et** du fragment de l’URL. Une ancre sans erreur est conservée.
- Le constructeur du harnais OAuth produit un identifiant propre à chaque essai et un fichier Drive réservé à cet essai. Il refuse les identifiants invalides.
- Des tests de compatibilité V13 et un scénario de sauvegarde/restauration traversant les vrais modules V53 ont été ajoutés.

Les protections précédentes restent en place : premier envoi sur confirmation, sauvegardes Drive successives sans PATCH/DELETE, copie locale avant restauration, refus des changements de compte et des réponses obsolètes, détection de concurrence, validation des propriétaires et empreintes, jetons Google API en mémoire, SDK Supabase fixé à `2.119.0`.

## Résultats des tests

**43 tests locaux réussis**, avec la sauvegarde V13 privée explicitement fournie. Les tests qui touchent Drive utilisent un serveur simulé ; ils ne prouvent pas qu’un transfert Google réel a réussi.

- Carte V13, branches, positions, relations, bilans, mémoires, tâches, liens archivés et date de contenu conservés par la migration du noyau V53.
- Copie V13 de secours préservée ; initialisation répétée du canevas sans déplacement des branches.
- Sauvegarde, modification et restauration V13 par les modules V53 avec serveur Drive simulé : contenu initial restitué exactement, deux versions conservées et copie de récupération avant restauration.
- Refus d’accès, expiration, corruption, annulation, manque d’espace, changements de compte, réponses asynchrones et conflits couverts par les tests.
- Construction complète Pages et syntaxe des **7 scripts intégrés** validées.
- Nouveau harnais OAuth construit et vérifié syntaxiquement ; il n’a pas été déployé.

Le JSON V13 exporté contient l’état du noyau ; une sauvegarde Drive V53 contient une enveloppe et les chaînes du stockage local, dont `second-brain-current`. Ces fichiers ne sont pas interchangeables directement. La copie V13 visible dans Drive reste une sauvegarde indépendante : le scope `drive.appdata` ne donne pas à l’application l’accès aux fichiers ordinaires du Drive. Aucun import ni aucune restauration de données personnelles n’a été exécuté.

## Sécurité du projet partagé

`second_brain_sync` possède RLS, une clé primaire `user_id`, une référence à `auth.users` et les quatre politiques limitées à `auth.uid() = user_id`. UPDATE possède aussi `WITH CHECK`. Le déclencheur `updated_at` est présent.

Le script facultatif `tests/rls-isolation.sql` prépare une vérification avec utilisateurs et lignes fictifs, suivie d’un rollback forcé. **Ce test n’a pas été exécuté : la confirmation demandée par le connecteur a expiré.** Il n’existe donc aucun résultat de test dynamique en base à revendiquer ; les vérifications ci-dessus portent sur les définitions.

L’advisor confirme encore deux fonctions `SECURITY DEFINER`, exécutables par `anon` et `authenticated`, sans filtre propriétaire :

- `public.get_session7_dashboard()` agrège notamment notes, tâches, documents et journal ;
- `public.get_course_load_summary()` agrège les cours.

Elles n’ont pas été appelées. Les tables Session7 n’ont pas de colonne propriétaire ni de politique d’accès utilisateur. Changer les fonctions en `SECURITY INVOKER` renverrait des résultats vides avec les politiques actuelles ; révoquer directement leurs accès peut interrompre Session7. L’absence d’appels observés dans la fenêtre de journaux ne prouve pas l’absence de consommateurs.

**Traitement nécessaire avant lancement :** identifier les consommateurs Session7 et leur mode d’authentification ; déplacer les accès vers un backend autorisant explicitement le propriétaire ou ajouter une isolation par propriétaire aux données ; tester Session7 ; révoquer ensuite les accès non autorisés aux deux RPC. Une alerte `search_path` concerne aussi `public.set_updated_at()` ; sa correction doit être intégrée à cette revue partagée. Aucune fonction, politique, donnée ou clé d’une autre application n’a été modifiée.

## Étapes restantes avant déploiement

1. Corriger le secret Google dans l’interface sécurisée, sans le divulguer ni supprimer les secrets existants.
2. Refaire OAuth, puis autoriser uniquement `drive.appdata` sur le harnais isolé.
3. Vérifier réellement première sauvegarde fictive, ajout d’une version, annulation, restauration et copie locale de récupération ; vérifier aussi refus d’accès et concurrence entre deux contextes.
4. Finaliser et tester la sécurité des RPC partagées sans interrompre Session7.
5. Revérifier l’API Drive et l’audience requise. Retirer le retour temporaire une fois les essais terminés, en conservant les redirections des autres applications.
6. Vérifier les contrôles GitHub du commit final ; déployer seulement après validation de ces points. Conserver un retour possible au commit principal actuel.

## Reproduction locale

```sh
node --test second-cerveau/tests/*.test.cjs
python3 second-cerveau/tests/check_build.py
node second-cerveau/build_site.cjs /tmp/second-cerveau-v53
```

Les deux tests privés sont ignorés en CI. Pour les exécuter localement, définir `SECOND_BRAIN_V13_BACKUP` vers une copie privée du JSON, hors dépôt. Ne jamais versionner de sauvegarde personnelle.

## Documentation

- [Dossier privé Google Drive](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Google OAuth et erreurs](https://developers.google.com/identity/protocols/oauth2/web-server#errors)
- [Connexion Google Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Fonctions SECURITY DEFINER exposées](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
