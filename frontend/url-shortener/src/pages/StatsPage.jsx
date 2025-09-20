import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { loadAll } from '../utils/storage';
import Navigation from '../components/Navigation';

function StatsPage(){
  const all = loadAll().sort((a,b)=>b.createdAt - a.createdAt);

  return (
    <>
      <Navigation />
      <Box sx={{p:4, maxWidth:1000, mx:'auto'}}>
        <Typography variant="h4">Statistics</Typography>
      {all.length === 0 && <Typography sx={{mt:2}}>No shortened URLs yet</Typography>}
      {all.map(item => (
        <Paper key={item.shortcode} sx={{p:2, mt:2}}>
          <Typography variant="h6">{window.location.origin}/{item.shortcode}</Typography>
          <div>Original: {item.longUrl}</div>
          <div>Created: {new Date(item.createdAt).toLocaleString()} | Expires: {new Date(item.expiresAt).toLocaleString()}</div>
          <div>Total clicks: {(item.clicks || []).length}</div>

          <Table size="small" sx={{mt:1}}>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Referrer</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>User Agent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(item.clicks || []).slice().reverse().map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(c.ts).toLocaleString()}</TableCell>
                  <TableCell>{c.referrer}</TableCell>
                  <TableCell>{c.country || 'unknown'}</TableCell>
                  <TableCell style={{maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.ua}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
      </Box>
    </>
  );
}

export default StatsPage;
