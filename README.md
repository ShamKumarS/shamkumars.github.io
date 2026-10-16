# Sham Kumar Meghwar - Portfolio

Portfolio of a Senior Mobile Engineer shipping native Android (Kotlin, Jetpack Compose), iOS (Swift, SwiftUI) and Flutter apps.

## 🚀 Features

The site is written as the **release notes of a product called "Sham Kumar"**: career eras are versions, skills are linked frameworks, projects are builds, recommendations are ratings & reviews.

- **Boot log**: Xcode-style build output on first visit (once per session, click to skip)
- **Build target switch**: All / Android / iOS / Flutter re-tints the site, filters frameworks, dims other-platform builds and swaps the headline (remembered per visitor)
- **Particle name**: the hero name is drawn from particles that move away from the cursor or a finger
- **Linked frameworks**: searchable, groupable skill index (⌘K / Ctrl+K to filter)
- **Changelog**: the version number stays pinned and changes as you scroll through each era
- **Builds**: vertical scroll moves the project shelf sideways on desktop (native swipe on mobile), with device frames that cycle through screenshots
- **Reviews**: draggable card stack (also arrow keys and buttons)
- Light/dark theme, honours `prefers-reduced-motion`, no frameworks or build step

## 🛠️ Structure

- `index.html`: all content
- `assets/style.css`: design tokens and layout
- `assets/app.js`: interactions (vanilla JS, no dependencies)
- `resume/`: downloadable résumés (Mobile: Android · iOS · Flutter, and iOS-only). `Sham_Kumar.pdf` at the root is a copy of the Mobile résumé so old links keep working
- `assets/shots/`: web-optimised screenshots (originals stay in `img/`)
