/* Kebab u Pajdy — interakcje */
(function () {
  "use strict";

  /* ---------- Godziny otwarcia (wg ulotki) ----------
     Pon–Pt 11–22, Sob 11–22, Nd 13–22 (czas lokalny: Europe/Warsaw) */
  var HOURS = {
    1: [11, 22], // poniedziałek
    2: [11, 22],
    3: [11, 22],
    4: [11, 22],
    5: [11, 22],
    6: [11, 22], // sobota
    0: [13, 22]  // niedziela
  };
  var DAY_NAMES = ["niedzielę", "poniedziałek", "wtorek", "środę", "czwartek", "piątek", "sobotę"];

  function warsawNow() {
    var parts = new Intl.DateTimeFormat("pl-PL", {
      timeZone: "Europe/Warsaw",
      weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var get = function (t) { return parts.find(function (p) { return p.type === t; }).value; };
    var wdMap = { pon: 1, wt: 2, śr: 3, sr: 3, czw: 4, pt: 5, sob: 6, nd: 0, nie: 0 };
    var key = get("weekday").toLowerCase().replace(/\./g, "").slice(0, 3);
    return {
      day: wdMap[key] !== undefined ? wdMap[key] : new Date().getDay(),
      minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10)
    };
  }

  function fmt(m) {
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  function updateStatus() {
    var now = warsawNow();
    var range = HOURS[now.day];
    var open = range[0] * 60, close = range[1] * 60;
    var statusEl = document.getElementById("openStatus");
    var bigEl = document.getElementById("openStatusBig");
    var hintEl = document.getElementById("openStatusHint");
    if (!statusEl) return;

    var isOpen = now.minutes >= open && now.minutes < close;
    var dotClass = isOpen ? "dot--green" : "dot--red";
    var text, hint;

    if (isOpen) {
      text = "Otwarte — czynne do " + fmt(close);
      hint = "Zamykamy o " + fmt(close) + ". Zadzwoń i zamów — będziemy gotowi!";
      if (close - now.minutes <= 60) hint = "⏰ Zamykamy za niecałą godzinę (" + fmt(close) + ") — zdążysz!";
    } else if (now.minutes < open) {
      text = "Zamknięte — otwieramy o " + fmt(open);
      hint = "Dzisiejsze otwarcie: " + fmt(open) + ". Zapraszamy od rana… tzn. od południa 😉";
    } else {
      // zamknięci po godzinach -> jutro
      var next = (now.day + 1) % 7;
      var nextOpen = HOURS[next][0] * 60;
      text = "Zamknięte — jutro od " + fmt(nextOpen);
      hint = "Widzimy się w " + DAY_NAMES[next] + " od " + fmt(nextOpen) + ".";
    }

    statusEl.innerHTML = '<span class="dot ' + dotClass + '"></span> ' +
      (isOpen ? "OTWARTE" : "ZAMKNIĘTE") + " · " + text;
    if (bigEl) {
      bigEl.textContent = isOpen ? "JESTEŚMY OTWARCI" : "JESTEŚMY ZAMKNIĘCI";
      bigEl.classList.toggle("is-open", isOpen);
      bigEl.classList.toggle("is-closed", !isOpen);
    }
    if (hintEl) hintEl.textContent = hint;
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------- Nawigacja mobilna ---------- */
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        burger.classList.remove("is-open");
      }
    });
  }

  /* ---------- Zakładki menu ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".menu__tab"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      document.querySelectorAll(".menu__panel").forEach(function (p) { p.classList.remove("is-active"); });
      var panel = document.getElementById("panel-" + tab.dataset.tab);
      if (panel) panel.classList.add("is-active");
    });
  });

  /* ---------- Ułatwienie: klik w link kategorii z hero → aktywuj zakładkę ---------- */

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    ".hours__card, .section-head, .menu__panel-head, .dish, .about__point, .contact__card"
  );
  if ("IntersectionObserver" in window) {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Rok w stopce ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
