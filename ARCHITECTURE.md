# DevBoard Architecture

DevBoard is a real-time collaborative whiteboard built with React, Vite, tldraw, Cloudflare Workers, and Cloudflare Durable Objects. The goal of the project is to provide an infinite canvas where multiple users can draw, add shapes, write text, add sticky notes, upload images, and collaborate through shareable board links.

Live Deployment: `https://devboard.atharvabodhekar.workers.dev`

GitHub Repository: `https://github.com/atharvabodhekar-rgb/DEVBOARD`

---

## 1. High-Level Architecture

DevBoard is divided into two main parts:

### Client

The client is the browser-based whiteboard application.

Main technologies:

* React
* Vite
* TypeScript
* tldraw SDK
* Custom CSS UI theme

The client handles:

* Infinite canvas rendering
* Drawing tools
* Shape creation
* Sticky notes
* Text boxes
* Image upload
* Keyboard shortcuts
* Undo/redo
* Export
* View/edit UI state
* Cursor presence display

### Server

The server runs on Cloudflare Workers.

Main technologies:

* Cloudflare Workers
* Cloudflare Durable Objects
* WebSocket-based synchronization
* Durable Object SQLite storage

The server handles:

* Real-time board sync
* WebSocket connections
* Room-based collaboration
* Board persistence
* Reconnection recovery
* Multi-user session state

---

## 2. Project Structure

Important files and folders:

```text
client/
  main.tsx
  index.css
  pages/
    Root.tsx
    Room.tsx
  multiplayerAssetStore.tsx

worker/
  worker.ts
  TldrawDurableObject.ts
  assetUploads.ts

wrangler.toml
package.json
ARCHITECTURE.md
```

### `client/pages/Root.tsx`

This file handles the home/root route and creates or redirects users to a board.

### `client/pages/Room.tsx`

This is the main whiteboard page. It connects the tldraw editor to the multiplayer sync store and displays the DevBoard top navigation bar.

It also handles:

* Room ID
* Live sync status
* View/edit mode
* Copying share links
* Creating new boards
* tldraw license key setup
* tldraw editor mount configuration
* Tool lock behavior

### `client/multiplayerAssetStore.tsx`

This file handles image uploads.

Because Cloudflare R2 requires account activation with billing details, the deployed free version stores uploaded images as compressed data URLs inside the board state.

The asset store:

* Accepts image files
* Rejects non-image files
* Compresses large images
* Converts images to data URLs
* Returns image data to the tldraw canvas

This keeps image upload working without requiring paid external object storage.

### `worker/TldrawDurableObject.ts`

This Durable Object manages real-time board synchronization and persistence for each board room.

Each board gets its own room-like Durable Object instance. This keeps collaboration isolated per board link.

### `worker/worker.ts`

This file routes incoming requests and WebSocket connections to the correct Durable Object.

### `wrangler.toml`

This is the Cloudflare deployment configuration. It defines:

* Worker name
* Main Worker entry file
* Compatibility flags
* Static asset directory
* Durable Object binding
* Durable Object migration

---

## 3. Real-Time Sync Architecture

DevBoard uses tldraw's multiplayer sync system connected to Cloudflare Durable Objects.

When a user opens a board, the client connects to:

```text
/api/connect/:roomId
```

The room ID is taken from the URL.

Example:

```text
/board-demo?mode=edit
```

The client uses `useSync()` from `@tldraw/sync` to create a synchronized tldraw store.

```ts
const store = useSync({
  uri: `${window.location.origin}/api/connect/${roomId}`,
  assets: multiplayerAssetStore,
})
```

This store is passed into the `<Tldraw />` component.

All board changes are sent through the sync connection.

Examples of synced changes:

* Pen strokes
* Shapes
* Text
* Sticky notes
* Uploaded images
* Object movement
* Object resizing
* Object deletion
* Page changes
* User presence
* Cursor position

---

## 4. WebSocket Flow

The real-time collaboration flow works like this:

```text
User A opens board
        ↓
Client connects to Cloudflare Worker
        ↓
Worker routes request to Durable Object for that board ID
        ↓
Durable Object opens WebSocket session
        ↓
User edits canvas
        ↓
Change is sent to Durable Object
        ↓
Durable Object broadcasts update to other connected users
        ↓
Other users see the update instantly
```

Each board has its own room ID, so users in one board do not affect users in another board.

---

## 5. Cursor Presence

Cursor presence is handled by the multiplayer sync system.

When a user moves their mouse on the canvas, the editor sends presence information through the sync connection.

Other connected users receive:

* Cursor position
* User presence state
* Current selection information

This allows collaborators to see where other users are working in real time.

---

## 6. Conflict Resolution

DevBoard relies on tldraw's multiplayer synchronization model and Cloudflare Durable Objects to handle concurrent edits.

The Durable Object acts as the central authority for a board room. All clients send changes to the same room instance.

This helps prevent conflicts because:

* Each board has one Durable Object coordinator
* Changes are processed through the shared sync store
* Updates are broadcast to connected clients
* Clients receive the latest shared board state
* Reconnected users reload the current board state from persistence

For example, if two users move different shapes at the same time, both changes are synchronized to the room. If two users edit the same object, the shared store resolves state based on the synchronized update order.

---

## 7. Auto-Save and Reconnection Recovery

Board data is stored through the Durable Object's persistent storage system.

This means:

* Users do not need to manually save the board
* Board state survives page refreshes
* Users can reconnect to the same board link
* The latest board state is restored when the board is reopened

