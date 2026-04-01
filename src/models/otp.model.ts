// Importing packages
import { Schema, model } from 'mongoose';

// Importing Interfaces
import { IOtp } from '../interfaces/model.interface';

const schema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IOtp>('otp', schema);