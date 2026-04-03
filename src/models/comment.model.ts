// Importing packages
import { Schema, model } from 'mongoose';

// Importing interfaces
import { IComment } from '../interfaces/model.interface';

/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-03
 * @description Mongoose schema for document comments and threaded replies
 */

const replySchema = new Schema({
  replyId: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const schema = new Schema<IComment>(
  {
    commentId: { type: String, required: true, unique: true },
    documentId: { type: String, required: true },
    userId: { type: String, required: true },
    selectedText: { type: String },
    rangeStart: { type: Number },
    rangeEnd: { type: Number },
    content: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    replies: { type: [replySchema], default: [] }
  },
  { timestamps: true }
);

export default model<IComment>('comment', schema);
