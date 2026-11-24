import { products } from '../src/products.js';
import { sheetsClient, HEADERS, sendError } from './_lib/sheets.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { customer, items } = req.body || {};
    if (!customer || !Array.isArray(items) || !items.length || items.length > products.length) return res.status(400).json({ error: 'กรุณาเลือกสินค้าและกรอกข้อมูลจัดส่งให้ครบ' });
    const clean = {
      name: String(customer.name || '').trim().slice(0, 100),
      phone: String(customer.phone || '').trim().slice(0, 20),
      address: String(customer.address || '').trim().slice(0, 500),
      province: String(customer.province || '').trim().slice(0, 80),
      postalCode: String(customer.postalCode || '').trim().slice(0, 5)
    };
    if (!clean.name || !clean.phone || !clean.address || !clean.province || !/^\d{5}$/.test(clean.postalCode)) return res.status(400).json({ error: 'ข้อมูลจัดส่งไม่ครบหรือไม่ถูกต้อง' });
    const verifiedItems = [];
    for (const item of items) {
      const product = products.find(p => p.sku === item.sku);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || verifiedItems.some(i => i.sku === item.sku)) return res.status(400).json({ error: 'รายการสินค้าไม่ถูกต้อง' });
      verifiedItems.push({ sku: product.sku, name: product.name, quantity, price: product.price });
    }
    const total = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `NS${Date.now().toString().slice(-9)}`;
    const { sheets, spreadsheetId } = sheetsClient();
    const range = 'Orders!A:K';
    const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    if (!existing.data.values?.length) await sheets.spreadsheets.values.update({ spreadsheetId, range: 'Orders!A1:K1', valueInputOption: 'RAW', requestBody: { values: [HEADERS] } });
    await sheets.spreadsheets.values.append({ spreadsheetId, range, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', requestBody: { values: [[orderId, new Date().toISOString(), clean.name, clean.phone, clean.address, clean.province, clean.postalCode, JSON.stringify(verifiedItems), total, 'รอหยิบสินค้า', '']] } });
    res.status(201).json({ orderId });
  } catch (error) { sendError(res, error, 503); }
}
