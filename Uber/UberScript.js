/* =========================================================
   UberScript.js
   Interactivity for the Uber landing page recreation.
   Works with the existing index HTML + style.css (no edits
   required). Styles needed by the JS are injected below.
   Tip: add `defer` to the <script> tag in <head>, e.g.
        <script src="UberScript.js" defer></script>
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ---------- Config ---------- */
  const LINKS = {
    signup: "http://127.0.0.1:5500/UberSignup.html",
    rideOptions: "https://www.uber.com/gh/en/ride/ride-options",
    airports: "https://www.uber.com/gh/en/airports",
    cities: "https://www.uber.com/global/en/cities/",
    business: "https://www.uber.com/gh/en/business/",
    safety: "https://www.uber.com/gh/en/safety/",
    newsroom: "https://www.uber.com/newsroom/",
  };

  const PLACE_SUGGESTIONS = [
    "Kotoka International Airport",
    "Accra Mall",
    "University of Ghana, Legon",
    "Osu Oxford Street",
    "Madina Market",
    "East Legon",
    "Labadi Beach",
    "Kwame Nkrumah Circle",
    "Achimota Mall",
    "Tema Station",
    "Airport City",
    "West Hills Mall",
    "Makola Market",
    "Cantonments",
    "Spintex Road",
  ];

  const GHANA_CITIES = ["Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast", "Tema"];

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .js-toast {
        position: fixed; left: 50%; bottom: 30px;
        transform: translate(-50%, 20px);
        background: #000; color: #fff; padding: 14px 22px;
        border-radius: 8px; font-size: 15px; z-index: 9999;
        opacity: 0; pointer-events: none; max-width: 90vw;
        transition: opacity .25s, transform .25s;
      }
      .js-toast.show { opacity: 1; transform: translate(-50%, 0); }
      .js-error { outline: 2px solid #e11900; }
      .js-error-msg { color: #e11900; font-size: 14px; margin: 4px 0 0 2px; }
      .js-prices {
        margin: 12px 2px 0; padding: 0; max-width: 400px;
        border: 1px solid #e2e2e2; border-radius: 8px; overflow: hidden;
        background: #fff; font-size: 15px;
      }
      .js-prices-head { padding: 10px 14px; background: #f6f6f6; font-size: 13px; color: #555; }
      .js-prices-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 14px; border-top: 1px solid #eee;
      }
      .js-prices-row small { display: block; color: #777; font-size: 12px; }
      .js-prices-row b { font-size: 16px; }
      .sticky-prices {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 9000;
        background: #fff; padding: 16px; box-shadow: 0 -2px 10px rgba(0,0,0,.15);
        transform: translateY(100%); transition: transform .3s;
      }
      .sticky-prices.show { transform: translateY(0); }
      .sticky-prices button {
        display: block; width: 100%; height: 48px; background: #000; color: #fff;
        border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;
      }
      body.sticky-on .js-toast { bottom: 100px; }
      .nav-bar-container.scrolled { box-shadow: 0 2px 10px rgba(0,0,0,.35); }
      .ride-options-list a { transition: opacity .15s; }
      .ride-options-list a:hover { opacity: .65; }
      .ride-options-list a.active span { border-bottom: 2px solid #000; padding-bottom: 2px; }
      .seeprices-btn, .next-btn, .travel-btn, .get-started-btn, .signup-btn, .login-btn { cursor: pointer; }
      .seeprices-btn:hover, .next-btn:hover, .travel-btn:hover { background-color: #333 !important; }
      .faq-item summary:hover { background: #f6f6f6; }
    `;
    document.head.appendChild(style);
  }

  let toastTimer;
  function showToast(message) {
    let toast = $(".js-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "js-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function setError(input, message) {
    clearError(input);
    input.classList.add("js-error");
    const msg = document.createElement("div");
    msg.className = "js-error-msg";
    msg.textContent = message;
    const holder = input.closest("p, li") || input.parentElement;
    holder.insertAdjacentElement("afterend", msg);
    input._errorEl = msg;
  }

  function clearError(input) {
    input.classList.remove("js-error");
    if (input._errorEl) {
      input._errorEl.remove();
      input._errorEl = null;
    }
  }

  function smoothScrollTo(el) {
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openLink(url) {
    window.open(url, "_blank", "noopener");
  }

  injectStyles();

  /* ---------- 1. Sticky nav shadow on scroll ---------- */
  const navContainer = $(".nav-bar-container");
  if (navContainer) {
    const onScroll = () => navContainer.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 2. "About" dropdown navigation ---------- */
  const aboutSelect = $(".about");
  if (aboutSelect) {
    aboutSelect.addEventListener("change", () => {
      const choice = aboutSelect.value.trim().toLowerCase();
      if (LINKS[choice]) openLink(LINKS[choice]);
      aboutSelect.selectedIndex = 0;
    });
  }

  /* ---------- 3. Sign up buttons (nav + "Sign up to ride") ---------- */
  const signupLink = $(".signup-btn a");
  if (signupLink) signupLink.href = LINKS.signup;
  const signupBtn = $(".signup-btn");
  if (signupBtn) {
    // Make the whole button clickable, not just the text.
    signupBtn.addEventListener("click", (e) => {
      if (e.target.tagName !== "A") window.location.href = LINKS.signup;
    });
  }
  const loginBtn = $(".login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      if (e.target.tagName !== "A") window.location.href = "http://127.0.0.1:5500/UberSignup.html";
    });
  }
  const signUpToRide = $(".download-link2");
  if (signUpToRide) signUpToRide.href = LINKS.signup;

  /* ---------- 4. Ride options row (Ride / Reserve / Courier / Moto) ---------- */
  const rideTabs = $$(".ride-options-list a");
  const planSection = $(".plan-container");
  const heading = $$(".heading-div")[0];
  rideTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const label = tab.textContent.trim().toLowerCase();
      if (label === "reserve") {
        // Stay on the page and jump to the Reserve section instead.
        e.preventDefault();
        smoothScrollTo(heading || planSection);
      }
      rideTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });
  if (rideTabs[0]) rideTabs[0].classList.add("active");

  /* ---------- 5. Change city ---------- */
   /* ---------- 5. Change city (pop-up modal) ---------- */
  // Edit this list to add/remove cities. `code` is the country code (used for
  // the flag image and the "Accra, GH" style label). `popular: true` puts a
  // city under the "Popular" heading when the search box is empty.
  const CITIES = [
    { name: "Paris", code: "fr", popular: true },
    { name: "Rio De Janeiro", code: "br", popular: true },
    { name: "New York City", code: "us", popular: true },
    { name: "Delhi NCR", code: "in", popular: true },
    { name: "Accra", code: "gh" },
    { name: "Kumasi", code: "gh" },
    { name: "Takoradi", code: "gh" },
    { name: "Tamale", code: "gh" },
    { name: "Cape Coast", code: "gh" },
    { name: "Tema", code: "gh" },
    { name: "Lagos", code: "ng" },
    { name: "Nairobi", code: "ke" },
    { name: "London", code: "gb" },
  ];
 
  const cityLabel = $(".request-ride-content li b");
  const changeCity = $(".request-ride-content li a");
  const footerCity = $$(".lang-place a")[1];
  let currentCity = { name: "Accra", code: "gh" };
 
  // Styles for the modal (injected so you don't have to touch style.css;
  // feel free to move these into style.css later).
  const cityStyle = document.createElement("style");
  cityStyle.textContent = `
    .city-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      display: none; justify-content: center; align-items: flex-start;
      padding-top: 80px; z-index: 10000;
    }
    .city-overlay.open { display: flex; }
    .city-modal {
      background: #fff; width: 500px; max-width: 92vw; max-height: 80vh;
      border-radius: 14px; padding: 24px; overflow-y: auto; box-sizing: border-box;
    }
    .city-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .city-head h2 { margin: 0; font-size: 28px; }
    .city-close {
      width: 52px; height: 52px; border: none; border-radius: 8px;
      background: #f1f1f1; font-size: 26px; cursor: pointer; flex-shrink: 0;
    }
    .city-close:hover { background: #e2e2e2; }
    .city-explore {
      margin: 24px 0; background: #000; color: #fff; border: none;
      border-radius: 8px; padding: 14px 18px; font-size: 16px;
      font-weight: bold; cursor: pointer;
    }
    .city-search {
      width: 100%; box-sizing: border-box; height: 58px; border: none;
      border-radius: 30px; background: #f1f1f1; font-size: 16px;
      padding: 0 20px 0 52px;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'><circle cx='11' cy='11' r='7'/><line x1='16' y1='16' x2='21' y2='21'/></svg>");
      background-repeat: no-repeat; background-position: 18px center;
    }
    .city-search:focus { outline: 2px solid #000; }
    .city-group { margin: 28px 0 0; padding-bottom: 10px; border-bottom: 1px solid #e2e2e2;
      color: #555; font-weight: bold; font-size: 17px; }
    .city-list { list-style: none; margin: 0; padding: 0; }
    .city-list li button {
      display: flex; align-items: center; gap: 12px; width: 100%;
      background: none; border: none; text-align: left; font-size: 17px;
      padding: 16px 4px; cursor: pointer;
    }
    .city-list li button:hover { background: #f6f6f6; }
    .city-list img { width: 24px; height: 16px; object-fit: cover; }
    .city-empty { padding: 16px 4px; color: #777; }
  `;
  document.head.appendChild(cityStyle);
 
  // Build the modal once
  const overlay = document.createElement("div");
  overlay.className = "city-overlay";
  overlay.innerHTML = `
    <div class="city-modal" role="dialog" aria-modal="true" aria-labelledby="city-title">
      <div class="city-head">
        <h2 id="city-title"></h2>
        <button type="button" class="city-close" aria-label="Close">&times;</button>
      </div>
      <button type="button" class="city-explore">Explore city</button>
      <input type="text" class="city-search" placeholder="Change city" aria-label="Search cities" autocomplete="off">
      <div class="city-group">Popular</div>
      <ul class="city-list"></ul>
    </div>`;
  document.body.appendChild(overlay);
 
  const cityTitle = $("#city-title", overlay);
  const citySearch = $(".city-search", overlay);
  const cityGroup = $(".city-group", overlay);
  const cityList = $(".city-list", overlay);
 
  function renderCityList(query = "") {
    const q = query.trim().toLowerCase();
    const matches = q
      ? CITIES.filter((c) => c.name.toLowerCase().includes(q))
      : CITIES.filter((c) => c.popular);
 
    cityGroup.textContent = q ? "Results" : "Popular";
    cityList.innerHTML = "";
 
    if (!matches.length) {
      const empty = document.createElement("li");
      empty.className = "city-empty";
      empty.textContent = "No cities found";
      cityList.appendChild(empty);
      return;
    }
 
    matches.forEach((city) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
 
      const flag = document.createElement("img");
      flag.src = `https://flagcdn.com/w40/${city.code}.png`; // flag emojis don't render on Windows
      flag.alt = "";
 
      const name = document.createElement("span");
      name.textContent = city.name;
 
      btn.append(flag, name);
      btn.addEventListener("click", () => selectCity(city));
      li.appendChild(btn);
      cityList.appendChild(li);
    });
  }
 
  function openCityModal() {
    cityTitle.textContent = `You are currently in ${currentCity.name}`;
    citySearch.value = "";
    renderCityList();
    overlay.classList.add("open");
    document.body.style.overflow = "hidden"; // stop the page scrolling behind
    citySearch.focus();
  }
 
  function closeCityModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
 
  function selectCity(city) {
    currentCity = city;
    if (cityLabel) cityLabel.textContent = `${city.name}, ${city.code.toUpperCase()}`;
    if (footerCity) footerCity.textContent = city.name;
    closeCityModal();
    showToast(`City changed to ${city.name}`);
  }
 
  if (changeCity) {
    changeCity.addEventListener("click", (e) => {
      e.preventDefault();
      openCityModal();
    });
  }
  citySearch.addEventListener("input", () => renderCityList(citySearch.value));
  $(".city-close", overlay).addEventListener("click", closeCityModal);
  $(".city-explore", overlay).addEventListener("click", () => {
    closeCityModal();
    openLink(LINKS.cities);
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCityModal(); // click the dark backdrop
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeCityModal();
  });


  /* ---------- 6. Request a ride form ---------- */
  const pickupSelect = $(".pickup-now");
  const pickupInput = $$(".location-input")[0];
  const dropoffInput = $$(".location-input")[1];
  const seePricesBtn = $(".seeprices-btn");

  // Autocomplete suggestions
  if (pickupInput && dropoffInput) {
    const datalist = document.createElement("datalist");
    datalist.id = "place-suggestions";
    PLACE_SUGGESTIONS.forEach((p) => {
      const o = document.createElement("option");
      o.value = p;
      datalist.appendChild(o);
    });
    document.body.appendChild(datalist);
    pickupInput.setAttribute("list", datalist.id);
    dropoffInput.setAttribute("list", datalist.id);
    [pickupInput, dropoffInput].forEach((inp) => {
      inp.setAttribute("autocomplete", "off");
      inp.addEventListener("input", () => clearError(inp));
    });
  }

  // "Schedule later" -> jump to the Reserve section
  if (pickupSelect) {
    pickupSelect.addEventListener("change", () => {
      if (pickupSelect.value === "Schedule Later") {
        smoothScrollTo(heading || planSection);
        showToast("Choose a date and time below to reserve your ride");
        setTimeout(() => (pickupSelect.selectedIndex = 0), 800);
      }
    });
  }

  // Simple deterministic "fake" distance so the same trip gives the same price.
  function pseudoDistanceKm(a, b) {
    const str = (a + "|" + b).toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return 3 + (hash % 220) / 10; // 3.0 - 25.0 km
  }

  function renderPrices(pickup, dropoff) {
    const old = $(".js-prices");
    if (old) old.remove();

    const km = pseudoDistanceKm(pickup, dropoff);
    const mins = Math.round(km * 2.6 + 4);
    const base = 8 + km * 3.2;
    const options = [
      { name: "Moto / Okada", mult: 0.6, seats: 1 },
      { name: "UberX", mult: 1, seats: 4 },
      { name: "Comfort", mult: 1.25, seats: 4 },
      { name: "UberXL", mult: 1.6, seats: 6 },
    ];

    const box = document.createElement("div");
    box.className = "js-prices";

    const head = document.createElement("div");
    head.className = "js-prices-head";
    head.textContent = `~${km.toFixed(1)} km · ~${mins} min (demo estimate)`;
    box.appendChild(head);

    options.forEach((opt) => {
      const row = document.createElement("div");
      row.className = "js-prices-row";

      const left = document.createElement("div");
      const title = document.createElement("span");
      title.textContent = opt.name;
      const sub = document.createElement("small");
      sub.textContent = `${opt.seats} seat${opt.seats > 1 ? "s" : ""}`;
      left.append(title, sub);

      const price = document.createElement("b");
      price.textContent = `GH₵ ${(base * opt.mult).toFixed(2)}`;

      row.append(left, price);
      box.appendChild(row);
    });

    seePricesBtn.closest("p").insertAdjacentElement("afterend", box);
  }

  if (seePricesBtn && pickupInput && dropoffInput) {
    seePricesBtn.addEventListener("click", () => {
      const pickup = pickupInput.value.trim();
      const dropoff = dropoffInput.value.trim();
      let valid = true;

      if (!pickup) {
        setError(pickupInput, "Enter a pickup location");
        valid = false;
      }
      if (!dropoff) {
        setError(dropoffInput, "Enter a dropoff location");
        valid = false;
      }
      if (valid && pickup.toLowerCase() === dropoff.toLowerCase()) {
        setError(dropoffInput, "Pickup and dropoff can't be the same");
        valid = false;
      }
      if (!valid) return;

      renderPrices(pickup, dropoff);
    });

    [pickupInput, dropoffInput].forEach((inp) =>
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") seePricesBtn.click();
      })
    );
  }

  /* ---------- 7. Uber Reserve (date + time) ---------- */
  const dateInput = $('input[type="date"]');
  const timeSelect = $("select.date-time");
  const nextBtn = $(".next-btn");

  function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatTime(h24, min) {
    const suffix = h24 >= 12 ? "pm" : "am";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(min).padStart(2, "0")}${suffix}`;
  }

  function buildTimeOptions() {
    if (!timeSelect) return;
    const placeholder = timeSelect.options[0];
    timeSelect.innerHTML = "";
    timeSelect.appendChild(placeholder);

    const today = toISODate(new Date());
    const isToday = dateInput && dateInput.value === today;
    const now = new Date();
    // Reserve needs a little lead time (about 60 minutes).
    const earliest = now.getHours() * 60 + now.getMinutes() + 60;

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (isToday && h * 60 + m < earliest) continue;
        const opt = document.createElement("option");
        opt.textContent = formatTime(h, m);
        timeSelect.appendChild(opt);
      }
    }
    placeholder.selected = true;
  }

  if (dateInput) {
    const today = new Date();
    const max = new Date();
    max.setDate(today.getDate() + 90); // "up to 90 days in advance"
    dateInput.min = toISODate(today);
    dateInput.max = toISODate(max);
    dateInput.addEventListener("change", () => {
      clearError(dateInput);
      buildTimeOptions();
    });
  }
  buildTimeOptions();
  if (timeSelect) timeSelect.addEventListener("change", () => clearError(timeSelect));

  if (nextBtn && dateInput && timeSelect) {
    nextBtn.addEventListener("click", () => {
      let valid = true;
      if (!dateInput.value) {
        setError(dateInput, "Choose a date");
        valid = false;
      }
      if (timeSelect.selectedIndex === 0) {
        setError(timeSelect, "Choose a time");
        valid = false;
      }
      if (!valid) return;

      const pretty = new Date(dateInput.value + "T00:00").toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      showToast(`Ride reserved for ${pretty} at ${timeSelect.value}`);
    });
  }

  /* ---------- 8. "Travel your way" + business buttons ---------- */
  const travelTargets = [LINKS.rideOptions, LINKS.airports, LINKS.cities];
  $$(".travel-btn").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (travelTargets[i]) openLink(travelTargets[i]);
    });
  });

  const getStarted = $(".get-started-btn");
  if (getStarted) getStarted.addEventListener("click", () => openLink(LINKS.business));
  const getStartedLink = $(".get-started-link");
  if (getStartedLink) getStartedLink.href = LINKS.business;

  /* ---------- 9. FAQ accordion (one open at a time) ---------- */
  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- 10. Placeholder links ("#") shouldn't jump to top ---------- */
  $$('a[href="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      if (a.href === LINKS.signup) return;
      e.preventDefault();
    });
  });

    /* ---------- 11. Sticky "See prices" bar ---------- */
  // Appears at the bottom once the real "See prices" button has scrolled
  // up out of view. Clicking it scrolls back to the form.
  if (seePricesBtn) {
    $$(".sticky-prices").forEach((el) => el.remove());
    const bar = document.createElement("div");
    bar.className = "sticky-prices";
    const stickyBtn = document.createElement("button");
    stickyBtn.type = "button";
    stickyBtn.textContent = "See prices";
    bar.appendChild(stickyBtn);
    document.body.appendChild(bar);
 
    stickyBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Wait for the scroll, then put the cursor in the pickup box.
      setTimeout(() => pickupInput && pickupInput.focus({ preventScroll: true }), 500);
    });
 
    // Show the bar once the real "See prices" button has scrolled up
    // behind the sticky nav. A plain scroll listener is used because it
    // is easy to debug (open DevTools > Console to see the log below).
    const updateStickyBar = () => {
      const navHeight = navContainer ? navContainer.offsetHeight : 64;
      const scrolledPast = seePricesBtn.getBoundingClientRect().bottom < navHeight;
      bar.classList.toggle("show", scrolledPast);
      document.body.classList.toggle("sticky-on", scrolledPast);
    };
    window.addEventListener("scroll", updateStickyBar, { passive: true });
    window.addEventListener("resize", updateStickyBar);
    updateStickyBar();
    console.log("[UberScript] sticky See prices bar ready");
  }

});