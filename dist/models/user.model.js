"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
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
    lastLogin: { type: Date }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('user', schema);
//# sourceMappingURL=user.model.js.map