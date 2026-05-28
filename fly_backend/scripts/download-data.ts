import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/raw');

const FILES = [
  {
    name: 'airports.csv',
    url: 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/airports.csv'
  },
  {
    name: 'regions.csv',
    url: 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/regions.csv'
  },
  {
    name: 'countries.csv',
    url: 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/countries.csv'
  }
];

async function downloadFile(url: string, dest: string) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${path.basename(dest)}`);
        resolve(true);
      });
    }).on('error', (err: Error) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  for (const file of FILES) {
    const dest = path.join(DATA_DIR, file.name);
    console.log(`Downloading ${file.name}...`);
    try {
      await downloadFile(file.url, dest);
    } catch (error) {
      console.error(`Failed to download ${file.name}:`, error);
    }
  }
}

main();
