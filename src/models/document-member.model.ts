// Importing packages
import { Schema, model } from 'mongoose';

// Importing interfaces
import { IDocumentMember } from '../interfaces/model.interface';


const schema = new Schema<IDocumentMember>(
  {
    memberId: { type: String, required: true, unique: true },
    documentId: { type: String, required: true },
    userId: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer'
    },
    invitedBy: { type: String },
    invitedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default model<IDocumentMember>('documentMember', schema);
