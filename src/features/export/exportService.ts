import type { Transaction, AppData } from '../../types/models';
import { getTransactionDisplay } from '../transactions/transactionService';

const BOM = "\uFEFF";

export function escapeCsvValue(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  
  // If the string contains a semicolon, quote, or newline, it needs to be quoted
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    // Double up any quotes inside the string
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportFilename(prefix: string, extension: string, monthKey?: string): string {
  const dateStr = monthKey ? monthKey : new Date().toISOString().substring(0, 10);
  return `${prefix}-${dateStr}.${extension}`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([BOM + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTransactionSourceLabel(tx: Transaction): string {
  if (tx.type === 'balanceAdjustment') return 'Saldojustering';
  if (tx.type === 'bill' || tx.billId) return 'Räkning';
  if (tx.isRecurring) return 'Återkommande inkomst/utgift';
  return 'Manuell transaktion';
}

export function transactionsToCsv(transactions: Transaction[], appData: AppData): string {
  const headers = [
    'Datum',
    'Typ',
    'Beskrivning',
    'Belopp',
    'Konto',
    'Kategori',
    'Profil',
    'Anteckning',
    'Källa'
  ];
  
  const rows = transactions.map(tx => {
    const display = getTransactionDisplay(tx, appData);
    const source = getTransactionSourceLabel(tx);
    
    return [
      tx.date.substring(0, 10),
      display.typeLabel,
      tx.description,
      tx.amount,
      display.accountName,
      display.categoryName,
      display.profileName,
      tx.comment || '',
      source
    ].map(escapeCsvValue).join(';');
  });
  
  return [headers.join(';'), ...rows].join('\n');
}
