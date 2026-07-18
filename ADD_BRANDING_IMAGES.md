# Add Branding Images to VizVoice UI

**Status**: Waiting for images to be saved

---

## Images to Save

Save these three images you provided to the following locations:

### 1. Agentforce Robot (Top Image - Blue robot with purple sphere)

**Save to**: `force-app/main/default/uiBundles/vizvoice/public/images/agentforce-robot.png`

**Used for**: 
- Header avatar (appears next to "VizVoice" title)
- Shows the friendly Agentforce robot mascot

**Dimensions**: Recommended 512x512px or larger (will be displayed at 48x48px)

---

### 2. Tableau Next Logo (Middle Image - Purple gradient logo)

**Save to**: `force-app/main/default/uiBundles/vizvoice/public/images/tableau-next-logo.png`

**Used for**:
- Header branding (appears next to VizVoice title)
- Shows the Tableau Next logo prominently

**Dimensions**: Recommended 200x100px (will be displayed at height 32px, auto width)

**Alternative**: If you have a transparent PNG version (no white background), that's even better!

---

### 3. User Avatar Icon (Bottom Image - Purple circle with person icon)

**Save to**: `force-app/main/default/uiBundles/vizvoice/public/images/user-avatar.png`

**Used for**:
- User message bubbles (optional - can be added later)
- Could also be used for accessibility info banner

**Dimensions**: Recommended 128x128px (will be displayed at 32x32px)

---

## How to Save the Images

### Option 1: From Your Screenshots

1. Right-click each image in your chat
2. Click **"Save Image As..."**
3. Navigate to: `/Users/russellevans/Library/Application Support/Claude-3p/local-agent-mode-sessions/734b7465-4068-4669-b480-5b4a8fbcfb2a/00000000-0000-4000-8000-000000000001/local_06aabcb2-6881-4446-b898-851aa7f21b7a/outputs/vizvoice-ui/force-app/main/default/uiBundles/vizvoice/public/images/`
4. Save with the exact filenames above

### Option 2: From Source Files

If you have higher-resolution versions from Salesforce branding assets, use those instead for better quality.

---

## After Saving Images

Run these commands to rebuild and deploy:

```bash
# Switch to Node 22 (required for build)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22

# Navigate to UI Bundle directory
cd /Users/russellevans/Library/Application\ Support/Claude-3p/local-agent-mode-sessions/734b7465-4068-4669-b480-5b4a8fbcfb2a/00000000-0000-4000-8000-000000000001/local_06aabcb2-6881-4446-b898-851aa7f21b7a/outputs/vizvoice-ui/force-app/main/default/uiBundles/vizvoice

# Rebuild with new images
npm run build

# Deploy to org
cd ../../../../../..
sf project deploy start --metadata UIBundle:vizvoice --target-org vizvoice-dev --wait 20
```

---

## Expected Result

After deployment, the VizVoice header will show:

```
┌───────────────────────────────────────────────────────┐
│  🤖  [Tableau Next Logo]  VizVoice                    │
│      Robot Icon            Voice Assistant             │
└───────────────────────────────────────────────────────┘
```

With:
- **Agentforce robot icon** on the left (rounded, with green "ready" indicator)
- **Tableau Next logo** next to the title
- **VizVoice blue-to-teal gradient background** (already applied)

---

## Fallback Behavior

If any image fails to load, the UI will gracefully fall back:
- **Robot icon** → Falls back to microphone SVG icon
- **Tableau Next logo** → Simply hidden (title still shows)
- **User avatar** → Not yet implemented (no fallback needed)

This ensures the app always works even if images are missing.

---

## Optional: User Avatar in Chat Bubbles

If you want to add user avatars to the chat messages, I can update the message rendering code. Let me know if you'd like that feature!

Current chat bubbles are:
- **User messages**: Blue background, white text (no avatar)
- **Agent messages**: White background, dark text (no avatar)

With avatars:
- **User messages**: User icon on the right
- **Agent messages**: Robot icon on the left

---

## Changelog

- **2026-07-18**: Created guide for adding branding images to VizVoice UI
