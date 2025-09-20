// storage.js
const KEY = 'url_shortener_data_v1';
const OLD_KEY = 'urls';

// Migration function to convert old format to new format
function migrateOldData() {
  const oldData = localStorage.getItem(OLD_KEY);
  const newData = localStorage.getItem(KEY);
  
  if (oldData && !newData) {
    try {
      const oldUrls = JSON.parse(oldData);
      const migratedData = [];
      
      Object.entries(oldUrls).forEach(([shortcode, data]) => {
        migratedData.push({
          shortcode: shortcode,
          longUrl: data.original,
          createdAt: Date.now(),
          expiresAt: Date.now() + (30 * 60 * 1000), // Default 30 minutes
          clicks: []
        });
      });
      
      localStorage.setItem(KEY, JSON.stringify(migratedData));
      console.log('Migrated old URL data to new format');
    } catch (e) {
      console.error('Error migrating old data:', e);
    }
  }
}

export function loadAll() {
  migrateOldData();
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function saveAll(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function findByShortcode(sc) {
  const all = loadAll();
  return all.find(x => x.shortcode === sc);
}

export function upsertUrlEntry(entry) {
  // entry = {shortcode, longUrl, createdAt(ms), expiresAt(ms), clicks: []}
  const all = loadAll();
  const idx = all.findIndex(x => x.shortcode === entry.shortcode);
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  saveAll(all);
}

export function recordClick(shortcode, clickObj) {
  const all = loadAll();
  const item = all.find(x => x.shortcode === shortcode);
  if (!item) return;
  item.clicks = item.clicks || [];
  item.clicks.push(clickObj);
  saveAll(all);
}

