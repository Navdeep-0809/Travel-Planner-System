// script.js - small helper library for local API + external weather
const API_BASE = 'http://localhost:3001'; // json-server

// helper - select
const $ = id => document.getElementById(id);

// Generic fetch wrapper
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

/* ----------------- DESTINATIONS (home / index2.html) ----------------- */
// Load destinations from local API and render into container with id="destinations-container"
async function loadDestinations(containerId = 'destinations-container') {
  try {
    const list = await apiFetch('/destinations');
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    list.forEach(dest => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="" data-src alt="${escapeHtml(dest.name)}" />
        <h3>${escapeHtml(dest.name)}</h3>
        <p>${escapeHtml(dest.short)}</p>
        <div class="buttons">
          <button class="add-btn">Add to List</button>
          <button class="explore-btn">Explore More</button>
          <button class="weather-btn">Show Weather</button>
          <button class="book-page-btn">Book</button>
        </div>
        <div class="more-info" style="display:none;"><p>${escapeHtml(dest.description)}</p></div>
      `;
      // attach metadata
      card.dataset.destId = dest.id;
      card.dataset.lat = dest.lat;
      card.dataset.lon = dest.lon;

      container.appendChild(card);
    });

    // lazy: wire buttons
    wireDestinationButtons(container);
  } catch (err) {
    console.error(err);
  }
}

function wireDestinationButtons(container) {
  container.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const place = btn.closest('.card').querySelector('h3').textContent;
      alert(`${place} added to your list!`);
    });
  });

  // Explore more toggles details
  container.querySelectorAll('.explore-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const info = card.querySelector('.more-info');
      const isHidden = info.style.display === 'none' || !info.style.display;
      info.style.display = isHidden ? 'block' : 'none';
      btn.textContent = isHidden ? 'Hide Details' : 'Explore More';
    });
  });

  // Weather button - calls external API
  container.querySelectorAll('.weather-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const lat = card.dataset.lat;
      const lon = card.dataset.lon;
      try {
        btn.disabled = true;
        btn.textContent = 'Loading...';
        const weather = await fetchWeather(lat, lon);
        alert(`Current temp: ${weather.temperature}°C, wind ${weather.windspeed} m/s`);
      } catch (err) {
        alert('Weather fetch failed');
        console.error(err);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Show Weather';
      }
    });
  });

  // Book page button - go to booking.html and save selected
  container.querySelectorAll('.book-page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const name = card.querySelector('h3').textContent;
      localStorage.setItem('selectedDestination', name);
      window.location.href = 'booking.html';
    });
  });
}

/* ----------------- WEATHER (external API) ----------------- */
async function fetchWeather(lat, lon) {
  const q = `${WEATHER_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true`;
  const res = await fetch(q);
  if (!res.ok) throw new Error('Weather fetch failed');
  const json = await res.json();
  // open-meteo returns current_weather { temperature, windspeed, winddirection, ... }
  return json.current_weather || { temperature: 'N/A', windspeed: 'N/A' };
}

/* ----------------- BOOKINGS (POST to local API) ----------------- */
// Call this to create a booking object in local API
async function createBooking(payload) {
  // payload example: { destination: 'Bali', type:'hotel', name:'Neha', date:'2025-11-01', days:3 }
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Create booking failed');
  return res.json();
}

// show bookings into element id="bookings-container"
async function loadBookings(containerId = 'bookings-container') {
  try {
    const data = await apiFetch('/bookings');
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    data.forEach(b => {
      const el = document.createElement('div');
      el.className = 'booking-item';
      el.innerHTML = `<strong>${escapeHtml(b.destination)}</strong> — ${escapeHtml(b.type)} — ${escapeHtml(b.name)} on ${escapeHtml(b.date || '')}`;
      container.appendChild(el);
    });
  } catch (err) {
    console.error(err);
  }
}

/* ----------------- FEEDBACK (POST to local API) ----------------- */
async function submitFeedback(payload) {
  // payload example: { name:'Neha', email:'a@b.com', message:'Great' }
  const res = await fetch(`${API_BASE}/feedbacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Submit feedback failed');
  return res.json();
}

/* ----------------- Utilities ----------------- */
function escapeHtml(s = '') {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/* ----------------- DOM wiring for booking page ----------------- */
// Call this in booking.html to wire modal + createBooking use
function wireBookingModal() {
  // Assumes you have .book-btn buttons on booking.html (we already created modal earlier)
  document.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = btn.textContent.trim(); // "Book Hotel" / "Reserve Table" / "Book Flight"
      const parentCard = btn.closest('.booking-card');
      const destination = parentCard.querySelector('h3').textContent;
      openBookingModal({ destination, service, btn });
    });
  });

  // load bookings list if container exists
  loadBookings('bookings-container');
}

