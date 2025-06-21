# Homebridge SE Flair User Guide

This guide walks through installation, configuration, and OAuth setup for the Homebridge SE Flair plugin.

## Installation

Use npm to install the plugin globally:
```bash
sudo npm install -g homebridge-se-flair
```

## Configuration

Add the following to your Homebridge `config.json`:
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
`pollInterval` determines how often device state is refreshed (default `300` seconds). Set the `include*` options to `false` if you want to exclude pucks, vents, or gateways.

## OAuth2 Setup

Run the helper script to start the OAuth flow and automatically capture the refresh token:
```bash
npm run auth-helper
```
If your browser doesn't open automatically, copy the authorization URL printed in the logs and paste it into your browser manually.

When the plugin launches without a stored refresh token, it will trigger the same flow and save the token to `~/.flair-refresh-token`.

## Support
Refer to the README for additional information and troubleshooting steps.
