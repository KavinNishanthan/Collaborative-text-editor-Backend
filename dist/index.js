"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing env variables
require("dotenv/config");
// Importing configs
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Importing Configs
const mongoose_config_1 = __importDefault(require("./configs/mongoose.config"));
//Importing Routs
const index_1 = __importDefault(require("./routes/index"));
const port = process.env.PORT;
const app = (0, express_1.default)();
(0, mongoose_config_1.default)();
app.use((0, cors_1.default)({
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.get('/', (req, res) => {
//   res.send('Server is Running Successfully');
// });
app.use('/api', index_1.default);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port} - ${new Date().toDateString()} / ${new Date().toLocaleTimeString()}`);
});
//# sourceMappingURL=index.js.map