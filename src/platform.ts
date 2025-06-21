import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';

import { FlairVentAccessory } from './accessories/FlairVentAccessory';
import { FlairPuckAccessory } from './accessories/FlairPuckAccessory';
import { FlairApiClient } from './flairApiClient';

export class FlairPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  private readonly accessories: PlatformAccessory[] = [];
  private readonly deviceMap: Record<string, FlairVentAccessory | FlairPuckAccessory> = {};
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
      this.client = new FlairApiClient(config.clientId, config.clientSecret, config.refreshToken);
      const pollSeconds = config.pollInterval ?? 300;

      try {
        const devices = await this.client.getDevices();

        for (const device of devices) {
          const uuid = this.api.hap.uuid.generate(device.id);
          const accessory = new this.api.platformAccessory(device.name, uuid);

          if (device.type === 'vent') {
            this.deviceMap[device.id] = new FlairVentAccessory(this, accessory, device);
          } else if (device.type === 'puck') {
            this.deviceMap[device.id] = new FlairPuckAccessory(this, accessory, device);
          }

          this.api.registerPlatformAccessories('homebridge-se-flair', 'FlairSE', [accessory]);
        }

        setInterval(() => this.refreshDevices(), pollSeconds * 1000).unref();
      } catch (error) {
        this.log.error('Error fetching Flair devices:', error);
      }
    });
  }

  private async refreshDevices(): Promise<void> {
    try {
      const devices = await this.client.getDevices();
      for (const device of devices) {
        const acc = this.deviceMap[device.id];
        acc?.updateFromDevice(device);
      }
    } catch (error) {
      this.log.error('Error refreshing Flair devices:', error);
    }
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.accessories.push(accessory);
  }
}
