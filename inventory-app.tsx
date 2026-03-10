import { useState, useMemo } from "react";

const ADMIN_PASSWORD = "admin123";
const DEPT_COLOR_OPTIONS = ["#4f86c6","#e07b39","#5aab61","#9b6dbf","#e84393","#0891b2","#b45309","#374151"];
const DEPT_ICON_OPTIONS = ["🧹","🔨","📦","📣","🏗️","🔧","💼","🏭","🚛","🖥️","🌿","🔬"];
const initDeptMeta = { Keepers:{color:"#4f86c6",icon:"🧹"}, Construction:{color:"#e07b39",icon:"🔨"}, Warehouse:{color:"#5aab61",icon:"📦"}, Marketing:{color:"#9b6dbf",icon:"📣"} };
const mk=(b,a,s)=>({building:b,aisle:a,shelf:s});
const initData = {
  Keepers:{"Cleaning Supplies":[{id:1,name:"Mops",qty:8,min:3,loc:mk("Main","A","1"),isTool:false},{id:2,name:"Bleach (1gal)",qty:2,min:5,loc:mk("Main","A","2"),isTool:false},{id:3,name:"Gloves (box)",qty:10,min:4,loc:mk("Main","A","3"),isTool:false},{id:4,name:"Trash Bags (roll)",qty:6,min:5,loc:mk("Main","A","4"),isTool:false}],"Equipment":[{id:5,name:"Buckets",qty:5,min:3,loc:mk("Main","B","1"),isTool:false},{id:6,name:"Ladders",qty:2,min:2,loc:mk("Main","B","2"),isTool:true},{id:7,name:"Brooms",qty:4,min:3,loc:mk("Main","B","3"),isTool:false}],"Safety Gear":[{id:8,name:"Safety Vest",qty:6,min:4,loc:mk("Main","C","1"),isTool:false},{id:9,name:"Hard Hats",qty:3,min:3,loc:mk("Main","C","2"),isTool:true}]},
  Construction:{"Tools":[{id:10,name:"Hammers",qty:7,min:4,loc:mk("Site A","T1","1"),isTool:true},{id:11,name:"Screwdrivers (set)",qty:3,min:3,loc:mk("Site A","T1","2"),isTool:true},{id:12,name:"Tape Measures",qty:5,min:3,loc:mk("Site A","T1","3"),isTool:true},{id:13,name:"Levels",qty:2,min:3,loc:mk("Site A","T1","4"),isTool:true}],"Materials":[{id:14,name:"Lumber (2x4, 8ft)",qty:20,min:10,loc:mk("Site A","M1","1"),isTool:false},{id:15,name:"Screws (box)",qty:4,min:5,loc:mk("Site A","M1","2"),isTool:false},{id:16,name:"Concrete Mix (bag)",qty:6,min:5,loc:mk("Site A","M1","3"),isTool:false}],"Power Equipment":[{id:17,name:"Drill",qty:3,min:2,loc:mk("Site A","P1","1"),isTool:true},{id:18,name:"Circular Saw",qty:1,min:2,loc:mk("Site A","P1","2"),isTool:true}]},
  Warehouse:{"Packaging":[{id:19,name:"Cardboard Boxes (sm)",qty:40,min:20,loc:mk("WH1","P1","1"),isTool:false},{id:20,name:"Cardboard Boxes (lg)",qty:15,min:10,loc:mk("WH1","P1","2"),isTool:false},{id:21,name:"Packing Tape (roll)",qty:8,min:10,loc:mk("WH1","P1","3"),isTool:false},{id:22,name:"Bubble Wrap (roll)",qty:3,min:5,loc:mk("WH1","P1","4"),isTool:false}],"Handling Equipment":[{id:23,name:"Pallet Jacks",qty:2,min:2,loc:mk("WH1","H1","1"),isTool:true},{id:24,name:"Hand Trucks",qty:4,min:3,loc:mk("WH1","H1","2"),isTool:true},{id:25,name:"Strapping Tool",qty:1,min:2,loc:mk("WH1","H1","3"),isTool:true}],"Storage":[{id:26,name:"Shelving Units",qty:10,min:5,loc:mk("WH1","S1","1"),isTool:false},{id:27,name:"Storage Bins",qty:25,min:15,loc:mk("WH1","S1","2"),isTool:false}]},
  Marketing:{"Print Supplies":[{id:28,name:"Printer Paper (ream)",qty:12,min:5,loc:mk("Office","PR","1"),isTool:false},{id:29,name:"Ink Cartridges",qty:2,min:4,loc:mk("Office","PR","2"),isTool:false},{id:30,name:"Brochure Stock (pack)",qty:5,min:3,loc:mk("Office","PR","3"),isTool:false}],"Office Supplies":[{id:31,name:"Pens (box)",qty:6,min:3,loc:mk("Office","OS","1"),isTool:false},{id:32,name:"Notebooks",qty:8,min:5,loc:mk("Office","OS","2"),isTool:false},{id:33,name:"Sticky Notes (pack)",qty:4,min:4,loc:mk("Office","OS","3"),isTool:false}],"Event Materials":[{id:34,name:"Banners",qty:3,min:2,loc:mk("Storage","EV","1"),isTool:false},{id:35,name:"Tablecloths",qty:5,min:3,loc:mk("Storage","EV","2"),isTool:false},{id:36,name:"Popup Display Stand",qty:1,min:1,loc:mk("Storage","EV","3"),isTool:true}]}
};

let nextId = 100;
function uid() { return ++nextId; }
function statusInfo(qty, min) {
  if (qty === 0) return { label:"Out of Stock", color:"#ef4444", bg:"#fef2f2" };
  if (qty < min) return { label:"Low Stock", color:"#f59e0b", bg:"#fffbeb" };
  return { label:"In Stock", color:"#22c55e", bg:"#f0fdf4" };
}

