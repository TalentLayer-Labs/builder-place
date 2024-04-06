export const isOnRootDomain = (): boolean => {
  const domain = `${window.location.hostname}${
    window.location.port ? ':' + window.location.port : ''
  }`;

  return domain === process.env.NEXT_PUBLIC_ROOT_DOMAIN;
};
