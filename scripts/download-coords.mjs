/**
 * GeoMondo — Expand valid Street View coordinates
 *
 * The WorldGuessr dataset is not committed to their GitHub repo — it's
 * generated externally using the Vali tool (https://github.com/slashP/Vali)
 * and requires ~15GB of downloaded data to produce.
 *
 * For GeoMondo, there are two practical options to get a large dataset:
 *
 * OPTION A — Export from map-making.app (easiest, free, no install needed)
 * -------------------------------------------------------------------------
 * 1. Go to https://map-making.app
 * 2. Search for "An Arbitrary World" or any large world map
 * 3. Click "Export" → choose JSON format
 * 4. Move the file here and rename to: data/valid-coords.json
 * 5. Run this script to normalise the format:
 *       node scripts/download-coords.mjs --normalise path/to/export.json
 *
 * OPTION B — Use the Vali CLI tool (most control, requires .NET 8)
 * ----------------------------------------------------------------
 * 1. Install .NET 8: https://dotnet.microsoft.com/download/dotnet/8.0
 * 2. Run: dotnet tool install -g vali
 * 3. Run: vali download   (downloads country data — takes a while)
 * 4. Create a spec file world.json:
 *    { "countryCodes": ["*"], "distributionStrategy": { "key": "FixedCountByMaxMinDistance", "locationCountGoal": 50000, "minMinDistance": 200 } }
 * 5. Run: vali generate --file world.json
 * 6. Move the output JSON to: data/valid-coords.json
 * 7. Run: node scripts/download-coords.mjs --normalise path/to/output.json
 *
 * The starter file at data/valid-coords.json already has 390 curated
 * coordinates covering all continents — enough for full development and testing.
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'data', 'valid-coords.json');

const args = process.argv.slice(2);
const normaliseFlag = args.indexOf('--normalise');

if (normaliseFlag === -1) {
  console.log('GeoMondo Coordinate Tool\n');
  console.log('Usage:');
  console.log('  node scripts/download-coords.mjs --normalise <path-to-export.json>');
  console.log('');
  console.log('See script comments for how to get a full dataset (map-making.app or Vali CLI).');
  console.log('');
  console.log(`Current dataset: ${OUTPUT_PATH}`);
  try {
    const existing = JSON.parse(await readFile(OUTPUT_PATH, 'utf8'));
    console.log(`  ${existing.length} coordinates loaded ✅`);
  } catch {
    console.log('  No dataset found ❌');
  }
  process.exit(0);
}

const inputPath = args[normaliseFlag + 1];
if (!inputPath) {
  console.error('Error: provide a path after --normalise');
  process.exit(1);
}

console.log(`Reading from ${inputPath}...`);
const raw = JSON.parse(await readFile(inputPath, 'utf8'));

// Handle various export formats (GeoGuessr, map-making.app, Vali, flat array)
let items = Array.isArray(raw) ? raw : (raw.locations ?? raw.customCoordinates ?? []);

const normalised = items.map(c => ({
  lat: Number(c.lat ?? c.latitude ?? c[0]),
  lng: Number(c.lng ?? c.lon ?? c.longitude ?? c[1]),
})).filter(c =>
  !isNaN(c.lat) && !isNaN(c.lng) &&
  c.lat >= -90 && c.lat <= 90 &&
  c.lng >= -180 && c.lng <= 180
);

await writeFile(OUTPUT_PATH, JSON.stringify(normalised));
console.log(`✅ Saved ${normalised.length.toLocaleString()} coordinates to data/valid-coords.json`);
console.log(`   File size: ${(JSON.stringify(normalised).length / 1024).toFixed(0)} KB`);
