// src/features/security/pinUtils.ts

export const createPinSalt = (): string => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const hashPin = async (pin: string, salt: string): Promise<string> => {
  const enc = new TextEncoder();
  const data = enc.encode(pin + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPin = async (pin: string, salt: string, expectedHash: string): Promise<boolean> => {
  const hash = await hashPin(pin, salt);
  return hash === expectedHash;
};
