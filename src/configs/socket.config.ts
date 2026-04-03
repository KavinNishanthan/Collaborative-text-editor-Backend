// Importing Packages
import jwt from 'jsonwebtoken';
import * as Y from 'yjs';
import { Server, Socket } from 'socket.io';
import * as awarenessProtocol from 'y-protocols/awareness';

// Importing Helper
import { generateUUID } from '../helpers/uuid.helper';

// Importing Models
import documentModel from '../models/document.model';
import documentHistoryModel from '../models/document-history.model';
import activityLogModel from '../models/activity-log.model';
import documentMemberModel from '../models/document-member.model';
import userModel from '../models/user.model';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Socket.IO configuration with Yjs CRDT, awareness, auto-save, throttled history, and activity logging
 */

const docMap = new Map<string, Y.Doc>();
const awarenessMap = new Map<string, awarenessProtocol.Awareness>();
const saveTimers = new Map<string, NodeJS.Timeout>();
const lastHistoryTime = new Map<string, number>();

const SAVE_DEBOUNCE_MS = 3_000;
const HISTORY_INTERVAL_MS = 10_000;

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Retrieves an existing Y.Doc for the given documentId from the in-memory map,
 * or creates a new one by loading the persisted Yjs state from the database.
 * Also initializes an Awareness instance for the document if not already present.
 */

const getOrCreateYDoc = async (documentId: string): Promise<Y.Doc> => {
  if (docMap.has(documentId)) {
    return docMap.get(documentId)!;
  }

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);

  const document = await documentModel.findOne({ documentId });
  if (document?.yjsState && document.yjsState.length > 0) {
    try {
      Y.applyUpdate(ydoc, new Uint8Array(document.yjsState));
    } catch (_) {}
  }

  docMap.set(documentId, ydoc);
  awarenessMap.set(documentId, awareness);

  return ydoc;
};

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Extracts plain text content from a Y.Doc by first checking for an XmlFragment
 * under the key 'default', and falling back to a YText under the key 'content'.
 */

const extractContent = (ydoc: Y.Doc): string => {
  const xmlFrag = ydoc.getXmlFragment('default');
  if (xmlFrag && xmlFrag.length > 0) {
    return extractTextFromXmlFragment(xmlFrag);
  }

  const yText = ydoc.getText('content');
  if (yText && yText.length > 0) {
    return yText.toString();
  }
  return '';
};

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Recursively traverses a Y.XmlFragment and collects text content from all
 * XmlText and XmlElement nodes. Appends newline characters after block-level elements
 * such as paragraphs, headings, blockquotes, and list items.
 */

const extractTextFromXmlFragment = (fragment: Y.XmlFragment): string => {
  const parts: string[] = [];
  for (let i = 0; i < fragment.length; i++) {
    const child = fragment.get(i);
    if (child instanceof Y.XmlText) {
      parts.push(child.toString());
    } else if (child instanceof Y.XmlElement) {
      parts.push(extractTextFromXmlFragment(child));
      const tag = child.nodeName?.toLowerCase();
      if (tag === 'paragraph' || tag === 'heading' || tag === 'blockquote' || tag === 'listitem') {
        parts.push('\n');
      }
    }
  }
  return parts.join('').trim();
};

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Debounces auto-saving of a document's Yjs state to the database.
 * Emits a 'saving' status to the room immediately, then waits SAVE_DEBOUNCE_MS before
 * persisting the state, content, and last-editor metadata. If HISTORY_INTERVAL_MS has
 * elapsed since the last snapshot, also creates a versioned history entry and an activity log.
 * Emits 'saved' or 'error' status to the room once the save attempt completes.
 */

