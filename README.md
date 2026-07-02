# Study Buddy

A small, self-contained guitar-practice companion. No build step, no dependencies, no tracking — just static files.

## Features

- **Key** — random note, all 17 enharmonic spellings (A♯ and B♭ are separate).
- **Fret** — random fret within a range you set (a two-handle slider in Settings).
- **Roll a die** — one or more dice, each with its own number of sides. Six-or-fewer sides show real pips; larger dice show the number on a die-shaped tile.
- **Shape** — cycles the five CAGED shapes in a fresh random order each pass. A faint ring is still to come, a filled ring is done, and the solid ring is the one you're on.
- **Direction** — ascending / descending.
- **Pedal Steel mode** — flip the switch to reveal **Minors** and **Permutations** randomizers.
- **Metronome** — tap-to-type or tap-tempo BPM, ± fine tune, a time-signature picker (beats per bar up to 51, note value up to 64), a subdivide toggle with its own indicator light, and a tempo that colours the display from cool (slow) to warm (fast).

## Run it locally

Because it registers a service worker and loads a manifest, open it through a local server rather than `file://`:

```bash
cd study-buddy
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new repository and push these files to the default branch.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick your branch and the `/ (root)` folder, and save.
4. Your app will be live at `https://<username>.github.io/<repo>/` in a minute or two.

On iPhone, open that URL in Safari, tap the Share button, and choose **Add to Home Screen** to install it with the pick icon and run it full-screen.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup / app shell |
| `styles.css` | All styling (light + dark) |
| `app.js` | All behaviour |
| `manifest.webmanifest` | PWA metadata |
| `sw.js` | Offline caching |
| `icon.svg` | Master icon (the pick) |
| `icon-512.png`, `icon-192.png`, `icon-180.png` | Rasterized icons |

## Notes

- Audio starts on the first tap of **Start** (browsers require a user gesture before playing sound). On iPhone, make sure the physical silent switch is off.
- Everything runs on-device; there is no network use at runtime.
