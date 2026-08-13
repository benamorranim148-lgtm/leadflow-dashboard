# Lead Generation Agent

A simple AI agent that:
1. Searches for businesses of a given type in a given location (Google Places API)
2. Fetches basic info + website content for each one
3. Uses Claude to score how much each business needs a specific service (1-10) + gives a reason
4. Saves a ranked CSV of leads, best first

## 1. Get your API keys

**Google Places API key**
1. Go to https://console.cloud.google.com/
2. Create a project (or use an existing one)
3. Enable the **Places API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key
6. ⚠️ Google gives $200/month free credit, but set a billing cap in the console so you never get an unexpected charge

**Anthropic API key**
1. Go to https://console.anthropic.com/
2. Create an account (separate from claude.ai — this is the developer/API console)
3. Go to "API Keys" → create a new key
4. Copy it
5. You'll need to add billing credit to your Anthropic Console account to use the API

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Set your API keys as environment variables

**Mac/Linux:**
```bash
export GOOGLE_PLACES_API_KEY="your_google_key_here"
export ANTHROPIC_API_KEY="your_anthropic_key_here"
```

**Windows (PowerShell):**
```powershell
$env:GOOGLE_PLACES_API_KEY="your_google_key_here"
$env:ANTHROPIC_API_KEY="your_anthropic_key_here"
```

(These only last for the current terminal session — for a permanent setup, add them to your system environment variables or a `.env` file with a package like `python-dotenv`.)

## 4. Run it

```bash
python agent.py --query "clothing stores" --location "Tunis, Tunisia" --service "e-commerce website" --max-results 15
```

This will:
- Search Google Places for ~15 clothing stores in Tunis
- Check if each has a website, and pull a snapshot of its homepage text
- Ask Claude to score each one on how much it likely needs an e-commerce website
- Save everything to `leads.csv`, sorted best lead first

## 5. Open `leads.csv`

You'll get columns: `name, address, website, phone, score, reason` — open it in Excel/Google Sheets to review, filter, and start outreach.

## Notes & next steps
- This is a starting prototype — realistic next upgrades: a simple web dashboard (React) instead of CSV, saving results to a database instead of overwriting each run, and adding an outreach-message-drafting step.
- Respect API rate limits and terms of service — don't hammer the Places API with huge result counts in a short time.
- Google Places' free tier has limits; check current pricing before running large batches: https://mapsplatform.google.com/pricing/
