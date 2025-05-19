import { PlatformAccessory, Service, CharacteristicValue } from 'homebridge';
import { FlairPlatform } from '../platform';
import { FlairDevice } from '../flairApiClient';

export class FlairPuckAccessory {
  private temperatureService: Service;
  private batteryService: Service;
  private temperature = 0;
  private battery = 100;

  constructor(
    private readonly platform: FlairPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: FlairDevice
  ) {
    this.temperature = device.state.temperature;
    this.battery = device.state.battery;

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Flair')
      .setCharacteristic(this.platform.Characteristic.Model, 'Puck')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.id);

    this.temperatureService = this.accessory.getService(this.platform.Service.TemperatureSensor)
      || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getTemperature.bind(this));

    this.batteryService = this.accessory.getService(this.platform.Service.BatteryService)
      || this.accessory.addService(this.platform.Service.BatteryService);
    this.batteryService.getCharacteristic(this.platform.Characteristic.BatteryLevel)
      .onGet(this.getBattery.bind(this));
    this.batteryService.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
      .onGet(() => this.battery < 20 ? 1 : 0);
  }

  async getTemperature(): Promise<CharacteristicValue> {
    return this.temperature;
  }

  async getBattery(): Promise<CharacteristicValue> {
    return this.battery;
  }
}
