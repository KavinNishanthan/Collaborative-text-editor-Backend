// Importing packages
import { Schema, model } from 'mongoose';

// Importing interfaces
import { IDocument } from '../interfaces/model.interface';


const schema = new Schema<IDocument>(
  {
    documentId: { type: String, required: true, unique: true },
    title: { type: String, required: true, default: 'Untitled Document' },
    content: { type: String, default: '' },
    yjsState: { type: Buffer },
    ownerId: { type: String, required: true },
    shareToken: { type: String, unique: true, sparse: true },
    lastEditedBy: { type: String },
    lastEditedAt: { type: Date }
  },
  { timestamps: true }
);

export default model<IDocument>('document', schema);