If a user disconnects temporarily, the client can reconnect to the same room and continue syncing with the current board state.

---

## 8. View/Edit Permissions

DevBoard supports simple link-based permissions using URL query parameters.

Edit mode:

```text
?mode=edit
```

View-only mode:

```text
?mode=view
```

In edit mode, users can draw, move, delete, and modify objects.

In view-only mode, the editor is set to read-only, so users can view the board without editing.

The top navigation provides separate buttons for:

* Edit link
* View link

This makes sharing easier during collaboration.

---

## 9. Infinite Canvas and Rendering

The canvas is powered by tldraw.

tldraw provides:

* Infinite canvas
* Smooth pan and zoom
* Transform-based viewport movement
* Shape rendering
* Selection tools
* Keyboard shortcuts
* Undo/redo
* SVG-based export
* Optimized rendering for many canvas objects

The project target is smooth performance with large boards and many objects.

---

## 10. Drawing Tools

DevBoard supports the following drawing and whiteboard tools:

* Freehand pen
* Rectangle
* Ellipse/circle
* Arrow
* Line
* Text
* Sticky notes
* Image upload
* Selection tool
* Hand/pan tool
* Eraser
* Arrange/layer tools

The toolbar is provided by tldraw, while DevBoard adds custom top-level controls for board navigation, sharing, and mode display.

---

## 11. Image Upload Design

The original tldraw multiplayer starter supports external asset storage using Cloudflare R2. However, R2 requires account activation with billing details.

To keep the project free and deployable without payment setup, DevBoard uses a custom asset store that:

* Accepts image uploads
* Compresses large images in the browser
* Resizes large dimensions
* Converts the image to a data URL
* Stores the image directly in the synchronized board state

This allows image upload to work in the free deployment.

For a production version, this asset store can be replaced with Cloudflare R2, S3, Supabase Storage, or another object storage service without changing the main canvas UI.

---

## 12. Layer Management

tldraw provides arrange and layer controls through its built-in object menu.

Users can:

* Bring objects forward
* Send objects backward
* Align objects
* Distribute objects
* Group objects
* Ungroup objects
* Duplicate objects
* Delete objects

This satisfies the layer management and z-order control requirement.

---

## 13. Undo/Redo

Undo and redo are handled by tldraw's editor history system.

Each user has local undo/redo history for their editing session.

This allows users to undo their own recent actions without manually rebuilding the board state.

---

## 14. Export

tldraw supports SVG-based export.

SVG export preserves vector quality for shapes, text, arrows, and other vector elements. This satisfies the requirement that export must preserve vector quality.

Users can export selected shapes or board content from the tldraw export options.

---

## 15. Deployment Architecture

DevBoard is deployed on Cloudflare Workers.

Deployment URL:

```text
https://devboard.atharvabodhekar.workers.dev
```

Deployment flow:

```text
Local source code
        ↓
npm run build
        ↓
Vite production build
        ↓
Wrangler deploy
        ↓
Cloudflare Workers
        ↓
Public workers.dev URL
```

The Worker serves both:

* Static frontend assets
* Real-time sync API routes

---

## 16. Scalability

Cloudflare Durable Objects are a good fit for real-time collaboration because each board room can be handled independently.

Each board ID maps to a Durable Object room. This means multiple boards can exist separately without mixing their data.

The system is designed to support multiple users in a shared board session. For the project requirement, the target is 10+ concurrent users on one board.

Performance depends on:

* Number of shapes
* Image sizes
* User network speed
* Cloudflare region
* Client device performance

---

## 17. Performance Notes

DevBoard is designed around tldraw's optimized canvas system.

Performance choices:

* tldraw handles canvas rendering and viewport transforms
* Images are compressed before being added to the board
* Board state is synchronized through WebSocket-style live sync
* Heavy external storage was avoided for the free deployment
* The app is deployed close to users through Cloudflare's edge network

For best performance in demos, uploaded images should be reasonable in size.

---

## 18. Current Limitations

The current free deployment stores images as compressed data URLs instead of external object storage.

This keeps the project free and working without payment setup, but it means very large images can increase board data size.

A production-ready version should use external object storage such as:

* Cloudflare R2
* AWS S3
* Supabase Storage
* Firebase Storage

The current implementation is suitable for project demonstration and academic evaluation.

---

## 19. Requirement Mapping

| Requirement                          | Status    |
| ------------------------------------ | --------- |
| Infinite canvas with smooth pan/zoom | Completed |
| Freehand pen                         | Completed |
| Shapes                               | Completed |
| Sticky notes                         | Completed |
| Text boxes                           | Completed |
| Image upload                         | Completed |
| Real-time sync via WebSocket         | Completed |
| Cursor presence                      | Completed |
| Shareable board links                | Completed |
| View/edit permissions                | Completed |
| Layer management                     | Completed |
| Undo/redo history                    | Completed |
| Auto-save                            | Completed |
| Reconnection recovery                | Completed |
| SVG/vector export                    | Completed |
| Live deployment URL                  | Completed |
| Git repository                       | Completed |

---

## 20. Conclusion

DevBoard is a deployed real-time collaborative whiteboard with infinite canvas support, multiplayer synchronization, cursor presence, drawing tools, image upload, view/edit links, auto-save, undo/redo, layer controls, and SVG export.

The architecture uses React and tldraw on the client side, and Cloudflare Workers with Durable Objects on the server side. This design provides a scalable and practical foundation for a collaborative whiteboard similar to a lightweight brainstorming and design tool.
