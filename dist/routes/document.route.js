"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing packages
const express_1 = require("express");
// Importing controllers
const document_controller_1 = __importDefault(require("../controllers/document.controller"));
// Importing middleware
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.default);
// Doc Route
router.post('/', document_controller_1.default.handleCreateDocument);
router.get('/', document_controller_1.default.handleGetAllDocuments);
router.get('/:documentId', document_controller_1.default.handleGetDocumentById);
router.put('/:documentId', document_controller_1.default.handleUpdateDocument);
exports.default = router;
//# sourceMappingURL=document.route.js.map