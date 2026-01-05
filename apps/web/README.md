
# Whiteboard (Nuxt)

## Features

- **Canvas engines**
  - WebGPU (WASM) 3D mode (when available)
  - Automatic fallback to 2D canvas renderer

- **Pages (Slides) sidebar**
  - Google Slides-like left sidebar
  - Live preview cards per page
  - Add page + switch page
  - Rename active page via top bar

- **Tool options**
  - Stroke color + stroke width
  - Fill on/off + fill color (rect/ellipse)
  - Font size (text)

- **Canvas UX**
  - Dot cursor
  - Double click zoom in
  - Minimap hides when empty and syncs with camera

- **Menus**
  - Canvas context menu (right click) with icon + keyboard navigation
  - Command palette (Ctrl+K) with search, grouping, shortcuts

- **Settings & mock panels**
  - Settings menu (grid toggle + background color)
  - AI Chatbot panel (mock) toggle

## Development

### Prerequisites

- Bun

### Install

```bash
bun install
```

### Run dev server

```bash
bun run dev
```

### Lint (typecheck + oxlint)

```bash
bun run lint
```

### Verify (lint + test coverage)

```bash
bun run verify
```

