# Roadmap technique — Galactic Harvest

## 1. Constat

Le jeu est aujourd'hui un fichier unique `index.html` (~2200 lignes, HTML + CSS + JS
inline, aucun outil de build, aucun typage, aucun test). C'est un excellent format
pour prototyper vite, mais il devient risqué à faire évoluer : pas de garde-fou à la
compilation, tout changement de la logique économique (production, coûts, sauvegarde)
peut casser silencieusement une autre partie du fichier.

Objectif de ce document : définir une trajectoire **incrémentale** (pas de réécriture
big-bang) vers une stack qui apporte typage strict, tests, CI, et un chemin clair vers
une app mobile — sans jamais bloquer la publication de nouvelles fonctionnalités.

## 2. Stack cible

| Sujet | Choix | Pourquoi |
|---|---|---|
| Build | **Vite** | zero-config, TS natif, dev server instantané, plugin PWA officiel |
| Langage | **TypeScript strict** (`strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`) | le cœur du jeu est du calcul (coûts, taux, offline progress) — le typage évite la classe de bugs la plus fréquente dans ce genre d'idle game |
| UI | DOM direct (pas de framework lourd) | le jeu est déjà pensé "manipulation DOM ciblée" ; introduire React/Vue serait un coût de réécriture sans bénéfice proportionné tant que l'UI reste simple |
| État | petit store maison typé (`GameState` + reducers purs) | permet de tester la logique indépendamment du DOM |
| Style | CSS modules, variables déjà en place | pas besoin de Tailwind, le design system existant (`--accent`, `--energy`, etc.) est déjà cohérent |
| Tests | **Vitest** (logique) + **Playwright** (parcours clé : clic, achat, save/load) | la logique économique est la partie la plus fragile aux régressions |
| Qualité | ESLint (`typescript-eslint` strict) + Prettier + Husky/lint-staged | bloque les erreurs avant le commit |
| CI | GitHub Actions : lint + typecheck + test sur chaque push/PR | déjà amorcé avec le workflow de déploiement |
| Sauvegarde | schéma de save **versionné** + fonctions de migration | indispensable dès qu'on change la forme du `GameState` en prod |

## 3. Migration incrémentale

- **Étape 0 — fait** : dépôt Git, icônes (favicon + PWA + mobile), déploiement
  GitHub Pages via Actions.
- **Étapes 1 à 3 — fait** : Vite + Svelte 5 + TypeScript strict. Données de jeu
  typées (`PlanetDef`, `BuildingDef`, `RdDef`, ...), logique économique pure et
  testable dans `src/lib/state/economy.ts`, monolithe découpé en composants Svelte
  (`state/`, `systems/`, `components/`). Le CSS reste volontairement global (un seul
  `app.css`, fidèle à l'original) plutôt que scopé composant par composant, pour
  limiter le risque de régression visuelle sur ce premier passage.
- **Étape 4** : tests unitaires sur la logique économique (`economy.ts` est déjà
  écrit comme des fonctions pures prenant l'état en paramètre — prêt à tester avec
  Vitest, mais les tests eux-mêmes restent à écrire).
- **Étape 5 — partiellement fait** : le workflow de déploiement build désormais le
  projet (`npm run check` + `npm run build`) avant de publier `dist/`. Il manque
  encore le lint (ESLint + Prettier) et l'exécution des futurs tests dans la CI.
- **Étape 6** : PWA complète via `vite-plugin-pwa` (service worker, cache offline,
  installable) — le manifest et les icônes sont déjà prêts pour ça.

Chaque étape est un PR indépendant qui laisse le jeu jouable à tout moment.

## 4. Plan mobile

**Recommandation : Capacitor (Ionic)**, pas une réécriture React Native.

Le jeu est 100% DOM/CSS (pas de canvas ni de rendu graphique lourd), donc l'empaqueter
avec Capacitor donne une app native quasi gratuite : même code, mêmes tests, accès aux
API natives (haptics, notifications, achats in-app) quand le besoin arrivera.
Une réécriture React Native/Expo ne se justifierait que si le jeu évolue vers des
animations 60fps complexes ou des besoins store-only — à réévaluer plus tard, pas
maintenant.

Étapes concrètes (une fois l'étape 5 ci-dessus faite, pour builder depuis `dist/`) :

1. `npm install @capacitor/core @capacitor/cli` puis `npx cap init`
2. `npx cap add ios` / `npx cap add android`
3. `capacitor.config.ts` → `webDir: 'dist'`
4. Génération des icônes/splash natifs via `@capacitor/assets`, à partir des sources
   déjà prêtes dans `icons/icon.svg` et `icons/icon-maskable.svg`
5. Remplacer `localStorage` par `@capacitor/preferences` pour une sauvegarde fiable
   côté natif (localStorage peut être purgé par l'OS sur mobile)
6. Distribution : TestFlight (iOS) et piste de test interne (Android), puis stores

## 5. Robustesse — points à corriger tôt

- La police Google Fonts est chargée via `@import` externe : ça casse le mode hors
  ligne visé par la PWA. À self-hoster ou bundler via Vite.
- Ajouter une validation du JSON de sauvegarde à l'import/chargement (un save corrompu
  ou d'une version antérieure ne doit jamais faire planter le jeu).
- CSP (`Content-Security-Policy`) une fois les assets externes supprimés/bundlés.

## 6. Priorisation suggérée

1. Étapes 1 → 2 (Vite + TS strict + données typées) : le plus gros gain de sécurité
   pour le plus petit effort.
2. Étape 4 (tests sur la logique économique) avant toute grosse feature.
3. Étape 6 (PWA) + plan mobile Capacitor : quand le besoin "app mobile" devient concret.
