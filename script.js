// script.js - Travel Planner (advanced)
// API base
console.log("✅ JavaScript is working");

const API = 'http://localhost:3001';

// DOM shortcuts
const $ = id => document.getElementById(id);
const createEl = (tag, opts = {}) => {
  const el = document.createElement(tag);
  for (const k in opts) el[k] = opts[k];
  return el;
};
 n 
// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  boot();
});

async function boot(){
  wireUI();
  restoreSession();        // keep user logged-in across reloads
  await loadAllData();     // load destinations, bookings, feedback
}

function wireUI(){
  // Nav toggle for mobile
  $('menuToggle')?.addEventListener('click', ()=> {
    const nav = document.querySelector('.nav');
    nav.style.display = nav.style.display === 'block' ? '' : 'block';
  });

  // Dark mode toggle (create if absent)
  if(!$('darkToggle')){
    const bt = createEl('button', { id: 'darkToggle', textContent: '🌙' });
    bt.style.marginLeft = '12px';
    document.querySelector('.site-header')?.appendChild(bt);
  }
  $('darkToggle').addEventListener('click', toggleDarkMode);

  // Login form
  $('loginForm')?.addEventListener('submit', e => {
    e.preventDefault();
    handleLogin();
  });

  // Logout link (dynamically created)
  // Destination form (create or update)
  $('destForm')?.addEventListener('submit', e => {
    e.preventDefault();
    submitDestForm();
  });
  $('clearDest')?.addEventListener('click', () => {
    resetDestForm();
  });

  // Feedback
  $('feedbackForm')?.addEventListener('submit', e => {
    e.preventDefault();
    submitFeedback();
  });

  // Booking
  $('bookingForm')?.addEventListener('submit', e => {
    e.preventDefault();
    submitBooking();
  });

  // Search input for destinations (if exists)
  const search = $('destSearch');
  if(search) {
    search.addEventListener('input', debounce(() => {
      applyDestFilters();
    }, 300));
  }

  // Sort select
  const sortSel = $('destSort');
  if(sortSel) sortSel.addEventListener('change', applyDestFilters);
}

function saveSession(user){
  localStorage.setItem('tp_user', JSON.stringify(user));
  renderAuthUI(user);
}

function clearSession(){
  localStorage.removeItem('tp_user');
  renderAuthUI(null);
}

function restoreSession(){
  const raw = localStorage.getItem('tp_user');
  if(raw){
    try {
      const user = JSON.parse(raw);
      renderAuthUI(user);
    } catch(e) { localStorage.removeItem('tp_user'); }
  } else renderAuthUI(null);
}

function renderAuthUI(user){
  const loginLink = $('loginBtn');
  if(user){
    if(loginLink) loginLink.textContent = `Hi, ${user.name || user.username}`;
    // show logout button
    let logout = $('logoutBtn');
    if(!logout){
      logout = createEl('button', { id: 'logoutBtn', textContent: 'Logout' });
      logout.style.marginLeft = '8px';
      document.querySelector('.site-header')?.appendChild(logout);
    }
    logout.onclick = () => { clearSession(); };
  } else {
    if(loginLink) loginLink.textContent = 'Login';
    $('logoutBtn')?.remove();
  }
}

