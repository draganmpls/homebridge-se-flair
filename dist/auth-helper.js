"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const readline_1 = __importDefault(require("readline"));
const open_1 = __importDefault(require("open"));
const http_1 = __importDefault(require("http"));
const credentialStore_1 = require("./credentialStore");
const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
const redirectUri = 'http://localhost:3000/callback';
function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}
async function waitForCode() {
    return await new Promise((resolve, reject) => {
        const server = http_1.default.createServer((req, res) => {
            if (!req.url)
                return;
            const urlObj = new URL(req.url, redirectUri);
            if (urlObj.pathname !== '/callback') {
                res.statusCode = 404;
                res.end();
                return;
            }
            const code = urlObj.searchParams.get('code');
            res.end('Authorization complete. You may close this window.');
            server.close();
            if (code) {
                resolve(code);
            }
            else {
                reject(new Error('No code received'));
            }
        });
        server.listen(3000);
    });
}
async function getRefreshToken() {
    const clientId = await prompt('Client ID: ');
    const clientSecret = await prompt('Client Secret: ');
    const authUrl = `https://api.flair.co/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    console.log(`Opening browser for authorization...`);
    await (0, open_1.default)(authUrl);
    const code = await waitForCode();
    try {
        const res = await axios_1.default.post('https://api.flair.co/oauth/token', {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        });
        console.log('\n✅ Your refresh token:\n', res.data.refresh_token);
        await (0, credentialStore_1.saveRefreshToken)(res.data.refresh_token);
        console.log(`Token saved to ~/.flair-refresh-token`);
    }
    catch (err) {
        console.error('❌ Failed to get token:', err.response?.data || err.message);
    }
    finally {
        rl.close();
    }
}
getRefreshToken();
