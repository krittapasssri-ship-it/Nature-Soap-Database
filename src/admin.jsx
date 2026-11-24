import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, Box, Check, LockKeyhole, PackageCheck, Printer, RefreshCw, Save } from 'lucide-react';
import './styles.css';

const STATUSES = ['รอหยิบสินค้า', 'รอแพ็คสินค้า', 'กำลังแพ็ค', 'จัดส่งแล้ว'];
function Admin() {
  const [password, setPassword] = useState(sessionStorage.getItem('nature_admin') || '');
  const [signedIn, setSignedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(token = password) {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'โหลดรายการไม่สำเร็จ');
      setOrders(data.orders); sessionStorage.setItem('nature_admin', token); setSignedIn(true);
    } catch (e) { setError(e.message); setSignedIn(false); sessionStorage.removeItem('nature_admin'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (password) load(password); }, []);
  async function update(order) {
    setError('');
    try {
      const response = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` }, body: JSON.stringify({ orderId: order.orderId, status: order.status, tracking: order.tracking }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      await load();
    } catch (e) { setError(e.message); }
  }
  function patch(id, field, value) { setOrders(current => current.map(o => o.orderId === id ? { ...o, [field]: value } : o)); }
  if (!signedIn) return <main className="admin-login"><a href="/" className="text-link"><ArrowLeft size={16}/> กลับหน้าร้าน</a><div className="login-card"><span className="brand-mark"><LockKeyhole/></span><span className="eyebrow">NATURE SOAP · ADMIN</span><h1>ระบบจัดการคำสั่งซื้อ</h1><p>เข้าสู่ระบบเพื่อหยิบ แพ็ค และจัดส่งสินค้า</p><form onSubmit={e => { e.preventDefault(); load(); }}><label>รหัสผ่านผู้ดูแล<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required/></label>{error && <div className="form-error">{error}</div>}<button className="button primary checkout-button" disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ…' : <>เข้าสู่ระบบ <ArrowLeft size={16}/></>}</button></form></div></main>;
  return <div className="admin-page"><header className="admin-top"><a className="brand" href="/"><span className="brand-mark"><Box size={21}/></span><span>NATURE SOAP<small>ORDER WORKSPACE</small></span></a><div><button className="button secondary" onClick={() => load()}><RefreshCw size={16}/> รีเฟรช</button><button className="text-link logout" onClick={() => { sessionStorage.removeItem('nature_admin'); setSignedIn(false); setPassword(''); }}>ออกจากระบบ</button></div></header><main className="admin-main"><div className="admin-title"><div><span className="eyebrow">FULFILLMENT</span><h1>จัดการคำสั่งซื้อ</h1><p>หยิบสินค้า · แพ็คสินค้า · พิมพ์ใบจ่าหน้าพัสดุ</p></div><div className="order-count"><PackageCheck/><span><b>{orders.length}</b> คำสั่งซื้อ</span></div></div>{error && <div className="form-error">{error}</div>}{loading && <p>กำลังโหลดรายการ…</p>}{!loading && !orders.length && <div className="admin-empty"><PackageCheck size={38}/><h3>ยังไม่มีคำสั่งซื้อ</h3><p>เมื่อมีลูกค้าสั่งซื้อ รายการจะปรากฏที่นี่</p></div>}<div className="orders-list">{orders.map(order => <article className="order-card" key={order.orderId}><div className="order-head"><div><span className="eyebrow">{order.orderId}</span><h2>{order.customerName}</h2><span className="order-date">{new Date(order.createdAt).toLocaleString('th-TH')}</span></div><span className={`status-pill ${order.status === 'จัดส่งแล้ว' ? 'done' : ''}`}>{order.status}</span></div><div className="order-body"><div className="pick-list"><h3><Check size={16}/> หยิบสินค้า</h3>{order.items.map((item, i) => <label className="pick-row" key={i}><input type="checkbox"/><span>{item.name} <small>{item.sku}</small></span><b>× {item.quantity}</b></label>)}<div className="order-total">ยอดสินค้า <b>฿{order.total}</b> <small>เก็บเงินปลายทาง</small></div></div><div className="ship-to"><h3>ข้อมูลจัดส่ง</h3><p><b>{order.customerName}</b> · {order.phone}</p><p>{order.address} {order.province} {order.postalCode}</p><label>เลขพัสดุ<input value={order.tracking} onChange={e => patch(order.orderId, 'tracking', e.target.value)} placeholder="กรอกเลขติดตามพัสดุ"/></label><label>สถานะ<select value={order.status} onChange={e => patch(order.orderId, 'status', e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label></div></div><div className="order-actions"><button className="button secondary" onClick={() => window.print()}><Printer size={16}/> พิมพ์ใบจ่าหน้า</button><button className="button primary" onClick={() => update(order)}><Save size={16}/> บันทึกสถานะ</button></div><div className="print-label"><div className="label-brand">NATURE SOAP · พัสดุเก็บเงินปลายทาง</div><div className="label-order">ORDER {order.orderId}</div><h2>{order.customerName}</h2><p>{order.address}</p><p>{order.province} {order.postalCode}</p><p className="label-phone">โทร. {order.phone}</p><div className="label-bottom"><span>เลขพัสดุ: {order.tracking || '___________________'}</span><b>เก็บเงิน ฿{order.total}</b></div></div></article>)}</div></main></div>;
}
createRoot(document.getElementById('root')).render(<Admin/>);