async function handleLogin(){
  const userEl = $('username'), passEl = $('password');
  const username = userEl.value.trim(), password = passEl.value.trim();
  if(!username || !password) { alert('Enter username and password'); return; }
  try {
    const resp = await fetch(`${API}/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    const arr = await resp.json();
    if(arr.length > 0){
      saveSession(arr[0]);
      $('loginMsg').textContent = `Welcome back, ${arr[0].name || arr[0].username}!`;
      setTimeout(()=> $('loginMsg').textContent = '', 3000);
      $('loginForm').reset();
    } else {
      $('loginMsg').textContent = 'Invalid credentials (demo)';
      setTimeout(()=> $('loginMsg').textContent = '', 3000);
    }
  } catch(e){
    console.error(e);
    alert('Login failed. Is json-server running?');
  }
}

let DESTINATIONS = []; // full cache used for filtering & rendering
let BOOKINGS = [];
let FEEDBACK = [];

async function loadAllData(){
  await Promise.all([ loadDestinationsFetch(), loadBookingsFetch(), loadFeedbackFetch() ]);
}

// Destinations: GET
async function loadDestinationsFetch(){
  showLoading('destinations', true);
  try {
    const res = await fetch(`${API}/destinations`);
    const data = await res.json();
    DESTINATIONS = Array.isArray(data) ? data : [];
    renderDestinations(DESTINATIONS);
    populateDestSelect(DESTINATIONS);
  } catch(e) {
    console.error('loadDestinationsFetch', e);
    alert('Could not load destinations');
  } finally {
    showLoading('destinations', false);
  }
}

// Bookings
async function loadBookingsFetch(){
  try {
    const r = await fetch(`${API}/bookings`);
    BOOKINGS = await r.json();
    renderBookings(BOOKINGS);
  } catch(e) { console.error(e); }
}

// Feedback
async function loadFeedbackFetch(){
  try {
    const r = await fetch(`${API}/feedback?_sort=date&_order=desc`);
    FEEDBACK = await r.json();
    renderFeedback(FEEDBACK);
  } catch(e) { console.error(e); }
}

function renderDestinations(list){
  const container = $('destinations');
  if(!container) return;
  container.innerHTML = '';
  if(list.length === 0) {
    container.appendChild(createEl('p', { textContent: 'No destinations found.' }));
    return;
  }
  list.forEach(d => {
    const card = createEl('div', { className: 'card' });
    card.innerHTML = `
      <h3>${escapeHtml(d.name)}</h3>
      <p>${escapeHtml(d.description || '')}</p>
      <p><strong>Price:</strong> ₹${d.price} • <strong>Duration:</strong> ${escapeHtml(d.duration)}</p>
      <div style="margin-top:8px">
        <button class="btn-edit" data-id="${d.id}">Edit</button>
        <button class="btn-delete" data-id="${d.id}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });

  // attach handlers (delegation could be used but simple attach ok)
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', e => editDestination(Number(e.currentTarget.dataset.id)));
  });
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', e => deleteDestinationXHR(Number(e.currentTarget.dataset.id)));
  });
}

function renderBookings(list){
  const el = $('bookingsList');
  if(!el) return;
  el.innerHTML = '<h4>Your Bookings (demo)</h4>';
  if(list.length === 0) {
    el.appendChild(createEl('p', { textContent: 'No bookings yet.' }));
    return;
  }
  // map dest id -> name
  const map = {};
  DESTINATIONS.forEach(d => map[d.id] = d.name);
  list.forEach(b => {
    const card = createEl('div', { className: 'card' });
    card.style.marginTop = '8px';
    card.innerHTML = `<p><strong>${escapeHtml(b.name)}</strong> booked <strong>${escapeHtml(map[b.destinationId] || '—')}</strong> on ${escapeHtml(b.date)}</p>`;
    el.appendChild(card);
  });
}

function renderFeedback(list){
  const el = $('feedbackList');
  if(!el) return;
  el.innerHTML = '';
  if(list.length === 0) return el.appendChild(createEl('p', { textContent: 'No feedback yet.' }));
  list.forEach(f => {
    const item = createEl('div', { className: 'card' });
    item.style.marginTop = '8px';
    item.innerHTML = `<strong>${escapeHtml(f.name)}</strong> <small>${new Date(f.date).toLocaleString()}</small>
                      <p>${escapeHtml(f.message)}</p>`;
    el.appendChild(item);
  });
}

function populateDestSelect(list){
  const sel = $('bookDest');
  if(!sel) return;
  sel.innerHTML = '<option value="">Select destination</option>';
  list.forEach(d => {
    const opt = createEl('option');
    opt.value = d.id;
    opt.textContent = `${d.name} — ₹${d.price}`;
    sel.appendChild(opt);
  });
}

// Validate destination payload
function validateDestPayload(p){
  if(!p.name || !p.duration) return 'Name and duration are required';
  if(!Number.isFinite(p.price) || p.price < 0) return 'Price must be a non-negative number';
  return null;
}

async function submitDestForm(){
  const id = $('destId').value;
  const payload = {
    name: $('destName').value.trim(),
    price: Number($('destPrice').value),
    duration: $('destDuration').value.trim(),
    description: $('destDesc').value.trim()
  };
  const err = validateDestPayload(payload);
  if(err) return alert(err);

  if(id){
    // Update using XHR (as demo)
    updateDestinationXHR(id, payload);
  } else {
    await addDestinationFetch(payload);
  }
  resetDestForm();
}

