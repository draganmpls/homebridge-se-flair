"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const readline_1 = __importDefault(require("readline"));
const open_1 = __importDefault(require("open"));
const clientId = 'ZQLrWcjroJJUi0Wv23MJDl0BuojQ0ksjJmWLkrj9';
const clientSecret = 'FLqH4PKhicEOAnQHxByyDVaFYjqCUPE1uny2fbcs1iVczDMh2XsIqeDWbuBZ';
const redirectUri = 'http://localhost:3000';
const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
async function getRefreshToken() {
    const authUrl = `https://api.flair.co/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    console.log(`Please authorize the app by visiting:
${authUrl}`);
    await (0, open_1.default)(authUrl);
    rl.question('Paste the authorization code here: ', async (code) => {
        try {
            const res = await axios_1.default.post('https://api.flair.co/oauth/token', {
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            });
            console.log('Your refresh token:', res.data.refresh_token);
        }
        catch (err) {
            console.error('Failed to get token:', err);
        }
        finally {
            rl.close();
        }
    });
}
getRefreshToken();
