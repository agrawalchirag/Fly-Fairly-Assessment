# Fly Fairly — Airport Search System

High-performance, typo-tolerant airport search engine. It handles complex cases like global city groups, tourism aliases, and multiple languages.

---

## 🚀 Choose Your Way to Run

You can run this project using **Docker** (Easiest) or **Manually** (No Docker required).

### Option A: Running with Docker (Recommended)
Use this if you have **Docker Desktop** installed and running.

1. **Start Docker Desktop** on your computer.
2. Open your terminal in the root folder (`\FLY`) and run:
   ```bash
   docker-compose up --build
   ```
3. **Seed the data** (Only the first time):
   Open a new terminal and run:
   ```bash
   cd fly_backend
   npm install
   npx tsx scripts/seed.ts
   ```

4. **Start the Backend**
Open a **new terminal**:
```bash
cd fly_backend
npm run dev
```

---

### Option B: Running Manually (No Docker)
Use this if you don't have Docker installed.

#### 1. Download & Start Meilisearch
- Download for windows `meilisearch-windows-amd64.exe` from the [Meilisearch GitHub Releases](https://github.com/meilisearch/meilisearch/releases).
- Rename it to `meilisearch.exe` and place it in the root folder (`\FLY`).
- Run this command in your terminal:
  ```bash
  .\meilisearch.exe --master-key masterKey --no-analytics --db-path ./meili_data
  ```

#### 2. Start the Backend
Open a **new terminal**:
```bash
cd fly_backend
npm install
npm run dev
```

#### 3. Seed the Data (First time only)
In the `fly_backend` folder, run:
```bash
# Download CSVs
npx tsx scripts/download-data.ts
# Index data
npx tsx scripts/seed.ts
```

#### 4. Start the Frontend
Open a **new terminal**:
```bash
cd fly_frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ⚡ Key Features
- **Typo Tolerance:** Handles "Londn" -> London.
- **Multi-Language:** Search in Japanese (東京), Arabic (دبي), etc.
- **Tourism Aliases:** Search "Bali" or "Goa" to see the correct airports.
- **Multi-Airport Cities:** Typing "LON" shows all London airports grouped.
