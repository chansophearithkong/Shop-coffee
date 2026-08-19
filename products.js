import { collection, addDoc, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const demoProducts = [
 {id:'demo-1',name:'Caramel Latte',category:'Coffee',price:4.5,description:'Smooth espresso, steamed milk and caramel.',image:'/images/caramel-latte.jpg'},
 {id:'demo-2',name:'Cappuccino',category:'Coffee',price:4,description:'Rich espresso with velvety foam.',image:'/images/cappuccino.jpg'},
 {id:'demo-3',name:'Cold Brew',category:'Cold Drinks',price:4.25,description:'Slow-steeped coffee served chilled.',image:'/images/cold-brew.jpg'},
 {id:'demo-4',name:'Chocolate Croissant',category:'Pastry',price:3.5,description:'Buttery pastry with chocolate filling.',image:'/images/chocolate-croissant.jpg'},
 {id:'demo-5',name:'Matcha Latte',category:'Tea',price:4.75,description:'Creamy ceremonial-style matcha latte.',image:'/images/matcha-latte.jpg'},
 {id:'demo-6',name:'Mocha',category:'Coffee',price:4.75,description:'Espresso, chocolate and steamed milk.',image:'/images/mocha.jpg'}
];

const productsRef = () => collection(db,'products');
export async function getProducts(){ if(!db) return JSON.parse(localStorage.getItem('bean-bloom-demo-products')||JSON.stringify(demoProducts)); const snap=await getDocs(query(productsRef(),orderBy('createdAt','desc'))); return snap.docs.map(d=>({id:d.id,...d.data()})); }
export async function createProduct(data){ if(!db){ const items=JSON.parse(localStorage.getItem('bean-bloom-demo-products')||JSON.stringify(demoProducts)); const item={id:'demo-'+Date.now(),...data}; localStorage.setItem('bean-bloom-demo-products',JSON.stringify([item,...items])); return item; } return addDoc(productsRef(),{...data,createdAt:serverTimestamp()}); }
export async function updateProduct(id,data){ if(!db){ const items=JSON.parse(localStorage.getItem('bean-bloom-demo-products')||JSON.stringify(demoProducts)).map(p=>p.id===id?{...p,...data}:p); localStorage.setItem('bean-bloom-demo-products',JSON.stringify(items)); return; } return updateDoc(doc(db,'products',id),data); }
export async function removeProduct(id){ if(!db){ const items=JSON.parse(localStorage.getItem('bean-bloom-demo-products')||JSON.stringify(demoProducts)).filter(p=>p.id!==id); localStorage.setItem('bean-bloom-demo-products',JSON.stringify(items)); return; } return deleteDoc(doc(db,'products',id)); }