/* Modal open / submit logic (integrates with createBooking) */
function openBookingModal({ destination, service }) {
  const modal = document.getElementById('bookingModal');
  const formTitle = document.getElementById('formTitle');
  const bookingForm = document.getElementById('bookingForm');
  const extraField = document.getElementById('extraField'); // container for days/time

  formTitle.textContent = `${service} — ${destination}`;
  extraField.innerHTML = '';

  if (service.includes('Hotel')) {
    extraField.innerHTML = `<input type="number" id="days" placeholder="Number of days" min="1" required />`;
  } else if (service.includes('Table')) {
    extraField.innerHTML = `<input type="time" id="time" required />`;
  } else {
    // flight -> nothing extra
    extraField.innerHTML = '';
  }

  modal.style.display = 'flex';

  // handle form submit (one-time attach - remove previous listener)
  const submitHandler = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const date = document.getElementById('date').value;
    const guests = document.getElementById('guests').value;
    const daysInput = document.getElementById('days');
    const timeInput = document.getElementById('time');

    const payload = {
      destination,
      type: service,
      name,
      email,
      date,
      guests,
      days: daysInput ? Number(daysInput.value) : undefined,
      time: timeInput ? timeInput.value : undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await createBooking(payload);
      alert('✅ Registration Done Successfully!');
      bookingForm.reset();
      document.getElementById('bookingModal').style.display = 'none';
      // refresh bookings list if present
      loadBookings('bookings-container');
    } catch (err) {
      console.error(err);
      alert('Booking failed — check console');
    } finally {
      bookingForm.removeEventListener('submit', submitHandler);
    }
  };

  bookingForm.removeEventListener('submit', submitHandler); // safe-guard
  bookingForm.addEventListener('submit', submitHandler);
}

/* Close modal helper */
function wireModalClose() {
  const modal = document.getElementById('bookingModal');
  const close = document.getElementById('closeModal');
  if (!modal) return;
  close.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
}

/* ----------------- Initialize on pages ----------------- */
document.addEventListener('DOMContentLoaded', () => {
  // If index page has destinations container, load them
  if (document.getElementById('destinations-container')) {
    loadDestinations('destinations-container');
  }

  // If booking page
  if (document.querySelectorAll('.booking-card').length) {
    wireBookingModal();
    wireModalClose();
    // set heading if selectedDestination present
    const sel = localStorage.getItem('selectedDestination');
    if (sel) {
      const header = document.querySelector('header h1'); 
      if (header) header.textContent = `🛎 Book Your Trip to ${sel}`;
      // optionally hide other booking-cards and show only the selected:
      document.querySelectorAll('.booking-card').forEach(card => {
        if (!card.querySelector('h3').textContent.includes(sel)) card.style.display = 'none';
      });
    }
  }

  // If feedback form exists, wire it
  const fbForm = document.getElementById('feedbackForm');
  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('fbName').value.trim(),
        email: document.getElementById('fbEmail').value.trim(),
        message: document.getElementById('fbMessage').value.trim(),
        createdAt: new Date().toISOString()
      };
      try {
        await submitFeedback(payload);
        // go to success page or show message
        window.location.href = 'feedback-success.html';
      } catch (err) {
        console.error(err);
        alert('Feedback submit failed');
      }
    });
  }
});