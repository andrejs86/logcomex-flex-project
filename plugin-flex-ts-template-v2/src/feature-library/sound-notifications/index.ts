import { FeatureDefinition } from '../../types/feature-loader';
import { isFeatureEnabled } from './config';
// @ts-ignore
import hooks from './flex-hooks/**/*.*';

export const register = async (): Promise<FeatureDefinition> => {
  if (!isFeatureEnabled()) return {};

  const atualPermission = window.Notification.permission;

  if (atualPermission !== 'granted') {
    const permission = await window.Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('Permissão negada para notificações');
    }
  }

  return { name: 'sound-notifications', hooks: typeof hooks === 'undefined' ? [] : hooks };
};
