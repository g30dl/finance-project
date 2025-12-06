export const requestPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported in this browser.');
    return 'unsupported';
  }
  const permission = await Notification.requestPermission();
  return permission;
};

export const notify = async (title, options = {}) => {
  const permission = await requestPermission();
  if (permission !== 'granted') return null;
  return new Notification(title, {
    body: options.body,
    icon: options.icon || '/icons/icon-192.png',
  });
};
