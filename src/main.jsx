import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, Check, Leaf, Menu, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
import { products } from './products.js';
import './styles.css';

function App() {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [orderDone, setOrderDone] = useState('');
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = useMemo(() => products.reduce((sum, p) => sum + p.price * (cart[p.sku] || 0), 0), [cart]);
  const change = (sku, amount) => setCart(current => {
    const next = { ...current, [sku]: Math.max(0, Math.min(20, (current[sku] || 0) + amount)) };
    if (!next[sku]) delete next[sku];
    return next;
  });

  async function submitOrder(event) {
    event.preventDefault();
    setBusy(true); setNotice('');
    const form = new FormData(event.currentTarget);
    const body = {
      customer: { name: form.get('name'), phone: form.get('phone'), address: form.get('address'), province: form.get('province'), postalCode: form.get('postalCode') },
      items: products.filter(p => cart[p.sku]).map(p => ({ sku: p.sku, quantity: cart[p.sku] }))
    };
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'ไม่สามารถบันทึกคำสั่งซื้อได้');
      setOrderDone(result.orderId); setCart({}); setCheckout(false); setCartOpen(false);
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  return <>
    <div className="announcement"><Leaf size={14} /> สบู่แฮนด์เมดจากธรรมชาติ ส่งฟรีเมื่อช้อปครบ 499 บาท <span>✦</span></div>
    <header className="nav wrap">
      <a className="brand" href="#home"><span className="brand-mark"><Leaf size={22} /></span><span>NATURE SOAP<small>กลับสู่ธรรมชาติของผิว</small></span></a>
      <nav><a href="#story">เรื่องราวของเรา</a><a href="#products">สินค้า</a><a href="#care">ใส่ใจทุกก้อน</a></nav>
      <button className="cart-button" onClick={() => setCartOpen(true)} aria-label="เปิดตะกร้าสินค้า"><ShoppingBag size={19} /><span>ตะกร้า</span><b>{count}</b></button>
    </header>
    <main>
      <section id="home" className="hero wrap">
        <div className="hero-copy"><span className="eyebrow"><Sparkles size={15} /> SMALL BATCH · MADE WITH CARE</span><h1>ผิวที่ดี<br />เริ่มต้นจาก<span>ธรรมชาติ</span></h1><p>ให้ช่วงเวลาอาบน้ำเป็นช่วงเวลาที่อ่อนโยนที่สุด ด้วยสบู่แฮนด์เมดจากส่วนผสมที่เราคัดสรรเพื่อผิวและโลก</p><a className="button primary" href="#products">เลือกสบู่ก้อนโปรด <ArrowRight size={17} /></a><div className="hero-note"><span>✳</span> ผลิตทีละน้อย สดใหม่ทุกก้อน</div></div>
        <div className="hero-art"><div className="sun"></div><img src="/images/rice-honey.svg" alt="สบู่น้ำนมข้าวและน้ำผึ้ง" /><div className="floating-note"><Leaf size={17}/><span>ส่วนผสมจากธรรมชาติ<small>ผิวสัมผัสได้ถึงความใส่ใจ</small></span></div><div className="art-caption">GENTLE CARE, EVERY DAY</div></div>
        <a className="scroll-hint" href="#products"><ArrowDown size={15}/> เลื่อนลงเพื่อค้นพบ</a>
      </section>
      <section className="trust-strip"><div><Leaf/><span>ส่วนผสมจากธรรมชาติ</span></div><div><Sparkles/><span>ทำมืออย่างพิถีพิถัน</span></div><div><Check/><span>อ่อนโยนต่อผิวในทุกวัน</span></div></section>
      <section id="products" className="products-section wrap"><div className="section-heading"><div><span className="eyebrow">OUR LITTLE COLLECTION</span><h2>สิ่งดี ๆ สำหรับผิวคุณ</h2></div><p>เรียบง่าย อ่อนโยน และตั้งใจทำ<br/>เลือกก้อนที่ใช่สำหรับคุณ</p></div><div className="product-grid">{products.map(product => <article className="product-card" key={product.sku}><div className={`product-image ${product.color}`}><span className="product-tag">{product.tag}</span><img src={product.image} alt={product.name}/><span className="image-sku">{product.sku}</span></div><div className="product-info"><div className="product-title"><div><h3>{product.name}</h3><span>{product.subtitle}</span></div><b>฿{product.price}</b></div><p>{product.description}</p><div className="product-buy"><small>{product.weight} · ทำมือ</small><button onClick={() => { change(product.sku, 1); setNotice('เพิ่มสินค้าในตะกร้าแล้ว'); setTimeout(() => setNotice(''), 2000); }}><Plus size={16}/> เพิ่มลงตะกร้า</button></div></div></article>)}</div></section>
      <section id="story" className="story-section"><div className="story-inner wrap"><div className="story-art"><div className="story-circle"><Leaf size={70}/><span>BACK TO<br/>NATURE</span></div><span className="story-stamp">HANDMADE<br/>WITH LOVE</span></div><div className="story-copy"><span className="eyebrow">A LITTLE STORY</span><h2>เราเชื่อว่า<br/>การดูแลผิวควร<span>เรียบง่าย</span></h2><p>Nature Soap เริ่มจากความตั้งใจเล็ก ๆ ที่อยากให้ทุกคนได้สัมผัสการดูแลผิวแบบอ่อนโยน เราคัดเลือกส่วนผสมที่คุ้นเคยจากธรรมชาติ และทำสบู่แต่ละก้อนด้วยมืออย่างตั้งใจ</p><p>ไม่มีอะไรซับซ้อน แค่สิ่งดี ๆ ที่ผิวรู้สึกได้ในทุกวัน</p><a href="#care" className="text-link">รู้จักความใส่ใจของเรา <ArrowRight size={16}/></a></div></div></section>
      <section id="care" className="care-section wrap"><span className="eyebrow">MADE WITH INTENTION</span><h2>ใส่ใจในทุกขั้นตอน</h2><div className="care-grid"><div><span>01</span><h3>เลือกส่วนผสมดี ๆ</h3><p>วัตถุดิบจากธรรมชาติที่คัดสรรอย่างตั้งใจ</p></div><div><span>02</span><h3>ทำมือทีละก้อน</h3><p>ผลิตเป็นล็อตเล็ก เพื่อคุณภาพที่เราดูแลได้</p></div><div><span>03</span><h3>แพ็คด้วยความรัก</h3><p>พร้อมส่งความอ่อนโยนถึงบ้านคุณ</p></div></div><a className="button primary" href="#products">เลือกสบู่ของคุณ <ArrowRight size={17}/></a></section>
    </main>
    <footer><div className="wrap footer-inner"><a className="brand" href="#home"><span className="brand-mark"><Leaf size={22}/></span><span>NATURE SOAP<small>กลับสู่ธรรมชาติของผิว</small></span></a><span>ทำด้วยใจ เพื่อผิวและโลกที่อ่อนโยนขึ้น ♡</span><a href="/admin" className="admin-link">สำหรับผู้ดูแลร้าน</a></div><div className="copyright">© 2026 Nature Soap. Handmade with care.</div></footer>
    {notice && <div className="toast"><Check size={17}/>{notice}</div>}
    {orderDone && <div className="overlay" onClick={() => setOrderDone('')}><div className="modal success-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setOrderDone('')}><X/></button><span className="success-icon"><Check/></span><h2>ขอบคุณสำหรับคำสั่งซื้อ</h2><p>เราได้รับรายการของคุณแล้ว</p><strong>{orderDone}</strong><p className="muted">ชำระเงินปลายทาง · ทีมงานจะรีบแพ็คสินค้าให้ค่ะ</p><button className="button primary" onClick={() => setOrderDone('')}>กลับไปเลือกชมสินค้า</button></div></div>}
    {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">YOUR BAG</span><h2>ตะกร้าของคุณ ({count})</h2></div><button className="close" onClick={() => setCartOpen(false)}><X/></button></div>{count === 0 ? <div className="empty-cart"><ShoppingBag size={34}/><p>ยังไม่มีสินค้าในตะกร้า</p><button className="text-link" onClick={() => setCartOpen(false)}>เลือกสบู่ก้อนโปรด <ArrowRight size={16}/></button></div> : <><div className="cart-items">{products.filter(p => cart[p.sku]).map(p => <div className="cart-row" key={p.sku}><img src={p.image} alt=""/><div className="cart-row-info"><b>{p.name}</b><span>฿{p.price} / ก้อน</span><div className="quantity"><button onClick={() => change(p.sku, -1)}><Minus size={14}/></button><span>{cart[p.sku]}</span><button onClick={() => change(p.sku, 1)}><Plus size={14}/></button></div></div><strong>฿{p.price * cart[p.sku]}</strong></div>)}</div><div className="cart-bottom"><div className="total-line"><span>ยอดรวม</span><b>฿{total}</b></div><small>ค่าจัดส่งคิดตามจริง · ฟรีเมื่อครบ ฿499</small><button className="button primary checkout-button" onClick={() => setCheckout(true)}>กรอกข้อมูลจัดส่ง <ArrowRight size={17}/></button></div></>}</aside></div>}
    {checkout && <div className="overlay" onClick={() => setCheckout(false)}><div className="modal checkout-modal" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">ONE LAST STEP</span><h2>ข้อมูลจัดส่ง</h2></div><button className="close" onClick={() => setCheckout(false)}><X/></button></div><p className="checkout-total">ยอดสินค้า <b>฿{total}</b> <small> · ชำระเงินปลายทาง</small></p><form onSubmit={submitOrder}><label>ชื่อผู้รับ<input name="name" required maxLength="100" placeholder="ชื่อ-นามสกุล"/></label><label>เบอร์โทรศัพท์<input name="phone" required inputMode="tel" pattern="[0-9+() -]{9,20}" placeholder="08X-XXX-XXXX"/></label><label>ที่อยู่จัดส่ง<textarea name="address" required maxLength="500" rows="3" placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต"/></label><div className="form-two"><label>จังหวัด<input name="province" required maxLength="80"/></label><label>รหัสไปรษณีย์<input name="postalCode" required inputMode="numeric" pattern="[0-9]{5}"/></label></div>{notice && <div className="form-error">{notice}</div>}<button className="button primary checkout-button" disabled={busy}>{busy ? 'กำลังบันทึกคำสั่งซื้อ…' : <>ยืนยันคำสั่งซื้อ <ArrowRight size={17}/></>}</button><p className="form-footnote">คำสั่งซื้อจะถูกส่งไปยังร้านเพื่อจัดเตรียมและจัดส่ง</p></form></div></div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
