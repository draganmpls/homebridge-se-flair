import { API } from 'homebridge';
import { FlairPlatform } from './platform';

export = (api: API): void => {
  api.registerPlatform('FlairSE', FlairPlatform);
};
