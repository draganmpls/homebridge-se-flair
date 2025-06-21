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
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.api.on('didFinishLaunching', async () => {
            this.log.info('FlairSE platform starting device discovery...');
            const client = new flairApiClient_1.FlairApiClient(config.clientId, config.clientSecret, config.refreshToken);
            try {
                const devices = await client.getDevices();
                for (const device of devices) {
                    const uuid = this.api.hap.uuid.generate(device.id);
                    const accessory = new this.api.platformAccessory(device.name, uuid);
                    if (device.type === 'vent') {
                        new FlairVentAccessory_1.FlairVentAccessory(this, accessory, device);
                    }
                    else if (device.type === 'puck') {
                        new FlairPuckAccessory_1.FlairPuckAccessory(this, accessory, device);
                    }
                    this.api.registerPlatformAccessories('homebridge-se-flair', 'FlairSE', [accessory]);
                }
            }
            catch (error) {
                this.log.error('Error fetching Flair devices:', error);
            }
        });
    }
    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }
}
exports.FlairPlatform = FlairPlatform;
