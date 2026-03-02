require('dotenv').config();
const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3003;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Créer un trip (status='recording')
app.post('/api/trips', async (req, res) => {
    const { data, error } = await supabase
        .from('trips')
        .insert({ user_id: 'goshia', status: 'recording' })
        .select('id')
        .single();

    if (error) {
        console.error('POST /api/trips error:', error);
        return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, data: { id: data.id } });
});

// Batch insert de points GPS
app.post('/api/trips/:id/points', async (req, res) => {
    const tripId = req.params.id;
    const { points } = req.body;

    if (!Array.isArray(points) || points.length === 0) {
        return res.status(400).json({ ok: false, error: 'points array required' });
    }

    const rows = points.map(p => ({
        trip_id: tripId,
        lat: p.lat,
        lng: p.lng,
        altitude: p.altitude,
        accuracy: p.accuracy,
        point_order: p.point_order,
        recorded_at: p.recorded_at || new Date().toISOString()
    }));

    const { error } = await supabase.from('trip_points').insert(rows);

    if (error) {
        console.error(`POST /api/trips/${tripId}/points error:`, error);
        return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true });
});

// Finaliser un trip (status='done' + métriques)
app.put('/api/trips/:id/finish', async (req, res) => {
    const tripId = req.params.id;
    const { distance_km, duration_seconds, avg_speed_kmh, max_speed_kmh, elev_positive, elev_negative } = req.body;

    const { data, error } = await supabase
        .from('trips')
        .update({
            status: 'done',
            finished_at: new Date().toISOString(),
            distance_km,
            duration_seconds,
            avg_speed_kmh,
            max_speed_kmh,
            elev_positive,
            elev_negative
        })
        .eq('id', tripId)
        .select()
        .single();

    if (error) {
        console.error(`PUT /api/trips/${tripId}/finish error:`, error);
        return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, data });
});

// Liste des trips terminés
app.get('/api/trips', async (req, res) => {
    const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'done')
        .order('started_at', { ascending: false });

    if (error) {
        console.error('GET /api/trips error:', error);
        return res.status(500).json({ ok: false, error: error.message });
    }
    res.json({ ok: true, data });
});

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
