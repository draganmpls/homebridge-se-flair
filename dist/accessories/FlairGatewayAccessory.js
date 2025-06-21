"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlairGatewayAccessory = void 0;
class FlairGatewayAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        platform.log.info(`Initialized Flair Gateway: ${accessory.displayName}`);
    }
    updateFromDevice() {
        // Gateways currently expose no dynamic state
    }
}
exports.FlairGatewayAccessory = FlairGatewayAccessory;
