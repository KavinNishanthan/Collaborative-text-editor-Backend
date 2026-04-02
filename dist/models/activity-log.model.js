"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const mongoose_1 = require("mongoose");
/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-02
 * @description Mongoose schema for document activity logs
 */
const schema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('activityLog', schema);
//# sourceMappingURL=activity-log.model.js.map