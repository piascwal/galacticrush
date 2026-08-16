# Galactic Harvest

Idle/clicker spatial : développe des colonies planétaires et récolte de l'énergie à
travers le système solaire. Jouable directement dans le navigateur, installable en PWA.

▶️ https://piascwal.github.io/galacticrush/

## Développement

Le jeu est pour l'instant un site statique (`index.html`), sans étape de build.

```bash
npx serve .
```

## Déploiement

Chaque push sur `main` déclenche le workflow `.github/workflows/deploy.yml`, qui
publie le contenu du dépôt sur GitHub Pages.

À faire une seule fois côté GitHub : **Settings → Pages → Source: GitHub Actions**.

## Roadmap

Le plan de migration vers TypeScript strict, les tests, la CI et le portage mobile
(Capacitor) sont détaillés dans [ROADMAP.md](./ROADMAP.md).
