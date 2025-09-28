# Copilot Instructions for MMDReporting

## Project Overview
- **MMDReporting** is a Node.js + Python hybrid app for generating and serving shop reports, with WhatsApp integration and a browser-based UI.
- **Key files:**
  - `Reports.js`: Frontend logic, shop config, table definitions, and data mapping for reports UI.
  - `server.js`: Node.js backend, Express server, WhatsApp bot integration, logging.
  - `MMD.py`: Python launcher for orchestrating environment setup, process management, and launching both Node and Chrome app.

## Architecture & Data Flow
- **Frontend (`Reports.js`/`Reports.html`)**: Loads shop config, fetches data from shop-specific REST endpoints, renders tables based on `table_columns` and `table_click_links`.
- **Backend (`server.js`)**: Runs an Express server, handles WhatsApp bot events, logs to `node_log.log`, exposes REST endpoints for frontend.
- **Launcher (`MMD.py`)**: Handles environment variables (`BRANCH`, `BRANCH_PASSWORD`), kills old Node/Chrome processes, launches Node server and Chrome app with a dedicated profile.

## Developer Workflows
- **Start the app:**
  - Run `python MMD.py` (Windows only; sets env vars, launches Node and Chrome app window).
  - Ensure `psutil` is installed: `pip install psutil`.
- **Logs:**
  - Node logs: `.\node_log.log` (auto-created).
- **Environment:**
  - Required: `BRANCH` and `BRANCH_PASSWORD` (set via prompt or env vars; persisted on Windows).
- **Shop config:**
  - Update encrypted keys/URLs in `Reports.js` under `shopConfig`.

## Project Conventions
- **Table columns and click links** are defined in `Reports.js` as JS objects for dynamic UI generation.
- **Sensitive keys** are stored in JS, not in environment variables.
- **No package.json**: Node dependencies are expected to be globally installed (e.g., `whatsapp-web.js`, `express`, `cors`, `qrcode-terminal`).
- **No test suite**: No automated tests or test scripts present.

## Integration Points
- **WhatsApp bot**: Uses `whatsapp-web.js` with local auth; QR code shown in terminal on first run.
- **REST API**: Shop endpoints are hardcoded in `Reports.js`.
- **Chrome app**: Launched with a dedicated profile for each run.

## Examples
- To add a new shop, update `shopConfig` in `Reports.js`.
- To change table structure, edit `table_columns` and `table_click_links` in `Reports.js`.
- To debug backend, check `node_log.log` and console output from `server.js`.

---
For questions about workflow or structure, see `MMD.py` for orchestration logic, `server.js` for backend, and `Reports.js` for frontend/report logic.
