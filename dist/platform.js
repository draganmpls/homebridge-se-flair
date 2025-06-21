"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlairPlatform = void 0;
const FlairVentAccessory_1 = require("./accessories/FlairVentAccessory");
const FlairPuckAccessory_1 = require("./accessories/FlairPuckAccessory");
const flairApiClient_1 = require("./flairApiClient");
class FlairPlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.accessories = [];
        this.deviceMap = {};
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.api.on('didFinishLaunching', async () => {
            this.log.info('FlairSE platform starting device discovery...');
            this.client = new flairApiClient_1.FlairApiClient(config.clientId, config.clientSecret, config.refreshToken);
            const pollSeconds = config.pollInterval ?? 300;
            try {
                const devices = await this.client.getDevices();
                for (const device of devices) {
                    const uuid = this.api.hap.uuid.generate(device.id);
                    const accessory = new this.api.platformAccessory(device.name, uuid);
                    if (device.type === 'vent') {
                        this.deviceMap[device.id] = new FlairVentAccessory_1.FlairVentAccessory(this, accessory, device);
                    }
                    else if (device.type === 'puck') {
                        this.deviceMap[device.id] = new FlairPuckAccessory_1.FlairPuckAccessory(this, accessory, device);
                    }
                    this.api.registerPlatformAccessories('homebridge-se-flair', 'FlairSE', [accessory]);
                }
                setInterval(() => this.refreshDevices(), pollSeconds * 1000).unref();
            }
            catch (error) {
                this.log.error('Error fetching Flair devices:', error);
            }
        });
    }
    async refreshDevices() {
        try {
            const devices = await this.client.getDevices();
            for (const device of devices) {
                const acc = this.deviceMap[device.id];
                acc?.updateFromDevice(device);
            }
        }
        catch (error) {
            this.log.error('Error refreshing Flair devices:', error);
        }
    }
    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }
}
exports.FlairPlatform = FlairPlatform;
