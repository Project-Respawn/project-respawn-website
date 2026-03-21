# Project Respawn Website - Vue.js with Bootstrap

A modern, modular website for the Ravens community built with Vue 3, Bootstrap 5, and Vite.

## Project Structure

```
src/
├── main.js              # Vue app entrypoint
├── App.vue              # Root component
├── router/
│   └── index.js         # Vue Router configuration
├── components/
│   ├── Header.vue       # Header with navbar component
│   └── Footer.vue       # Footer component
├── views/
│   ├── Home.vue         # Home page
│   ├── About.vue        # About page
│   ├── Contact.vue      # Contact form page
│   └── OurMission.vue   # Mission page
├── assets
│    └── logo.png
└── css
    └── styles.css
```

## Features

- **Vue 3** with Composition API
- **Bootstrap 5** for responsive UI
- **Vue Router** for client-side routing
- **Reusable Components** (Header, Footer)
- **Modular Pages** (Home, About, Contact, Our Mission)
- **Responsive Design** with custom lavender theme
- **Vite** for fast development and building

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Customization

### Theme Colors

```css
:root {
  --bg: #0f172a;           /* Background */
  --text: #94a3b8;         /* Text color */
  --accent: #39ff14;       /* Primary accent */
  --accent-2: #d4a5ff;     /* Secondary accent */
  --muted: #6100e0;        /* Muted text */
}
```

### Components

- **Header.vue**: Navigation bar with logo, menu, and CTA button
- **Footer.vue**: Footer with links

### Pages

Each page is a Vue component in `src/views/`:
- Home page with news, teams, and events
- About page with community information
- Contact page with contact form
- Our Mission page with mission statement

## Dependencies

- **vue**: Progressive JavaScript framework
- **vue-router**: Official router for Vue
- **bootstrap**: CSS framework for responsive design
- **vite**: Next generation frontend tooling

## Browser Support
Modern browsers (Chrome, Firefox, Safari, Edge)
Mobile browser support