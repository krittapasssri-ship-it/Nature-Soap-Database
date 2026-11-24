import { google } from 'googleapis';

export const HEADERS = ['orderId', 'createdAt', 'customerName', 'phone', 'address', 'province', 'postalCode', 'items', 'total', 'status', 'tracking'];

export function sheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!raw || !spreadsheetId) throw new Error('Google Sheets ยังไม่ได้ตั้งค่า กรุณาตรวจสอบ GOOGLE_SERVICE_ACCOUNT_JSON และ GOOGLE_SHEET_ID');
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return { sheets: google.sheets({ version: 'v4', auth }), spreadsheetId };
}

export function adminAuthorized(req) {
  const password = process.env.ADMIN_PASSWORD;
  const token = (req.headers.authorization || '').replace(/^Bearer\\s+/i, '');
  return Boolean(password && token && token === password);
}

export function sendError(res, error, status = 500) {
  console.error(error);
  res.status(status).json({ error: error.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง' });
}
