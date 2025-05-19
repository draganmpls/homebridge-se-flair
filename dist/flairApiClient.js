"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlairApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class FlairApiClient {
    constructor(refreshToken) {
        this.refreshToken = refreshToken;
        this.token = '';
        this.http = axios_1.default.create({ baseURL: 'https://api.flair.co' });
    }
    async authenticate() {
        const res = await axios_1.default.post('https://api.flair.co/oauth/token', {
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            client_id: '', // User-provided at runtime
            client_secret: '',
        });
        this.token = res.data.access_token;
        this.http.defaults.headers.common.Authorization = `Bearer ${this.token}`;
    }
    async getDevices() {
        await this.authenticate();
        // Simulated data for testing
        return [
            { id: 'vent1', type: 'vent', name: 'Living Room Vent', roomName: 'Living Room', state: { open: true } },
            { id: 'puck1', type: 'puck', name: 'Living Room Puck', roomName: 'Living Room', state: { temperature: 22.5, battery: 95 } },
        ];
    }
}
exports.FlairApiClient = FlairApiClient;
