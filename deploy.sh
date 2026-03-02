#!/bin/bash
# Script de déploiement automatique pour velotracker
# Appelé par le webhook /webhook/deploy

set -e

git fetch origin master
git reset --hard origin/master
npm install --production --silent
sudo /usr/bin/systemctl restart velotracker
