import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Check, ChevronLeft, ChevronRight, CircleDollarSign,
  FileText, History, Home, ListChecks, Menu, Plus, ReceiptText,
  Search, Settings, ShoppingCart, Trash2, X, Download, Upload
} from "lucide-react";

type Item = { id:string; name:string; qty:number; unit:string; done:boolean; price:number };
type Transaction = { id:string; date:string; store:string; items:Item[]; total:number };

const KEY="checklist-data-v1";
const today=()=>new Date().toISOString().slice(0,10);
const money=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);

const seed: {items:Item[]; transactions:Transaction[]; budget:number} = {
  items: [
    {id:"1",name:"BERAS",qty:1,unit:"kg",done:false,price:0},
    {id:"2",name:"TELUR",qty:1,unit:"butir",done:false,price:0},
    {id:"3",name:"MINYAK GORENG",qty:1,unit:"liter",done:false,price:0},
  ],
  transactions: [],
  budget: 1000000
};

function loadData(){
  try { const x=localStorage.getItem(KEY); return x?JSON.parse(x):seed; } catch { return seed; }
}

export default function App(){
  const [data,setData]=useState(loadData);
  const [page,setPage]=useState<"dashboard"|"belanja"|"history"|"receipt"|"settings">("dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [newItem,setNewItem]=useState("");
  const [store,setStore]=useState("");
  const [search,setSearch]=useState("");
  const [toast,setToast]=useState("");

  useEffect(()=>localStorage.setItem(KEY,JSON.stringify(data)),[data]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(""),2200); return()=>clearTimeout(t)},[toast]);

  const spent=data.transactions.reduce((s,t)=>s+t.total,0);
  const month=new Date().toISOString().slice(0,7);
  const monthTx=data.transactions.filter(t=>t.date.startsWith(month));
  const monthSpent=monthTx.reduce((s,t)=>s+t.total,0);
  const remaining=Math.max(data.budget-monthSpent,0);
  const done=data.items.filter(i=>i.done).length;

  function addItem(){
    const name=newItem.trim().toUpperCase();
    if(!name)return;
    setData(d=>({...d,items:[...d.items,{id:crypto.randomUUID(),name,qty:1,unit:"pcs",done:false,price:0}]}));
    setNewItem(""); setToast("Item ditambahkan");
  }
  function toggle(id:string){
    setData(d=>({...d,items:d.items.map(i=>i.id===id?{...i,done:!i.done}:i)}));
  }
  function remove(id:string){
    setData(d=>({...d,items:d.items.filter(i=>i.id!==id)}));
  }
  function updateItem(id:string,patch:Partial<Item>){
    setData(d=>({...d,items:d.items.map(i=>i.id===id?{...i,...patch}:i)}));
  }
  function saveTransaction(){
    const chosen=data.items.filter(i=>i.done);
    if(!chosen.length){setToast("Centang item yang sudah dibeli dulu");return}
    if(!store.trim()){setToast("Isi nama toko dulu");return}
    const txItems=chosen.map(i=>({...i}));
    const total=txItems.reduce((s,i)=>s+i.qty*i.price,0);
    const tx={id:crypto.randomUUID(),date:today(),store:store.trim(),items:txItems,total};
    setData(d=>({...d,transactions:[tx,...d.transactions],items:d.items.filter(i=>!i.done)}));
    setStore(""); setPage("dashboard"); setToast("Belanja berhasil disimpan");
  }
  function exportData(){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="checklist-backup.json"; a.click();
    URL.revokeObjectURL(a.href);
  }
  function resetData(){
    if(confirm("Hapus semua data lokal CHECKLIST?")){setData(seed);setToast("Data direset")}
  }

  const nav=[
    ["dashboard","Dashboard",Home],["belanja","Belanja",ShoppingCart],["history","History",History],["receipt","Receipt",ReceiptText]
  ] as const;

  return <div className="app">
    <aside className={"sidebar "+(collapsed?"collapsed":"")}>
      <div className="brand"><div className="brand-mark">✓</div>{!collapsed&&<div><b>CHECKLIST</b><small>Belanja lebih teratur.</small></div>}</div>
      <nav>{nav.map(([id,label,Icon])=><button key={id} className={page===id?"active":""} onClick={()=>setPage(id)} title={label}><Icon size={20}/>{!collapsed&&<span>{label}</span>}</button>)}</nav>
      <div className="side-bottom">
        <button className={page==="settings"?"active":""} onClick={()=>setPage("settings")}><Settings size={20}/>{!collapsed&&<span>Settings</span>}</button>
        <button onClick={()=>setCollapsed(!collapsed)}>{collapsed?<ChevronRight size={20}/>:<ChevronLeft size={20}/>} {!collapsed&&<span>Ciutkan</span>}</button>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setCollapsed(!collapsed)}><Menu size={22}/></button>
        <div><span className="eyebrow">CHECKLIST</span><h1>{page==="dashboard"?"Ringkasan":page==="belanja"?"Belanja":page==="history"?"History":page==="receipt"?"Receipt":"Settings"}</h1></div>
        <button className="primary small" onClick={()=>setPage("belanja")}><Plus size={18}/> Tambah Belanja</button>
      </header>

      {page==="dashboard"&&<Dashboard budget={data.budget} spent={monthSpent} remaining={remaining} count={monthTx.length} items={data.items} transactions={monthTx} setPage={setPage} money={money}/>}
      {page==="belanja"&&<Shopping items={data.items} newItem={newItem} setNewItem={setNewItem} addItem={addItem} toggle={toggle} remove={remove} updateItem={updateItem} done={done} store={store} setStore={setStore} save={saveTransaction}/>}
      {page==="history"&&<HistoryPage transactions={data.transactions} search={search} setSearch={setSearch} money={money}/>}
      {page==="receipt"&&<Receipt transactions={data.transactions} money={money}/>}
      {page==="settings"&&<SettingsPage budget={data.budget} setBudget={(n)=>setData(d=>({...d,budget:n}))} exportData={exportData} resetData={resetData}/>}
    </main>

    <div className="mobile-nav">{nav.map(([id,label,Icon])=><button key={id} className={page===id?"active":""} onClick={()=>setPage(id)}><Icon size={20}/><span>{label}</span></button>)}</div>
    {toast&&<div className="toast"><Check size={18}/>{toast}</div>}
  </div>
}

