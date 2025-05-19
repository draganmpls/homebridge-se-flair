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

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.api.on('didFinishLaunching', async () => {
      this.log.info('FlairSE platform starting device discovery...');
      const client = new FlairApiClient(config.refreshToken);

      try {
        const devices = await client.getDevices();

        for (const device of devices) {
          const uuid = this.api.hap.uuid.generate(device.id);
          const accessory = new this.api.platformAccessory(device.name, uuid);

          if (device.type === 'vent') {
            new FlairVentAccessory(this, accessory, device);
          } else if (device.type === 'puck') {
            new FlairPuckAccessory(this, accessory, device);
          }

          this.api.registerPlatformAccessories('homebridge-se-flair', 'FlairSE', [accessory]);
        }
      } catch (error) {
        this.log.error('Error fetching Flair devices:', error);
      }
    });
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.accessories.push(accessory);
  }
}
