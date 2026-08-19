import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route, Navigate, Link, NavLink, useNavigate} from 'react-router-dom';
import {Coffee, Menu, X, ShoppingBag, User, LogOut, LockKeyhole, Search, Plus, Pencil, Trash2, Mail, MapPin, Clock, ArrowRight, Heart, CheckCircle2, QrCode} from 'lucide-react';
import {auth, db, firebaseReady} from './lib/firebase';

const DEMO_AUTH_KEY = 'bean-bloom-demo-user';
const DEMO_SESSION_KEY = 'bean-bloom-demo-session';
const DEMO_AUTH_EVENT = 'bean-bloom-auth-changed';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail} from 'firebase/auth';
import {collection, getDocs, getDoc, doc} from 'firebase/firestore';
import {getProducts, createProduct, updateProduct, removeProduct, demoProducts} from './lib/products';
import './styles.css';
function ensureSeedAccount(){ try{ if(!localStorage.getItem(DEMO_AUTH_KEY)){ localStorage.setItem(DEMO_AUTH_KEY,JSON.stringify({uid:'demo-admin',email:'admin@beanandbloom.com',name:'Coffee Shop Admin',password:'coffee123'})); } }catch{} }

const money = n => `$${Number(n).toFixed(2)}`;
const Ctx = React.createContext(null);
function BrandMark({size=22}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-18 12 12)"><ellipse cx="12" cy="12" rx="7" ry="9.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 3.5C9.8 6.5 9.8 17.5 12 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></g></svg>}
function BloomBranch(){return <svg viewBox="0 0 380 460" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M70,440 C95,360 55,290 100,225 C138,168 118,110 165,45" stroke="#3F5138" strokeWidth="5" strokeLinecap="round"/>
 <g transform="translate(95,300) rotate(-30)"><path d="M0,0 C14,-22 40,-22 54,0 C40,22 14,22 0,0 Z" fill="#3F5138"/><path d="M2,0 L52,0" stroke="#FAF7F1" strokeWidth="1" opacity="0.5"/></g>
 <g transform="translate(58,228) rotate(15)"><path d="M0,0 C14,-22 40,-22 54,0 C40,22 14,22 0,0 Z" fill="#4C6244"/><path d="M2,0 L52,0" stroke="#FAF7F1" strokeWidth="1" opacity="0.5"/></g>
 <g transform="translate(128,148) rotate(-45)"><path d="M0,0 C12,-19 34,-19 46,0 C34,19 12,19 0,0 Z" fill="#3F5138"/><path d="M2,0 L44,0" stroke="#FAF7F1" strokeWidth="1" opacity="0.5"/></g>
 <circle cx="88" cy="270" r="10" fill="#8C2F39"/><ellipse cx="85" cy="266" rx="3" ry="2" fill="#C97A5C" opacity="0.7"/>
 <circle cx="108" cy="278" r="9" fill="#6E232B"/><ellipse cx="105" cy="274" rx="2.5" ry="1.8" fill="#C97A5C" opacity="0.6"/>
 <circle cx="150" cy="195" r="9" fill="#8C2F39"/><ellipse cx="147" cy="191" rx="2.5" ry="1.8" fill="#C97A5C" opacity="0.7"/>
 <g transform="translate(180,55)">{[0,72,144,216,288].map(a=><ellipse key={a} cx="0" cy="-14" rx="8" ry="14" fill="#FAF7F1" stroke="#B98A42" strokeWidth="1" transform={`rotate(${a})`}/>)}<circle r="6" fill="#B98A42"/></g>
</svg>}
function App(){
 const [user,setUser]=useState(null), [cart,setCart]=useState([]), [open,setOpen]=useState(false), [checkoutOpen,setCheckoutOpen]=useState(false), [products,setProducts]=useState(demoProducts);
 useEffect(()=>{
  if(auth) return onAuthStateChanged(auth,setUser);
  ensureSeedAccount();
  const sync=()=>{ try{ if(!localStorage.getItem(DEMO_SESSION_KEY)){ setUser(null); return; } const acct=JSON.parse(localStorage.getItem(DEMO_AUTH_KEY)||'null'); setUser(acct?{uid:acct.uid,email:acct.email,name:acct.name}:null); }catch{setUser(null)} };
  sync(); window.addEventListener(DEMO_AUTH_EVENT,sync);
  return ()=>window.removeEventListener(DEMO_AUTH_EVENT,sync);
 },[]);
 useEffect(()=>{getProducts().then(setProducts).catch(()=>setProducts(demoProducts));},[]);
 const add=(p)=>setCart(c=>[...c,p]);
 const remove=(i)=>setCart(c=>c.filter((_,x)=>x!==i));
 return <Ctx.Provider value={{user,cart,add,remove,products,setProducts}}><Header open={open} setOpen={setOpen} onCheckout={()=>setCheckoutOpen(true)}/>{open&&<div className="mobile-menu"><NavLinks close={()=>setOpen(false)}/></div>}<main><Routes>
  <Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/menu" element={<MenuPage/>}/><Route path="/contact" element={<Contact/>}/>
  <Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/forgot-password" element={<Forgot/>}/><Route path="/admin" element={<Admin/>}/>
  <Route path="*" element={<Navigate to="/"/>}/></Routes></main><CheckoutModal open={checkoutOpen} onClose={()=>setCheckoutOpen(false)} onComplete={()=>{setCart([]);setCheckoutOpen(false)}}/><CartDrawer/><Footer/></Ctx.Provider>
}
function NavLinks({close=()=>{}}){return <><NavLink onClick={close} to="/">Home</NavLink><NavLink onClick={close} to="/about">About</NavLink><NavLink onClick={close} to="/menu">Menu</NavLink><NavLink onClick={close} to="/contact">Contact</NavLink></>}
function Header({open,setOpen,onCheckout}){const {user,cart}=React.useContext(Ctx); const [cartOpen,setCartOpen]=useState(false); return <><header className="header"><Link className="brand" to="/"><span className="logo"><BrandMark size={20}/></span><span>Bean & Bloom</span></Link><nav className="desktop-nav"><NavLinks/></nav><div className="header-actions"><Link className="icon-btn user-btn" to={user?'/admin':'/login'} title={user?'Dashboard':'Login'}>{user?<User size={19}/>:<LockKeyhole size={19}/>}</Link><button className="icon-btn cart-btn" onClick={()=>setCartOpen(true)}><ShoppingBag size={19}/><b>{cart.length}</b></button><button className="hamb" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header>{cartOpen&&<div className="drawer-overlay" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><h3>Your Cart</h3><button onClick={()=>setCartOpen(false)}><X/></button></div><CartContent onCheckout={onCheckout}/></aside></div>}</>}
function CartDrawer(){return null}
function CartContent({onCheckout}){const {cart,remove}=React.useContext(Ctx); const total=cart.reduce((s,p)=>s+Number(p.price),0); return <div className="cart-content">{cart.length===0?<div className="empty"><ShoppingBag size={42}/><p>Your cart is empty.</p><Link className="btn" to="/menu">Browse Menu</Link></div>:<><div className="cart-list">{cart.map((p,i)=><div className="cart-item" key={i}><img src={p.image}/><div><strong>{p.name}</strong><span>{money(p.price)}</span></div><button onClick={()=>remove(i)}><X size={16}/></button></div>)}</div><div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div><button className="btn full" onClick={()=>{onCheckout();}}>Checkout & Pay</button></>}</div>}
function CheckoutModal({open,onClose,onComplete}){
 const {cart}=React.useContext(Ctx);
 const total=cart.reduce((s,p)=>s+Number(p.price),0);
 const [done,setDone]=useState(false);
 useEffect(()=>{if(open)setDone(false)},[open]);
 if(!open)return null;
 return <div className="checkout-overlay" onClick={onClose}>
   <section className="checkout-modal" onClick={e=>e.stopPropagation()}>
     <button className="checkout-close" onClick={onClose}><X/></button>
     {!done ? <div className="checkout-layout">
       <div className="checkout-summary">
         <span className="eyebrow">Secure checkout</span>
         <h2>Scan & pay</h2>
         <p>Scan the ACLEDA QR code with your banking app to pay for your coffee order.</p>
         <div className="checkout-total"><span>Order total</span><strong>{money(total)}</strong></div>
         <div className="checkout-items">{cart.map((p,i)=><div key={i}><span>{p.name}</span><strong>{money(p.price)}</strong></div>)}</div>
         <div className="payment-note"><QrCode size={18}/><span>After payment, tap “I have completed payment”.</span></div>
       </div>
       <div className="qr-panel">
         <div className="qr-title"><span>ACLEDA BANK</span><small>Scan. Pay Done.</small></div>
         <img src="/images/acleda-qr.png" alt="ACLEDA payment QR code"/>
         <strong>KONG CHANSOPHEARITH</strong>
         <small>Scan this QR code to pay</small>
         <button className="btn full" onClick={()=>setDone(true)}><CheckCircle2 size={17}/> I have completed payment</button>
       </div>
     </div> : <div className="payment-success">
       <div className="success-icon"><CheckCircle2 size={58}/></div>
       <span className="eyebrow">Thank you</span>
       <h2>Payment submitted</h2>
       <p>Your order has been recorded as paid for this demo checkout. Payment is not automatically verified.</p>
       <button className="btn" onClick={onComplete}>Back to menu</button>
     </div>}
   </section>
 </div>
}
function Hero(){return <section className="hero"><div className="hero-copy"><span className="eyebrow">Freshly brewed every day</span><h1>Good coffee.<br/><em>Good moments.</em></h1><p>Handcrafted drinks, warm pastries, and a cozy place to slow down. Your daily cup starts here.</p><div className="hero-buttons"><Link className="btn" to="/menu">Explore Menu <ArrowRight size={17}/></Link><Link className="btn ghost" to="/about">Our Story</Link></div><div className="mini-stats"><span><b>100%</b> Fresh beans</span><span><b>7:00–20:00</b> Daily</span></div></div><div className="hero-art"><div className="bloom-glow"></div><BloomBranch/><span className="art-note">Grown in the Cambodian highlands</span></div></section>}
function Home(){const {products}=React.useContext(Ctx); return <><Hero/><section className="section featured"><div className="section-head"><div><span className="eyebrow">Customer favorites</span><h2>Made for your mood</h2></div><Link to="/menu" className="text-link">View full menu <ArrowRight size={16}/></Link></div><div className="product-grid">{products.slice(0,3).map(p=><ProductCard p={p} key={p.id}/>)}</div></section><section className="story-band"><div className="story-photo"><div className="coffee-circle"><BrandMark size={54}/></div></div><div><span className="eyebrow">Why Bean & Bloom?</span><h2>A little café with a lot of heart.</h2><p>We believe coffee tastes better when it is made with good beans, careful hands, and a welcoming smile. Come in, stay awhile, and make yourself at home.</p><Link to="/about" className="btn ghost dark">Read our story</Link></div></section><section className="section values"><span className="eyebrow">Simple things, done well</span><h2>What we care about</h2><div className="value-grid"><Value icon="☕" title="Quality coffee" text="Freshly roasted beans and carefully balanced recipes."/><Value icon="♡" title="Warm service" text="Friendly faces and a space where everyone belongs."/><Value icon="✦" title="Good energy" text="A calm corner for work, chats, and little celebrations."/></div></section></>}
function Value({icon,title,text}){return <div className="value"><div className="value-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>}
function ProductCard({p,onEdit,onDelete}){const {add}=React.useContext(Ctx); return <article className="product-card"><div className="product-image"><img src={p.image}/><span>{p.category}</span></div><div className="product-info"><div><h3>{p.name}</h3><p>{p.description}</p></div><div className="product-bottom"><strong>{money(p.price)}</strong><button className="add-btn" onClick={()=>add(p)}><Plus size={17}/></button></div>{onEdit&&<div className="admin-actions"><button onClick={()=>onEdit(p)}><Pencil size={15}/> Edit</button><button onClick={()=>onDelete(p.id)}><Trash2 size={15}/> Delete</button></div>}</div></article>}
function MenuPage(){const {products}=React.useContext(Ctx); const [cat,setCat]=useState('All'),[search,setSearch]=useState(''); const cats=['All','Coffee','Cold Drinks','Tea','Pastry']; const shown=products.filter(p=>(cat==='All'||p.category===cat)&&p.name.toLowerCase().includes(search.toLowerCase())); return <section className="section menu-page"><div className="center-head"><span className="eyebrow">Our menu</span><h1>Something delicious<br/>for every moment.</h1><p>From your first coffee of the morning to a sweet afternoon break.</p></div><div className="menu-tools"><div className="pills">{cats.map(c=><button className={cat===c?'active':''} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div><label className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search menu..."/></label></div><div className="product-grid">{shown.map(p=><ProductCard p={p} key={p.id}/>)}</div>{shown.length===0&&<div className="empty"><Coffee size={42}/><p>No items found.</p></div>}</section>}
function About(){return <section className="section about"><div className="split"><div><span className="eyebrow">Our story</span><h1>Born from a love of coffee & community.</h1><p>Bean & Bloom started with one simple idea: create a neighborhood café where excellent coffee and genuine connection come together.</p><p>Our baristas take time with every cup, using thoughtfully selected beans and fresh ingredients. Whether you are meeting a friend, studying, or enjoying five quiet minutes alone, there is a seat for you here.</p><Link to="/menu" className="btn">Taste the menu</Link></div><div className="about-art"><div className="about-card"><BrandMark size={44}/><strong>Since 2024</strong><span>Made with care</span></div></div></div><div className="about-stats"><div><b>6+</b><span>Signature drinks</span></div><div><b>7 days</b><span>Open every week</span></div><div><b>100%</b><span>Good vibes</span></div></div></section>}
function Contact(){return <section className="section contact"><div className="center-head"><span className="eyebrow">Come say hello</span><h1>We'd love to see you.</h1><p>Drop by for a cup, a chat, or a little quiet time.</p></div><div className="contact-grid"><div className="contact-card"><MapPin/><h3>Visit us</h3><p>123 Coffee Street<br/>Phnom Penh, Cambodia</p></div><div className="contact-card"><Clock/><h3>Opening hours</h3><p>Monday – Sunday<br/>7:00 AM – 8:00 PM</p></div><div className="contact-card"><Mail/><h3>Email us</h3><p>hello@beanandbloom.com<br/>+855 12 345 678</p></div></div><form className="contact-form" onSubmit={e=>{e.preventDefault();alert('Thanks! Your message has been received.')}}><h2>Send us a message</h2><div className="form-grid"><input placeholder="Your name" required/><input type="email" placeholder="Email address" required/></div><textarea placeholder="How can we help?" rows="5" required></textarea><button className="btn">Send message</button></form></section>}
function Auth({mode}){const isLogin=mode==='login'; const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[busy,setBusy]=useState(false),[err,setErr]=useState(''); const nav=useNavigate(); const submit=async e=>{e.preventDefault();setBusy(true);setErr(''); try{
 if(!firebaseReady){
   const saved=JSON.parse(localStorage.getItem(DEMO_AUTH_KEY)||'null');
   if(isLogin){
     if(!saved || saved.email.toLowerCase()!==email.toLowerCase() || saved.password!==password) throw new Error('Invalid email or password.');
     localStorage.setItem(DEMO_SESSION_KEY,'1');
   }else{
     if(saved && saved.email.toLowerCase()===email.toLowerCase()) throw new Error('An account with this email already exists.');
     if(password.length<6) throw new Error('Password must be at least 6 characters.');
     localStorage.setItem(DEMO_AUTH_KEY,JSON.stringify({uid:'demo-admin',email,name:name||'Coffee Shop Admin',password}));
     localStorage.setItem(DEMO_SESSION_KEY,'1');
   }
   window.dispatchEvent(new Event(DEMO_AUTH_EVENT)); nav('/admin'); return;
 }
 if(isLogin) await signInWithEmailAndPassword(auth,email,password);
 else await createUserWithEmailAndPassword(auth,email,password);
 nav('/admin');
 }catch(x){setErr(x.message.replace('Firebase: ','').replace(/\s*\(.+\)$/,''));}finally{setBusy(false)}}; return <section className="auth-page"><div className="auth-card"><div className="auth-icon"><BrandMark size={24}/></div><span className="eyebrow">Bean & Bloom</span><h1>{isLogin?'Welcome back':'Create your account'}</h1><p>{isLogin?'Sign in to access your account and dashboard.':'Join us and manage your coffee shop account.'}</p><form onSubmit={submit}>{!isLogin&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/>}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" minLength="6" required/>{err&&<div className="error">{err}</div>}<button className="btn full" disabled={busy}>{busy?'Please wait...':isLogin?'Sign in':'Create account'}</button></form>{isLogin&&<Link className="small-link" to="/forgot-password">Forgot password?</Link>}<p className="switch">{isLogin?'New here?':'Already have an account?'} <Link to={isLogin?'/register':'/login'}>{isLogin?'Create an account':'Sign in'}</Link></p>{isLogin&&!firebaseReady&&<p className="demo-hint">demo admin — admin@beanandbloom.com / coffee123</p>}</div></section>}
function Forgot(){const [email,setEmail]=useState(''),[msg,setMsg]=useState('');const send=async e=>{e.preventDefault();if(!auth){setMsg('Demo mode: connect Firebase in .env to send a real reset email.');return;}try{await sendPasswordResetEmail(auth,email);setMsg('Password reset email sent. Check your inbox.')}catch(x){setMsg(x.message)}};return <section className="auth-page"><div className="auth-card"><div className="auth-icon"><Mail/></div><span className="eyebrow">Account recovery</span><h1>Reset your password</h1><p>Enter your email and we will send a reset link.</p><form onSubmit={send}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required/><button className="btn full">Send reset link</button></form>{msg&&<div className="success">{msg}</div>}<p className="switch"><Link to="/login">Back to sign in</Link></p></div></section>}
function Admin(){const {user,products,setProducts}=React.useContext(Ctx); const [allowed,setAllowed]=useState(false),[checking,setChecking]=useState(true),[editing,setEditing]=useState(null),[form,setForm]=useState({name:'',category:'Coffee',price:'',description:'',image:'/images/caramel-latte.jpg'}); useEffect(()=>{(async()=>{if(!user){setChecking(false);return;} if(!firebaseReady){setAllowed(true);setChecking(false);return;} const s=await getDoc(doc(db,'admins',user.uid));setAllowed(s.exists());setChecking(false);})();},[user]); const logout=async()=>{if(auth) await signOut(auth); else {localStorage.removeItem(DEMO_SESSION_KEY);window.dispatchEvent(new Event(DEMO_AUTH_EVENT));}}; if(checking)return <div className="loading">Checking dashboard access...</div>; if(!user)return <Navigate to="/login"/>; if(!allowed)return <section className="section denied"><LockKeyhole size={45}/><h1>Admin access required</h1><p>Signed in as {user.email}. Add your Firebase Auth UID to the <code>admins</code> collection to enable this dashboard.</p><Link to="/" className="btn">Back to website</Link><button className="text-link logout" onClick={logout}>Sign out</button></section>;
 const save=async e=>{e.preventDefault();const data={...form,price:Number(form.price)};try{if(editing)await updateProduct(editing,data);else await createProduct(data);setProducts(await getProducts());setEditing(null);setForm({name:'',category:'Coffee',price:'',description:'',image:'/images/caramel-latte.jpg'});}catch(x){alert(x.message)}}; const edit=p=>{setEditing(p.id);setForm({name:p.name,category:p.category,price:p.price,description:p.description,image:p.image})}; const del=async id=>{if(confirm('Delete this product?')){await removeProduct(id);setProducts(await getProducts())}}; return <section className="section admin"><div className="admin-head"><div><span className="eyebrow">Management</span><h1>Admin dashboard</h1><p>Manage your menu products with Firebase Firestore.</p></div><button className="btn ghost dark" onClick={logout}><LogOut size={17}/> Sign out</button></div><div className="dashboard-grid"><div className="panel"><div className="panel-head"><h2>{editing?'Edit product':'Add product'}</h2>{editing&&<button onClick={()=>setEditing(null)}>Cancel</button>}</div><form className="product-form" onSubmit={save}><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Product name" required/><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Coffee</option><option>Cold Drinks</option><option>Tea</option><option>Pastry</option></select><input type="number" step="0.01" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Price" required/><input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="Image path or URL"/><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" rows="4"/><button className="btn full">{editing?'Update product':'Add product'}</button></form></div><div className="panel"><div className="panel-head"><h2>Products <span>{products.length}</span></h2></div><div className="admin-products">{products.map(p=><ProductCard p={p} key={p.id} onEdit={edit} onDelete={del}/>)}</div></div></div></section>}
function Footer(){return <footer><div className="footer-main"><Link className="brand" to="/"><span className="logo"><BrandMark size={17}/></span><span>Bean & Bloom</span></Link><p>Good coffee. Good moments. Every day.</p><div className="footer-links"><Link to="/about">About</Link><Link to="/menu">Menu</Link><Link to="/contact">Contact</Link></div></div><div className="footer-bottom"><span>© 2026 Bean & Bloom Coffee</span><span>Made with ☕ in Cambodia</span></div></footer>}

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
