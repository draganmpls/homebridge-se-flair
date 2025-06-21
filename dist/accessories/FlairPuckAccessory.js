"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlairPuckAccessory = void 0;
class FlairPuckAccessory {
    constructor(platform, accessory, device) {
        this.platform = platform;
        this.accessory = accessory;
        this.device = device;
        this.temperature = 0;
        this.battery = 100;
        this.temperature = device.state.temperature;
        this.battery = device.state.battery;
        this.accessory.getService(this.platform.Service.AccessoryInformation)
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
    updateFromDevice(device) {
        this.temperature = device.state.temperature;
        this.battery = device.state.battery;
        this.temperatureService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.temperature);
        this.batteryService.updateCharacteristic(this.platform.Characteristic.BatteryLevel, this.battery);
        this.batteryService.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.battery < 20 ? 1 : 0);
    }
    async getTemperature() {
        return this.temperature;
    }
    async getBattery() {
        return this.battery;
    }
}
exports.FlairPuckAccessory = FlairPuckAccessory;
