# Galactic Harvest

Idle/clicker spatial : développe des colonies planétaires et récolte de l'énergie à
travers le système solaire. Jouable directement dans le navigateur, installable en PWA.

▶️ https://piascwal.github.io/galacticrush/

## Stack

Vite + Svelte 5 + TypeScript strict. Voir [ROADMAP.md](./ROADMAP.md) pour le détail
de la migration et le plan mobile (Capacitor).

## Développement

```bash
npm install
npm run dev      # serveur de dev
npm run check    # typecheck (svelte-check + tsc)
npm run build    # build de production dans dist/
```

L'ancienne version monolithique (avant migration Vite/Svelte) reste disponible pour
référence dans [legacy/galactic-harvest-classic.html](./legacy/galactic-harvest-classic.html).

## Déploiement

Chaque push sur `main` déclenche le workflow `.github/workflows/deploy.yml`, qui
build le projet et publie `dist/` sur GitHub Pages.

À faire une seule fois côté GitHub : **Settings → Pages → Source: GitHub Actions**
(indispensable depuis l'introduction de l'étape de build — un déploiement "Deploy from
a branch" servirait le code source non compilé).

## Roadmap

Le plan de migration vers TypeScript strict, les tests, la CI et le portage mobile
(Capacitor) sont détaillés dans [ROADMAP.md](./ROADMAP.md).
