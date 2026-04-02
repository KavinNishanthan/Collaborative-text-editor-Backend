"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const express_1 = require("express");
// Importing routes
const auth_route_1 = __importDefault(require("./auth.route"));
const document_route_1 = __importDefault(require("./document.route"));
const member_route_1 = __importDefault(require("./member.route"));
// Defining router
const router = (0, express_1.Router)();
// Non authorization routes
router.use('/auth', auth_route_1.default);
// authorization routes
router.use('/documents', document_route_1.default);
router.use('/documents', member_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map