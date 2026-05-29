import type { AppData } from '../../types/models';

export interface BackupPayload {
  appName: string;
  backupVersion: number;
  exportedAt: string;
  appBuild: string;
  data: AppData;
}

export const createBackupPayload = (appData: AppData): BackupPayload => {
  return {
    appName: 'Månadsro',
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    appBuild: '8',
    data: appData,
  };
};

export const validateBackupData = (payload: any): payload is BackupPayload => {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.appName !== 'Månadsro') return false;
  if (typeof payload.backupVersion !== 'number') return false;
  
  const data = payload.data;
  if (!data || typeof data !== 'object') return false;
  
  if (!Array.isArray(data.accounts)) return false;
  if (!Array.isArray(data.transactions)) return false;
  if (!Array.isArray(data.bills)) return false;
  if (!Array.isArray(data.budgets)) return false;
  if (!Array.isArray(data.categories)) return false;
  if (!Array.isArray(data.profiles)) return false;

  return true;
};

export const downloadBackup = (appData: AppData) => {
  const payload = createBackupPayload(appData);
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const filename = `manadsro-backup-${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseBackupFile = (file: File): Promise<BackupPayload> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (validateBackupData(json)) {
          resolve(json);
        } else {
          reject(new Error('Invalid backup format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
};
