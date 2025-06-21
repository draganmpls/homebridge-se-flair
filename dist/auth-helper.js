"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const readline_1 = __importDefault(require("readline"));
const open_1 = __importDefault(require("open"));
const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
const redirectUri = 'http://localhost:3000';
function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}
async function getRefreshToken() {
    const clientId = await prompt('Client ID: ');
    const clientSecret = await prompt('Client Secret: ');
    const authUrl = `https://api.flair.co/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    console.log(`Please authorize the app by visiting:\n${authUrl}`);
    await (0, open_1.default)(authUrl);
    const code = await prompt('Paste the authorization code here: ');
    try {
        const res = await axios_1.default.post('https://api.flair.co/oauth/token', {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        });
        console.log('\n✅ Your refresh token:\n', res.data.refresh_token);
    }
    catch (err) {
        console.error('❌ Failed to get token:', err.response?.data || err.message);
    }
    finally {
        rl.close();
    }
}
getRefreshToken();
