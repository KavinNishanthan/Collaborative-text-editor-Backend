// Importing packages
import { Schema, model } from 'mongoose';

// Importing interfaces
import { IActivityLog } from '../interfaces/model.interface';


const schema = new Schema<IActivityLog>(
  {
    logId: { type: String, required: true, unique: true },
    documentId: { type: String, required: true },
    userId: { type: String, required: true },
    action: {
      type: String,
      enum: ['joined', 'left', 'edited', 'commented', 'restored', 'invited', 'removed'],
      required: true
    },
    metadata: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default model<IActivityLog>('activityLog', schema);
