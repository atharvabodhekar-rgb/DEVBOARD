# DevBoard

DevBoard is a real-time collaborative whiteboard built for brainstorming, planning, and visual collaboration. It works like a lightweight Figma/Miro-style board where multiple users can draw, add sticky notes, create shapes, write text, upload images, and see each other’s cursors live.

## Live Demo

```text
https://devboard.atharvabodhekar.workers.dev
```

## GitHub Repository

```text
https://github.com/atharvabodhekar-rgb/DEVBOARD
```

## Features

* Infinite canvas with smooth pan and zoom
* Freehand pen drawing
* Shape tools including rectangle, circle, arrow, and line
* Sticky notes
* Text boxes
* Image upload with browser-side compression
* Real-time multiplayer sync
* Cursor presence for collaborators
* Shareable board links
* View/edit permission links
* Undo/redo support
* Auto-save and reconnection recovery
* Layer and z-order controls
* SVG export for vector-quality export
* Dark mode interface
* Template boards

  * Brainstorming
  * Wireframe
  * Retrospective
  * Mindmap
* Multiple canvas backgrounds

  * Plain
  * Grid
  * Dots
  * Lined
* Comment notes attached to selected elements

## Tech Stack

* React
* TypeScript
* Vite
* tldraw
* Cloudflare Workers
* Cloudflare Durable Objects
* WebSocket-based multiplayer sync
* Wrangler CLI

## Project Architecture

DevBoard uses a client-server architecture.

The client is built with React, Vite, TypeScript, and tldraw. It handles the whiteboard UI, canvas tools, editor interactions, image upload, template insertion, comments, and board sharing.

The backend runs on Cloudflare Workers. Real-time board synchronization is handled through Cloudflare Durable Objects. Each board room is connected to a Durable Object instance, which manages multiplayer state, persistence, and reconnection recovery.

More details are available in:

```text
ARCHITECTURE.md
```

## Image Upload

The project supports image upload without requiring paid object storage.

For the free deployment, uploaded images are compressed in the browser and stored as data URLs inside the board state. This keeps the image upload feature working without needing Cloudflare R2 billing setup.

For a production version, the asset storage system can be upgraded to Cloudflare R2, AWS S3, Supabase Storage, or Firebase Storage.

## View and Edit Links

DevBoard supports simple link-based permissions.

Edit mode:

```text
?mode=edit
```

View-only mode:

```text
?mode=view
```

The app provides separate buttons for copying edit links and view-only links.

## Export

DevBoard supports SVG export through tldraw’s export tools. SVG export preserves vector quality for shapes, text, arrows, and other vector elements.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

Build the project:

```bash
npm run build
```

## Deployment

The project is deployed using Cloudflare Workers and Wrangler.

Deploy command:

```bash
npx wrangler deploy
```

Live deployment:

```text
https://devboard.atharvabodhekar.workers.dev
```

## Deliverables

* GitHub repository with full source code
* Live deployment URL
* `ARCHITECTURE.md`
* `AI_DECLARATION.md`
* `prompts/` folder

## AI Declaration

This project was developed with AI assistance for planning, debugging, documentation, deployment help, and requirement mapping.

More details are available in:

```text
AI_DECLARATION.md
```

## Prompts Record

A short record of AI-assisted development prompts is included in:

```text
prompts/
```

## Notes

This project is designed for academic/project demonstration. It focuses on real-time collaboration, whiteboard tools, deployment, documentation, and a clean user experience.
