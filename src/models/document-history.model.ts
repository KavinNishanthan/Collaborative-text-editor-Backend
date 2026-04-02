// Importing packages
import { Schema, model } from 'mongoose';

// Importing interfaces
import { IDocumentHistory } from '../interfaces/model.interface';


const schema = new Schema<IDocumentHistory>(
  {
    historyId: { type: String, required: true, unique: true },
    documentId: { type: String, required: true },
    editedBy: { type: String, required: true },
    changes: { type: String }, 
    content: { type: String }, 
    version: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default model<IDocumentHistory>('documentHistory', schema);
