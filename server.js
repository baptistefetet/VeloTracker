const express = require('express');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.static(path.join(__dirname, 'public')));

app.post('/webhook/deploy', (req, res) => {
    console.log('Webhook deploy: déploiement déclenché');
    const deployScript = path.join(__dirname, 'deploy.sh');
    execFile('bash', [deployScript], { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error('Erreur de déploiement:', error.message);
            console.error('stderr:', stderr);
            return;
        }
        console.log('Déploiement terminé:', stdout);
    });
    res.json({ ok: true, message: 'Déploiement déclenché' });
});

app.listen(PORT, () => {
    console.log(`VeloTracker running on port ${PORT}`);
});
