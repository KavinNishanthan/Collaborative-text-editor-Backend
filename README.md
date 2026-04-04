# CollabEdit — Backend

A real-time collaborative text editor backend where multiple users can edit the same document simultaneously. Built with Node.js, Express, Socket.IO, and Yjs CRDTs.

---

# Live URL 
Live App: --> [http://16.176.171.124/login](http://16.176.171.124/login)

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Socket.IO Events](#socketio-events)
- [Deployment](#deployment)
- [AI Tools Used](#ai-tools-used)
- [Known Limitations](#known-limitations)

---

## Features

- **User Authentication** — Register with email OTP verification, login with JWT (HTTP-only cookie-based sessions)
- **Document Management** — Create, rename, list, and delete documents with role-based ownership
- **Real-Time Collaboration** — Yjs CRDT with Socket.IO transport for conflict-free multi-user editing
- **Awareness & Presence** — Live user cursors, online/offline indicators per document room
- **Auto-Save** — Debounced (3s) document persistence to MongoDB with Yjs binary state
- **Version History** — Automatic version snapshots every 10s during editing, with restore capability
- **Commenting System** — Threaded comments with replies and resolve functionality
- **Member Management** — Invite by email, role assignment (owner / editor / viewer), role updates, and removal
- **Email Invitations** — Styled HTML emails via Nodemailer (SMTP) with join links
- **Share Links** — Generate cryptographic share tokens for link-based document access
- **Invitation System** — Pending invitations with accept/decline flow
- **Activity Logging** — Tracks joins, edits, comments, invites, restores, and departures per document

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  TipTap Editor  ←→  SocketIOProvider  ←→  Yjs CRDT (Y.Doc)   │
└──────────────┬───────────────────────────────┬───────────────┘
               │  REST API (Axios)             │  WebSocket (Socket.IO)
               ▼                               ▼
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js / Express)                 │
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  REST API   │  │  Socket.IO   │  │  In-Memory Y.Doc      │  │
│  │  Routes &   │  │  Server      │  │  Map (per document)   │  │
│  │  Controllers│  │  (Real-Time) │  │                       │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬────────────┘  │
│         │                │                     │               │
│         ▼                ▼                     ▼               │
│    ┌──────────────────────────────────────────────────────┐    │
│    │                  MongoDB (Mongoose)                  │    │
│    │  Users | Documents | Members | History | Comments    │    │
│    │  Activity Logs | Invitations | OTPs                  │    │
│    └──────────────────────────────────────────────────────┘    │
│                                                                │
│      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│      │  JWT Auth    │  │  Nodemailer  │  │  Joi         │      │
│      │  Middleware  │  │  SMTP Emails │  │  Validation  │      │
│      └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow for Real-Time Editing

1. Client opens document → Socket.IO `join-document` event
2. Server loads or creates in-memory `Y.Doc` (loaded from MongoDB `yjsState`)
3. Server sends `sync-init` with current Yjs state to joining client
4. Client edits → local Yjs update → emitted via `yjs-update` event
5. Server applies update to in-memory `Y.Doc`, broadcasts to other clients
6. Auto-save debounce (3s) persists `Y.Doc` state + plain text to MongoDB
7. History snapshot created every ≥10s during active editing
8. On last user disconnect, final save is triggered and in-memory docs are cleaned up

---

## Tech Stack

| Layer          | Technology                                                                |
|----------------|---------------------------------------------------------------------------|
| **Runtime**    | Node.js 20                                                                |
| **Framework**  | Express 5                                                                 |
| **Language**   | TypeScript 5                                                              |
| **Database**   | MongoDB Atlas (via Mongoose)                                              |
| **Real-Time**  | Socket.IO 4                                                               |
| **CRDT**       | Yjs + y-protocols (awareness)                                             |
| **Auth**       | JWT (jsonwebtoken) + bcryptjs                                             |
| **Validation** | Joi                                                                       |
| **Email**      | Nodemailer (Gmail SMTP)                                                   |
| **Container**  | Docker (multi-stage build, node:20-alpine)                                |
| **CI/CD**      | GitLab CI/CD (build → Docker push to ECR → deploy to EC2)                 |

---

## Project Structure

```
src/
├── index.ts                  
├── configs/
│   ├── mongoose.config.ts    
│   └── socket.config.ts      
├── constants/
│   ├── http-message.constant.ts
│   └── response-message.constant.ts
├── controllers/
│   ├── auth.controller.ts   
│   ├── document.controller.ts
│   ├── member.controller.ts  
│   ├── comment.controller.ts 
│   ├── history.controller.ts 
│   ├── sharing.controller.ts 
│   ├── invitation.controller.ts 
│   └── activity.controller.ts
├── helpers/
│   ├── cookie.helper.ts     
│   ├── mail.helper.ts       
│   ├── otp.helper.ts       
│   ├── profile-colour.helper.ts 
│   └── uuid.helper.ts       
├── interfaces/              
├── middlewares/              
├── models/
│   ├── user.model.ts
│   ├── document.model.ts
│   ├── document-member.model.ts
│   ├── document-history.model.ts
│   ├── comment.model.ts
│   ├── invitation.model.ts
│   ├── activity-log.model.ts
│   └── otp.model.ts
├── routes/                   
├── types/                  
└── utils/             
```

---

## Setup Instructions

### Prerequisites

- **Node.js** v20+
- **npm** v9+
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Gmail account** with [App Password](https://support.google.com/accounts/answer/185833) for SMTP

### 1. Clone the Repository

```bash
git clone https://github.com/KavinNishanthan/Collaborative-text-editor-Backend.git
cd Collaborative-text-editor-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### 4. Run in Development Mode

```bash
npm run dev
```

This runs the TypeScript compiler in watch mode and Nodemon concurrently. The server starts on `http://localhost:8080`.

### 5. Build for Production

```bash
npm run build
npm start
```

### 6. Run with Docker

```bash
docker build -t collabedit-backend .
docker run -p 8080:8080 --env-file .env collabedit-backend
```

---

## Environment Variables

| Variable        | Description                                  | Example                                     |
|-----------------|----------------------------------------------|---------------------------------------------|
| `NODE_ENV`      | Environment mode                             | `development` / `production`                |
| `PORT`          | Server port                                  | `8080`                                      |
| `MONGOURI`      | MongoDB connection string                    | `mongodb+srv://user:pass@cluster/dbname`    |
| `CORS_ORIGIN`   | Allowed origins (comma-separated)            | `http://localhost:5173,https://example.com` |
| `CLIENT_URL`    | Frontend URL (for email links)               | `http://localhost:5173`                     |
| `JWT_SECRET`    | Secret key for JWT signing                   | `your_jwt_secret_here`                      |
| `SMTP_MAIL`     | Gmail address for sending emails             | `your_email@gmail.com`                      |
| `SMTP_PASSWORD` | Gmail App Password                           | `xxxx xxxx xxxx xxxx`                       |

---

## API Endpoints

### Authentication
| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| POST   | `/api/auth/register`        | Register & send OTP          |
| POST   | `/api/auth/verify-otp`      | Verify OTP & create account  |
| POST   | `/api/auth/login`           | Login & set JWT cookie       |

### Documents
| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | `/api/documents`                 | Create document          |
| GET    | `/api/documents`                 | List user's documents    |
| GET    | `/api/documents/:documentId`     | Get document detail      |
| PUT    | `/api/documents/:documentId`     | Update document title    |

### Members
| Method | Endpoint                                         | Description            |
|--------|--------------------------------------------------|------------------------|
| GET    | `/api/members/:documentId`                       | List document members  |
| POST   | `/api/members/:documentId/invite`                | Send email invitation  |
| PUT    | `/api/members/:documentId/:memberId/role`        | Update member role     |
| DELETE | `/api/members/:documentId/:memberId`             | Remove member          |

### Comments
| Method | Endpoint                                                | Description        |
|--------|---------------------------------------------------------|--------------------|
| GET    | `/api/comments/:documentId`                             | List comments      |
| POST   | `/api/comments/:documentId`                             | Add comment        |
| POST   | `/api/comments/:documentId/:commentId/reply`            | Reply to comment   |
| PUT    | `/api/comments/:documentId/:commentId/resolve`          | Resolve comment    |

### History
| Method | Endpoint                                              | Description          |
|--------|-------------------------------------------------------|----------------------|
| GET    | `/api/history/:documentId`                            | List version history |
| POST   | `/api/history/:documentId/:historyId/restore`         | Restore a version    |

### Sharing
| Method | Endpoint                                  | Description            |
|--------|-------------------------------------------|------------------------|
| POST   | `/api/share/:documentId/generate`         | Generate share link    |
| POST   | `/api/share/join`                         | Join via share token   |

### Invitations
| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| GET    | `/api/invitations/pending`                  | List pending invitations |
| POST   | `/api/invitations/:invitationId/accept`     | Accept invitation        |
| POST   | `/api/invitations/:invitationId/decline`    | Decline invitation       |

### Activity
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | `/api/activity/:documentId`     | Get activity log     |

---

## Socket.IO Events

### Client → Server
| Event              | Payload                          | Description                    |
|--------------------|----------------------------------|--------------------------------|
| `join-document`    | `documentId: string`             | Join a document room           |
| `yjs-update`       | `documentId, update: ArrayBuffer`| Send local Yjs update          |
| `sync-complete`    | `documentId, update: ArrayBuffer`| Complete initial sync          |
| `awareness-update` | `documentId, update: ArrayBuffer`| Send awareness state           |
| `typing`           | `documentId: string`             | Broadcast typing indicator     |

### Server → Client
| Event              | Payload                          | Description                    |
|--------------------|----------------------------------|--------------------------------|
| `sync-init`        | `stateUpdate: Buffer`            | Initial Yjs state on join      |
| `yjs-update`       | `update: ArrayBuffer`            | Broadcast remote Yjs update    |
| `awareness-update` | `update: ArrayBuffer`            | Broadcast awareness changes    |
| `save-status`      | `{ status: string }`             | Auto-save status notification  |
| `room-users`       | `OnlineUser[]`                   | Current users in the room      |
| `user-joined`      | `OnlineUser`                     | New user joined the doc        |
| `user-left`        | `{ userId, name, socketId }`     | User left the doc              |
| `user-typing`      | `{ userId, email }`              | Someone is typing              |

---

## Deployment

The application is containerized with Docker and deployed via a GitLab CI/CD pipeline:

1. **Build Stage** — TypeScript compilation (`npm run build`)
2. **Docker Stage** — Multi-stage Docker build, push to AWS ECR
3. **Deploy Stage** — SSH into EC2 instance, pull latest image, run container with environment variables

See [`.gitlab-ci.yml`](.gitlab-ci.yml) for full pipeline configuration.

---

## Deployment

The project is deployed using a production-ready DevOps pipeline:

- **AWS:** Frontend and backend services are hosted on AWS
- **Docker:** Application services are containerized for consistency across development and production environments  
- **GitLab CI/CD:** Automated pipelines handle build, testing, and deployment processes  
- **Version Control:** Git-based workflow integrated with GitLab for seamless collaboration and deployment  

This architecture enables efficient delivery, reproducibility, and streamlined deployments.

---

## AI Tools Used

| Tool                 |                                                                                       
|----------------------|
|  **Gemini,ChatGPT**  |

> AI tools such as ChatGPT and Gemini were used to accelerate development and support learning,Debug complex real-time synchronization issues, particularly while working with technologies like Socket.IO and real-time synchronization. 

---

## Known Limitations

- **No Google OAuth** — Currently only manual email/password registration is supported (Google OAuth is modeled but not yet implemented)
- **No WebSocket Scaling** — Socket.IO runs on a single server instance; horizontal scaling would require a Redis adapter for room/state sharing
- **History Snapshots** — Version snapshots are based on a 10-second interval timer, not semantic (per-keystroke) boundaries
- **No Offline Support** — The editor requires an active WebSocket connection; offline editing is not supported
- **Share Link Scope** — Share links always grant viewer access; role-specific share links are not yet supported
- **Comment Text Selection** — Comments support text attachment fields but don't yet visually highlight the selected range in the editor
- **Email Provider** — SMTP is configured for Gmail only; switching providers requires code changes in `mail.helper.ts`

---

