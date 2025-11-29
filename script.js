// ---------- SAMPLE DATA ----------
const flights = [
  {
    id: 1,
    from: "Delhi",
    to: "Mumbai",
    date: "2025-12-01",
    airline: "IndiGo",
    flightNo: "6E 203",
    departTime: "06:15",
    arriveTime: "08:25",
    durationMinutes: 130,
    stops: 0,
    platforms: {
      "MakeMyTrip": 5499,
      "Skyscanner": 5320,
      "EaseMyTrip": 5450,
      "Cleartrip": 5380
    }
  },
  {
    id: 2,
    from: "Delhi",
    to: "Mumbai",
    date: "2025-12-01",
    airline: "Vistara",
    flightNo: "UK 951",
    departTime: "09:30",
    arriveTime: "11:45",
    durationMinutes: 135,
    stops: 0,
    platforms: {
      "MakeMyTrip": 6199,
      "Skyscanner": 6080,
      "EaseMyTrip": 6120,
      "Cleartrip": 6100
    }
  },
  {
    id: 3,
    from: "Delhi",
    to: "Bengaluru",
    date: "2025-12-01",
    airline: "Air India",
    flightNo: "AI 502",
    departTime: "07:00",
    arriveTime: "09:45",
    durationMinutes: 165,
    stops: 1,
    platforms: {
      "MakeMyTrip": 7899,
      "Skyscanner": 7740,
      "EaseMyTrip": 7810,
      "Cleartrip": 7790
    }
  },
  {
    id: 4,
    from: "Delhi",
    to: "Mumbai",
    date: "2025-12-02",
    airline: "SpiceJet",
    flightNo: "SG 157",
    departTime: "21:10",
    arriveTime: "23:40",
    durationMinutes: 150,
    stops: 0,
    platforms: {
      "MakeMyTrip": 4999,
      "Skyscanner": 5120,
      "EaseMyTrip": 5050,
      "Cleartrip": 5010
    }
  },
  {
    id: 5,
    from: "Mumbai",
    to: "Delhi",
    date: "2025-12-01",
    airline: "IndiGo",
    flightNo: "6E 502",
    departTime: "15:30",
    arriveTime: "17:40",
    durationMinutes: 130,
    stops: 0,
    platforms: {
      "MakeMyTrip": 5599,
      "Skyscanner": 5480,
      "EaseMyTrip": 5520,
      "Cleartrip": 5500
    }
  }
];

const urlMap = {
  "MakeMyTrip": "https://www.makemytrip.com/flights/",
  "Skyscanner": "https://www.skyscanner.co.in/transport/flights/",
  "EaseMyTrip": "https://www.easemytrip.com/flights.html",
  "Cleartrip": "https://www.cleartrip.com/flights"
};

// ---------- HELPERS ----------
function minutesToHrMin(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h + "h " + m + "m";
}

function getBestPriceInfo(platforms) {
  let bestPlatform = null;
  let bestPrice = Infinity;
  for (const key in platforms) {
    const price = platforms[key];
    if (price < bestPrice) {
      bestPrice = price;
      bestPlatform = key;
    }
  }
  return { bestPlatform, bestPrice };
}

function timeToMinutes(timeStr) {
  const parts = timeStr.split(":");
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  return hh * 60 + mm;
}

// ---------- DOM ELEMENTS ----------
const flightListEl = document.getElementById("flightList");
const resultsCountEl = document.getElementById("resultsCount");
const resultsRouteEl = document.getElementById("resultsRoute");
const noResultsEl = document.getElementById("noResults");

const fromInput = document.getElementById("fromInput");
const toInput = document.getElementById("toInput");
const dateInput = document.getElementById("dateInput");
const passengersInput = document.getElementById("passengersInput");
const nonStopFilter = document.getElementById("nonStopFilter");
const airlineFilter = document.getElementById("airlineFilter");
const maxPriceFilter = document.getElementById("maxPriceFilter");
const sortSelect = document.getElementById("sortSelect");

const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const swapBtn = document.getElementById("swapBtn");
const scrollToSearchBtn = document.getElementById("scrollToSearch");

// default date
dateInput.value = "2025-12-01";

// ---------- FILTER + SORT ----------
function getFilteredFlights() {
  const fromVal = fromInput.value.trim().toLowerCase();
  const toVal = toInput.value.trim().toLowerCase();
  const dateVal = dateInput.value;
  const nonStopOnly = nonStopFilter.checked;
  const airlineVal = airlineFilter.value;
  const maxPriceVal = parseInt(maxPriceFilter.value, 10);
  const sortBy = sortSelect.value;

  let filtered = flights.filter(function (f) {
    if (fromVal && f.from.toLowerCase().indexOf(fromVal) === -1) return false;
    if (toVal && f.to.toLowerCase().indexOf(toVal) === -1) return false;
    if (dateVal && f.date !== dateVal) return false;
    if (nonStopOnly && f.stops > 0) return false;
    if (airlineVal && f.airline !== airlineVal) return false;

    if (!isNaN(maxPriceVal)) {
      const best = getBestPriceInfo(f.platforms).bestPrice;
      if (best > maxPriceVal) return false;
    }
    return true;
  });

  filtered.sort(function (a, b) {
    if (sortBy === "cheapest") {
      const aPrice = getBestPriceInfo(a.platforms).bestPrice;
      const bPrice = getBestPriceInfo(b.platforms).bestPrice;
      return aPrice - bPrice;
    } else if (sortBy === "earliest") {
      return timeToMinutes(a.departTime) - timeToMinutes(b.departTime);
    } else if (sortBy === "duration") {
      return a.durationMinutes - b.durationMinutes;
    }
    return 0;
  });

  return filtered;
}

