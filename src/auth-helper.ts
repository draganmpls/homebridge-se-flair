import axios from 'axios';
import readline from 'readline';
import open from 'open';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const redirectUri = 'http://localhost:3000';

function prompt(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function getRefreshToken() {
  const clientId = await prompt('Client ID: ');
  const clientSecret = await prompt('Client Secret: ');

  const authUrl = `https://api.flair.co/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  console.log(`Please authorize the app by visiting:\n${authUrl}`);
  await open(authUrl);

  const code = await prompt('Paste the authorization code here: ');

  try {
    const res = await axios.post('https://api.flair.co/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    console.log('\n✅ Your refresh token:\n', res.data.refresh_token);
  } catch (err: any) {
    console.error('❌ Failed to get token:', err.response?.data || err.message);
  } finally {
    rl.close();
  }
}

getRefreshToken();
