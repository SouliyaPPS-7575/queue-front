import { isClient } from '~/utils/url';

export const rememberMe = (() => {
  const getRememberMe = () => {
    if (isClient) {
      return localStorage.getItem('rememberMe') || '';
    }
    return ''; // Or some default value for SSR
  };

  const setRememberMe = (rememberMe: string) => {
    if (isClient) {
      localStorage.setItem('rememberMe', rememberMe);
    }
  };

  const removeRememberMe = () => {
    if (isClient) {
      localStorage.removeItem('rememberMe');
    }
  };

  return {
    getRememberMe,
    setRememberMe,
    removeRememberMe,
  };
})();

export const localStorageData = (name: string) => {
  const getLocalStrage = () => {
    if (isClient) {
      return localStorage.getItem(name) || '';
    }
    return ''; // Or some default value for SSR
  };

  const setLocalStorage = (value: string) => {
    if (isClient) {
      localStorage.setItem(name, value);
    }
  };

  const removeLocalStorage = () => {
    if (isClient) {
      localStorage.removeItem(name);
    }
  };

  return {
    getLocalStrage,
    setLocalStorage,
    removeLocalStorage,
  };
};