// ---------- RENDER ----------
function renderFlights() {
  const filtered = getFilteredFlights();
  flightListEl.innerHTML = "";

  if (filtered.length === 0) {
    resultsCountEl.textContent = "0 flights";
    resultsRouteEl.textContent = "";
    noResultsEl.style.display = "block";
    return;
  }

  noResultsEl.style.display = "none";
  resultsCountEl.textContent =
    filtered.length + " flight" + (filtered.length > 1 ? "s" : "");

  const routeParts = [];
  if (fromInput.value.trim()) routeParts.push(fromInput.value.trim());
  if (toInput.value.trim()) routeParts.push("→ " + toInput.value.trim());
  if (dateInput.value) routeParts.push("· " + dateInput.value);
  resultsRouteEl.textContent = routeParts.length
    ? " for " + routeParts.join(" ")
    : "";

  filtered.forEach(function (f) {
    const best = getBestPriceInfo(f.platforms);
    const card = document.createElement("article");
    card.className = "flight-card";
    card.dataset.flightId = f.id;

    const stopsText = f.stops === 0 ? "Non-stop" : f.stops + " stop";

    card.innerHTML = `
      <div class="flight-main">
        <div class="airline">
          <span class="airline-tag">${f.airline}</span>
          <span>${f.flightNo}</span>
        </div>
        <div class="route">
          <div>
            <div class="time-block">${f.departTime}</div>
            <div class="time-sub">${f.from}</div>
          </div>
          <div class="route-divider"></div>
          <div>
            <div class="time-block">${f.arriveTime}</div>
            <div class="time-sub">${f.to}</div>
          </div>
        </div>
        <div class="meta-row">
          <div class="meta-pill">${minutesToHrMin(f.durationMinutes)}</div>
          <div class="meta-pill">${stopsText}</div>
          <div class="meta-pill">Date: ${f.date}</div>
        </div>
      </div>

      <div class="flight-meta">
        <div class="platform-row">
          <span class="platform-name">Best price on</span>
          <span class="best-tag">${best.bestPlatform}</span>
        </div>
        <div class="platform-row">
          <span class="platform-name">Other platforms</span>
          <span class="time-sub">Tap "Compare" to view all</span>
        </div>
        <div class="platform-row">
          <span class="platform-name">Passengers</span>
          <span>${passengersInput.value}</span>
        </div>
      </div>

      <div class="flight-price">
        <div>
          <div class="price-main">₹${best.bestPrice.toLocaleString("en-IN")}</div>
          <div class="price-sub">per traveller · ${best.bestPlatform}</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-compare" data-action="compare" data-id="${f.id}">
            Compare
          </button>
          <button class="btn-book" data-action="book" data-id="${f.id}">
            Book on ${best.bestPlatform}
          </button>
        </div>
      </div>
    `;

    flightListEl.appendChild(card);
  });
}

// ---------- COMPARE PANEL ----------
function toggleComparePanel(flightId) {
  const cards = document.querySelectorAll(".flight-card");
  const card = Array.from(cards).find(function (c) {
    return Number(c.dataset.flightId) === flightId;
  });
  if (!card) return;

  const existing = card.querySelector(".compare-panel");
  if (existing) {
    existing.remove();
    return;
  }

  const flight = flights.find(function (f) {
    return f.id === flightId;
  });
  if (!flight) return;

  const panel = document.createElement("div");
  panel.className = "compare-panel";

  let rows = "";
  for (const platform in flight.platforms) {
    const price = flight.platforms[platform];
    const url = urlMap[platform] || "#";
    rows += `
      <tr>
        <td>${platform}</td>
        <td>₹${price.toLocaleString("en-IN")}</td>
        <td><a href="${url}" target="_blank" rel="noopener noreferrer">Open</a></td>
      </tr>
    `;
  }

  panel.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Platform</th>
          <th>Price (₹)</th>
          <th>Visit</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  card.appendChild(panel);
}

// ---------- BOOK BUTTON ----------
function bookOnBestPlatform(flightId) {
  const flight = flights.find(function (f) {
    return f.id === flightId;
  });
  if (!flight) return;
  const best = getBestPriceInfo(flight.platforms);
  const url = urlMap[best.bestPlatform] || "#";
  window.open(url, "_blank");
}

// ---------- EVENT LISTENERS ----------
searchBtn.addEventListener("click", renderFlights);
sortSelect.addEventListener("change", renderFlights);
nonStopFilter.addEventListener("change", renderFlights);
airlineFilter.addEventListener("change", renderFlights);

maxPriceFilter.addEventListener("input", function () {
  clearTimeout(window._maxPriceTimer);
  window._maxPriceTimer = setTimeout(renderFlights, 250);
});

swapBtn.addEventListener("click", function () {
  const tmp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = tmp;
  renderFlights();
});

resetBtn.addEventListener("click", function () {
  fromInput.value = "";
  toInput.value = "";
  dateInput.value = "2025-12-01";
  passengersInput.value = "1";
  nonStopFilter.checked = false;
  airlineFilter.value = "";
  maxPriceFilter.value = "";
  sortSelect.value = "cheapest";
  renderFlights();
});

scrollToSearchBtn.addEventListener("click", function () {
  document.getElementById("search").scrollIntoView({ behavior: "smooth" });
});

// delegate click events for compare/book
flightListEl.addEventListener("click", function (e) {
  const btn = e.target.closest("button");
  if (!btn) return;
  const flightId = Number(btn.dataset.id);
  const action = btn.dataset.action;
  if (action === "compare") {
    toggleComparePanel(flightId);
  } else if (action === "book") {
    bookOnBestPlatform(flightId);
  }
});

// initial render
renderFlights();