async function addDestinationFetch(payload){
  // optimistic UI: push to local cache, render, then POST
  const tempId = Date.now();
  const tempItem = { ...payload, id: tempId };
  DESTINATIONS.unshift(tempItem);
  renderDestinations(DESTINATIONS);
  populateDestSelect(DESTINATIONS);

  try {
    const res = await fetch(`${API}/destinations`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('Add failed');
    const created = await res.json();
    // replace temp item with created item
    DESTINATIONS = DESTINATIONS.map(d => d.id === tempId ? created : d);
    renderDestinations(DESTINATIONS);
    populateDestSelect(DESTINATIONS);
  } catch(e) {
    console.error(e);
    // rollback temp item
    DESTINATIONS = DESTINATIONS.filter(d => d.id !== tempId);
    renderDestinations(DESTINATIONS);
    populateDestSelect(DESTINATIONS);
    alert('Could not add destination');
  }
}

function resetDestForm(){
  $('destForm')?.reset();
  $('destId').value = '';
}

async function editDestination(id){
  try {
    const res = await fetch(`${API}/destinations/${id}`);
    if(!res.ok) throw new Error('Not found');
    const d = await res.json();
    $('destId').value = d.id;
    $('destName').value = d.name;
    $('destPrice').value = d.price;
    $('destDuration').value = d.duration;
    $('destDesc').value = d.description || '';
    window.scrollTo({top: document.getElementById('dest-section').offsetTop - 40, behavior:'smooth'});
  } catch(e){
    console.error(e);
    alert('Load for edit failed');
  }
}

function updateDestinationXHR(id, payload){
  // XHR PUT (classic AJAX)
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', `${API}/destinations/${id}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if(xhr.status >= 200 && xhr.status < 300) {
      // update local cache & re-render
      try {
        const updated = JSON.parse(xhr.responseText);
        DESTINATIONS = DESTINATIONS.map(d => d.id === updated.id ? updated : d);
        renderDestinations(DESTINATIONS);
        populateDestSelect(DESTINATIONS);
        alert('Destination updated (demo)');
      } catch(e) { console.error(e); }
    } else {
      alert('Update failed (XHR)');
    }
  };
  xhr.onerror = function(){ alert('Network error (XHR)'); };
  xhr.send(JSON.stringify(payload));
}

function deleteDestinationXHR(id){
  if(!confirm('Delete this destination?')) return;
  // optimistic remove
  const backup = [...DESTINATIONS];
  DESTINATIONS = DESTINATIONS.filter(d => d.id !== id);
  renderDestinations(DESTINATIONS);
  populateDestSelect(DESTINATIONS);

  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `${API}/destinations/${id}`);
  xhr.onload = function(){
    if(xhr.status >= 200 && xhr.status < 300){
      // ok
    } else {
      alert('Delete failed; rolling back');
      DESTINATIONS = backup;
      renderDestinations(DESTINATIONS);
      populateDestSelect(DESTINATIONS);
    }
  };
  xhr.onerror = function(){
    alert('Network error (XHR); rolling back');
    DESTINATIONS = backup;
    renderDestinations(DESTINATIONS);
    populateDestSelect(DESTINATIONS);
  };
  xhr.send();
}

