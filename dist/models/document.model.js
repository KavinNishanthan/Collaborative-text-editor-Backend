"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    documentId: { type: String, required: true, unique: true },
    title: { type: String, required: true, default: 'Untitled Document' },
    content: { type: String, default: '' },
    yjsState: { type: Buffer },
    ownerId: { type: String, required: true },
    shareToken: { type: String, unique: true, sparse: true },
    lastEditedBy: { type: String },
    lastEditedAt: { type: Date }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('document', schema);
//# sourceMappingURL=document.model.js.map