import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';
import http from 'http';
import open from 'open';

import { FlairVentAccessory } from './accessories/FlairVentAccessory';
import { FlairPuckAccessory } from './accessories/FlairPuckAccessory';
import { FlairGatewayAccessory } from './accessories/FlairGatewayAccessory';
import { FlairApiClient, FlairDevice } from './flairApiClient';
import { loadRefreshToken, saveRefreshToken } from './credentialStore';

export class FlairPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  private readonly accessories: PlatformAccessory[] = [];
  private readonly deviceMap: Record<string, FlairVentAccessory | FlairPuckAccessory | FlairGatewayAccessory> = {};
  private client!: FlairApiClient;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.api.on('didFinishLaunching', async () => {
      this.log.info('FlairSE platform starting device discovery...');
      let refreshToken = config.refreshToken || await loadRefreshToken();

      if (!refreshToken && config.clientId && config.clientSecret) {
        refreshToken = await this.runAuthFlow(config.clientId, config.clientSecret);
      }
      if (!refreshToken) {
        this.log.error('No refresh token available; cannot communicate with Flair API.');
        return;
      }

      this.client = new FlairApiClient(config.clientId, config.clientSecret, refreshToken);
      const pollSeconds = config.pollInterval ?? 300;

      try {
        const devices = await this.client.getDevices();

        for (const device of devices) {
          this.addDevice(device);
        }

        setInterval(() => this.refreshDevices(), pollSeconds * 1000).unref();
      } catch (error) {
        this.log.error('Error fetching Flair devices:', error);
      }
    });
  }

  private async runAuthFlow(clientId: string, clientSecret: string): Promise<string | null> {
    const redirectUri = 'http://localhost:3000/callback';
    const authUrl = `https://api.flair.co/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

    return await new Promise(resolve => {
      const server = http.createServer(async (req, res) => {
        if (!req.url) return;
        const urlObj = new URL(req.url, redirectUri);
        if (urlObj.pathname !== '/callback') { res.statusCode = 404; res.end(); return; }
        const code = urlObj.searchParams.get('code');
        res.end('Authorization complete. You may close this window.');
        server.close();
        if (!code) { resolve(null); return; }
        try {
          const tokenRes = await import('axios').then(m => m.default.post('https://api.flair.co/oauth/token', {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
          }));
          await saveRefreshToken(tokenRes.data.refresh_token);
          this.log.info('Stored refresh token at ~/.flair-refresh-token');
          resolve(tokenRes.data.refresh_token);
        } catch (err) {
          this.log.error('Failed to exchange auth code:', err);
          resolve(null);
        }
      });
      server.listen(3000, () => {
        this.log.info(`Open this URL in your browser to authorize: ${authUrl}`);
        open(authUrl).catch(err => this.log.error('Failed to open browser', err));
        this.log.info('Waiting for OAuth authorization in browser...');
      });
    });
  }

  private async refreshDevices(): Promise<void> {
    try {
      const devices = await this.client.getDevices();
      for (const device of devices) {
        const acc = this.deviceMap[device.id];
        if (acc) {
          acc.updateFromDevice(device);
        } else {
          this.addDevice(device);
        }
      }
    } catch (error) {
      this.log.error('Error refreshing Flair devices:', error);
    }
  }

  private addDevice(device: FlairDevice): void {
    const uuid = this.api.hap.uuid.generate(device.id);
    const accessory = new this.api.platformAccessory(device.name, uuid);

    if (device.type === 'vent') {
      if (this.config.includeVents === false) {
        return;
      }
      this.deviceMap[device.id] = new FlairVentAccessory(this, accessory, device);
    } else if (device.type === 'puck') {
      if (this.config.includePucks === false) {
        return;
      }
      this.deviceMap[device.id] = new FlairPuckAccessory(this, accessory, device);
    } else if (device.type === 'gateway') {
      if (this.config.includeGateways === false) {
        return;
      }
      this.deviceMap[device.id] = new FlairGatewayAccessory(this, accessory);
    } else {
      return;
    }

    this.api.registerPlatformAccessories('homebridge-se-flair', 'FlairSE', [accessory]);
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.accessories.push(accessory);
  }
}
