# Fly Fairly — Airport Search System

High-performance, typo-tolerant airport search engine. It handles complex cases like global city groups (LON, NYC), tourism aliases (Bali), and multiple languages (Japanese, Arabic, etc.).

---

## 🚀 Tech Stack

- **Search Engine:** Meilisearch (Fast, typo-tolerant, Rust-based)
- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, Vite, Vanilla CSS
- **Data Source:** OurAirports (Airports, Regions, Countries)

---

## 🛠️ Getting Started

### 1. Start Meilisearch
Run the Meilisearch binary in the root folder:
```bash
.\meilisearch.exe --master-key masterKey --no-analytics --db-path ./meili_data
```

### 2. Setup Backend
Open a new terminal:
```bash
cd fly_backend
npm install
npm run dev
```

### 3. Setup Data (First time only)
In the `fly_backend` folder, run these scripts to fetch and index the data:
```bash
# Download raw CSV files
npx tsx scripts/download-data.ts

# Clean, enrich, and seed to Meilisearch
npx tsx scripts/seed.ts
```

### 4. Setup Frontend
Open a new terminal:
```bash
cd fly_frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ⚡ Key Features

- **Multi-Index Strategy:** Separate indexes for Airports, Cities, and Regions for high accuracy.
- **Custom Ranking:** Prioritizes exact IATA codes, then exact region matches, then city groups.
- **Typo Tolerance:** Handles misspellings like "Londn" automatically.
- **Global Support:** Search in English, Chinese, Japanese, Korean, and Arabic.
- **Enriched Data:** Hardcoded aliases for tourism spots (Bali, Goa) and city overrides (Manama, Bengaluru).

---

## 📁 Project Structure

- `fly_backend/`: Express API and search logic.
- `fly_backend/data/`: Enrichment JSON files (translations, aliases, overrides).
- `fly_backend/scripts/`: Data download and seeding logic.
- `fly_frontend/`: React components and UI.
- `meilisearch.exe`: Local search engine binary.
