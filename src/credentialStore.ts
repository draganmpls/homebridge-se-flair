import { promises as fs } from 'fs';
import path from 'path';

const tokenFile = path.join(process.env.HOME || process.cwd(), '.flair-refresh-token');

export async function saveRefreshToken(token: string): Promise<void> {
  const data = JSON.stringify({ refreshToken: token });
  await fs.writeFile(tokenFile, data, { mode: 0o600 });
}

export async function loadRefreshToken(): Promise<string | null> {
  try {
    const data = await fs.readFile(tokenFile, 'utf8');
    return JSON.parse(data).refreshToken as string;
  } catch {
    return null;
  }
}
