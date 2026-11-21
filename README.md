# Wedding Invitation Website — Kiran & Megha

A luxury interactive wedding invitation experience cloned and personalized for **Kiran & Megha**.

## 📁 Project Structure

```
├── index.html                  # Main markup with cleaned assets and Cloudflare scripts removed
├── style.css                   # Responsive layout, typography, animations, and color scheme
├── app.js                      # Intro scroll lock, audio/video player, scratch card canvas & petal physics, countdown
├── assets/                     # Media files (all downloaded locally)
│   ├── autoplay-poster.jpg     # Video placeholder poster
│   ├── temple-autoplay.mp4     # Opening cinematic film (17 MB)
│   ├── opening-final.jpg       # Still frame displayed when film ends
│   ├── raanjhan-aaya-from-40s.mp3 # Background music
│   ├── km-monogram.webp        # Blessing monogram artwork (KM initials)
│   ├── divider-names.webp      # Decorative flourish divider
│   ├── divider-scratch.webp    # Scratch section divider
│   ├── divider-countdown.webp  # Countdown section divider
│   ├── divider-celebrations.webp # Celebrations section divider
│   ├── divider-love.webp       # Closing thanks divider
│   ├── haldi-ceremony.jpg      # Haldi ceremony poster
│   ├── haldi-ceremony.mp4      # Haldi looping video card
│   ├── ring-ceremony.jpg       # Ring ceremony poster
│   ├── ring-ceremony.mp4       # Ring ceremony looping video card
│   ├── wedding-ceremony.jpg    # Wedding ceremony poster
│   └── wedding-ceremony.mp4    # Wedding ceremony looping video card
└── README.md                   # Documentation and customization guide
```

---

## 🚀 How to Run Locally

Because the project loads videos and canvas images, modern browsers enforce CORS policy on `file://` URLs. To test or run the site locally, use any simple local HTTP server:

### Option 1: Python (Built-in)
```bash
# In this directory, run:
python -m http.server 8000
```
Then open: [http://localhost:8000](http://localhost:8000)

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and click **"Open with Live Server"**.

---

## ✨ Features Included

1. **Cinematic Intro**:
   - Full-bleed auto-playing temple lighting film (`assets/temple-autoplay.mp4`).
   - Page scroll is locked until the video completes or the user clicks "Scroll down ↓".
   - Smooth transition to the final still frame (`assets/opening-final.jpg`).

2. **Background Music Player**:
   - Floating audio toggle button in the bottom right corner.
   - Smooth play/mute synchronization with the song (`assets/raanjhan-aaya-from-40s.mp3`).

3. **Interactive Scratch Card with Petal Falling Physics**:
   - Heart-shaped canvas scratch card (`#scratch-heart` clip path).
   - Dynamic metallic gradient and spark particles when scratching.
   - Falling blue flower petals animation on reveal.
   - Alternative "Tap to reveal" button.

4. **Live Countdown Timer**:
   - Automatic live calculation of Days, Hours, Minutes, and Seconds.
   - Configurable target date in `app.js` (`2026-12-04T16:30:00+05:30`).

5. **Celebration Event Cards with Intersection Observer**:
   - Looping video cards for Haldi, Ring Ceremony, and Wedding.
   - Automatically pauses videos when scrolled out of view and plays when visible.
   - Integrated Google Maps links for event locations.

---

## ✏️ How to Customize (e.g. for Kiran & Megha)

### 1. Change Names & Text (`index.html`)
- Open [index.html](file:///c:/Users/manis/OneDrive/Desktop/Kiran%20and%20megha/index.html).
- Update `<title>` and `<meta name="description">`.
- Change `<h1 class="bride-name">` and `<h2 class="groom-name">` to your desired names (e.g. **Kiran & Megha**).
- Update family member names and lineages.
- Update the date, time, and ceremony venue details.
- Update Google Maps search URLs on the venue links.

### 2. Change Wedding Date / Countdown (`app.js`)
- Open [app.js](file:///c:/Users/manis/OneDrive/Desktop/Kiran%20and%20megha/app.js) around line 122:
  ```javascript
  const target = Date.parse('2026-12-04T16:30:00+05:30');
  ```
  Replace `'2026-12-04T16:30:00+05:30'` with your wedding date and time (ISO format with timezone offset).

### 3. Replace Photos, Videos, or Music (`assets/`)
- Simply replace any `.mp4`, `.mp3`, or `.webp`/`.jpg` file in the `assets/` folder with your own media using the same filename, or change the corresponding filename in [index.html](file:///c:/Users/manis/OneDrive/Desktop/Kiran%20and%20megha/index.html).
