# Himalayan Singing Bowls Export Automation System (API 3)

A full-stack, enterprise-grade export outreach and buyer discovery platform built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, and **Google Gemini AI**.

This application automates the end-to-end B2B & B2C export marketing pipeline for authentic Himalayan singing bowls, meditation chimes, and gong manufacturers—from multi-channel lead discovery and validation to AI classification, personalized email drafting, and reliable Gmail SMTP delivery with PDF catalog attachments.

---

## 📑 Table of Contents
1. [Core Features & Architecture](#-core-features--architecture)
2. [Prerequisites](#-prerequisites)
3. [End-to-End Setup Guide](#-end-to-end-setup-guide)
   - [Step 1: Clone & Install Dependencies](#step-1-clone--install-dependencies)
   - [Step 2: Environment Variables (.env)](#step-2-environment-variables-env)
   - [Step 3: Generating a Google Gmail App Password](#step-3-generating-a-google-gmail-app-password)
   - [Step 4: Setting Up Presentation / Catalog PDF](#step-4-setting-up-presentation--catalog-pdf)
4. [Running the Application](#-running-the-application)
   - [Development Mode](#development-mode)
   - [Production Build & Run](#production-build--run)
5. [Data Architecture & Storage](#-data-architecture--storage)
6. [Complete User Workflow](#-complete-user-workflow)
7. [REST API Reference](#-rest-api-reference)
8. [Database Maintenance & Resetting](#-database-maintenance--resetting)
9. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🚀 Core Features & Architecture

- **Multi-Source Buyer Discovery**: Search prospective international leads across Google, LinkedIn, Facebook, Directories, and direct website URL scrapers using niche keywords (e.g., *Singing Bowls*, *Sound Healing Studio*).
- **Email Syntax & Domain Validation**: Automated RFC 5322 regex checks, disposable/flagged email detection, and cross-referencing against existing database contacts.
- **AI Classification Engine (Gemini 3.8 Flash)**: Categorizes discovered leads into commercial enterprises (`business_emails.csv`) vs. solo practitioners/retailers (`individual_emails.csv`) with confidence scores and reasoning. Includes resilient automatic failover to `gemini-3.1-flash-lite` and rule-based heuristics.
- **Dynamic Email Personalization**: Automatically interpolates merge tags (`{buyer_name}`, `{company_name}`, `{country}`) with optional AI tailoring for context-specific outreach.
- **Gmail SMTP Dispatch & Simulation Sandbox**: Send live outbound emails via authenticated Gmail SMTP (`smtp.gmail.com:587`), or execute risk-free simulated campaigns with delay throttling and live progress tracking.
- **Catalog PDF Attachments**: Seamlessly embeds product catalogs (e.g. `assets/Export_API_documentation.docx.pdf`) with configurable attachment display names.
- **Duplicate Suppression**: Automatically cross-references `sent_log.csv` to prevent double-contacting the same prospective buyer across multiple campaigns.
- **CSV Data Persistence**: All operational data is stored in human-readable, exportable CSV files without requiring external database servers.

---

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js**: Version `18.0.0` or higher (Node 20+ recommended)
- **npm** (comes with Node.js) or **bun**
- **Google Account**: With **2-Step Verification** enabled to generate a 16-character **App Password** for SMTP.
- **Gemini API Key** *(Optional but recommended)*: For AI-powered lead discovery, smart categorization, and personalized email tailoring. Get one free from [Google AI Studio](https://aistudio.google.com/).

---

## 🛠️ End-to-End Setup Guide

### Step 1: Clone & Install Dependencies

Clone the repository and install all required npm packages:

```bash
# Clone the repository
git clone https://github.com/Anshuman-Jha-01/api-export-automation-system
cd api-export-automation-system

# Install all dependencies
npm install
```

---

### Step 2: Environment Variables (.env)

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in your text editor and configure the following parameters:

```env
# ==============================================================================
# Google Gemini API Configuration (Server-Side Secret)
# ==============================================================================
GEMINI_API_KEY="your-gemini-api-key-here"

# ==============================================================================
# Gmail SMTP Credentials (Outreach Email Dispatch)
# ==============================================================================
GMAIL_EMAIL="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"    # 16-character Gmail App Password

# ==============================================================================
# SMTP Server Configuration
# ==============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USE_SSL="false"
CC_MONITORING=""

# ==============================================================================
# Campaign & Presentation Configuration
# ==============================================================================
SEARCH_KEYWORD="Singing Bowls"
DAILY_SEND_LIMIT="100"
PRESENTATION_PATH="assets/Export_API_documentation.docx.pdf"
PRESENTATION_FILENAME="Export_API_documentation.docx.pdf"
```

> **Note**: You can also update these credentials anytime directly from the **Settings** tab in the web application. Changes made in the UI are saved to `data/settings.json`.

---

### Step 3: Generating a Google Gmail App Password

Standard Gmail passwords do **not** work with SMTP because of Google's security standards. You must generate a 16-character **Google App Password**:

1. Log into your Google Account and visit: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure that **2-Step Verification** is turned **ON**. (App Passwords are only available if 2-Step Verification is enabled).
3. In the search bar at the top of your Google Account page, search for **App passwords**, or navigate directly to:  
   👉 [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Under **App name**, enter a name (e.g., `Singing Bowls Exporter`) and click **Create**.
5. Google will display a **16-character yellow pop-up code** (e.g., `wbos qtmp akdr tcfz`).
6. Copy this password and paste it into:
   - Your `.env` file under `GMAIL_APP_PASSWORD="..."`, or
   - The web interface under **Settings → Gmail Account Credentials**.
7. *(Spaces are ignored automatically by the system).*

---

### Step 4: Setting Up Presentation / Catalog PDF

When launching email campaigns, the system can automatically attach your product presentation or export wholesale catalog to outgoing emails.

1. Place your PDF file into the `assets/` directory:
   ```bash
   # Example: Place your document in assets/
   assets/Export_API_documentation.docx.pdf
   ```
2. In **Settings → Product Presentation Asset**:
   - Set **Server Asset File Path**: `assets/Export_API_documentation.docx.pdf`
   - Set **Outgoing Attachment Display Name**: `Export_API_documentation.docx.pdf` (or any custom name your recipients should see).
3. You can click **Inspect & Download Current PDF** in the Settings panel or navigation bar to preview the exact document that will be sent.

---

## 💻 Running the Application

### Development Mode

Runs the unified full-stack server (Express backend + Vite development middleware) on port `3000`:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build & Run

To build optimized client assets and bundle the server for production deployment:

```bash
# 1. Compile Vite client and bundle server with esbuild
npm run build

# 2. Start the production Node.js server
npm start
```

The production server starts on `http://0.0.0.0:3000`.

---

## 🗄️ Data Architecture & Storage

All data is maintained in the `data/` directory using standard CSV and JSON formats:

| File Path | Description | Key Fields |
| :--- | :--- | :--- |
| `data/buyers.csv` | Master repository of all discovered & uploaded buyer leads. | `email`, `buyer_name`, `company_name`, `website`, `country`, `source_platform`, `category`, `status` |
| `data/business_emails.csv` | Commercial entities segmented by AI (studios, wholesalers, retail stores). | `email`, `buyer_name`, `company_name`, `ai_confidence`, `ai_reasoning`, `classified_at` |
| `data/individual_emails.csv` | Solo acoustic therapists, yoga teachers, and private practitioners. | `email`, `buyer_name`, `company_name`, `ai_confidence`, `ai_reasoning`, `classified_at` |
| `data/sent_log.csv` | Historical delivery audit trail preventing duplicate contacts across campaigns. | `delivery_id`, `campaign_id`, `email`, `subject`, `status`, `sent_at`, `response_message` |
| `data/settings.json` | Persistent application configuration, SMTP credentials, and templates. | `email`, `app_password`, `smtp_host`, `delay`, `presentation_path`, `simulation_mode` |

---

## 🔄 Complete User Workflow

The platform follows a structured 5-stage export outreach pipeline:

```
[1. Discover Leads] ➔ [2. Validate & Filter] ➔ [3. AI Classify] ➔ [4. Dispatch Campaign] ➔ [5. Audit & Reports]
```

### 1. Lead Discovery (`/search`)
- Enter targeted search queries (e.g. `Himalayan Singing Bowls wholesale`, `Sound Bath Healing`).
- Select search sources (Google, LinkedIn, Facebook, Directories, or Website scrapers).
- Filter by target country (US, UK, Germany, France, Japan, Australia, etc.).
- The system discovers realistic buyer leads and enriches them with contact details.

### 2. Lead Validation & CSV Upload (`/upload`)
- Upload your existing contact lists in `.csv` format or extract emails from website URLs.
- The validator flags malformed syntax and filters out duplicate addresses already present in `sent_log.csv`.

### 3. AI Classification (`/classify`)
- Click **Run AI Classification** to trigger the Gemini categorization engine.
- Leads are evaluated based on company titles, domain structures, and online presence.
- Commercial entities are automatically routed to `business_emails.csv`, while private practitioners are routed to `individual_emails.csv`.

### 4. Campaign Dispatch (`/send`)
- **Audience Selection**: Choose between **All Valid Buyers**, **Business Entities Only**, or **Individual Practitioners Only**.
- **Template Variables**: Personalize messages using `{buyer_name}`, `{company_name}`, and `{country}`.
- **Presentation Attachment**: Check **Attach Product Catalog / Presentation** to include your PDF file.
- **Safety Throttling**: Set a dispatch delay (e.g. 2–5 seconds) to maintain high email sender reputation.
- **Simulation Sandbox vs. Live SMTP**: Toggle **Simulation Mode** to safely test your campaign without sending live emails, or turn it OFF to dispatch real emails via Gmail.

### 5. Audit Trail & Reports (`/report`)
- View real-time campaign progress with delivery status breakdowns.
- Download `outreach_campaign_report.csv` or export individual contact segments directly.

---

## 📡 REST API Reference

The backend exposes a full suite of REST API endpoints:

### System & Status
- `GET /api/health`: Check server health and status.
- `GET /api/stats`: Retrieve counts of buyers, business leads, individual leads, and sent logs.
- `GET /api/settings`: Retrieve current application settings.
- `POST /api/settings`: Update application settings and credentials.

### Buyer & Lead Management
- `GET /api/buyers`: Fetch all buyers with optional filtering (`?category=business&status=valid`).
- `POST /api/buyers`: Add or update a single buyer lead.
- `DELETE /api/buyers/:email`: Delete a buyer from the database.
- `POST /api/search`: Run multi-source buyer discovery.
- `POST /api/scrape-url`: Extract email addresses from any target web page.
- `POST /api/validate-emails`: Validate all leads for RFC syntax and duplicate suppression.

### AI Classification
- `POST /api/classify`: Trigger Gemini AI classification across unclassified leads.
- `POST /api/preview-email`: Generate an interpolated or AI-tailored email preview.

### Email Campaign Dispatch
- `POST /api/send-campaign`: Dispatch an outreach campaign with the following payload:
  ```json
  {
    "subject": "Handcrafted Singing Bowls Wholesale Catalog",
    "body": "Dear {buyer_name} at {company_name}...",
    "audience": "business",
    "attach_presentation": true,
    "delay_seconds": 2,
    "simulation_mode": false,
    "ai_tailor_content": false
  }
  ```
- `GET /api/sent-log`: Retrieve delivery logs.
- `GET /api/report`: Retrieve latest campaign metrics and success rates.

### Files & Downloads
- `POST /api/upload-csv`: Upload and merge external CSV leads into the database.
- `GET /api/download-csv/:type`: Download `buyers`, `business`, `individual`, or `sent_log` as CSV.
- `GET /api/download-report`: Download current campaign report as CSV.
- `GET /api/presentation`: Download or inspect the active PDF presentation asset.
- `POST /api/clear-data`: Clear all operational records from CSV files.

---

## 🧹 Database Maintenance & Resetting

To wipe all buyer leads, classification outputs, and sent logs clean:

### Via Web Interface
Navigate to the **Settings** or **Dashboard** tab and use the data export and management controls.

### Via Command Line / API
Send a POST request to the clear-data endpoint:

```bash
curl -X POST http://localhost:3000/api/clear-data
```

This clears `buyers.csv`, `business_emails.csv`, `individual_emails.csv`, and `sent_log.csv` back to clean header rows while preserving your SMTP and application configuration in `data/settings.json`.

---

## ❓ Troubleshooting & FAQs

### 1. `Invalid login: 535-5.7.8 Username and Password not accepted`
- **Cause**: Using standard Gmail password instead of a Google App Password, or 2-Step Verification is not enabled.
- **Fix**: Generate a 16-character App Password at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and enter it without spaces.

### 2. `Presentation file not found at assets/...`
- **Cause**: The PDF file path configured in Settings does not exist on disk.
- **Fix**: Place your PDF file into the `assets/` folder and verify that the path in **Settings → Product Presentation Asset** matches the filename (e.g. `assets/Export_API_documentation.docx.pdf`).

### 3. `Gemini API quota or 503 high-demand notice`
- **Behavior**: The built-in Gemini service features automatic retry with exponential backoff and transparent failover to `gemini-3.1-flash-lite`. If an API key is omitted, the application uses built-in rule-based heuristics and directory matching so core features continue working uninterrupted.

### 4. `Emails skipped as duplicates`
- **Behavior**: If an email address already appears in `data/sent_log.csv` and **Remove Duplicates** is enabled in Settings, the system skips that contact to protect your domain reputation. To re-contact leads, clear `sent_log.csv` or disable duplicate suppression in Settings.

---

## 📄 License

MIT License. Designed for international Himalayan Singing Bowl and sound wellness export houses.
