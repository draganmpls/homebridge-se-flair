import axios, { AxiosInstance } from 'axios';

export interface FlairDevice {
  id: string;
  type: 'vent' | 'puck' | 'gateway';
  name: string;
  roomName: string;
  state: any;
}

export class FlairApiClient {
  private token = '';
  private tokenExpires = 0;
  private http: AxiosInstance;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly refreshToken: string,
  ) {
    this.http = axios.create({ baseURL: 'https://api.flair.co' });
  }

  private async authenticate(): Promise<void> {
    if (this.token && Date.now() < this.tokenExpires - 60000) {
      return; // token still valid
    }
    const res = await axios.post('https://api.flair.co/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    this.token = res.data.access_token;
    this.tokenExpires = Date.now() + res.data.expires_in * 1000;
    this.http.defaults.headers.common.Authorization = `Bearer ${this.token}`;
  }

  async getDevices(): Promise<FlairDevice[]> {
    await this.authenticate();

    // Simulated data for testing
    return [
      { id: 'vent1', type: 'vent', name: 'Living Room Vent', roomName: 'Living Room', state: { open: true }},
      { id: 'puck1', type: 'puck', name: 'Living Room Puck', roomName: 'Living Room', state: { temperature: 22.5, battery: 95 }},
      { id: 'gateway1', type: 'gateway', name: 'Home Gateway', roomName: 'Living Room', state: {} },
    ];
  }
}
