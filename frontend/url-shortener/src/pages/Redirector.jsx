import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findByShortcode, recordClick } from '../utils/storage';
import { logEvent } from '../utils/loggingAdapter';
import { Box, Typography, CircularProgress } from '@mui/material';

function Redirector(){
  const { shortcode } = useParams();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    async function doRedirect(){
      const entry = findByShortcode(shortcode);
      if (!entry) { setStatus('notfound'); logEvent('REDIRECT_NOT_FOUND', {shortcode}); return; }
      if (Date.now() > entry.expiresAt) { setStatus('expired'); logEvent('REDIRECT_EXPIRED',{shortcode}); return; }

      setStatus('redirecting');
      // prepare click info
      const click = {
        ts: Date.now(),
        referrer: document.referrer || 'direct',
        ua: navigator.userAgent || '',
        // coarse geo attempt
        country: 'unknown'
      };

      // try coarse geo (optional): use ipapi.co (may fail if offline)
      try {
        const r = await fetch('https://ipapi.co/json/');
        if (r.ok) {
          const js = await r.json();
          click.country = js.country_name || js.country || 'unknown';
        }
       } catch (e) {
        // ignore
      }

      recordClick(shortcode, click);
      logEvent('REDIRECT', {shortcode, click});

      // finally redirect
      window.location.assign(entry.longUrl);
    }
    doRedirect();
  }, [shortcode]);

  if (status === 'checking' || status === 'redirecting') {
    return <Box sx={{p:4,textAlign:'center'}}><CircularProgress /><Typography>Redirecting...</Typography></Box>;
  }
  if (status === 'notfound') return <Box sx={{p:4}}><Typography>Short link not found. <Link to="/">Go home</Link></Typography></Box>;
  if (status === 'expired') return <Box sx={{p:4}}><Typography>Short link expired. <Link to="/">Create new</Link></Typography></Box>;
  return null;
}

export default Redirector;
