# Homebridge Flair SE Integration

This plugin connects your Flair.co vents, pucks, and gateways to Apple HomeKit via Homebridge.

## Installation
```bash
sudo npm install -g homebridge-se-flair
```

## Configuration
Add the following to your Homebridge `config.json` (or use Homebridge UI):
```json
{
  "platform": "FlairSE",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "pollInterval": 300,
  "includePucks": true,
  "includeVents": true,
  "includeGateways": true
}
```
When using the Homebridge UI, your OAuth credentials now appear in a **Flair API Credentials** section, with polling and accessory options grouped under **Device Options**.
`pollInterval` controls how often the plugin refreshes device state from Flair.
If omitted, it defaults to `300` seconds. The `include*` options let you disable adding pucks, vents, or gateways; all default to `true` following the Flair API defaults.

### OAuth2 Setup
Run the helper script to perform the login flow. It will open a browser and automatically capture the authorization code, saving the refresh token to `~/.flair-refresh-token`.
```bash
npm run auth-helper
```
You can also click **Run OAuth Helper** in the Homebridge UI which executes the same command.

If `refreshToken` is omitted from your config, the plugin will also trigger this browser flow on the first launch and store the token automatically.
If no browser window appears, copy the authorization link from the logs and open it manually.

### Python helper scripts
The optional `vent_status.py` script reads credentials from the environment variables `FLAIR_CLIENT_ID` and `FLAIR_CLIENT_SECRET` before accessing the API. Install dependencies with `pip install -r requirements.txt`.

### npm proxy warning
If you see `npm warn Unknown env config "http-proxy"` during `npm` commands,
rename your proxy environment variables to `npm_config_proxy` and
`npm_config_https_proxy`. The deprecated `http_proxy` and
`https_proxy` variables trigger this warning in newer npm versions.

## Status
- ✅ OAuth2 refresh token flow with automatic browser capture
- ✅ Compatible with Homebridge UI
- ✅ Stubs for Pucks, Vents, Gateways
- ⏳ Accessory logic in progress

## License
MIT
