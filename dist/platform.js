"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlairPlatform = void 0;
const http_1 = __importDefault(require("http"));
const open_1 = __importDefault(require("open"));
const FlairVentAccessory_1 = require("./accessories/FlairVentAccessory");
const FlairPuckAccessory_1 = require("./accessories/FlairPuckAccessory");
const FlairGatewayAccessory_1 = require("./accessories/FlairGatewayAccessory");
const flairApiClient_1 = require("./flairApiClient");
const credentialStore_1 = require("./credentialStore");
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
            let refreshToken = config.refreshToken || await (0, credentialStore_1.loadRefreshToken)();
            if (!refreshToken && config.clientId && config.clientSecret) {
                refreshToken = await this.runAuthFlow(config.clientId, config.clientSecret);
            }
            if (!refreshToken) {
                this.log.error('No refresh token available; cannot communicate with Flair API.');
                return;
            }
            this.client = new flairApiClient_1.FlairApiClient(config.clientId, config.clientSecret, refreshToken);
            const pollSeconds = config.pollInterval ?? 300;
            try {
                const devices = await this.client.getDevices();
                for (const device of devices) {
                    this.addDevice(device);
                }
                setInterval(() => this.refreshDevices(), pollSeconds * 1000).unref();
            }
            catch (error) {
                this.log.error('Error fetching Flair devices:', error);
            }
        });
    }
    async runAuthFlow(clientId, clientSecret) {
        const redirectUri = 'http://localhost:3000/callback';
        const authUrl = `https://api.flair.co/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
        return await new Promise(resolve => {
            const server = http_1.default.createServer(async (req, res) => {
                if (!req.url)
                    return;
                const urlObj = new URL(req.url, redirectUri);
                if (urlObj.pathname !== '/callback') {
                    res.statusCode = 404;
                    res.end();
                    return;
                }
                const code = urlObj.searchParams.get('code');
                res.end('Authorization complete. You may close this window.');
                server.close();
                if (!code) {
                    resolve(null);
                    return;
                }
                try {
                    const tokenRes = await Promise.resolve().then(() => __importStar(require('axios'))).then(m => m.default.post('https://api.flair.co/oauth/token', {
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: redirectUri,
                        client_id: clientId,
                        client_secret: clientSecret,
                    }));
                    await (0, credentialStore_1.saveRefreshToken)(tokenRes.data.refresh_token);
                    this.log.info('Stored refresh token at ~/.flair-refresh-token');
                    resolve(tokenRes.data.refresh_token);
                }
                catch (err) {
                    this.log.error('Failed to exchange auth code:', err);
                    resolve(null);
                }
            });
            server.listen(3000, () => {
                (0, open_1.default)(authUrl).catch(err => this.log.error('Failed to open browser', err));
                this.log.info('Waiting for OAuth authorization in browser...');
            });
        });
    }
    async refreshDevices() {
        try {
            const devices = await this.client.getDevices();
            for (const device of devices) {
                const acc = this.deviceMap[device.id];
                if (acc) {
                    acc.updateFromDevice(device);
                }
                else {
                    this.addDevice(device);
                }
            }
        }
        catch (error) {
            this.log.error('Error refreshing Flair devices:', error);
        }
    }
    addDevice(device) {
        const uuid = this.api.hap.uuid.generate(device.id);
        const accessory = new this.api.platformAccessory(device.name, uuid);
        if (device.type === 'vent') {
            if (this.config.includeVents === false) {
                return;
            }
            this.deviceMap[device.id] = new FlairVentAccessory_1.FlairVentAccessory(this, accessory, device);
        }
        else if (device.type === 'puck') {
            if (this.config.includePucks === false) {
                return;
            }
            this.deviceMap[device.id] = new FlairPuckAccessory_1.FlairPuckAccessory(this, accessory, device);
        }
        else if (device.type === 'gateway') {
            if (this.config.includeGateways === false) {
                return;
            }
            this.deviceMap[device.id] = new FlairGatewayAccessory_1.FlairGatewayAccessory(this, accessory);
        }
        else {
            return;
        }
        this.api.registerPlatformAccessories('homebridge-se-flair', 'FlairSE', [accessory]);
    }
    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }
}
exports.FlairPlatform = FlairPlatform;
