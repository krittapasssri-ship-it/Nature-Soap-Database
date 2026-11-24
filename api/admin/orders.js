import { sheetsClient, adminAuthorized, sendError } from '../_lib/sheets.js';

export default async function handler(req, res) {
  if (!adminAuthorized(req)) return res.status(401).json({ error: 'รหัสผ่านผู้ดูแลไม่ถูกต้อง' });
  const { sheets, spreadsheetId } = (() => { try { return sheetsClient(); } catch (e) { throw e; } })();
  try {
    if (req.method === 'GET') {
      const result = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Orders!A:K' });
      const rows = (result.data.values || []).slice(1).reverse().map(row => ({ orderId: row[0] || '', createdAt: row[1] || '', customerName: row[2] || '', phone: row[3] || '', address: row[4] || '', province: row[5] || '', postalCode: row[6] || '', items: safeItems(row[7]), total: Number(row[8] || 0), status: row[9] || 'รอหยิบสินค้า', tracking: row[10] || '' }));
      return res.status(200).json({ orders: rows });
    }
    if (req.method === 'PATCH') {
      const { orderId, status, tracking = '' } = req.body || {};
      const allowed = ['รอหยิบสินค้า', '拣货中', 'รอแพ็คสินค้า', 'กำลังแพ็ค', 'จัดส่งแล้ว'];
      if (!orderId || !allowed.includes(status)) return res.status(400).json({ error: 'ข้อมูลคำสั่งซื้อไม่ถูกต้อง' });
      const result = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Orders!A:K' });
      const rows = result.data.values || [];
      const index = rows.findIndex((row, i) => i > 0 && row[0] === orderId);
      if (index < 1) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
      await sheets.spreadsheets.values.update({ spreadsheetId, range: `Orders!J${index + 1}:K${index + 1}`, valueInputOption: 'USER_ENTERED', requestBody: { values: [[status, String(tracking).trim().slice(0, 80)]] } });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) { return sendError(res, error, 503); }
}

function safeItems(value) {
  try { const items = JSON.parse(value || '[]'); return Array.isArray(items) ? items : []; }
  catch { return []; }
}