function Dashboard(p:any){
  const pct=p.budget?Math.min((p.spent/p.budget)*100,100):0;
  return <section className="content">
    <div className="hero"><div><p className="muted">Bulan ini</p><h2>{money(p.spent)}</h2><p className="muted">Total pengeluaran</p></div><div className="hero-icon"><CircleDollarSign size={30}/></div></div>
    <div className="cards">
      <Stat title="Anggaran" value={money(p.budget)} icon={<BarChart3/>}/>
      <Stat title="Tersisa" value={money(p.remaining)} icon={<CircleDollarSign/>}/>
      <Stat title="Transaksi" value={p.count} icon={<ReceiptText/>}/>
    </div>
    <div className="panel"><div className="panel-head"><div><h3>Progress anggaran</h3><p className="muted">{Math.round(pct)}% terpakai</p></div><b>{money(p.spent)} / {money(p.budget)}</b></div><div className="progress"><span style={{width:pct+"%"}}/></div></div>
    <div className="grid2">
      <div className="panel"><div className="panel-head"><h3>Daftar belanja</h3><button className="text-btn" onClick={()=>p.setPage("belanja")}>Buka</button></div>
        {p.items.length?<div className="mini-list">{p.items.slice(0,5).map((i:Item)=><div className="mini-row" key={i.id}><ListChecks size={18}/><span>{i.name}</span><small>{i.qty} {i.unit}</small></div>)}</div>:<Empty text="Daftar belanja kosong."/>}
      </div>
      <div className="panel"><div className="panel-head"><h3>Belanja terbaru</h3><button className="text-btn" onClick={()=>p.setPage("history")}>Lihat semua</button></div>
        {p.transactions.length?<div className="mini-list">{p.transactions.slice(0,5).map((t:Transaction)=><div className="mini-row" key={t.id}><ReceiptText size={18}/><span>{t.store}<small>{t.date}</small></span><b>{p.money(t.total)}</b></div>)}</div>:<Empty text="Belum ada transaksi."/>}
      </div>
    </div>
  </section>
}
function Stat({title,value,icon}:any){return <div className="stat"><div className="stat-icon">{icon}</div><div><small>{title}</small><strong>{value}</strong></div></div>}
function Empty({text}:any){return <div className="empty">{text}</div>}

