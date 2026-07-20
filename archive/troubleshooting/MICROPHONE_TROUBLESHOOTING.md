# Microphone Troubleshooting Guide

## Issue: Clicking microphone doesn't engage hardware

### Quick Fixes

#### 1. **Grant Browser Microphone Permission** (Most Common)

**Chrome/Edge:**
1. Click the 🔒 lock icon in the address bar
2. Find "Microphone" in the permissions list
3. Change from "Block" to "Allow"
4. Refresh the page

**Safari:**
1. Safari menu → Settings → Websites → Microphone
2. Find your org URL in the list
3. Change to "Allow"
4. Refresh the page

**Firefox:**
1. Click the 🔒 lock icon
2. Click "Connection secure" → More information
3. Permissions tab → Microphone → Change to "Allow"
4. Refresh the page

#### 2. **Check System Microphone Permissions**

**macOS:**
```
System Settings → Privacy & Security → Microphone
```
Ensure your browser (Chrome/Safari/Firefox) is checked ✅

**Windows:**
```
Settings → Privacy → Microphone
```
Ensure "Allow apps to access your microphone" is ON
Ensure your browser is allowed

#### 3. **Verify Microphone Hardware**

**macOS:**
```bash
# Test microphone in Terminal
say "Testing microphone" && open /Applications/QuickTime\ Player.app
# Then: File → New Audio Recording → click record button
```

**Windows:**
```
Settings → System → Sound → Input
Select your microphone and test
```

---

## Visual Indicators in VizVoice

### Permission States

**🟡 Prompt (first time):**
```
ℹ️ First click will request microphone permission.
```
You'll see a browser popup asking for permission.

**🟢 Granted:**
No warning banners. Microphone button is active (blue gradient).

**🔴 Denied:**
```
⚠️ Microphone access denied. Please enable microphone permissions...
```
Yellow banner at top. Follow Quick Fix #1 above.

---

## Debug Checklist

Open browser console (F12) and check for these logs when clicking the mic:

### ✅ Success Flow
```
[useSpeechInput] Starting recognition...
[useSpeechInput] Recognition started - microphone active
[useSpeechInput] Recognition result: "your transcript here"
```

### ❌ Common Errors

**Error: `not-allowed`**
```
[useSpeechInput] Recognition error: not-allowed
```
→ **Fix:** Grant microphone permission (Quick Fix #1)

**Error: `no-speech`**
```
[useSpeechInput] Recognition error: no-speech
```
→ **Fix:** Speak louder or closer to mic. Check input volume in system settings.

**Error: `audio-capture`**
```
[useSpeechInput] Recognition error: audio-capture
```
→ **Fix:** Microphone hardware issue. Check Quick Fix #3.

**Error: `network`**
```
[useSceechInput] Recognition error: network
```
→ **Fix:** Web Speech API requires internet. Check connection.

---

## Browser Compatibility

### Fully Supported
- ✅ **Chrome/Edge** (desktop) — Best experience
- ✅ **Safari** (macOS) — Requires explicit permission
- ✅ **Chrome** (Android) — Mobile support

### Limited/Unsupported
- ⚠️ **Firefox** — Web Speech API support is experimental
- ❌ **Safari** (iOS) — Web Speech API not supported
- ❌ **IE/Legacy browsers** — Not supported

---

## Advanced Debugging

### Check Web Speech API availability
Open browser console (F12) and run:
```javascript
console.log('SpeechRecognition:', window.SpeechRecognition || window.webkitSpeechRecognition);
console.log('SpeechSynthesis:', window.speechSynthesis);
```

Expected output:
```
SpeechRecognition: function SpeechRecognition() { [native code] }
SpeechSynthesis: SpeechSynthesis {}
```

If `undefined` → your browser doesn't support Web Speech API.

### Test microphone access directly
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone access granted!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('Microphone access denied:', err));
```

### Check current permission state
```javascript
navigator.permissions.query({ name: 'microphone' })
  .then(result => console.log('Mic permission:', result.state));
```

---

## Still Not Working?

### 1. **Hard Refresh**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Safari: Hold `Shift` and click reload
- Firefox: `Ctrl+F5`

### 2. **Clear Site Data**
Chrome/Edge:
1. F12 → Application tab
2. Clear storage → Clear site data
3. Refresh page
4. Re-grant microphone permission

### 3. **Try Incognito/Private Mode**
This bypasses any cached permissions or extensions that might interfere.

### 4. **Check Browser Extensions**
Ad blockers or privacy extensions can block microphone access.
Try disabling extensions temporarily.

### 5. **Verify Org URL**
The app must be accessed via:
```
https://orgfarm-aac260ab62-dev-ed.my.salesforce.com
```
NOT:
- `http://` (non-HTTPS won't work)
- `localhost` (unless explicitly configured)

---

## How VizVoice Requests Permission

**Step-by-step flow:**

1. User clicks microphone button or presses Alt+V
2. App checks current permission state via `navigator.permissions.query()`
3. If not granted, calls `navigator.mediaDevices.getUserMedia({ audio: true })`
4. Browser shows native permission prompt
5. If granted, starts Web Speech API `recognition.start()`
6. Microphone indicator appears in browser tab/address bar

**Important:** The permission request happens *before* Speech Recognition starts, ensuring the hardware microphone is accessible.

---

## Continuous Mode Note

Once microphone is working:
- First interaction starts continuous mode
- After each agent response, auto-listens again (500ms delay)
- Press Alt+V again or click mic to stop

If continuous mode stops unexpectedly:
- Check console for errors
- Verify microphone didn't disconnect
- Ensure you're still speaking (silence stops the loop)

---

## Contact/Report Issues

If none of these fixes work, capture the following and report:

1. **Browser & version**: e.g., "Chrome 121.0.6167.85"
2. **Operating system**: e.g., "macOS 14.5"
3. **Console logs**: Copy full error from browser console (F12)
4. **Network tab**: Check if any API calls are failing
5. **Microphone model**: Built-in laptop mic or external device?

Include this in your issue report with a screenshot of the console.
