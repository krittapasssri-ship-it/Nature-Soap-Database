# Nature Soap — ร้านสบู่แฮนด์เมด

เว็บร้านค้า Nature Soap พร้อมสินค้า 2 SKU, ตะกร้าและเช็กเอาต์เก็บเงินปลายทาง, บันทึกออเดอร์ลง Google Sheets และหน้าแอดมินสำหรับหยิบสินค้า แพ็คสินค้า อัปเดตสถานะ/เลขพัสดุ และพิมพ์ใบจ่าหน้าพัสดุ รูปสินค้า SVG และซอร์สโค้ดอยู่ใน GitHub repository นี้

## ใช้งานในเครื่อง

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง (โดยปกติ `http://localhost:5173`). หน้าแอดมินอยู่ที่ `/admin`.

## ตั้งค่า Google Sheets

1. สร้าง Google Spreadsheet และเพิ่มแท็บชื่อ `Orders`.
2. สร้าง Google Cloud service account เปิด Google Sheets API และแชร์ Spreadsheet ให้กับอีเมล service account ด้วยสิทธิ์ Editor.
3. คัดลอก Spreadsheet ID จาก URL และเตรียม JSON key ของ service account.
4. ตั้ง environment variables ใน Vercel Project Settings → Environment Variables:
   - `GOOGLE_SHEET_ID` — ID ของ Spreadsheet
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — เนื้อหา JSON key ทั้งก้อน (เก็บเป็น secret; ห้ามใส่ใน client code หรือ commit ลง Git)
   - `ADMIN_PASSWORD` — รหัสผ่านผู้ดูแลที่คาดเดายาก
5. Deploy โปรเจกต์นี้บน Vercel แล้วทดสอบสั่งซื้อและเข้า `/admin`.

ระบบจะสร้างแถวหัวตารางอัตโนมัติเมื่อแท็บ `Orders` ว่าง ข้อมูลออเดอร์ประกอบด้วย order ID, เวลา, ข้อมูลผู้รับ, รายการสินค้า, ยอดชำระ, สถานะ และเลขติดตามพัสดุ

## Deploy บน Vercel

นำเข้า repository `krittapasssri-ship-it/Nature-Soap-Database` จากหน้า Vercel → Add New → Project, ตั้ง Environment Variables ด้านบน และกด Deploy. ใช้ค่า build command `npm run build` และ output directory `dist` (Vercel รองรับ Vite โดยอัตโนมัติ). `vercel.json` จัดการ SPA routing และ API functions ให้แล้ว

## จัดการออเดอร์

- ลูกค้าส่งคำสั่งซื้อแบบเก็บเงินปลายทางผ่านแบบฟอร์มจัดส่ง
- เปิด `/admin` และใช้ `ADMIN_PASSWORD` เพื่อเข้าสู่ระบบ
- ตรวจรายการที่ต้องหยิบและต���๊กเช็กสินค้าตาม SKU/จำนวน
- เลือกสถานะ กรอกเลขพัสดุ แล้วกดบันทึกสถานะ
- กด “พิมพ์ใบจ่าหน้า” เพื่อพิมพ์ใบที่อยู่ผู้รับและยอดเก็บเงินปลายทาง

สถานะเริ่มต้นคือ `รอหยิบสินค้า` และเลือกอัปเดตเป็น `รอแพ็คสินค้า`, `กำลังแพ็ค` หรือ `จัดส่งแล้ว` ได้

## หมายเหตุ

- ราคาสินค้าและ SKU ที่ยืนยันโดย server อยู่ใน `src/products.js` เพื่อป้องกันลูกค้าแก้ราคาใน browser
- API และการเชื่อมต่อ Google Sheets ทำงานบน Vercel serverless functions เท่านั้น; ต้องตั้งค่า environment variables และสร้างแท็บ `Orders` ก่อนรับออเดอร์จริง
- ระบบนี้เป็น MVP ร้านค้า ไม่มี payment gateway หรือระบบคิดค่าส่งอัตโนมัติ (หน้าร้านแจ้งว่าค่าส่งคิดตามจริง)