const inp = {width:"100%",padding:"9px 13px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:14,boxSizing:"border-box"};
function mkBtn(bg, c) { return {background:bg, color:c||"#fff", border:"none", borderRadius:8, padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer"}; }

function LocBadge({ loc }) {
  if (!loc || !loc.building) return null;
  return (
    <span style={{fontSize:10,color:"#6366f1",background:"#eef2ff",borderRadius:5,padding:"2px 7px",fontWeight:600}}>
      📍 {loc.building} · Aisle {loc.aisle} · Shelf {loc.shelf}
    </span>
  );
}

function QRImg({ value, size }) {
  const s = size || 80;
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=1e293b&margin=4`} width={s} height={s} alt="QR" style={{display:"block",borderRadius:4}} />;
}

function Avatar({ name, color, size }) {
  const s = size || 34;
  return (
    <div style={{width:s,height:s,borderRadius:"50%",background:color||"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:s*0.44,flexShrink:0}}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{marginBottom:13}}>
      <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>{label}</label>
      {children}
    </div>
  );
}

function ModalShell({ title, onClose, maxW, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16,overflowY:"auto"}}>
      <div style={{background:"#fff",borderRadius:16,padding:24,width:"100%",maxWidth:maxW||400,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DeptForm({ modal, onSave, onClose }) {
  const isEdit = !!modal.dept;
  const [n, setN] = useState(modal.dept || "");
  const [c, setC] = useState(modal.color || DEPT_COLOR_OPTIONS[0]);
  const [ic, setIc] = useState(modal.icon || DEPT_ICON_OPTIONS[0]);
  return (
    <div>
      <Field label="Department Name">
        <input style={inp} value={n} onChange={e => setN(e.target.value)} placeholder="e.g. Maintenance" />
      </Field>
      <Field label="Color">
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {DEPT_COLOR_OPTIONS.map(col => (
            <button key={col} onClick={() => setC(col)} style={{width:30,height:30,borderRadius:"50%",background:col,border:c===col?"3px solid #1e293b":"3px solid transparent",cursor:"pointer"}} />
          ))}
        </div>
      </Field>
      <Field label="Icon">
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {DEPT_ICON_OPTIONS.map(i => (
            <button key={i} onClick={() => setIc(i)} style={{width:34,height:34,borderRadius:8,border:ic===i?"2px solid #6366f1":"2px solid #e2e8f0",background:ic===i?"#eef2ff":"#f8fafc",fontSize:18,cursor:"pointer"}}>{i}</button>
          ))}
        </div>
      </Field>
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <button onClick={onClose} style={{...mkBtn("#f1f5f9","#374151"),flex:1}}>Cancel</button>
        <button onClick={() => onSave(n, c, ic, isEdit ? modal.dept : null)} style={{...mkBtn("#6366f1"),flex:2}}>{isEdit ? "Save Changes" : "Create Department"}</button>
      </div>
    </div>
  );
}

function CatForm({ modal, onSave, onClose }) {
  const isEdit = !!modal.cat;
  const [n, setN] = useState(modal.cat || "");
  return (
    <div>
      <Field label="Category Name">
        <input style={inp} value={n} onChange={e => setN(e.target.value)} placeholder="e.g. Power Tools" />
      </Field>
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <button onClick={onClose} style={{...mkBtn("#f1f5f9","#374151"),flex:1}}>Cancel</button>
        <button onClick={() => onSave(n, isEdit ? modal.cat : null)} style={{...mkBtn("#6366f1"),flex:2}}>{isEdit ? "Rename" : "Add Category"}</button>
      </div>
    </div>
  );
}

function ItemForm({ modal, onSave, onClose }) {
  const isEdit = !!modal.item;
  const it = modal.item || {};
  const [f, setF] = useState({
    name: it.name||"", qty: it.qty!=null?it.qty:0, min: it.min!=null?it.min:0,
    building: it.loc?.building||"", aisle: it.loc?.aisle||"", shelf: it.loc?.shelf||"",
    isTool: it.isTool||false
  });
  function upd(k) {
    return function(e) {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setF(p => ({...p, [k]: val}));
    };
  }
  return (
    <div>
      <Field label="Item Name *">
        <input style={inp} value={f.name} onChange={upd("name")} placeholder="e.g. Safety Goggles" />
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Quantity"><input type="number" min={0} style={inp} value={f.qty} onChange={upd("qty")} /></Field>
        <Field label="Min Stock"><input type="number" min={0} style={inp} value={f.min} onChange={upd("min")} /></Field>
      </div>
      <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>📍 Location</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        <input style={{...inp,fontSize:12}} placeholder="Building" value={f.building} onChange={upd("building")} />
        <input style={{...inp,fontSize:12}} placeholder="Aisle" value={f.aisle} onChange={upd("aisle")} />
        <input style={{...inp,fontSize:12}} placeholder="Shelf" value={f.shelf} onChange={upd("shelf")} />
      </div>
      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,marginBottom:16,cursor:"pointer"}}>
        <input type="checkbox" checked={f.isTool} onChange={upd("isTool")} style={{width:16,height:16}} />
        <span>This is a <strong>Tool</strong> (enables checkout)</span>
      </label>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{...mkBtn("#f1f5f9","#374151"),flex:1}}>Cancel</button>
        <button onClick={() => { if (!f.name.trim()) return; onSave(f); }} style={{...mkBtn("#6366f1"),flex:2}}>{isEdit ? "Save Changes" : "Add Item"}</button>
      </div>
    </div>
  );
}

function EmpForm({ modal, deptList, onSave, onClose }) {
  const isEdit = !!modal.emp;
  const e = modal.emp || {};
  const [f, setF] = useState({ name:e.name||"", dept:e.dept||deptList[0]||"", password:e.password||"", confirm:e.password||"" });
  function upd(k) { return function(ev) { setF(p => ({...p, [k]: ev.target.value})); }; }
  return (
    <div>
      <Field label="Full Name"><input style={inp} value={f.name} onChange={upd("name")} placeholder="Jane Smith" /></Field>
      <Field label="Department">
        <select style={inp} value={f.dept} onChange={upd("dept")}>
          {deptList.map(d => <option key={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Password"><input type="password" style={inp} value={f.password} onChange={upd("password")} /></Field>
      <Field label="Confirm Password"><input type="password" style={inp} value={f.confirm} onChange={upd("confirm")} /></Field>
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <button onClick={onClose} style={{...mkBtn("#f1f5f9","#374151"),flex:1}}>Cancel</button>
        <button onClick={() => onSave(f, isEdit ? modal.emp.id : null)} style={{...mkBtn("#6366f1"),flex:2}}>{isEdit ? "Save Changes" : "Add Employee"}</button>
      </div>
    </div>
  );
}

function ConfirmDialog({ modal, onClose }) {
  return (
    <div>
      <p style={{color:"#64748b",fontSize:14,marginBottom:20}}>{modal.message}</p>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{...mkBtn("#f1f5f9","#374151"),flex:1}}>Cancel</button>
        <button onClick={() => { modal.onConfirm(); onClose(); }} style={{...mkBtn("#ef4444"),flex:1}}>Delete</button>
      </div>
    </div>
  );
}

function PrintCards({ dept, inventory, deptMeta, onBack }) {
  const color = deptMeta[dept]?.color || "#6366f1";
  const icon = deptMeta[dept]?.icon || "📦";
  const allItems = Object.entries(inventory[dept] || {}).flatMap(([cat, items]) => items.map(i => ({...i, cat})));
  return (
    <div style={{fontFamily:"system-ui,sans-serif"}}>
      <div className="no-print" style={{background:"#1e293b",color:"#fff",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontWeight:700}}>🖨️ Print Cards — {icon} {dept}</span>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onBack} style={{background:"transparent",border:"1px solid #334155",color:"#94a3b8",borderRadius:7,padding:"7px 14px",fontSize:13,cursor:"pointer"}}>← Back</button>
          <button onClick={() => window.print()} style={{...mkBtn(color)}}>🖨️ Print</button>
        </div>
      </div>
      <style>{`@media print{.no-print{display:none!important}body{margin:0}}.card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:20px;background:#f1f5f9}`}</style>
      <div className="card-grid">
        {allItems.map(item => {
          const s = statusInfo(item.qty, item.min);
          return (
            <div key={item.id} style={{background:"#fff",borderRadius:10,padding:14,boxShadow:"0 2px 8px rgba(0,0,0,.09)",border:`2px solid ${color}`,pageBreakInside:"avoid",breakInside:"avoid"}}>
              <div style={{background:color,color:"#fff",borderRadius:6,padding:"6px 10px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase"}}>{dept}</span>
                <span style={{fontSize:10,opacity:.85}}>{item.cat}</span>
              </div>
              <div style={{fontWeight:800,fontSize:15,color:"#1e293b",marginBottom:6}}>
                {item.name}
                {item.isTool && <span style={{fontSize:10,background:"#fef3c7",color:"#92400e",borderRadius:4,padding:"1px 5px",marginLeft:6}}>TOOL</span>}
              </div>
              {item.loc?.building && <div style={{fontSize:10,color:"#6366f1",background:"#eef2ff",borderRadius:5,padding:"3px 7px",marginBottom:8,fontWeight:600}}>📍 {item.loc.building} · Aisle {item.loc.aisle} · Shelf {item.loc.shelf}</div>}
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{textAlign:"center"}}><div style={{color:"#94a3b8",fontSize:10}}>CURRENT</div><div style={{fontWeight:800,fontSize:20}}>{item.qty}</div></div>
                <div style={{textAlign:"center"}}><div style={{color:"#94a3b8",fontSize:10}}>MIN</div><div style={{fontWeight:700,fontSize:20,color:"#64748b"}}>{item.min}</div></div>
                <div style={{textAlign:"center"}}><div style={{color:"#94a3b8",fontSize:10}}>STATUS</div><div style={{fontSize:10,fontWeight:700,color:s.color,background:s.bg,borderRadius:5,padding:"3px 6px",marginTop:4}}>{s.label}</div></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,borderTop:"1px dashed #e2e8f0",paddingTop:10}}>
                <QRImg value={`INVENTORY:${dept}:${item.cat}:${item.id}:${item.name}`} size={72} />
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#475569",marginBottom:3}}>📱 Scan to Update Stock</div>
                  <div style={{fontSize:9,color:"#94a3b8",lineHeight:1.4}}>Scan to add, remove, or check out</div>
                  <div style={{fontSize:9,color:"#cbd5e1",marginTop:4,fontFamily:"monospace"}}>ID:{item.id}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemActionScreen({ itemId, inventory, setInventory, setActivityLog, checkouts, setCheckouts, user, deptMeta, setScreen }) {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(null);
  let found = null, foundDept = "", foundCat = "";
  for (const [d, cats] of Object.entries(inventory))
    for (const [c, items] of Object.entries(cats)) {
      const it = items.find(i => i.id === itemId);
      if (it) { found = it; foundDept = d; foundCat = c; }
    }
  if (!found) return <div style={{padding:40,textAlign:"center"}}>Item not found.</div>;
  const s = statusInfo(found.qty, found.min);
  const color = deptMeta[foundDept]?.color || "#6366f1";
  const icon = deptMeta[foundDept]?.icon || "📦";
  const myCheckout = checkouts.find(c => c.itemId === itemId && c.employee === user?.name && !c.returnedAt);
  function logAct(action, q) { setActivityLog(l => [{id:Date.now(),itemId,itemName:found.name,dept:foundDept,action,qty:q,employee:user?.name||"Unknown",date:new Date().toLocaleString()},...l]); }
  function mutate(delta) { setInventory(prev => { const n = JSON.parse(JSON.stringify(prev)); const it = n[foundDept]?.[foundCat]?.find(i => i.id === itemId); if (it) it.qty = Math.max(0, it.qty + delta); return n; }); }
  function adjust(delta) { mutate(delta); logAct(delta > 0 ? "Added" : "Removed", Math.abs(delta)); setDone(delta > 0 ? "added" : "removed"); }
  function checkout() { if (found.qty < qty) { alert("Not enough stock."); return; } mutate(-qty); setCheckouts(p => [{id:Date.now(),itemId,itemName:found.name,dept:foundDept,qty,employee:user?.name,checkedOutAt:new Date().toLocaleString(),returnedAt:null},...p]); logAct("Checked Out", qty); setDone("checkedout"); }
  function returnItem() { mutate(myCheckout.qty); setCheckouts(p => p.map(c => c.id === myCheckout.id ? {...c, returnedAt:new Date().toLocaleString()} : c)); logAct("Returned", myCheckout.qty); setDone("returned"); }

  if (done) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#f1f5f9",fontFamily:"system-ui,sans-serif",padding:24}}>
      <div style={{background:"#fff",borderRadius:16,padding:32,textAlign:"center",maxWidth:340,width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
        <div style={{fontSize:48,marginBottom:12}}>{done==="checkedout"?"🧰":done==="returned"?"✅":"📦"}</div>
        <h2 style={{margin:"0 0 8px"}}>{done==="checkedout"?"Checked Out!":done==="returned"?"Returned!":done==="added"?"Stock Added!":"Stock Removed!"}</h2>
        <p style={{color:"#64748b",fontSize:14}}>{found.name} updated by <strong>{user?.name}</strong></p>
        <button onClick={() => { setDone(null); setQty(1); }} style={{...mkBtn(color),marginTop:16,padding:"11px 28px"}}>Another Action</button>
        <br /><button onClick={() => setScreen("dept")} style={{marginTop:10,background:"transparent",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer"}}>← Back</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f1f5f9",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:color,color:"#fff",padding:"16px 20px"}}>
        <div style={{fontSize:13,opacity:.8}}>{icon} {foundDept} · {foundCat}</div>
        <div style={{fontSize:20,fontWeight:700}}>
          {found.name}
          {found.isTool && <span style={{fontSize:12,background:"rgba(255,255,255,.25)",borderRadius:5,padding:"2px 8px",marginLeft:8}}>TOOL</span>}
        </div>
        {found.loc?.building && <div style={{fontSize:12,opacity:.85,marginTop:3}}>📍 {found.loc.building} · Aisle {found.loc.aisle} · Shelf {found.loc.shelf}</div>}
      </div>
      <div style={{maxWidth:400,margin:"0 auto",padding:20}}>
        <div style={{background:"#fff",borderRadius:12,padding:20,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,.07)",display:"flex",justifyContent:"space-between"}}>
          <div><div style={{fontSize:13,color:"#64748b"}}>Available</div><div style={{fontSize:32,fontWeight:800}}>{found.qty}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:13,color:"#64748b"}}>Min</div><div style={{fontSize:20,fontWeight:600,color:"#475569"}}>{found.min}</div><span style={{fontSize:11,fontWeight:600,color:s.color,background:s.bg,borderRadius:6,padding:"3px 8px"}}>{s.label}</span></div>
        </div>
        {myCheckout && <div style={{background:"#fef3c7",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#92400e"}}>⚠️ You have <strong>{myCheckout.qty}</strong> checked out since {myCheckout.checkedOutAt}</div>}
        <div style={{background:"#eef2ff",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#4338ca"}}>👤 <strong>{user?.name}</strong></div>
        <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:8}}>Quantity</label>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
          <button onClick={() => setQty(q => Math.max(1,q-1))} style={{width:38,height:38,borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:20,cursor:"pointer"}}>−</button>
          <span style={{fontSize:24,fontWeight:700,minWidth:32,textAlign:"center"}}>{qty}</span>
          <button onClick={() => setQty(q => q+1)} style={{width:38,height:38,borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:20,cursor:"pointer"}}>+</button>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <button onClick={() => adjust(qty)} style={{...mkBtn("#22c55e"),flex:1,padding:"12px 0",fontSize:13}}>+ Add</button>
          <button onClick={() => adjust(-qty)} style={{...mkBtn("#ef4444"),flex:1,padding:"12px 0",fontSize:13}}>− Remove</button>
        </div>
        {found.isTool && (
          <div style={{display:"flex",gap:10}}>
            <button onClick={checkout} style={{...mkBtn("#f59e0b"),flex:1,padding:"12px 0",fontSize:13}}>🧰 Check Out</button>
            {myCheckout && <button onClick={returnItem} style={{...mkBtn("#6366f1"),flex:1,padding:"12px 0",fontSize:13}}>↩ Return</button>}
          </div>
        )}
        <button onClick={() => setScreen("dept")} style={{marginTop:14,width:"100%",background:"transparent",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer"}}>← Back</button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [adminTab, setAdminTab] = useState("orders");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([{id:1,name:"Demo User",dept:"Warehouse",password:"demo123"}]);
  const [inventory, setInventory] = useState(initData);
  const [deptMeta, setDeptMeta] = useState(initDeptMeta);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [toolboxes, setToolboxes] = useState([
    {id:1,name:"Construction Kit A",dept:"Construction",items:[{itemId:10,qty:2},{itemId:11,qty:1},{itemId:17,qty:1}],checkedOutBy:null,checkedOutAt:null},
    {id:2,name:"Warehouse Starter",dept:"Warehouse",items:[{itemId:24,qty:1},{itemId:25,qty:1}],checkedOutBy:null,checkedOutAt:null},
  ]);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertLog, setAlertLog] = useState([]);
  const [deptTab, setDeptTab] = useState("inventory");
  const [orderModal, setOrderModal] = useState(null);
  const [orderQty, setOrderQty] = useState(1);
  const [reqForm, setReqForm] = useState({name:"",category:"",reason:"",urgency:"Normal"});
  const [scanItemId, setScanItemId] = useState(null);
  const [toast, setToast] = useState(null);
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [authForm, setAuthForm] = useState({name:"",dept:"",password:"",confirm:""});
  const [formErr, setFormErr] = useState("");
  const [modal, setModal] = useState(null);
  const [showNewTB, setShowNewTB] = useState(false);
  const [newTB, setNewTB] = useState({name:"",dept:"",items:[]});
  const [tbItemSel, setTBItemSel] = useState("");
  const [tbItemQty, setTBItemQty] = useState(1);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3200); }
  function closeModal() { setModal(null); }

  const deptList = Object.keys(inventory);
  const dept = user?.dept;
  const color = deptMeta[dept]?.color || "#6366f1";
  const icon = deptMeta[dept]?.icon || "📦";
  const deptItems = dept ? inventory[dept] : {};
  const cats = Object.keys(deptItems);
  const allItems = useMemo(() => Object.entries(inventory).flatMap(([d,cs]) => Object.entries(cs).flatMap(([c,items]) => items.map(i => ({...i,dept:d,cat:c})))), [inventory]);

  function checkLowStock(inv) { const low=[]; for (const [d,cs] of Object.entries(inv)) for (const items of Object.values(cs)) for (const it of items) if (it.qty < it.min) low.push({dept:d,name:it.name,qty:it.qty,min:it.min}); return low; }
  function triggerAlerts(inv) { if (!alertEmail) return; const low=checkLowStock(inv); if (!low.length) return; setAlertLog(p=>[{id:Date.now(),email:alertEmail,items:low,date:new Date().toLocaleString()},...p]); showToast(`📧 Alert sent to ${alertEmail} for ${low.length} item(s)`); }
  function setInvAndAlert(fn) { setInventory(prev => { const next = fn(prev); triggerAlerts(next); return next; }); }
  function mutateInv(fn) { setInventory(prev => { const n = JSON.parse(JSON.stringify(prev)); fn(n); return n; }); }

  function login() { const acct=accounts.find(a=>a.name.toLowerCase()===authForm.name.toLowerCase()&&a.dept===authForm.dept&&a.password===authForm.password); if(!acct){setFormErr("Invalid name, department, or password.");return;} setUser(acct);setScreen("dept");setDeptTab("inventory");setFormErr(""); }
  function signup() { if(!authForm.name.trim()){setFormErr("Name required.");return;} if(!authForm.dept){setFormErr("Select a department.");return;} if(!authForm.password){setFormErr("Password required.");return;} if(authForm.password!==authForm.confirm){setFormErr("Passwords don't match.");return;} if(accounts.find(a=>a.name.toLowerCase()===authForm.name.toLowerCase()&&a.dept===authForm.dept)){setFormErr("Account already exists.");return;} const acct={id:uid(),name:authForm.name.trim(),dept:authForm.dept,password:authForm.password}; setAccounts(p=>[...p,acct]);setUser(acct);setScreen("dept");setDeptTab("inventory");setFormErr(""); }
  function logout() { setUser(null); setScreen("login"); setAuthForm({name:"",dept:deptList[0]||"",password:"",confirm:""}); }
  function updateStatus(list, setList, id, status) { setList(l => l.map(x => x.id===id ? {...x,status} : x)); }

  function saveDept(name, col, ic, oldName) {
    if (!name) { showToast("Name required"); return; }
    if (oldName) {
      setInventory(prev => { const n={...prev}; if(name!==oldName){n[name]=n[oldName];delete n[oldName];} return n; });
      setDeptMeta(prev => { const n={...prev}; if(name!==oldName){n[name]={color:col,icon:ic};delete n[oldName];}else n[name]={color:col,icon:ic}; return n; });
      setAccounts(p => p.map(a => a.dept===oldName ? {...a,dept:name} : a));
      setToolboxes(p => p.map(t => t.dept===oldName ? {...t,dept:name} : t));
      if (user?.dept===oldName) setUser(u => ({...u,dept:name}));
    } else {
      if (inventory[name]) { showToast("Dept already exists"); return; }
      setInventory(p => ({...p,[name]:{}}));
      setDeptMeta(p => ({...p,[name]:{color:col,icon:ic}}));
    }
    showToast("✅ Department saved"); closeModal();
  }
  function deleteDept(name) { if(Object.values(inventory[name]||{}).flat().length>0){showToast("⚠️ Remove all items first");return;} setInventory(prev=>{const n={...prev};delete n[name];return n;}); setDeptMeta(prev=>{const n={...prev};delete n[name];return n;}); showToast(`🗑 Deleted "${name}"`); }
  function saveCat(d, name, oldCat) { if(!name){showToast("Name required");return;} if(oldCat){mutateInv(n=>{n[d][name]=n[d][oldCat];delete n[d][oldCat];});}else{if(inventory[d][name]){showToast("Category exists");return;} mutateInv(n=>{n[d][name]=[];});} showToast("✅ Category saved"); closeModal(); }
  function deleteCat(d, cat) { if((inventory[d][cat]||[]).length>0){showToast("⚠️ Remove items first");return;} mutateInv(n=>{delete n[d][cat];}); showToast("🗑 Category deleted"); }
  function saveItem(d, cat, f, id) {
    const item = {name:f.name,qty:parseInt(f.qty)||0,min:parseInt(f.min)||0,loc:{building:f.building,aisle:f.aisle,shelf:f.shelf},isTool:f.isTool};
    if (id) { setInvAndAlert(prev=>{const n=JSON.parse(JSON.stringify(prev));const it=n[d][cat].find(i=>i.id===id);if(it)Object.assign(it,item);return n;}); }
    else { mutateInv(n=>{n[d][cat].push({id:uid(),...item});}); }
    showToast("✅ Item saved"); closeModal();
  }
  function deleteItem(d, cat, id) { mutateInv(n=>{n[d][cat]=n[d][cat].filter(i=>i.id!==id);}); showToast("🗑 Item removed"); }
  function saveEmployee(f, id) {
    if (f.password!==f.confirm){showToast("Passwords don't match");return;}
    if (id) { setAccounts(p=>p.map(a=>a.id===id?{...a,name:f.name,dept:f.dept,password:f.password}:a)); if(user?.id===id)setUser(u=>({...u,name:f.name,dept:f.dept})); }
    else { if(accounts.find(a=>a.name.toLowerCase()===f.name.toLowerCase()&&a.dept===f.dept)){showToast("Account exists");return;} setAccounts(p=>[...p,{id:uid(),name:f.name,dept:f.dept,password:f.password}]); }
    showToast("✅ Employee saved"); closeModal();
  }
  function deleteEmployee(id) { setAccounts(p=>p.filter(a=>a.id!==id)); showToast("🗑 Employee removed"); }

  function addTBItem() { const id=parseInt(tbItemSel); if(!id)return; setNewTB(p=>({...p,items:p.items.find(i=>i.itemId===id)?p.items.map(i=>i.itemId===id?{...i,qty:i.qty+tbItemQty}:i):[...p.items,{itemId:id,qty:tbItemQty}]})); setTBItemSel("");setTBItemQty(1); }
  function createToolbox() { if(!newTB.name.trim()||!newTB.items.length)return; setToolboxes(p=>[...p,{id:uid(),...newTB,checkedOutBy:null,checkedOutAt:null}]); setNewTB({name:"",dept:deptList[0]||"",items:[]}); setShowNewTB(false); showToast("🧰 Toolbox created!"); }
  function tbCheckout(tb) { for(const ti of tb.items){const it=allItems.find(i=>i.id===ti.itemId);if(!it||it.qty<ti.qty){showToast(`❌ Not enough ${it?.name||"item"}`);return;}} setInvAndAlert(prev=>{const n=JSON.parse(JSON.stringify(prev));for(const ti of tb.items)for(const cs of Object.values(n))for(const items of Object.values(cs)){const it=items.find(i=>i.id===ti.itemId);if(it)it.qty=Math.max(0,it.qty-ti.qty);}return n;}); setToolboxes(p=>p.map(t=>t.id===tb.id?{...t,checkedOutBy:user.name,checkedOutAt:new Date().toLocaleString()}:t)); setActivityLog(l=>[{id:Date.now(),itemName:`Toolbox: ${tb.name}`,dept:tb.dept,action:"Toolbox Checkout",qty:1,employee:user.name,date:new Date().toLocaleString()},...l]); showToast(`🧰 ${tb.name} checked out!`); }
  function tbReturn(tb) { setInvAndAlert(prev=>{const n=JSON.parse(JSON.stringify(prev));for(const ti of tb.items)for(const cs of Object.values(n))for(const items of Object.values(cs)){const it=items.find(i=>i.id===ti.itemId);if(it)it.qty+=ti.qty;}return n;}); setToolboxes(p=>p.map(t=>t.id===tb.id?{...t,checkedOutBy:null,checkedOutAt:null}:t)); setActivityLog(l=>[{id:Date.now(),itemName:`Toolbox: ${tb.name}`,dept:tb.dept,action:"Toolbox Return",qty:1,employee:user.name,date:new Date().toLocaleString()},...l]); showToast(`↩ ${tb.name} returned!`); }

  const lowStock = checkLowStock(inventory);
  const activeCheckouts = checkouts.filter(c => !c.returnedAt);

  function renderModal() {
    if (!modal) return null;
    const titles = {"dept-form": modal.dept?"Edit Department":"Add Department","cat-form":modal.cat?"Rename Category":"Add Category","item-form":modal.item?"Edit Item":"Add Item","emp-form":modal.emp?"Edit Employee":"Add Employee","confirm":"Confirm Delete"};
    return (
      <ModalShell title={titles[modal.type]||""} onClose={closeModal} maxW={modal.type==="confirm"?340:440}>
        {modal.type==="dept-form" && <DeptForm modal={modal} onSave={saveDept} onClose={closeModal} />}
        {modal.type==="cat-form" && <CatForm modal={modal} onSave={(n,old)=>saveCat(modal.dept,n,old)} onClose={closeModal} />}
        {modal.type==="item-form" && <ItemForm modal={modal} onSave={f=>saveItem(modal.dept,modal.cat,f,modal.item?.id)} onClose={closeModal} />}
        {modal.type==="emp-form" && <EmpForm modal={modal} deptList={deptList} onSave={saveEmployee} onClose={closeModal} />}
        {modal.type==="confirm" && <ConfirmDialog modal={modal} onClose={closeModal} />}
      </ModalShell>
    );
  }

  const Toast = () => toast ? <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#1e293b",color:"#fff",borderRadius:10,padding:"12px 22px",fontSize:14,zIndex:999,boxShadow:"0 4px 20px rgba(0,0,0,.2)"}}>{toast}</div> : null;

  // AUTH
  if (screen==="login" || screen==="signup") {
    const isLogin = screen==="login";
    return (
      <div style={{minHeight:"100vh",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"system-ui,sans-serif"}}>
        <div style={{background:"#1e293b",color:"#fff",borderRadius:16,padding:"32px 36px",maxWidth:420,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,.2)"}}>
          <h1 style={{margin:"0 0 4px",fontSize:24,fontWeight:700}}>📋 Inventory Hub</h1>
          <p style={{color:"#94a3b8",marginBottom:24,fontSize:13}}>{isLogin?"Sign in to your account":"Create a new account"}</p>
          <input placeholder="Full Name" value={authForm.name} onChange={e=>{setAuthForm(p=>({...p,name:e.target.value}));setFormErr("");}} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#fff",fontSize:14,marginBottom:12,boxSizing:"border-box"}} />
          <select value={authForm.dept} onChange={e=>{setAuthForm(p=>({...p,dept:e.target.value}));setFormErr("");}} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#fff",fontSize:14,marginBottom:12,boxSizing:"border-box"}}>
            <option value="">Select Department...</option>
            {deptList.map(d => <option key={d}>{d}</option>)}
          </select>
          <input type="password" placeholder="Password" value={authForm.password} onChange={e=>{setAuthForm(p=>({...p,password:e.target.value}));setFormErr("");}} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#fff",fontSize:14,marginBottom:12,boxSizing:"border-box"}} />
          {!isLogin && <input type="password" placeholder="Confirm Password" value={authForm.confirm} onChange={e=>{setAuthForm(p=>({...p,confirm:e.target.value}));setFormErr("");}} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#fff",fontSize:14,marginBottom:12,boxSizing:"border-box"}} />}
          {formErr && <div style={{color:"#f87171",fontSize:12,marginBottom:10}}>{formErr}</div>}
          <button onClick={isLogin?login:signup} style={{width:"100%",background:"#6366f1",color:"#fff",border:"none",borderRadius:9,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10}}>{isLogin?"Sign In":"Create Account"}</button>
          <button onClick={()=>{setScreen(isLogin?"signup":"login");setFormErr("");}} style={{width:"100%",background:"transparent",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",marginBottom:6}}>{isLogin?"No account? Sign up":"Already have an account? Sign in"}</button>
          <button onClick={()=>setScreen("admin-login")} style={{width:"100%",background:"transparent",border:"none",color:"#475569",fontSize:12,cursor:"pointer"}}>🔐 Admin Panel</button>
        </div>
      </div>
    );
  }

  if (screen==="admin-login") return (
    <div style={{minHeight:"100vh",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:"#fff",borderRadius:16,padding:36,width:340,boxShadow:"0 4px 24px rgba(0,0,0,.1)"}}>
        <h2 style={{margin:"0 0 6px"}}>🔐 Admin Login</h2>
        <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>Password: <strong>admin123</strong></p>
        <input type="password" placeholder="Password" value={adminPass} onChange={e=>{setAdminPass(e.target.value);setAdminErr(false);}} onKeyDown={e=>e.key==="Enter"&&(adminPass===ADMIN_PASSWORD?(setScreen("admin"),setAdminPass(""),setAdminTab("orders")):setAdminErr(true))} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid ${adminErr?"#ef4444":"#e2e8f0"}`,fontSize:14,marginBottom:8,boxSizing:"border-box"}} />
        {adminErr && <p style={{color:"#ef4444",fontSize:12,margin:"0 0 10px"}}>Incorrect password</p>}
        <button onClick={()=>adminPass===ADMIN_PASSWORD?(setScreen("admin"),setAdminPass(""),setAdminTab("orders")):setAdminErr(true)} style={{width:"100%",background:"#1e293b",color:"#fff",border:"none",borderRadius:8,padding:12,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:10}}>Login</button>
        <button onClick={()=>setScreen(user?"dept":"login")} style={{width:"100%",background:"transparent",border:"none",color:"#64748b",fontSize:13,cursor:"pointer"}}>← Back</button>
      </div>
    </div>
  );

  if (screen==="print") return <PrintCards dept={dept} inventory={inventory} deptMeta={deptMeta} onBack={()=>setScreen("dept")} />;
  if (screen==="scan") return <ItemActionScreen itemId={scanItemId} inventory={inventory} setInventory={setInvAndAlert} setActivityLog={setActivityLog} checkouts={checkouts} setCheckouts={setCheckouts} user={user} deptMeta={deptMeta} setScreen={setScreen} />;

  // ADMIN
  if (screen==="admin") {
    const all = [...orders.map(o=>({...o,_type:"Order"})),...requests.map(r=>({...r,_type:"Request"}))].sort((a,b)=>b.id-a.id);
    const pending = all.filter(x=>x.status==="Pending");
    const resolved = all.filter(x=>x.status!=="Pending");
    const TABS = ["orders","structure","inventory","toolboxes","activity","alerts","employees"];
    const TAB_LABELS = {orders:`📋 Orders${pending.length?` (${pending.length})`:""}`,structure:"🏢 Structure",inventory:"🗃️ Inventory",toolboxes:"🧰 Toolboxes",activity:"📊 Activity",alerts:"📧 Alerts",employees:"👥 Employees"};
    return (
      <div style={{minHeight:"100vh",background:"#f1f5f9",fontFamily:"system-ui,sans-serif"}}>
        <Toast />
        {renderModal()}
        <div style={{background:"#1e293b",color:"#fff",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontWeight:700,fontSize:18}}>🔐 Admin Panel</span>
          <button onClick={()=>setScreen(user?"dept":"login")} style={{background:"transparent",border:"1px solid #334155",color:"#94a3b8",borderRadius:7,padding:"7px 14px",fontSize:13,cursor:"pointer"}}>← Exit</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#0f172a"}}>
          {[["📦",allItems.reduce((a,i)=>a+i.qty,0),"Total Items"],["🔴",lowStock.length,"Low Stock"],["🧰",activeCheckouts.length,"Checked Out"],["👥",accounts.length,"Employees"]].map(([ic,v,l]) => (
            <div key={l} style={{padding:"12px 8px",textAlign:"center",borderRight:"1px solid #1e293b"}}>
              <div style={{fontSize:18}}>{ic}</div>
              <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{v}</div>
              <div style={{fontSize:10,color:"#64748b"}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{overflowX:"auto",background:"#fff",borderBottom:"1px solid #e2e8f0"}}>
          <div style={{display:"flex",minWidth:600}}>
            {TABS.map(t => <button key={t} onClick={()=>setAdminTab(t)} style={{flex:1,padding:"11px 6px",border:"none",background:"transparent",fontSize:11,fontWeight:adminTab===t?700:400,color:adminTab===t?"#6366f1":"#64748b",borderBottom:adminTab===t?"2px solid #6366f1":"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>{TAB_LABELS[t]}</button>)}
          </div>
        </div>
        <div style={{maxWidth:800,margin:"0 auto",padding:20}}>

          {adminTab==="orders" && (
            <div>
              <h3 style={{margin:"0 0 12px"}}>Pending ({pending.length})</h3>
              {pending.length===0 && <p style={{color:"#94a3b8",fontSize:14}}>No pending items 🎉</p>}
              {pending.map(x => (
                <div key={x.id} style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,.07)",borderLeft:`4px solid ${deptMeta[x.dept]?.color||"#94a3b8"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><span style={{fontWeight:700,fontSize:14}}>{x._type}: </span><span style={{fontSize:14}}>{x.name||x.item}{x.qty&&<span style={{color:"#64748b"}}> × {x.qty}</span>}</span><div style={{fontSize:12,color:"#64748b",marginTop:3}}>{x.dept} · {x.employee} · {x.date}</div>{x.reason&&<div style={{fontSize:12,color:"#475569",marginTop:3}}>Reason: {x.reason}</div>}</div>
                    <span style={{fontSize:12,fontWeight:600,color:"#f59e0b",background:"#fffbeb",borderRadius:6,padding:"3px 8px"}}>Pending</span>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <button onClick={()=>x._type==="Order"?updateStatus(orders,setOrders,x.id,"Approved"):updateStatus(requests,setRequests,x.id,"Approved")} style={{...mkBtn("#22c55e"),flex:1,padding:"7px 0",fontSize:13}}>✓ Approve</button>
                    <button onClick={()=>x._type==="Order"?updateStatus(orders,setOrders,x.id,"Denied"):updateStatus(requests,setRequests,x.id,"Denied")} style={{...mkBtn("#ef4444"),flex:1,padding:"7px 0",fontSize:13}}>✗ Deny</button>
                  </div>
                </div>
              ))}
              {resolved.length>0 && (
                <div>
                  <h3 style={{margin:"20px 0 12px"}}>Resolved ({resolved.length})</h3>
                  {resolved.map(x => (
                    <div key={x.id} style={{background:"#fff",borderRadius:10,padding:16,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,.07)",borderLeft:`4px solid ${deptMeta[x.dept]?.color||"#94a3b8"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}><div><span style={{fontWeight:700,fontSize:14}}>{x._type}: </span><span style={{fontSize:14}}>{x.name||x.item}</span><div style={{fontSize:12,color:"#64748b",marginTop:3}}>{x.dept} · {x.employee} · {x.date}</div></div><span style={{fontSize:12,fontWeight:600,color:x.status==="Approved"?"#22c55e":"#ef4444",background:x.status==="Approved"?"#f0fdf4":"#fef2f2",borderRadius:6,padding:"3px 8px"}}>{x.status}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {adminTab==="structure" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h3 style={{margin:0}}>Departments, Categories & Items</h3>
                <button onClick={()=>setModal({type:"dept-form"})} style={{...mkBtn("#6366f1"),fontSize:12}}>+ Add Department</button>
              </div>
              {deptList.map(d => {
                const dc = deptMeta[d]?.color||"#6366f1";
                const di = deptMeta[d]?.icon||"📦";
                return (
                  <div key={d} style={{background:"#fff",borderRadius:12,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,.07)",overflow:"hidden"}}>
                    <div style={{background:dc,color:"#fff",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:700,fontSize:15}}>{di} {d}</span>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setModal({type:"cat-form",dept:d})} style={{...mkBtn("rgba(255,255,255,.2)"),fontSize:11,padding:"5px 10px"}}>+ Cat</button>
                        <button onClick={()=>setModal({type:"dept-form",dept:d,color:dc,icon:di})} style={{...mkBtn("rgba(255,255,255,.2)"),fontSize:11,padding:"5px 10px"}}>✏️</button>
                        <button onClick={()=>setModal({type:"confirm",message:`Delete "${d}"? Must have no items.`,onConfirm:()=>deleteDept(d)})} style={{...mkBtn("rgba(239,68,68,.5)"),fontSize:11,padding:"5px 10px"}}>🗑</button>
                      </div>
                    </div>
                    <div style={{padding:"10px 14px"}}>
                      {Object.entries(inventory[d]||{}).map(([cat,items]) => (
                        <div key={cat} style={{marginBottom:12}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <span style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5}}>{cat}</span>
                            <div style={{display:"flex",gap:5}}>
                              <button onClick={()=>setModal({type:"item-form",dept:d,cat})} style={{...mkBtn("#22c55e"),fontSize:10,padding:"3px 8px"}}>+ Item</button>
                              <button onClick={()=>setModal({type:"cat-form",dept:d,cat})} style={{...mkBtn("#f1f5f9","#374151"),fontSize:10,padding:"3px 8px"}}>✏️</button>
                              <button onClick={()=>setModal({type:"confirm",message:`Delete "${cat}"? Must be empty.`,onConfirm:()=>deleteCat(d,cat)})} style={{...mkBtn("#fef2f2","#ef4444"),fontSize:10,padding:"3px 8px"}}>🗑</button>
                            </div>
                          </div>
                          {items.length===0 && <div style={{fontSize:12,color:"#cbd5e1",padding:"4px 0"}}>No items yet</div>}
                          {items.map(it => {
                            const s = statusInfo(it.qty, it.min);
                            return (
                              <div key={it.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",borderRadius:8,marginBottom:4,background:"#f8fafc",borderLeft:`3px solid ${s.color}`}}>
                                <div>
                                  <span style={{fontSize:13,fontWeight:600}}>{it.name}</span>
                                  {it.isTool && <span style={{fontSize:9,background:"#fef3c7",color:"#92400e",borderRadius:3,padding:"1px 4px",marginLeft:5}}>TOOL</span>}
                                  {it.loc?.building && <span style={{fontSize:10,color:"#6366f1",marginLeft:6}}>📍{it.loc.building}/{it.loc.aisle}/{it.loc.shelf}</span>}
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span style={{fontWeight:700,fontSize:15}}>{it.qty}</span>
                                  <span style={{fontSize:10,color:s.color,background:s.bg,borderRadius:4,padding:"2px 5px",fontWeight:600}}>{s.label}</span>
                                  <button onClick={()=>setModal({type:"item-form",dept:d,cat,item:it})} style={{...mkBtn("#f1f5f9","#374151"),fontSize:10,padding:"3px 8px"}}>✏️</button>
                                  <button onClick={()=>setModal({type:"confirm",message:`Delete "${it.name}"?`,onConfirm:()=>deleteItem(d,cat,it.id)})} style={{...mkBtn("#fef2f2","#ef4444"),fontSize:10,padding:"3px 8px"}}>🗑</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      {Object.keys(inventory[d]||{}).length===0 && <div style={{fontSize:12,color:"#cbd5e1",padding:"4px 0"}}>No categories yet</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {adminTab==="inventory" && (
            <div>
              <h3 style={{margin:"0 0 4px"}}>Edit Stock Quantities</h3>
              <p style={{color:"#64748b",fontSize:13,marginBottom:16}}>Click ✏️ to edit any item.</p>
              {lowStock.length>0 && <div style={{background:"#fef3c7",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#92400e"}}>⚠️ {lowStock.length} item(s) below minimum</div>}
              {deptList.map(d => (
                <div key={d} style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:16}}>{deptMeta[d]?.icon}</span><span style={{fontWeight:700,color:deptMeta[d]?.color}}>{d}</span></div>
                  {Object.entries(inventory[d]||{}).map(([cat,items]) => (
                    <div key={cat} style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{cat}</div>
                      {items.map(it => {
                        const s = statusInfo(it.qty, it.min);
                        return (
                          <div key={it.id} style={{background:"#fff",borderRadius:9,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 3px rgba(0,0,0,.06)",borderLeft:`3px solid ${s.color}`}}>
                            <span style={{fontWeight:600,fontSize:13}}>{it.name}{it.isTool&&<span style={{fontSize:9,background:"#fef3c7",color:"#92400e",borderRadius:3,padding:"1px 4px",marginLeft:5}}>TOOL</span>}</span>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontSize:10,color:s.color,fontWeight:600,background:s.bg,borderRadius:5,padding:"2px 6px"}}>{s.label}</span>
                              <span style={{fontWeight:800,fontSize:18,minWidth:28,textAlign:"center"}}>{it.qty}</span>
                              <button onClick={()=>setModal({type:"item-form",dept:d,cat,item:it})} style={{...mkBtn("#f1f5f9","#374151"),fontSize:11,padding:"5px 10px"}}>✏️</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {adminTab==="toolboxes" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h3 style={{margin:0}}>Toolboxes ({toolboxes.length})</h3>
                <button onClick={()=>{setNewTB({name:"",dept:deptList[0]||"",items:[]});setShowNewTB(v=>!v);}} style={{...mkBtn("#6366f1"),fontSize:12}}>+ New Toolbox</button>
              </div>
              {showNewTB && (
                <div style={{background:"#fff",borderRadius:12,padding:20,marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.08)",border:"2px dashed #6366f1"}}>
                  <h4 style={{margin:"0 0 14px"}}>Create New Toolbox</h4>
                  <Field label="Name"><input style={inp} placeholder="Toolbox Name" value={newTB.name} onChange={e=>setNewTB(p=>({...p,name:e.target.value}))} /></Field>
                  <Field label="Department"><select style={inp} value={newTB.dept} onChange={e=>setNewTB(p=>({...p,dept:e.target.value}))}>{deptList.map(d=><option key={d}>{d}</option>)}</select></Field>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <select value={tbItemSel} onChange={e=>setTBItemSel(e.target.value)} style={{...inp,flex:2,fontSize:12}}><option value="">Select item...</option>{allItems.map(i=><option key={i.id} value={i.id}>{i.name} ({i.dept})</option>)}</select>
                    <input type="number" min={1} value={tbItemQty} onChange={e=>setTBItemQty(parseInt(e.target.value)||1)} style={{...inp,width:56,textAlign:"center"}} />
                    <button onClick={addTBItem} style={{...mkBtn("#22c55e"),padding:"9px 12px",fontSize:12}}>+ Add</button>
                  </div>
                  {newTB.items.map(ti => { const it=allItems.find(i=>i.id===ti.itemId); return <div key={ti.itemId} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid #f1f5f9"}}><span>{it?.name}</span><span>{ti.qty} <button onClick={()=>setNewTB(p=>({...p,items:p.items.filter(i=>i.itemId!==ti.itemId)}))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer"}}>✕</button></span></div>; })}
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <button onClick={()=>setShowNewTB(false)} style={{...mkBtn("#f1f5f9","#374151"),flex:1}}>Cancel</button>
                    <button onClick={createToolbox} style={{...mkBtn("#6366f1"),flex:2}}>Create</button>
                  </div>
                </div>
              )}
              {toolboxes.map(tb => (
                <div key={tb.id} style={{background:"#fff",borderRadius:12,padding:16,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,.07)",borderLeft:`4px solid ${deptMeta[tb.dept]?.color||"#6366f1"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div><div style={{fontWeight:700,fontSize:15}}>🧰 {tb.name}</div><div style={{fontSize:12,color:"#64748b"}}>{deptMeta[tb.dept]?.icon} {tb.dept}</div></div>
                    <span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:6,background:tb.checkedOutBy?"#fef3c7":"#f0fdf4",color:tb.checkedOutBy?"#92400e":"#166534"}}>{tb.checkedOutBy?`Out: ${tb.checkedOutBy}`:"Available"}</span>
                  </div>
                  <div style={{marginBottom:10}}>{tb.items.map(ti=>{const it=allItems.find(i=>i.id===ti.itemId);return <span key={ti.itemId} style={{display:"inline-block",fontSize:11,background:"#f1f5f9",borderRadius:5,padding:"2px 8px",margin:"2px 3px 2px 0",color:"#475569"}}>{it?.name||"?"} ×{ti.qty}</span>;})}</div>
                  <button onClick={()=>setModal({type:"confirm",message:`Delete toolbox "${tb.name}"?`,onConfirm:()=>setToolboxes(p=>p.filter(t=>t.id!==tb.id))})} style={{...mkBtn("#fef2f2","#ef4444"),border:"1px solid #fecaca",fontSize:12}}>🗑 Delete</button>
                </div>
              ))}
            </div>
          )}

          {adminTab==="activity" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
                {[["Total Updates",activityLog.length,"#6366f1"],["Active Checkouts",activeCheckouts.length,"#f59e0b"],["Low Stock",lowStock.length,"#ef4444"]].map(([l,v,c]) => (
                  <div key={l} style={{background:"#fff",borderRadius:10,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:12,color:"#64748b"}}>{l}</div></div>
                ))}
              </div>
              {lowStock.length>0 && <div style={{background:"#fef2f2",borderRadius:10,padding:14,marginBottom:16}}><div style={{fontWeight:700,fontSize:14,color:"#ef4444",marginBottom:8}}>🔴 Low / Out of Stock</div>{lowStock.map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:"1px solid #fee2e2"}}><span>{it.name} <span style={{color:"#94a3b8",fontSize:11}}>({it.dept})</span></span><span style={{color:"#ef4444",fontWeight:700}}>{it.qty}/{it.min}</span></div>)}</div>}
              <h3 style={{margin:"0 0 12px"}}>Activity Log</h3>
              {activityLog.length===0 && <p style={{color:"#94a3b8",fontSize:14}}>No activity yet.</p>}
              {activityLog.map(log => (
                <div key={log.id} style={{background:"#fff",borderRadius:10,padding:"11px 14px",marginBottom:7,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
                  <span style={{fontWeight:700,fontSize:13,color:["Added","Returned","Toolbox Return"].includes(log.action)?"#22c55e":["Checked Out","Toolbox Checkout"].includes(log.action)?"#f59e0b":"#ef4444"}}>{log.action}</span>
                  {log.qty && <span style={{fontSize:13}}> ×{log.qty}</span>}
                  <span style={{fontSize:13}}> — {log.itemName}</span>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>👤 {log.employee} · {log.dept} · {log.date}</div>
                </div>
              ))}
            </div>
          )}

          {adminTab==="alerts" && (
            <div>
              <h3 style={{margin:"0 0 4px"}}>📧 Low-Stock Email Alerts</h3>
              <p style={{color:"#64748b",fontSize:13,marginBottom:16}}>Alerts fire when stock drops below minimum after any update.</p>
              <div style={{background:"#fff",borderRadius:12,padding:20,marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
                <Field label="Alert Email Address">
                  <div style={{display:"flex",gap:8}}>
                    <input type="email" placeholder="admin@company.com" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} style={{...inp,flex:1}} />
                    <button onClick={()=>showToast(alertEmail?`✅ Saved: ${alertEmail}`:"Enter an email first")} style={mkBtn("#6366f1")}>Save</button>
                  </div>
                </Field>
                {alertEmail && <div style={{fontSize:12,color:"#22c55e",marginTop:4}}>✅ Active: {alertEmail}</div>}
              </div>
              <button onClick={()=>triggerAlerts(inventory)} style={{...mkBtn("#f59e0b"),marginBottom:20}}>🔔 Test Alert Now</button>
              <h4 style={{margin:"0 0 10px"}}>Alert History ({alertLog.length})</h4>
              {alertLog.length===0 && <p style={{color:"#94a3b8",fontSize:13}}>No alerts yet.</p>}
              {alertLog.map(a => (
                <div key={a.id} style={{background:"#fff",borderRadius:10,padding:14,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,.07)",borderLeft:"4px solid #f59e0b"}}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>📧 Sent to {a.email}</div>
                  <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>{a.date}</div>
                  {a.items.map((it,i) => <div key={i} style={{fontSize:12,color:"#92400e",background:"#fef3c7",borderRadius:5,padding:"3px 8px",marginBottom:4}}>{it.name} ({it.dept}) — {it.qty}/{it.min}</div>)}
                </div>
              ))}
            </div>
          )}

          {adminTab==="employees" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h3 style={{margin:0}}>Employees ({accounts.length})</h3>
                <button onClick={()=>setModal({type:"emp-form"})} style={{...mkBtn("#6366f1"),fontSize:12}}>+ Add Employee</button>
              </div>
              {accounts.map(a => (
                <div key={a.id} style={{background:"#fff",borderRadius:10,padding:"12px 16px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <Avatar name={a.name} color={deptMeta[a.dept]?.color} />
                    <div><div style={{fontWeight:600,fontSize:14}}>{a.name}</div><div style={{fontSize:12,color:"#64748b"}}>{deptMeta[a.dept]?.icon} {a.dept}</div></div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setModal({type:"emp-form",emp:a})} style={{...mkBtn("#f1f5f9","#374151"),fontSize:11,padding:"5px 10px"}}>✏️ Edit</button>
                    <button onClick={()=>setModal({type:"confirm",message:`Remove "${a.name}"?`,onConfirm:()=>deleteEmployee(a.id)})} style={{...mkBtn("#fef2f2","#ef4444"),fontSize:11,padding:"5px 10px"}}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEPT VIEW
  const myCheckouts = checkouts.filter(c => c.employee===user.name && !c.returnedAt);
  const deptToolboxes = toolboxes.filter(tb => tb.dept===dept);
  return (
    <div style={{minHeight:"100vh",background:"#f1f5f9",fontFamily:"system-ui,sans-serif"}}>
      <Toast />
      {renderModal()}
      <div style={{background:color,color:"#fff",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar name={user.name} color="rgba(255,255,255,.25)" />
          <div><div style={{fontWeight:700,fontSize:16}}>{user.name}</div><div style={{fontSize:11,opacity:.8}}>{icon} {dept}</div></div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setScreen("print")} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:7,padding:"6px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>🖨️</button>
          <button onClick={logout} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:7,padding:"6px 10px",fontSize:12,cursor:"pointer"}}>Sign Out</button>
        </div>
      </div>
      <div style={{overflowX:"auto",background:"#fff",borderBottom:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",minWidth:380}}>
          {["inventory","toolboxes","order","request"].map(t => (
            <button key={t} onClick={()=>setDeptTab(t)} style={{flex:1,padding:"12px 6px",border:"none",background:"transparent",fontSize:12,fontWeight:deptTab===t?700:400,color:deptTab===t?color:"#64748b",borderBottom:deptTab===t?`2px solid ${color}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>
              {t==="inventory"?"📊 Inventory":t==="toolboxes"?`🧰 Toolboxes${deptToolboxes.length?` (${deptToolboxes.length})`:""}`:t==="order"?"🛒 Reorder":"✏️ Request"}
            </button>
          ))}
        </div>
      </div>
      {myCheckouts.length>0 && <div style={{background:"#fef3c7",padding:"8px 16px",fontSize:13,color:"#92400e"}}>🧰 You have <strong>{myCheckouts.length}</strong> item(s) checked out</div>}
      <div style={{maxWidth:700,margin:"0 auto",padding:20}}>
        {deptTab==="inventory" && cats.map(cat => (
          <div key={cat} style={{marginBottom:20}}>
            <h3 style={{margin:"0 0 10px",fontSize:14,color:"#64748b",textTransform:"uppercase",letterSpacing:1}}>{cat}</h3>
            {deptItems[cat].map(item => {
              const s = statusInfo(item.qty, item.min);
              return (
                <div key={item.id} style={{background:"#fff",borderRadius:10,padding:"13px 16px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{item.name}{item.isTool&&<span style={{fontSize:10,background:"#fef3c7",color:"#92400e",borderRadius:4,padding:"1px 5px",marginLeft:6}}>TOOL</span>}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4,flexWrap:"wrap"}}><LocBadge loc={item.loc} /></div>
                      <div style={{fontSize:12,color:"#94a3b8",marginTop:3}}>Min: {item.min}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:700,fontSize:18}}>{item.qty}</span>
                      <span style={{fontSize:11,fontWeight:600,color:s.color,background:s.bg,borderRadius:6,padding:"3px 8px"}}>{s.label}</span>
                      <button onClick={()=>{setScanItemId(item.id);setScreen("scan");}} style={{background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,padding:"5px 9px",fontSize:13,cursor:"pointer"}}>📱</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {deptTab==="toolboxes" && (
          <div>
            {deptToolboxes.length===0 && <p style={{color:"#94a3b8",fontSize:14}}>No toolboxes for this department.</p>}
            {deptToolboxes.map(tb => (
              <div key={tb.id} style={{background:"#fff",borderRadius:12,padding:16,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,.07)",borderLeft:`4px solid ${color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><div style={{fontWeight:700,fontSize:15}}>🧰 {tb.name}</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{tb.items.length} item type(s)</div></div>
                  <span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:6,background:tb.checkedOutBy?"#fef3c7":"#f0fdf4",color:tb.checkedOutBy?"#92400e":"#166534"}}>{tb.checkedOutBy?`Out: ${tb.checkedOutBy}`:"Available"}</span>
                </div>
                <div style={{marginBottom:10}}>{tb.items.map(ti=>{const it=allItems.find(i=>i.id===ti.itemId);return <span key={ti.itemId} style={{display:"inline-block",fontSize:11,background:"#f1f5f9",borderRadius:5,padding:"2px 8px",margin:"2px 3px 2px 0",color:"#475569"}}>{it?.name||"?"} ×{ti.qty}</span>;})}</div>
                {tb.checkedOutAt && <div style={{fontSize:11,color:"#94a3b8",marginBottom:8}}>Since: {tb.checkedOutAt}</div>}
                {!tb.checkedOutBy && <button onClick={()=>tbCheckout(tb)} style={{...mkBtn(color),fontSize:13}}>🧰 Check Out</button>}
                {tb.checkedOutBy===user.name && <button onClick={()=>tbReturn(tb)} style={{...mkBtn("#6366f1"),fontSize:13}}>↩ Return</button>}
                {tb.checkedOutBy && tb.checkedOutBy!==user.name && <span style={{fontSize:12,color:"#94a3b8"}}>Checked out by another employee</span>}
              </div>
            ))}
          </div>
        )}

        {deptTab==="order" && cats.map(cat => (
          <div key={cat} style={{marginBottom:20}}>
            <h3 style={{margin:"0 0 10px",fontSize:14,color:"#64748b",textTransform:"uppercase",letterSpacing:1}}>{cat}</h3>
            {deptItems[cat].map(item => {
              const s = statusInfo(item.qty, item.min);
              return (
                <div key={item.id} style={{background:"#fff",borderRadius:10,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{item.name}</div>
                    {item.loc?.building && <div style={{marginTop:3}}><LocBadge loc={item.loc} /></div>}
                    <div style={{fontSize:12,marginTop:3}}><span style={{color:s.color,fontWeight:600}}>{item.qty}</span><span style={{color:"#94a3b8"}}> in stock</span></div>
                  </div>
                  <button onClick={()=>{setOrderModal(item);setOrderQty(1);}} style={{...mkBtn(color),fontSize:13}}>Reorder</button>
                </div>
              );
            })}
          </div>
        ))}

        {deptTab==="request" && (
          <div style={{background:"#fff",borderRadius:12,padding:24,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
            <h3 style={{margin:"0 0 4px",fontSize:16}}>Request a New Item or Tool</h3>
            <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>Fill out the form and an admin will review your request.</p>
            {[{label:"Item / Tool Name *",key:"name",ph:"e.g. Power Drill"},{label:"Category",key:"category",ph:"e.g. Power Equipment"},{label:"Reason",key:"reason",ph:"Why is this needed?"}].map(f => (
              <div key={f.key} style={{marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>{f.label}</label>
                <input placeholder={f.ph} value={reqForm[f.key]} onChange={e=>setReqForm(p=>({...p,[f.key]:e.target.value}))} style={inp} />
              </div>
            ))}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>Urgency</label>
              <select value={reqForm.urgency} onChange={e=>setReqForm(p=>({...p,urgency:e.target.value}))} style={inp}>
                {["Low","Normal","High","Critical"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <button onClick={()=>{if(!reqForm.name.trim())return;setRequests(p=>[{id:uid(),dept,...reqForm,employee:user.name,status:"Pending",date:new Date().toLocaleString()},...p]);showToast("✅ Request submitted!");setReqForm({name:"",category:"",reason:"",urgency:"Normal"});}} style={{...mkBtn(color),width:"100%",padding:"13px 0",fontSize:15,fontWeight:700}}>Submit Request</button>
          </div>
        )}
      </div>

      {orderModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
          <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:380}}>
            <h3 style={{margin:"0 0 4px"}}>Reorder: {orderModal.name}</h3>
            <p style={{color:"#64748b",fontSize:13,marginBottom:16}}>Current: {orderModal.qty} · Min: {orderModal.min}</p>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <button onClick={()=>setOrderQty(q=>Math.max(1,q-1))} style={{width:36,height:36,borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:18,cursor:"pointer"}}>−</button>
              <span style={{fontSize:22,fontWeight:700,minWidth:30,textAlign:"center"}}>{orderQty}</span>
              <button onClick={()=>setOrderQty(q=>q+1)} style={{width:36,height:36,borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:18,cursor:"pointer"}}>+</button>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setOrderModal(null)} style={{...mkBtn("#f1f5f9","#374151"),flex:1}}>Cancel</button>
              <button onClick={()=>{setOrders(p=>[{id:uid(),type:"reorder",dept,item:orderModal.name,qty:orderQty,employee:user.name,status:"Pending",date:new Date().toLocaleString()},...p]);showToast(`✅ Order submitted ×${orderQty}`);setOrderModal(null);setOrderQty(1);}} style={{...mkBtn(color),flex:2}}>Submit Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
