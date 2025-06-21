import axios from 'axios';
import readline from 'readline';
import open from 'open';
import http from 'http';
import { saveRefreshToken } from './credentialStore';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const redirectUri = 'http://localhost:3000/callback';

function prompt(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function waitForCode(): Promise<string> {
  return await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return;
      const urlObj = new URL(req.url, redirectUri);
      if (urlObj.pathname !== '/callback') {
        res.statusCode = 404; res.end(); return;
      }
      const code = urlObj.searchParams.get('code');
      res.end('Authorization complete. You may close this window.');
      server.close();
      if (code) {
        resolve(code);
      } else {
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
  await open(authUrl);
  const code = await waitForCode();

  try {
    const res = await axios.post('https://api.flair.co/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });
    console.log('\n✅ Your refresh token:\n', res.data.refresh_token);
    await saveRefreshToken(res.data.refresh_token);
    console.log(`Token saved to ~/.flair-refresh-token`);
  } catch (err: any) {
    console.error('❌ Failed to get token:', err.response?.data || err.message);
  } finally {
    rl.close();
  }
}

getRefreshToken();
