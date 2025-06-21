"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRefreshToken = saveRefreshToken;
exports.loadRefreshToken = loadRefreshToken;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const tokenFile = path_1.default.join(process.env.HOME || process.cwd(), '.flair-refresh-token');
async function saveRefreshToken(token) {
    const data = JSON.stringify({ refreshToken: token });
    await fs_1.promises.writeFile(tokenFile, data, { mode: 0o600 });
}
async function loadRefreshToken() {
    try {
        const data = await fs_1.promises.readFile(tokenFile, 'utf8');
        return JSON.parse(data).refreshToken;
    }
    catch {
        return null;
    }
}
