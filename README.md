# CHECKLIST

Aplikasi checklist belanja + catatan pengeluaran rumah tangga.

## Prinsip
- Offline/local-first
- Tanpa login
- Tanpa backend
- Tanpa API berbayar
- Tanpa iklan
- Data disimpan di browser menggunakan localStorage
- Cocok untuk deploy gratis di Vercel/GitHub Pages

## Jalankan lokal

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

## Upload ke GitHub
1. Extract ZIP ini.
2. Masuk ke repo GitHub `CHECKLIST`.
3. Upload semua file dan folder **beserta folder `src` dan `public`**.
4. Commit changes.
5. Di Vercel pilih repo tersebut.
6. Framework: Vite (biasanya terdeteksi otomatis).
7. Build command: `npm run build`
8. Output directory: `dist`

## Catatan
Versi ini adalah fondasi kerja pertama yang sudah mencakup dashboard, checklist belanja, transaksi, history, receipt print/PDF melalui browser, pengaturan budget, backup JSON, responsive desktop/mobile, dan penyimpanan lokal.

Fitur lanjutan seperti IndexedDB/Dexie, import JSON penuh, master item/kategori/alias, fuzzy matching, migration, dan generator PDF native dapat ditambahkan pada iterasi berikutnya tanpa mengubah konsep utama aplikasi.
