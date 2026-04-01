"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Importing Mongoose
const mongoose_1 = __importDefault(require("mongoose"));
const connect = async () => {
    try {
        mongoose_1.default.set('strictQuery', false);
        const res = await mongoose_1.default.connect(process.env.MONGOURI || '');
        console.log('Mongodb connected');
        return res;
    }
    catch (err) {
        console.log('Mongodb Error:', err);
    }
};
exports.default = connect;
//# sourceMappingURL=mongoose.config.js.map