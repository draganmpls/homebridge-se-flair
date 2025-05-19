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
  "refreshToken": "your-refresh-token",
  "pollInterval": 30
}
```

## OAuth2 Setup
Use the included helper script to generate a refresh token:
```bash
npm run auth-helper
```

You'll be prompted to enter your client ID and secret, and complete a browser-based login. A refresh token will be printed to the console.

## Status
- ✅ OAuth2 refresh token flow
- ✅ Compatible with Homebridge UI
- ✅ Stubs for Pucks, Vents, Gateways
- ⏳ Accessory logic in progress

## License
MIT
# homebridge-se-flair
