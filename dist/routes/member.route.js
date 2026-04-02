"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const express_1 = require("express");
// Importing controllers
const member_controller_1 = __importDefault(require("../controllers/member.controller"));
// Importing middleware
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.default);
// Routes for document member management
router.post('/:documentId/members/invite', member_controller_1.default.handleInviteMember);
exports.default = router;
//# sourceMappingURL=member.route.js.map