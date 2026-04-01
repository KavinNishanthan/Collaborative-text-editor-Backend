"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = void 0;
// Importing packages
const uuid_1 = require("uuid");
const generateUUID = () => {
    const generatedUUID = (0, uuid_1.v4)();
    return generatedUUID.replace(/-/g, '');
};
exports.generateUUID = generateUUID;
exports.default = {
    generateUUID: exports.generateUUID
};
//# sourceMappingURL=uuid.helper.js.map