async function submitBooking(){
  const destId = Number($('bookDest').value || 0);
  const name = $('bookName').value.trim();
  const date = $('bookDate').value;
  if(!destId) return alert('Choose a destination');
  if(!name || !date) return alert('Fill all booking fields');

  const payload = { destinationId: destId, name, date, createdAt: new Date().toISOString() };
  // optimistic add to local bookings
  const temp = { ...payload, id: Date.now() };
  BOOKINGS.unshift(temp);
  renderBookings(BOOKINGS);

  try {
    const res = await fetch(`${API}/bookings`, {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('Booking failed');
    const created = await res.json();
    BOOKINGS = BOOKINGS.map(b => b.id === temp.id ? created : b);
    renderBookings(BOOKINGS);
    $('bookingForm').reset();
    alert('Booked (demo)');
  } catch(e){
    console.error(e);
    // rollback
    BOOKINGS = BOOKINGS.filter(b => b.id !== temp.id);
    renderBookings(BOOKINGS);
    alert('Booking failed');
  }
}

async function submitFeedback(){
  const name = $('fbName').value.trim();
  const text = $('fbText').value.trim();
  if(!name || !text) return alert('Enter your name and feedback');

  const payload = { name, message: text, date: new Date().toISOString() };
  // optimistic add
  FEEDBACK.unshift({ ...payload, id: Date.now() });
  renderFeedback(FEEDBACK);

  try {
    const r = await fetch(`${API}/feedback`, {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    if(!r.ok) throw new Error('Feedback failed');
    const created = await r.json();
    // replace temp with created
    FEEDBACK = FEEDBACK.map(f => f.id === payload.id ? created : f);
    await loadFeedbackFetch(); // reload sorted
    $('feedbackForm').reset();
  } catch(e){
    console.error(e);
    alert('Could not submit feedback');
    // optionally reload from server
    await loadFeedbackFetch();
  }
}

function applyDestFilters(){
  const q = ($('destSearch')?.value || '').trim().toLowerCase();
  const sort = $('destSort')?.value || 'none';
  let arr = DESTINATIONS.slice();

  if(q) {
    arr = arr.filter(d => (d.name + ' ' + (d.description||'')).toLowerCase().includes(q));
  }

  if(sort === 'priceAsc') arr.sort((a,b)=> a.price - b.price);
  if(sort === 'priceDesc') arr.sort((a,b)=> b.price - a.price);
  if(sort === 'nameAsc') arr.sort((a,b)=> a.name.localeCompare(b.name));
  if(sort === 'nameDesc') arr.sort((a,b)=> b.name.localeCompare(a.name));

  renderDestinations(arr);
}

function debounce(fn, wait=250){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=> fn.apply(this, args), wait);
  };
}

function escapeHtml(str=''){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function showLoading(sectionId, show){
  const el = $(sectionId);
  if(!el) return;
  let loader = el.querySelector('.__loader');
  if(show){
    if(!loader){
      loader = createEl('div', { className: '__loader', textContent: 'Loading...' });
      loader.style.opacity = '0.8';
      loader.style.padding = '6px 10px';
      loader.style.fontStyle = 'italic';
      el.prepend(loader);
    }
  } else {
    loader?.remove();
  }
}

function toggleDarkMode(){
  const is = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('tp_dark', is ? '1' : '0');
  $('darkToggle').textContent = is ? '☀️' : '🌙';
}
// restore on load
if(localStorage.getItem('tp_dark') === '1') {
  document.documentElement.classList.add('dark-mode');
  if($('darkToggle')) $('darkToggle').textContent = '☀️';
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ Script is running! DOM fully loaded.");

  // --- Add to List Buttons ---
  const addButtons = document.querySelectorAll('.add-btn');
  addButtons.forEach(button => {
    button.addEventListener('click', () => {
      const place = button.closest('.card').querySelector('h3').textContent;
      alert(`✅ ${place} added to your list!`);
    });
  });

  // --- Explore More Buttons ---
  const exploreButtons = document.querySelectorAll('.explore-btn');
  exploreButtons.forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.card');
      const info = card.querySelector('.more-info');

      if (info.style.display === 'none') {
        info.style.display = 'block';
        button.textContent = 'Hide Details';
      } else {
        info.style.display = 'none';
        button.textContent = 'Explore More';
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Destination click → go to booking page
  const destinations = document.querySelectorAll(".destination-card");
  destinations.forEach(card => {
    card.addEventListener("click", (e) => {
      // Prevent clicks on Explore More from triggering this
      if (e.target.classList.contains("explore-btn")) return;

      // Redirect to booking page
      window.location.href = "booking.html";
    });
  });

  // Explore More button → show extra info
  const exploreButtons = document.querySelectorAll(".explore-btn");
  exploreButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Stop redirect to booking
      const destinationName = button.closest(".destination-card").querySelector("h3").textContent;

      alert(`🌍 More about ${destinationName}:\n\n` +
        `✨ Famous for its culture, traditions, food, and scenic beauty.\n` +
        `📍 Explore temples, beaches, markets, and unique experiences!`);
    });
  });
});

function getWeather() {
  const city = document.getElementById("cityInput").value;
  const apiKey = "b10c555572b7566179b9fb70248ba877";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      document.getElementById("weatherInfo").innerHTML = `
        <h3>Weather in ${city}</h3>
        <p>🌡️ Temperature: ${(data.main.temp - 273.15).toFixed(1)} °C</p>
        <p>🌤️ Condition: ${data.weather[0].description}</p>
        <p>💨 Wind Speed: ${data.wind.speed} m/s</p>
      `;
    })
    .catch(error => {
      document.getElementById("weatherInfo").innerHTML = `<p>City not found!</p>`;
    });
}