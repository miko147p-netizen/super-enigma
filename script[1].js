/* ===== Sweet N Savoury Bakery — Shared JS =====
   Handles: search bar (with recent search persistence),
            review form (with localStorage),
            star rating, toast notifications,
            sticky search hide-on-scroll up
*/

// --- Full searchable catalog (shared across pages) ---
const CATALOG = [
  // Pastries
  {name:"Blueberry Cheesecake", section:"Pastries", page:"pastries.html", price:120, egg:true,
   img:"https://b.zmtcdn.com/data/dish_photos/78e/b7359464f806ee22fd6931f48fa5178e.jpg"},
  {name:"Biscoff Cheesecake", section:"Pastries", page:"pastries.html", price:140, egg:true,
   img:"https://b.zmtcdn.com/data/dish_photos/ece/016662d51cd80bcb9fd4e58f97e12ece.jpg"},
  {name:"Pineapple Pastry", section:"Pastries", page:"pastries.html", price:70, egg:false,
   img:"https://b.zmtcdn.com/data/dish_photos/9f6/5544219fb53ae7b6243647e143b8c9f6.jpeg"},
  {name:"Red Velvet Pastry", section:"Pastries", page:"pastries.html", price:110, egg:true,
   img:"https://b.zmtcdn.com/data/dish_photos/2d8/31fc5c357e707d68df0d3abf9cc802d8.jpeg"},
  {name:"Belgian Chocolate Pastry", section:"Pastries", page:"pastries.html", price:110, egg:true,
   img:"https://b.zmtcdn.com/data/dish_photos/0f8/cba56f8c6ce4d3492b3482943b2300f8.jpeg"},
  {name:"Le Petit Antonie", section:"Pastries", page:"pastries.html", price:150, egg:false,
   img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0G30ERzFKP6GadPuf4qhmEEdxQB75o0sngQ&s"},

  // Cake Bites (500 gm)
  {name:"Belgian Chocolate Truffle", section:"Cake Bites (500 gm)", page:"cake-bites.html", price:450, egg:true,
   img:"https://b.zmtcdn.com/data/dish_photos/433/fa0b1a3b3d14bf2e5e62292e664d6433.jpeg"},
  {name:"Black Forest", section:"Cake Bites (500 gm)", page:"cake-bites.html", price:400, egg:true,
   img:"https://b.zmtcdn.com/data/dish_photos/bcf/8eb2c55d7ce5adca87fca1c95ec17bcf.jpeg"},
  {name:"Pineapple", section:"Cake Bites (500 gm)", page:"cake-bites.html", price:350, egg:false,
   img:"https://b.zmtcdn.com/data/dish_photos/0fb/a1fba4703c821c7cbd55f1eea0d920fb.jpeg"},
  {name:"Mango", section:"Cake Bites (500 gm)", page:"cake-bites.html", price:380, egg:false,
   img:"https://b.zmtcdn.com/data/dish_photos/9d9/5a7e7c0b45e28e13b4dea0ab8ebf69d9.jpg"},
  {name:"Red Velvet", section:"Cake Bites (500 gm)", page:"cake-bites.html", price:450, egg:true,
   img:"https://b.zmtcdn.com/data/dish_photos/fa7/0f36b484c761695b20d2577fabcccfa7.jpeg"},

  // Specials
  {name:"Cup Cake", section:"Specials", page:"specials.html", price:60, egg:false,
   img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR4GoMzJcayotcVt0eU3DSIkwB1Sl2oLgDkA&s"},
  {name:"Jar Cake", section:"Specials", page:"specials.html", price:180, egg:true,
   img:"https://www.dreamadozen.com/cdn/shop/files/mixedberryjar_5bdfe16d-354b-4b40-b2a7-9cdd626d879b.jpg"},
  {name:"Brownie", section:"Specials", page:"specials.html", price:90, egg:false,
   img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9uYA2164dty-nkTec-yj1TF32DE1p9yYQ3w&s"},
  {name:"Dry Cake", section:"Specials", page:"specials.html", price:200, egg:false,
   img:"https://b.zmtcdn.com/data/dish_photos/47d/324ff2830373b76ee1a44a08ccca947d.jpeg"},
  {name:"Veg Puff", section:"Specials", page:"specials.html", price:40, egg:false,
   img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS7p8IOuO1OLqRV1JvcvX4vRuroM-Vb_WSrg&s"},
  {name:"Macarons", section:"Specials", page:"specials.html", price:80, egg:false,
   img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxr9y4NCH4gpWFAi_V38qLCao_oxa0GnGm8Q&s"},
  {name:"Donuts", section:"Specials", page:"specials.html", price:70, egg:false,
   img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjoS4ADknRwFrZJwWdrwTZbEDrmEIS1jj7Eg&s"},
];

// ---------- Toast ----------
function toast(msg){
  let t = document.getElementById('snb-toast');
  if(!t){
    t = document.createElement('div');
    t.id='snb-toast';t.className='toast';document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(()=>t.classList.remove('show'), 2400);
}

// ---------- Search ----------
const RECENT_KEY = 'snb_recent_v1';
function getRecent(){
  try{ return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }catch{ return []; }
}
function pushRecent(term){
  if(!term || term.trim().length<2) return;
  const list = getRecent().filter(x => x.toLowerCase() !== term.toLowerCase());
  list.unshift(term.trim());
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0,6)));
}

function renderResults(query){
  const wrap = document.getElementById('searchResults');
  if(!wrap) return;
  const q = (query||'').trim().toLowerCase();
  const recent = getRecent();

  // No query -> show recent suggestions / popular
  if(!q){
    let html = '';
    if(recent.length){
      html += `<div class="recent"><small>Recent:</small>` +
        recent.map(r=>`<span class="recent-chip" data-q="${r}">${r}</span>`).join('') +
        `</div>`;
      // Show top match for the most recent term
      const last = recent[0].toLowerCase();
      const hits = CATALOG.filter(i=>i.name.toLowerCase().includes(last)).slice(0,4);
      if(hits.length){
        html += hits.map(renderResultRow).join('');
      }
    } else {
      html += `<div class="search-empty">Try searching: <b>black forest</b>, <b>red velvet</b>, <b>brownie</b>…</div>`;
    }
    wrap.innerHTML = html;
    wrap.classList.add('open');
    bindChips();
    return;
  }

  const matches = CATALOG.filter(i =>
    i.name.toLowerCase().includes(q) || i.section.toLowerCase().includes(q)
  );
  if(!matches.length){
    wrap.innerHTML = `<div class="search-empty">No results for "<b>${escapeHtml(query)}</b>". Try Pastries, Cake Bites, or Specials.</div>`;
  } else {
    wrap.innerHTML = matches.map(renderResultRow).join('');
  }
  wrap.classList.add('open');
}
function renderResultRow(i){
  return `<a href="${i.page}" class="search-result">
    <img src="${i.img}" alt="${escapeHtml(i.name)}" loading="lazy">
    <div class="meta"><strong>${escapeHtml(i.name)}</strong><small>${i.section}</small></div>
    <span class="price">₹${i.price}</span>
  </a>`;
}
function bindChips(){
  document.querySelectorAll('.recent-chip').forEach(c=>{
    c.addEventListener('click', ()=>{
      const q = c.dataset.q;
      const input = document.getElementById('searchInput');
      if(input){ input.value = q; input.focus(); renderResults(q); }
    });
  });
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

function initSearch(){
  const input = document.getElementById('searchInput');
  const wrap = document.getElementById('searchResults');
  const sticky = document.getElementById('searchSticky');
  if(!input) return;

  input.addEventListener('focus', ()=> renderResults(input.value));
  input.addEventListener('input', ()=> renderResults(input.value));
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter'){
      pushRecent(input.value);
      renderResults(input.value);
      toast('Saved to your recent searches');
    }
    if(e.key==='Escape'){ wrap.classList.remove('open'); input.blur(); }
  });
  document.addEventListener('click', e=>{
    if(!e.target.closest('.search-wrap')) wrap.classList.remove('open');
  });

  // Sticky search: hide on scroll-down, show on scroll-up, hide at very top
  let lastY = window.scrollY;
  const heroThreshold = 380;
  function onScroll(){
    const y = window.scrollY;
    if(!sticky) return;
    if(y < heroThreshold){
      sticky.classList.add('hidden');
    } else if(y > lastY + 6){
      sticky.classList.add('hidden');
    } else if(y < lastY - 6){
      sticky.classList.remove('hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
}

// ---------- Reviews ----------
const REVIEW_KEY = 'snb_reviews_v1';
const SEED_REVIEWS = [
  {name:"Aarav Sharma", date:"Mar 2026", rating:5, color:"#E8A0BF",
   text:"Their Belgian Chocolate Truffle is unreal — clearly five-star hotel quality at a fraction of the price. The Naan Khatai is the best I've had in NCR. Highly recommended."},
  {name:"Priya Verma", date:"Feb 2026", rating:5, color:"#D4A24C",
   text:"Ordered a custom red velvet for my husband's birthday. Beautiful presentation, moist crumb, perfectly balanced cream cheese. They genuinely care about quality."},
  {name:"Rohit Mehta", date:"Jan 2026", rating:4, color:"#7BAE7F",
   text:"Macarons are crisp on the outside, chewy inside — exactly how they should be. The Biscoff cheesecake jar is addictive. Service is warm and quick."},
  {name:"Sneha Kapoor", date:"Dec 2025", rating:5, color:"#C2185B",
   text:"Hidden gem in Bisrakh! Their veg puffs are flaky and hot, and the Le Petit Antonie pastry is a must-try. Pricing is very fair for the quality."},
];
function getReviews(){
  try{ return JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]'); }catch{ return []; }
}
function saveReview(r){
  const all = getReviews();
  all.unshift(r);
  localStorage.setItem(REVIEW_KEY, JSON.stringify(all.slice(0,30)));
}
const palette = ["#E8A0BF","#D4A24C","#7BAE7F","#C2185B","#8B4513","#A8C4A2"];
function renderReviewCard(r){
  const initials = r.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5-r.rating);
  return `<article class="review">
    <div class="review-head">
      <div class="avatar" style="background:${r.color||palette[0]}">${initials}</div>
      <div class="review-meta"><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.date||'')}</small></div>
      <div class="stars">${stars}</div>
    </div>
    <p>${escapeHtml(r.text)}</p>
  </article>`;
}
function initReviews(){
  const list = document.getElementById('reviewList');
  if(!list) return;
  const user = getReviews();
  const all = [...user, ...SEED_REVIEWS];
  list.innerHTML = all.map(renderReviewCard).join('');

  // Star rating
  let rating = 5;
  const rateEl = document.getElementById('rate');
  if(rateEl){
    rateEl.querySelectorAll('span').forEach((s,i)=>{
      s.addEventListener('click', ()=>{
        rating = i+1;
        rateEl.querySelectorAll('span').forEach((x,j)=> x.classList.toggle('on', j<rating));
      });
    });
    rateEl.querySelectorAll('span').forEach((x,j)=> x.classList.toggle('on', j<rating));
  }

  // Form submission
  const form = document.getElementById('reviewForm');
  if(form){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name')||'').toString().trim();
      const email = (fd.get('email')||'').toString().trim();
      const text = (fd.get('text')||'').toString().trim();
      if(!name || !email || !text){ toast('Please fill all fields'); return; }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ toast('Enter a valid email'); return; }
      const color = palette[Math.floor(Math.random()*palette.length)];
      const d = new Date();
      const date = d.toLocaleString('en-US',{month:'short',year:'numeric'});
      saveReview({name, text, rating, color, date});
      form.reset();
      rating = 5;
      rateEl?.querySelectorAll('span').forEach((x,j)=> x.classList.toggle('on', j<rating));
      initReviews();
      toast('Thanks for your review!');
    });
  }
}

// ---------- Init on DOM ready ----------
document.addEventListener('DOMContentLoaded', ()=>{
  initSearch();
  initReviews();

  // Highlight active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = a.getAttribute('href') || '';
    if(href.endsWith(path)) a.classList.add('active');
  });
});