function Shopping(p:any){
  return <section className="content">
    <div className="section-head"><div><p className="muted">Checklist aktif</p><h2>{p.done} dari {p.items.length} selesai</h2></div></div>
    <div className="shopping-layout">
      <div className="panel">
        <div className="add-row"><input autoFocus value={p.newItem} onChange={(e:any)=>p.setNewItem(e.target.value)} onKeyDown={(e:any)=>e.key==="Enter"&&p.addItem()} placeholder="Tambah barang, lalu Enter..."/><button className="primary" onClick={p.addItem}><Plus size={18}/>Tambah</button></div>
        <div className="checklist">{p.items.length?p.items.map((i:Item)=><div className={"check-row "+(i.done?"checked":"")} key={i.id}>
          <button className="check" onClick={()=>p.toggle(i.id)}>{i.done&&<Check size={16}/>}</button>
          <div className="item-main"><b>{i.name}</b><div className="item-controls"><input type="number" min="1" value={i.qty} onChange={(e:any)=>p.updateItem(i.id,{qty:Math.max(1,Number(e.target.value))})}/><select value={i.unit} onChange={(e:any)=>p.updateItem(i.id,{unit:e.target.value})}><option>pcs</option><option>kg</option><option>liter</option><option>butir</option><option>pack</option></select></div></div>
          <input className="price" type="number" min="0" value={i.price} onChange={(e:any)=>p.updateItem(i.id,{price:Math.max(0,Number(e.target.value))})} placeholder="Harga"/>
          <button className="icon-btn danger" onClick={()=>p.remove(i.id)}><Trash2 size={17}/></button>
        </div>):<Empty text="Belum ada barang. Tambahkan dari kolom di atas."/>}</div>
      </div>
      <div className="panel checkout"><h3>Simpan belanja</h3><label>Toko / tempat belanja<input value={p.store} onChange={(e:any)=>p.setStore(e.target.value)} placeholder="Contoh: Indomaret"/></label>
        <div className="checkout-total"><span>Total item tercentang</span><b>{p.items.filter((i:Item)=>i.done).reduce((s:number,i:Item)=>s+i.qty*i.price,0).toLocaleString("id-ID")}</b></div>
        <button className="primary wide" onClick={p.save}>Simpan Transaksi</button>
        <p className="hint">Harga diisi per unit. Semua data tersimpan lokal di perangkat ini.</p>
      </div>
    </div>
  </section>
}

function HistoryPage(p:any){
  const filtered=p.transactions.filter((t:Transaction)=>t.store.toLowerCase().includes(p.search.toLowerCase())||t.items.some(i=>i.name.toLowerCase().includes(p.search.toLowerCase())));
  return <section className="content"><div className="section-head"><div><p className="muted">Catatan pengeluaran</p><h2>History belanja</h2></div></div>
    <div className="panel"><div className="search"><Search size={18}/><input value={p.search} onChange={(e:any)=>p.setSearch(e.target.value)} placeholder="Cari toko atau barang..."/></div>
      {filtered.length?<div className="history-list">{filtered.map((t:Transaction)=><div className="history-card" key={t.id}><div><b>{t.store}</b><small>{t.date} · {t.items.length} item</small></div><strong>{p.money(t.total)}</strong></div>)}</div>:<Empty text="Belum ada transaksi yang cocok."/>}
    </div>
  </section>
}

function Receipt(p:any){
  const [selected,setSelected]=useState(p.transactions[0]?.id||"");
  const tx=p.transactions.find((x:Transaction)=>x.id===selected);
  return <section className="content"><div className="section-head"><div><p className="muted">Cetak / simpan</p><h2>Receipt</h2></div><button className="primary small" onClick={()=>window.print()}><Download size={17}/> Print / PDF</button></div>
    <div className="receipt-layout"><div className="panel"><label>Pilih transaksi<select value={selected} onChange={e=>setSelected(e.target.value)}>{p.transactions.map((t:Transaction)=><option key={t.id} value={t.id}>{t.date} — {t.store}</option>)}</select></label><p className="hint">Gunakan dialog Print browser untuk Save as PDF.</p></div>
      <div className="receipt-paper">{tx?<><h3>CHECKLIST</h3><div className="receipt-store">{tx.store}<br/>{tx.date}</div><hr/>{tx.items.map((i:Item)=><div className="receipt-line" key={i.id}><span>{i.name}<small>{i.qty} {i.unit} × {p.money(i.price)}</small></span><b>{p.money(i.qty*i.price)}</b></div>)}<hr/><div className="receipt-total"><span>TOTAL</span><b>{p.money(tx.total)}</b></div></>:<Empty text="Belum ada transaksi untuk ditampilkan."/>}</div>
    </div>
  </section>
}

function SettingsPage(p:any){
  return <section className="content"><div className="section-head"><div><p className="muted">Preferensi lokal</p><h2>Settings</h2></div></div>
    <div className="panel settings"><label>Anggaran bulanan<input type="number" min="0" value={p.budget} onChange={e=>p.setBudget(Math.max(0,Number(e.target.value)))}/></label>
      <div className="setting-row"><div><b>Backup data</b><p className="muted">Simpan seluruh data CHECKLIST sebagai JSON.</p></div><button className="secondary" onClick={p.exportData}><Download size={17}/> Export JSON</button></div>
      <div className="setting-row"><div><b>Import</b><p className="muted">Untuk versi awal, backup dapat dipindahkan antar perangkat secara manual.</p></div><button className="secondary" disabled><Upload size={17}/> Import</button></div>
      <div className="danger-zone"><div><b>Reset semua data</b><p className="muted">Menghapus data lokal dan mengembalikan data awal.</p></div><button className="danger-btn" onClick={p.resetData}><Trash2 size={17}/> Reset</button></div>
    </div>
  </section>
}