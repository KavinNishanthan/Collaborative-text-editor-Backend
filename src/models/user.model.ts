// Importing packages
import { Schema, model } from "mongoose";

// Importing interfaces
import { IUser } from '../interfaces/model.interface';

const schema = new Schema<IUser>(
    {
        userId: {
            type: String,
            required: true
        },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false, select: false },
        googleId: { type: String, required: false },
        profilePicture: { type: String, required: true },
        isManualAuth: { type: Boolean, default: false },
        isEmailVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        lastLogin: {type: Date}
    },
    { timestamps: true }
)

export default model<IUser>('user', schema);