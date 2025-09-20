import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper } from '@mui/material';
import { isValidUrl, genShortcode, isAlphanumeric } from '../utils/helpers';
import { loadAll, upsertUrlEntry } from '../utils/storage';
import { logEvent } from '../utils/loggingAdapter';
import Navigation from '../components/Navigation';

function ShortenerPage(){
  // default 5 rows
  const [rows, setRows] = useState(
    Array.from({length:5}).map(()=> ({ longUrl: '', minutes: '', custom: '' }))
  );
  const [result, setResult] = useState([]); // created items to display
  const [error, setError] = useState('');

  function handleChange(i, field, value){
    const copy = [...rows]; copy[i][field] = value; setRows(copy);
  }

  async function handleSubmit(e){
    e.preventDefault();
    setError('');
    const created = [];
    const allExisting = loadAll();
    for (let i=0; i<rows.length; i++){
      const r = rows[i];
      if (!r.longUrl.trim()) continue; // skip empty
      if (!isValidUrl(r.longUrl.trim())) { setError(`Row ${i+1}: Invalid URL`); return; }
      let minutes = parseInt(r.minutes || '', 10);
      if (isNaN(minutes) || minutes <= 0) minutes = 30; // default 30
      // shortcode logic
      let sc = r.custom && r.custom.trim();
      if (sc) {
        if (!isAlphanumeric(sc) || sc.length < 3 || sc.length > 20) {
          setError(`Row ${i+1}: Custom shortcode must be alphanumeric, 3-20 chars`);
          return;
        }
        // uniqueness check
        if (allExisting.some(x => x.shortcode === sc)) {
          setError(`Row ${i+1}: Custom shortcode "${sc}" already taken`);
          return;
        }
      } else {
        // auto generate until unique
        let tries = 0;
        do { sc = genShortcode(6); tries++; } while (allExisting.some(x => x.shortcode === sc) && tries < 10);
      }

      const createdAt = Date.now();
      const expiresAt = createdAt + minutes * 60 * 1000;
      const entry = { shortcode: sc, longUrl: r.longUrl.trim(), createdAt, expiresAt, clicks: [] };
      upsertUrlEntry(entry);
      created.push(entry);
      logEvent('SHORTEN_CREATED', { shortcode: sc, longUrl: r.longUrl.trim(), expiresAt });
    }
    setResult(created);
  }
return (
    <>
      <Navigation />
      <Box sx={{ p:4, maxWidth:900, mx:'auto' }}>
        <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {rows.map((r,i) => (
            <React.Fragment key={i}>
              <Grid item xs={12}>
                <Paper sx={{p:2}}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} md={7}>
                      <TextField fullWidth label={`Original long URL (row ${i+1})`}
                        value={r.longUrl}
                        onChange={e=>handleChange(i,'longUrl', e.target.value)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField label="Validity (minutes)" value={r.minutes}
                        onChange={e=>handleChange(i,'minutes', e.target.value)} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField label="Custom shortcode (optional)" value={r.custom}
                        onChange={e=>handleChange(i,'custom', e.target.value)} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </React.Fragment>
 ))}
          <Grid item xs={12}>
            <Button variant="contained" type="submit">Shorten selected</Button>
            <Button sx={{ml:2}} href="/stats">Go to Stats</Button>
          </Grid>
        </Grid>
      </form>

      {error && <Typography color="error" sx={{mt:2}}>{error}</Typography>}

      {result.length > 0 && (
        <Box sx={{mt:3}}>
          <Typography variant="h6">Created:</Typography>
          {result.map(it=>(
            <Paper key={it.shortcode} sx={{p:2, mt:1}}>
              <div>Short: <a href={`/go/${it.shortcode}`}>{window.location.origin}/go/{it.shortcode}</a></div>
              <div>Original: {it.longUrl}</div>
              <div>Expires at: {new Date(it.expiresAt).toLocaleString()}</div>
            </Paper>
          ))}
        </Box>
      )}
      </Box>
    </>
  );
}

export default ShortenerPage;
