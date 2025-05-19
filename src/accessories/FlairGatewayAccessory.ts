import { PlatformAccessory } from 'homebridge';
import { FlairPlatform } from '../platform';

export class FlairGatewayAccessory {
  constructor(
    private readonly platform: FlairPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    platform.log.info(`Initialized Flair Gateway: ${accessory.displayName}`);
  }
}