const scheduleSave = (io: Server, documentId: string, ydoc: Y.Doc, userId: string) => {
  io.to(`doc:${documentId}`).emit('save-status', { status: 'saving' });

  if (saveTimers.has(documentId)) {
    clearTimeout(saveTimers.get(documentId)!);
  }

  const timer = setTimeout(async () => {
    try {
      const stateUpdate = Y.encodeStateAsUpdate(ydoc);
      const content = extractContent(ydoc);

      await documentModel.findOneAndUpdate(
        { documentId },
        {
          yjsState: Buffer.from(stateUpdate),
          content,
          lastEditedBy: userId,
          lastEditedAt: new Date()
        }
      );

      const now = Date.now();
      const lastSnapshot = lastHistoryTime.get(documentId) || 0;

      if (now - lastSnapshot >= HISTORY_INTERVAL_MS) {
        const latestHistory = await documentHistoryModel.findOne({ documentId }).sort({ version: -1 });
        const nextVersion = (latestHistory?.version || 0) + 1;

        await documentHistoryModel.create({
          historyId: generateUUID(),
          documentId,
          editedBy: userId,
          changes: Buffer.from(stateUpdate).toString('base64'),
          content,
          version: nextVersion,
          timestamp: new Date()
        });

        await activityLogModel.create({
          logId: generateUUID(),
          documentId,
          userId,
          action: 'edited',
          timestamp: new Date()
        });

        lastHistoryTime.set(documentId, now);
      }

      io.to(`doc:${documentId}`).emit('save-status', { status: 'saved' });
      saveTimers.delete(documentId);
    } catch (err) {
      console.error(`[Socket] Auto-save failed for document ${documentId}:`, err);
      io.to(`doc:${documentId}`).emit('save-status', { status: 'error' });
    }
  }, SAVE_DEBOUNCE_MS);

  saveTimers.set(documentId, timer);
};

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Extracts the JWT from the socket handshake. Checks the auth object first,
 * then falls back to parsing the 'token' cookie from the Cookie header.
 */
const parseToken = (socket: Socket): string | null => {
  if (socket.handshake.auth?.token) {
    return socket.handshake.auth.token;
  }

  const cookieHeader = socket.handshake.headers?.cookie || '';
  const tokenMatch = cookieHeader.split('; ').find((c: string) => c.startsWith('token='));
  return tokenMatch ? (tokenMatch.split('=')[1] ?? null) : null;
};

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Registers Socket.IO middleware and event handlers for real-time collaborative
 * document editing. The middleware authenticates each connection using a JWT and attaches
 * user metadata to the socket. Supported events include join-document, sync-complete,
 * yjs-update, awareness-update, typing, and disconnect. Handles Yjs state synchronization,
 * awareness broadcasting, debounced auto-save, versioned history snapshots, and activity logging.
 */

