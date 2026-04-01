"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing axios
const axios_1 = __importDefault(require("axios"));
const axiosInstance = axios_1.default.create({
    withCredentials: true
});
const getRequest = (data) => {
    const { path, config, success, error, final } = data;
    axiosInstance.get(path, config).then(success).catch(error).finally(final);
};
const postRequest = (data) => {
    const { path, payload, config, success, error, final } = data;
    axiosInstance.post(path, payload, config).then(success).catch(error).finally(final);
};
const putRequest = (data) => {
    const { path, payload, success, error, config, final } = data;
    axiosInstance.put(path, payload, config).then(success).catch(error).finally(final);
};
const deleteRequest = (data) => {
    const { path, success, error, final } = data;
    axiosInstance.delete(path).then(success).catch(error).finally(final);
};
exports.default = {
    getRequest,
    postRequest,
    putRequest,
    deleteRequest
};
//# sourceMappingURL=http-request.config.js.map