import { PlatformAccessory, Service, CharacteristicValue } from 'homebridge';
import { FlairPlatform } from '../platform';
import { FlairDevice } from '../flairApiClient';

export class FlairVentAccessory {
  private service: Service;
  private isOpen = false;

  constructor(
    private readonly platform: FlairPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: FlairDevice
  ) {
    this.isOpen = device.state.open;

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Flair')
      .setCharacteristic(this.platform.Characteristic.Model, 'Smart Vent')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.id);

    this.service = this.accessory.getService(this.platform.Service.Switch)
      || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleGet.bind(this))
      .onSet(this.handleSet.bind(this));
  }

  async handleGet(): Promise<CharacteristicValue> {
    return this.isOpen;
  }

  async handleSet(value: CharacteristicValue): Promise<void> {
    this.isOpen = value as boolean;
    this.platform.log.info(`${this.device.name} set to ${this.isOpen ? 'open' : 'closed'}`);
    // TODO: Send update to Flair API
  }
}
