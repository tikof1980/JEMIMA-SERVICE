# JEMIMA SERVICE

Plateforme SaaS multi-tenant permettant à une dirigeante de piloter plusieurs entreprises
(Agence de voyage, Boutique de vêtements, Salon de coiffure, + entreprises personnalisables)
depuis un Command Center unique.

**Projet entièrement indépendant** — aucun code, dépendance ou configuration partagée
avec GOD.ROGWEBSERVICE ou tout autre projet RogWeb Service.

## Structure du monorepo

```
jemima-service/
├── apps/
│   ├── api/     # Backend NestJS + TypeORM (PostgreSQL)
│   └── web/     # Frontend Next.js (Command Center + apps métier)
├── docker-compose.yml
├── .env.example
└── README.md
```

## Démarrage rapide (local)

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env

# 2. Lancer PostgreSQL en local (via Docker)
docker compose up -d db

# 3. Backend
cd apps/api
npm install
npm run start:dev

# 4. Frontend (nouveau terminal)
cd apps/web
npm install
npm run dev
```

## Dépôt GitHub

Ce projet doit être poussé vers un **nouveau dépôt indépendant**, par exemple :
`github.com/tikof1980/jemima-service`

```bash
git remote add origin https://github.com/tikof1980/jemima-service.git
git branch -M main
git add .
git commit -m "Phase 2 — initialisation du projet JEMIMA SERVICE"
git push -u origin main
```

## Statut d'avancement

- [x] Phase 1 — Architecture technique
- [x] Phase 2 — Initialisation du projet (squelette backend/frontend, structure, config)
- [ ] Phase 3 — Authentification + utilisateurs + rôles
- [ ] Phase 4 — Entreprises + multi-tenant
- [ ] Phase 5 — Command Center
- [ ] Phase 6 — Modules métiers
- [ ] Phase 7 — QR codes
- [ ] Phase 8 — Automatisations
- [ ] Phase 9 — AI CORE + Gemini
- [ ] Phase 10 — Alertes vocales
- [ ] Phase 11 — Notifications + WhatsApp
- [ ] Phase 12 — PWA / mobile
- [ ] Phase 13 — Tests + sécurité + déploiement
