import axios from 'axios';
import readline from 'readline';
import open from 'open';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const clientId = 'bBal2B4NsVheVoRC9xAWrgIAoBYlID5CkrFgisTm';
const clientSecret = 'oNPQT4iz5jurWsb4nVdTYz04zoBvIyetMbhawsWIUaaiR3KeKaKWdcS4ryZO';
const redirectUri = 'http://localhost:3000';

async function getRefreshToken() {
  const authUrl = `https://api.flair.co/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  console.log(`Please authorize the app by visiting:\n${authUrl}`);
  await open(authUrl);

  rl.question('Paste the authorization code here: ', async (code) => {
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
  });
}

getRefreshToken();
