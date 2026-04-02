"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('documentMember', schema);
//# sourceMappingURL=document-member.model.js.map