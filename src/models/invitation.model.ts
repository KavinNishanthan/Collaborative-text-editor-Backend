// Importing packages
import { Schema, model } from 'mongoose';

// Importing interfaces
import { IInvitation } from '../interfaces/model.interface';


const schema = new Schema<IInvitation>(
  {
    invitationId: { type: String, required: true, unique: true },
    documentId: { type: String, required: true },
    inviteeUserId: { type: String, required: true },
    invitedBy: { type: String, required: true },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'viewer'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

schema.index({ documentId: 1, inviteeUserId: 1, status: 1 });

export default model<IInvitation>('invitation', schema);
