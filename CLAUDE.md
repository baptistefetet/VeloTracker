# VeloTracker

Application de suivi de sorties vélo.

## Stack
- **Backend** : Node.js + Express
- **Frontend** : HTML statique (Tailwind CSS, Leaflet) dans `public/`
- **Port** : 3003
- **Domaine** : `velo.pbat.ovh`

## Structure
```
velotracker/
├── server.js          # Serveur Express (sert les fichiers statiques)
├── package.json
├── public/
│   └── index.html     # Application front-end
├── CLAUDE.md
└── README.md
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
