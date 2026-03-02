# VeloTracker

Application de suivi de sorties vélo avec enregistrement GPS et persistance Supabase.

## Stack
- **Backend** : Node.js + Express (proxy vers Supabase)
- **Frontend** : HTML statique (Tailwind CSS, Leaflet) dans `public/`
- **Base de données** : Supabase (PostgreSQL)
- **Port** : 3003
- **Domaine** : `velo.pbat.ovh`

## Structure
```
velotracker/
├── server.js          # Serveur Express + endpoints API Supabase
├── package.json       # express, dotenv, @supabase/supabase-js
├── .env               # SUPABASE_URL, SUPABASE_ANON_KEY
├── .env.example
├── deploy.sh
├── public/
│   └── index.html     # Application front-end (GPS, carte, historique)
├── CLAUDE.md
└── README.md
```

## Architecture

### Principe
Le client ne parle jamais directement à Supabase. Toutes les requêtes passent par le serveur Express qui fait proxy — aucun credential exposé côté client.

### Flux d'enregistrement
1. **Démarrer** → `POST /api/trips` crée un trip `status=recording`
2. **Pendant** → les points GPS sont bufferisés côté client et flushés toutes les 10s via `POST /api/trips/:id/points`
3. **Arrêter** → flush final + `PUT /api/trips/:id/finish` passe le trip en `done` avec les métriques
4. **Historique** → `GET /api/trips` retourne les trips `done` triés par date desc

### Cas limites
- **Perte réseau** : les points restent en buffer mémoire, retry au prochain flush
- **Trajet 0 km** : finalisé normalement (done avec métriques à 0)
- **Navigateur fermé** : trip reste `recording`, invisible dans l'historique

## Supabase

### Tables
- `trips` : `id` (uuid PK), `user_id` (text), `status` (text: recording/done), `started_at` (timestamptz), `finished_at` (timestamptz), `distance_km` (numeric), `duration_seconds` (int), `avg_speed_kmh` (numeric), `max_speed_kmh` (numeric), `elev_positive` (int), `elev_negative` (int)
- `trip_points` : `id` (uuid PK), `trip_id` (uuid FK → trips ON DELETE CASCADE), `lat` (float8), `lng` (float8), `altitude` (float8), `accuracy` (float8), `point_order` (int), `recorded_at` (timestamptz)

### Index
- `idx_trip_points_trip_id` sur `trip_points(trip_id)`
- `idx_trips_status` sur `trips(status)`

### RLS
Activé sur les deux tables avec policies permissives (pas d'auth pour l'instant).

### User
Hardcodé `goshia` dans `server.js` (pas d'authentification).

### Endpoints
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/trips | Crée un trip recording |
| POST | /api/trips/:id/points | Batch insert points GPS |
| PUT | /api/trips/:id/finish | Finalise avec métriques |
| GET | /api/trips | Liste trips done (desc) |

### Variables d'environnement (`.env`)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

## Développement
```bash
# Lancer en local
cd /var/www/html/velotracker && sudo -u www-data PORT=3003 node server.js

# Service systemd
systemctl status|restart velotracker
journalctl -u velotracker -f
```

## Déploiement
Le service tourne en tant que `www-data` via systemd (`velotracker.service`).

Webhook `/webhook/deploy` déclenche `deploy.sh` (git pull + npm install + restart).

Déploiement manuel :
```bash
cd /var/www/html/velotracker && sudo -u www-data bash deploy.sh
```
