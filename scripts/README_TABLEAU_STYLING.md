# Tableau Dashboard Auto-Styler for VizVoice

**⚠️ SAFETY FIRST: This script modifies your Tableau workbook. Always backup before running!**

---

## What This Does

Automatically applies VizVoice brand colors and accessibility styling to your Tableau dashboard:

- ✅ Sets dashboard background to `#FAFAFA` (Gray 50)
- ✅ Changes title to "VizVoice Transit Analytics"
- ✅ Applies semantic colors:
  - **Orange** (`#F28E2B`) for delay/warning charts
  - **Green** (`#59A14F`) for on-time/success charts
  - **Red** (`#E15759`) for cancellation/error charts
- ✅ Updates borders to `#E0E0E0` (medium gray)
- ✅ Updates gridlines to `#EEEEEE` (light gray)
- ✅ Applies VizVoice typography (font sizes, weights, colors)

---

## Prerequisites

### 1. Install Dependencies

```bash
cd scripts
pip install tableauserverclient lxml python-dotenv
```

### 2. Create Tableau Personal Access Token

**For Tableau Server / Tableau Cloud:**
1. Log in to your Tableau Server
2. Click your profile icon → **My Account Settings**
3. Scroll to **Personal Access Tokens**
4. Click **Create New Token**
5. Name: `VizVoice Styling Script`
6. Copy the **Token Name** and **Token Secret** (you'll need both)

**For Tableau Next (Salesforce embedded):**
- You may need to use the Tableau REST API via Salesforce Connected App
- Check with your admin if Tableau Next supports Personal Access Tokens

---

## Setup

### 1. Configure Credentials

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Tableau credentials:

```bash
TABLEAU_SERVER_URL=https://your-tableau-server.com
TABLEAU_TOKEN_NAME=your_token_name
TABLEAU_TOKEN_VALUE=your_token_secret_value
TABLEAU_SITE_ID=                    # Leave empty for default site
```

**⚠️ NEVER commit `.env` to git!** (Already in `.gitignore`)

---

## Usage

### Step 1: Backup Your Workbook (CRITICAL!)

**Before running the script, manually download a backup:**

1. Go to Tableau Server / Tableau Cloud
2. Find your "TransitData" workbook
3. Click **...** (More Actions) → **Download**
4. Save as `TransitData_BACKUP_2026-07-18.twbx`
5. Store in a safe location

### Step 2: Run the Script

**Dry Run (Download + Style Locally, NO Upload):**

```bash
python style_tableau_dashboard.py \
  --workbook "TransitData" \
  --dashboard "TransitData" \
  --output-dir ./styled_workbooks
```

This will:
1. Download your workbook
2. Apply VizVoice styling
3. Save the styled version to `./styled_workbooks/TransitData_vizvoice_styled.twbx`
4. **NOT upload** (waits for your confirmation)

**Review the Output:**
- Open `./styled_workbooks/TransitData_vizvoice_styled.twbx` in Tableau Desktop
- Check that colors, titles, and styling look correct
- If something broke, you have your backup!

### Step 3: Upload (Optional)

When prompted:
```
🚀 Upload styled workbook to Tableau Server? (y/n):
```

- Type `y` to upload and overwrite the original
- Type `n` to keep it local and upload manually later

---

## What Gets Changed

### Dashboard Title
- **Before**: "TransitData"
- **After**: "VizVoice Transit Analytics"

### Dashboard Background
- **Before**: `#FFFFFF` (white)
- **After**: `#FAFAFA` (Gray 50)

### Chart Colors (Smart Detection)

The script detects chart purpose by worksheet name:

| Worksheet Name Contains | Color Applied | Hex | Reasoning |
|-------------------------|---------------|-----|-----------|
| "delay", "cause" | **Orange** | `#F28E2B` | Warning/caution |
| "on-time", "performance" | **Green** | `#59A14F` | Success/positive |
| "cancel", "cancelled" | **Red** | `#E15759` | Error/negative |
| Anything else | **Blue** | `#4E79A7` | Default brand color |

### Typography
- **Dashboard title**: 18pt, bold, `#212121`
- **Chart titles**: 14pt, normal, `#424242`
- **Axis labels**: 10pt, `#757575`

### Borders & Gridlines
- **Chart borders**: `#E0E0E0` (medium gray), 1px solid
- **Gridlines**: `#EEEEEE` (light gray), dotted

---

## Troubleshooting

### Error: "Workbook 'TransitData' not found on server"

**Solution**: Check the workbook name exactly matches. Run this to list all workbooks:

```bash
python -c "
import tableauserverclient as TSC
import os
from dotenv import load_dotenv

load_dotenv()
auth = TSC.PersonalAccessTokenAuth(
    os.getenv('TABLEAU_TOKEN_NAME'),
    os.getenv('TABLEAU_TOKEN_VALUE'),
    site_id=os.getenv('TABLEAU_SITE_ID', '')
)
server = TSC.Server(os.getenv('TABLEAU_SERVER_URL'))
with server.auth.sign_in(auth):
    workbooks, _ = server.workbooks.get()
    for wb in workbooks:
        print(f'- {wb.name}')
"
```

### Error: "Dashboard 'TransitData' not found in workbook"

**Solution**: Check the dashboard name. Open the `.twbx` in Tableau Desktop and verify the dashboard tab name.

### Error: "Authentication failed"

**Solution**: Verify your token credentials:
- Token Name and Token Value must match exactly
- Token must not be expired
- Token must have "Write" permissions

### Script Changed Something Wrong

**Solution**: Restore from backup:
1. Go to Tableau Server
2. Upload your `TransitData_BACKUP_2026-07-18.twbx` manually
3. Overwrite the broken version

---

## Safety Features

### What the Script Does NOT Do

- ❌ Does NOT delete any worksheets
- ❌ Does NOT change data sources or connections
- ❌ Does NOT modify filters or calculations
- ❌ Does NOT alter dashboard layout or sizing
- ❌ Does NOT change permissions or sharing settings

### What the Script DOES Change

- ✅ Colors (backgrounds, chart fills, borders, gridlines)
- ✅ Typography (font sizes, weights, colors)
- ✅ Dashboard title text
- ✅ XML formatting attributes only

**All changes are cosmetic styling only — no data or logic changes.**

---

## Alternative: Manual Tableau Editing

If you prefer NOT to use the script, here's the manual checklist:

### In Tableau Desktop

1. Download the workbook
2. Open in Tableau Desktop
3. **Dashboard → Format → Shading**: `#FAFAFA`
4. **Dashboard title**: Double-click → Change to "VizVoice Transit Analytics"
5. For each worksheet:
   - **Format → Borders → Pane**: `#E0E0E0`, 1px
   - **Format → Lines → Grid Lines**: `#EEEEEE`, dotted
   - **Marks card → Color**:
     - Delay charts: `#F28E2B`
     - On-time charts: `#59A14F`
     - Cancellation heatmap: Red gradient ending at `#E15759`
6. **File → Save As**: `TransitData_vizvoice_styled.twbx`
7. Upload to Tableau Server

---

## Advanced: Customize Styling Rules

Edit `style_tableau_dashboard.py` to change colors or add rules:

```python
# Line 34-41: Change color mappings
CHART_COLOR_RULES = {
    'delay_cause': '#YOUR_CUSTOM_COLOR',    # Change delay color
    'on_time': '#YOUR_CUSTOM_COLOR',        # Change on-time color
    # ... add more rules
}
```

---

## Support

**Issues with the script?**
- Check `.env` credentials are correct
- Verify you have "Write" permissions on the workbook
- Try running with `--output-dir ./test` to test locally first

**Need help?**
- Open an issue in the VizVoice repo
- Include error message from terminal
- Include Tableau Server version (Server Settings → About)

---

## License

Part of the VizVoice project (Salesforce Agentforce for Good Hackathon 2026)