const socketConfig = (io: Server): void => {
  io.use(async (socket, next) => {
    const token = parseToken(socket);

    if (!token) {
      return next(new Error('Authentication token is missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
        email: string;
      };
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;

      const userInfo = await userModel.findOne({ userId: decoded.userId }).select('name profilePicture username -_id');
      socket.data.name = userInfo?.name || decoded.email;
      socket.data.profilePicture = userInfo?.profilePicture || '';

      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('Session expired'));
      }
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.data.userId} (${socket.id})`);

    socket.on('join-document', async (documentId: string) => {
      try {
        const membership = await documentMemberModel.findOne({
          documentId,
          userId: socket.data.userId
        });

        if (!membership) {
          socket.emit('error', { message: 'You do not have access to this document' });
          return;
        }

        socket.data.documentId = documentId;
        socket.join(`doc:${documentId}`);

        const ydoc = await getOrCreateYDoc(documentId);

        const stateUpdate = Y.encodeStateAsUpdate(ydoc);
        socket.emit('sync-init', Buffer.from(stateUpdate));

        await activityLogModel.create({
          logId: generateUUID(),
          documentId,
          userId: socket.data.userId,
          action: 'joined',
          timestamp: new Date()
        });

        const room = io.sockets.adapter.rooms.get(`doc:${documentId}`);
        const userMap = new Map<string, { userId: string; name: string; email: string; profilePicture: string }>();
        if (room) {
          for (const sid of room) {
            const s = io.sockets.sockets.get(sid);
            if (s && s.data.userId !== socket.data.userId && !userMap.has(s.data.userId)) {
              userMap.set(s.data.userId, {
                userId: s.data.userId,
                name: s.data.name || s.data.email,
                email: s.data.email,
                profilePicture: s.data.profilePicture || ''
              });
            }
          }
        }
        socket.emit('room-users', [...userMap.values()]);

        socket.to(`doc:${documentId}`).emit('user-joined', {
          userId: socket.data.userId,
          email: socket.data.email,
          name: socket.data.name,
          profilePicture: socket.data.profilePicture,
          socketId: socket.id
        });

        console.log(`[Socket] ${socket.data.userId} joined doc:${documentId}`);
      } catch (err) {
        console.error('[Socket] join-document error:', err);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    socket.on('sync-complete', (documentId: string, update: ArrayBuffer) => {
      try {
        const ydoc = docMap.get(documentId);
        if (!ydoc) return;

        const uint8Update = new Uint8Array(update);
        Y.applyUpdate(ydoc, uint8Update);

        socket.to(`doc:${documentId}`).emit('yjs-update', update);
      } catch (err) {
        console.error('[Socket] sync-complete error:', err);
      }
    });

    socket.on('yjs-update', (documentId: string, update: ArrayBuffer) => {
      try {
        const ydoc = docMap.get(documentId);
        if (!ydoc) return;

        const uint8Update = new Uint8Array(update);
        Y.applyUpdate(ydoc, uint8Update);

        socket.to(`doc:${documentId}`).emit('yjs-update', update);

        scheduleSave(io, documentId, ydoc, socket.data.userId);
      } catch (err) {
        console.error('[Socket] yjs-update error:', err);
      }
    });

    socket.on('awareness-update', (documentId: string, awarenessUpdate: ArrayBuffer) => {
      try {
        socket.to(`doc:${documentId}`).emit('awareness-update', awarenessUpdate);
      } catch (err) {
        console.error('[Socket] awareness-update error:', err);
      }
    });

    socket.on('typing', (documentId: string) => {
      socket.to(`doc:${documentId}`).emit('user-typing', {
        userId: socket.data.userId,
        email: socket.data.email
      });
    });

    socket.on('disconnect', async () => {
      try {
        const documentId = socket.data.documentId;

        if (documentId) {
          socket.to(`doc:${documentId}`).emit('user-left', {
            userId: socket.data.userId,
            name: socket.data.name,
            socketId: socket.id
          });

          await activityLogModel.create({
            logId: generateUUID(),
            documentId,
            userId: socket.data.userId,
            action: 'left',
            timestamp: new Date()
          });

          const room = io.sockets.adapter.rooms.get(`doc:${documentId}`);
          if (!room || room.size === 0) {
            const pendingTimer = saveTimers.get(documentId);
            if (pendingTimer) {
              clearTimeout(pendingTimer);
              saveTimers.delete(documentId);
            }

            const ydoc = docMap.get(documentId);
            if (ydoc) {
              try {
                const stateUpdate = Y.encodeStateAsUpdate(ydoc);
                const content = extractContent(ydoc);
                await documentModel.findOneAndUpdate({ documentId }, { yjsState: Buffer.from(stateUpdate), content });
              } catch (saveErr) {
                console.error(`[Socket] Final save failed for doc ${documentId}:`, saveErr);
              }
            }

            docMap.delete(documentId);
            awarenessMap.delete(documentId);
            lastHistoryTime.delete(documentId);
          }
        }

        console.log(`[Socket] User disconnected: ${socket.data.userId} (${socket.id})`);
      } catch (err) {
        console.error('[Socket] disconnect error:', err);
      }
    });
  });
};

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Clears the in-memory Y.Doc, Awareness instance, pending save timer, and
 * history timestamp for a given documentId. Intended to be called after a version restore
 * via the REST API so that reconnecting clients receive the restored state on next sync.
 */

export const clearInMemoryDoc = (documentId: string): void => {
  const pendingTimer = saveTimers.get(documentId);
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    saveTimers.delete(documentId);
  }
  docMap.delete(documentId);
  awarenessMap.delete(documentId);
  lastHistoryTime.delete(documentId);
};

export default socketConfig;
