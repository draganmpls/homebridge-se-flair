"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlairVentAccessory = void 0;
class FlairVentAccessory {
    constructor(platform, accessory, device) {
        this.platform = platform;
        this.accessory = accessory;
        this.device = device;
        this.isOpen = false;
        this.isOpen = device.state.open;
        this.accessory.getService(this.platform.Service.AccessoryInformation)
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
    updateFromDevice(device) {
        this.isOpen = device.state.open;
        this.service.updateCharacteristic(this.platform.Characteristic.On, this.isOpen);
    }
    async handleGet() {
        return this.isOpen;
    }
    async handleSet(value) {
        this.isOpen = value;
        this.platform.log.info(`${this.device.name} set to ${this.isOpen ? 'open' : 'closed'}`);
        // TODO: Send update to Flair API
    }
}
exports.FlairVentAccessory = FlairVentAccessory;
