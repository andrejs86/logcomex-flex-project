import { FeatureDefinition } from '../../types/feature-loader';
import { isFeatureEnabled } from './config';
// @ts-ignore
import hooks from './flex-hooks/**/*.*';

export const register = (): FeatureDefinition => {
  if (!isFeatureEnabled()) return {};

  const actualPermission = window.Notification.permission;

  if (actualPermission !== 'granted') {
    window.Notification.requestPermission().then((permission) => {
      if (permission !== 'granted') {
        throw new Error('Permissão negada para notificações');
      }
    });
  }

  return { name: 'sound-notifications', hooks: typeof hooks === 'undefined' ? [] : hooks };
};
