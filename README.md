![Preview](/img/preview.jpg)
# Keyframe Scroll Odyssey

> A scroll-driven 3D narrative experience built with Three.js — where each scroll position reveals a new perspective, and every session tells its own story.


---

## Overview

This project transforms the classic Three.js keyframes example into a polished, scroll-driven cinematic experience. Instead of a static animation, the user navigates through **14 waypoints** by scrolling — each one repositioning the camera, the target, and even the 3D model itself.

The result is a guided tour around Glen Fox's *Littlest Tokyo* diorama, with smooth transitions, per-session text overlays, and a free-exploration mode that hands control back to the user.

---

## Features

- **Scroll-driven camera choreography** — 14 waypoints with smooth `easeInOutCubic` transitions and configurable hold zones.
- **Model animation** — The diorama rotates in sync with the camera path, reinforcing each composition.
- **Character-by-character text reveals** — Titles and descriptions animate letter by letter, creating a rhythmic reading experience.
- **Free exploration mode** — Click *Explorar* to freeze the camera and enter an OrbitControls-powered fly-around. Click ✕ to snap back instantly.
- **Procedural clouds** — Soft, sprite-based cloud clusters scattered across the sky.
- **Physically based sky** — Three.js `Sky` addon with turbidity, rayleigh scattering, and a sun position that stays overhead.
- **Fluid scrolling** — Powered by Lenis with `lerp: 0.08` for butter-smooth wheel input.
- **ACES Filmic tone mapping** — For richer contrast and a more cinematic look.

---


## Tech Stack

| Layer | Technology |
|---|---|
| Rendering | Three.js 0.170.0 (WebGL, ACES Filmic) |
| Scrolling | Lenis 1.1.18 |
| Controls | OrbitControls (free mode) |
| Model format | GLTF + Draco compression |
| Sky | Three.js `Sky` addon |
| Styling | CSS + `mix-blend-mode: difference` |
| Build | Native ES modules + import map (no bundler) |

---

## Project Structure

```
├── index.html          # Entry point — markup & import map
├── main.css            # All styles — overlay, clouds, cursor
├── main.js             # Application logic — scene, camera, scroll, text animation
├── models/
│   └── gltf/
│       └── LittlestTokyo.glb   # Glen Fox's diorama
└── README.md
```

No build step. No bundler. Open `index.html` in a server and it runs.

---

## Getting Started

### Prerequisites

A local HTTP server is required for ES module imports. Any of these work:

```bash
# Python
python -m http.server 8000

# Node
npx serve .

# VS Code
# Install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8000` and scroll.

### Installation

```bash
git clone https://github.com/your-username/keyframe-scroll-odyssey.git
cd keyframe-scroll-odyssey
# No npm install — dependencies are loaded via import map
```

---

## How It Works

### Scroll → Progress → Waypoint

```
User scrolls  →  Lenis normalizes progress (0–1)
               →  remapProgress() applies hold zones + easing
               →  Camera + target + model are lerped between waypoints
               →  Overlay text updates when the session index changes
```

### Waypoints (cameraPath)

Each waypoint defines four things:

| Field | Type | Description |
|---|---|---|
| `pos` | `Vector3` | Camera position in world space |
| `target` | `Vector3` | Point the camera looks at |
| `modelPos` | `Vector3` | Model position |
| `modelRot` | `Euler` | Model rotation |
| `title` / `desc` | `string` | Session overlay text |

The array has **14 entries** (0–13), producing **13 scroll segments**. Each segment is separated by a 3.5% hold zone on each side, giving the scroll a rhythmic pause‑and‑transition feel.

### Text Animation

When a new waypoint is reached:

1. **Exit** — existing characters fade out with a staggered `translateY(-20px)`.
2. **Enter** — new characters fade in from `translateY(40px)` with a cubic-bezier curve.
3. Stagger timing: titles at 25 ms, descriptions at 3 ms (tighter for longer text).

### Free Exploration

Clicking *Explorar*:
- Saves the current scroll progress.
- Halts Lenis.
- Creates an `OrbitControls` instance at the frozen camera position.
- Model drifts to a neutral rotation via `lerp`.

Clicking ✕:
- Camera and model snap back to the saved position instantly.
- `OrbitControls` is disposed.
- Lenis resumes.
- Overlay returns to the current session.

---

## Customization

### Add or modify waypoints

Edit the `cameraPath` array in `main.js`. Each entry follows the same `{ pos, target, modelPos, modelRot, title, desc }` shape.

```js
{ pos: new THREE.Vector3( x, y, z ),
  target: new THREE.Vector3( x, y, z ),
  modelPos: new THREE.Vector3( 1, 1, 0 ),
  modelRot: new THREE.Euler( 0, 0, 0 ),
  title: 'My Session',
  desc: 'A new perspective.' }
```

### Adjust scroll feel

```js
const lenis = new Lenis({ lerp: 0.08 });   // lower = snappier, higher = floatier
```

### Tweak hold zone

```js
const hold = 0.035;   // 3.5% hold per side. Increase for longer pauses.
```

---

## Credits

- **Model** — [Littlest Tokyo](https://artstation.com/artwork/1AGwX) by [Glen Fox](https://artstation.com/glenatron), licensed CC Attribution.
- **Three.js** — The backbone of the 3D rendering ([threejs.org](https://threejs.org)).
- **Lenis** — Smooth scrolling by [Darkroom Engineering](https://lenis.darkroom.engineering).
- **Inspiration** — The original [Three.js keyframes example](https://threejs.org/examples/webgl_animation_keyframes.html).

---
 
<div align="center">

Made with ❤️ by <a href="https://sebas-dev.vercel.app/" target="_blank" rel="noopener noreferrer">Sebastián V</a>

</div>