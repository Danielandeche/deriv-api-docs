let disableDevtoolStarted = false;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export const initDisableDevtool = async () => {
  if (disableDevtoolStarted || typeof window === 'undefined') {
    return;
  }

  if (LOCAL_HOSTS.has(window.location.hostname)) {
    return;
  }

  try {
    const { default: DisableDevtool } = await import('disable-devtool');

    DisableDevtool();
    disableDevtoolStarted = true;
  } catch (error) {
    console.warn('disable-devtool failed to initialise', error);
  }
};
