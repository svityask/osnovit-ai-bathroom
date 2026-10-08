// ---------- справочники формы ----------
const OPTIONS = {
  tiles: ["100x200", "150x300", "200x400", "300x300", "300x600", "600x600", "600x1200", "800x800", "1200x1200", "1200x2400"]
    .map(v => [v, v.replace("x", "×") + " мм"]),
  colors: [
    ["RAL9003", "RAL 9003 — Белый", "pure white"],
    ["RAL9001", "RAL 9001 — Сливочно-белый", "creamy white"],
    ["RAL1013", "RAL 1013 — Белая устрица", "oyster white"],
    ["RAL1015", "RAL 1015 — Слоновая кость", "light ivory"],
    ["RAL1001", "RAL 1001 — Бежевый", "warm beige"],
    ["RAL1019", "RAL 1019 — Серый бежевый", "greige"],
    ["RAL7044", "RAL 7044 — Серый шёлк", "silk light grey"],
    ["RAL7032", "RAL 7032 — Серая галька", "pebble grey"],
    ["RAL7030", "RAL 7030 — Серый камень", "stone grey"],
    ["RAL7036", "RAL 7036 — Серая платина", "platinum grey"],
    ["RAL7023", "RAL 7023 — Серый бетон", "concrete grey"],
    ["RAL7016", "RAL 7016 — Серый антрацит", "anthracite grey"],
    ["RAL7021", "RAL 7021 — Серо-чёрный", "very dark charcoal"],
    ["RAL9005", "RAL 9005 — Чёрный", "jet black"],
    ["RAL8024", "RAL 8024 — Бежево-коричневый", "beige brown"],
    ["RAL8011", "RAL 8011 — Коричневый орех", "walnut brown"],
    ["RAL6021", "RAL 6021 — Бледный зелёный", "pale sage green"],
    ["RAL6011", "RAL 6011 — Зелёная резеда", "reseda green"],
    ["RAL6005", "RAL 6005 — Зелёный мох", "deep moss green"],
    ["RAL5024", "RAL 5024 — Синяя пастель", "pastel blue"],
    ["RAL5014", "RAL 5014 — Синяя птица", "pigeon blue"],
    ["RAL5011", "RAL 5011 — Синяя сталь", "dark navy steel blue"],
    ["RAL3014", "RAL 3014 — Старая роза", "dusty pink"],
    ["RAL3012", "RAL 3012 — Бежево-красный", "terracotta beige red"],
  ],
  textures: [
    ["matte", "Матовая", "matte"],
    ["glossy", "Глянцевая", "glossy"],
    ["marble", "Под мрамор", "marble-look"],
    ["concrete", "Под бетон", "concrete-look"],
    ["stone", "Под камень", "natural stone-look"],
    ["wood", "Под дерево", "wood-look"],
  ],
  styles: [
    ["minimal", "Минимализм", "minimalist"],
    ["modern", "Современный", "modern"],
    ["japandi", "Japandi", "japandi"],
    ["scandi", "Scandinavian", "scandinavian"],
    ["contemporary", "Contemporary", "contemporary"],
    ["luxury", "Luxury", "luxury hotel"],
    ["loft", "Loft", "industrial loft"],
    ["neoclassic", "Неоклассика", "neoclassical"],
  ],
};

const EN = {};
for (const list of [OPTIONS.colors, OPTIONS.textures, OPTIONS.styles]) for (const [v, , en] of list) EN[v] = en;
Object.assign(EN, {
  vertical: "vertical", horizontal: "horizontal", straight: "straight grid", diagonal: "diagonal", herringbone: "herringbone",
  warm: "warm 3000K", neutral: "neutral 4000K", cold: "cool daylight 5000K",
  toilet: "a wall-hung toilet", towel: "a heated towel rail", washer: "a front-loading washing machine",
  niche: "a recessed wall niche with LED strip", plants: "a few green plants",
});

const $ = s => document.querySelector(s);
const form = $("#form");

for (const sel of form.querySelectorAll("select[data-options]")) {
  for (const [value, label] of OPTIONS[sel.dataset.options]) sel.add(new Option(label, value));
  sel.value = sel.dataset.default;
}

// ---------- параметры → промпт ----------
function readForm() {
  const f = new FormData(form);
  const d = Object.fromEntries(f);
  d.extras = f.getAll("extras");
  for (const k of ["length", "width", "height"]) d[k] = Number(d[k]);
  return d;
}

function validate(d) {
  const bad = [];
  if (!(d.length >= 1000 && d.length <= 8000)) bad.push("length");
  if (!(d.width >= 1000 && d.width <= 8000)) bad.push("width");
  if (!(d.height >= 2000 && d.height <= 4000)) bad.push("height");
  for (const n of ["length", "width", "height"]) form.querySelector(`[name=${n}]`).classList.toggle("bad", bad.includes(n));
  return bad.length ? "Проверьте размеры: длина и ширина 1000–8000 мм, высота 2000–4000 мм." : "";
}

function buildPrompt(d) {
  const m2 = (d.length * d.width / 1e6).toFixed(1);
  const wet = d.wet === "shower"
    ? "a walk-in shower with frameless glass screen and rain shower head on the LEFT side"
    : "a built-in bathtub along the LEFT wall";
  const extras = d.extras.length ? ", also " + d.extras.map(e => EN[e]).join(", ") : "";
  const notes = d.notes ? `. Extra wishes: ${d.notes.trim().slice(0, 300)}` : "";
  return [
    `Photorealistic interior design photo of a ${EN[d.style]} bathroom, ${m2} square meters, ceiling ${(d.height / 1000).toFixed(1)} m`,
    "eye-level camera standing in the doorway looking straight at the back wall, symmetrical one-point perspective, wide angle",
    `${wet}, floating vanity with sink and mirror on the RIGHT side${extras}`,
    `walls: ${d.wallTile} mm ${EN[d.wallTexture]} ${EN[d.wallColor]} porcelain tiles laid ${EN[d.wallLaying]} with thin visible grout lines`,
    `floor: ${d.floorTile} mm ${EN[d.floorTexture]} ${EN[d.floorColor]} tiles in ${EN[d.floorLaying]} pattern, open tiled floor area in the foreground`,
    `${EN[d.light]} lighting, architectural photography, high detail, no people, no text${notes}`,
  ].join(". ");
}

// ---------- подбор материалов по зонам ----------
const longSide = s => Math.max(...s.split("x").map(Number));

function pickMaterials(d) {
  const wallBig = longSide(d.wallTile) >= 600;
  const floorBig = longSide(d.floorTile) >= 600;
  const shiny = t => t === "glossy" || t === "marble";
  const shower = d.wet === "shower";

  const zones = [
    {
      id: "walls", title: "Стены", x: .55, y: .36,
      main: shiny(d.wallTexture) ? "ac17w" : wallBig ? "ac16" : "ac12h",
      also: ["pc211", "lp51a"],
    },
    {
      id: "wet", title: shower ? "Душевая зона" : "Зона ванны", x: .17, y: .5,
      main: shower ? "hc62" : "ha64",
      also: shower ? ["hb70", "xe15"] : ["hb70", "sealant"],
    },
    {
      id: "joints", title: "Швы", x: .62, y: .83,
      main: shiny(d.wallTexture) || shiny(d.floorTexture) ? "xe15" : "xc6e",
      also: shiny(d.wallTexture) || shiny(d.floorTexture) ? ["xc6e"] : ["xe15"],
    },
    {
      id: "floor", title: "Пол", x: .4, y: .92,
      main: floorBig ? "ac161e" : "ac12h",
      also: shower ? ["fc42h", "fc40", "lp52"] : ["fc42h", "lp52"],
    },
    {
      id: "seal", title: "Примыкания", x: .3, y: .7,
      main: "sealant",
      also: ["hb70"],
    },
  ];
  return zones;
}

// ---------- генерация ----------
const viewer = $("#viewer"), stage = $("#stage"), img = $("#img"), spots = $("#spots");
const goBtn = $("#go");
let zones = [], lastParams = null, timer = null;

form.addEventListener("submit", e => {
  e.preventDefault();
  const d = readForm();
  const err = validate(d);
  $("#formErr").hidden = !err;
  $("#formErr").textContent = err;
  if (err) return;
  generate(d);
});
$("#retry").addEventListener("click", () => lastParams && generate(lastParams));

function generate(d) {
  lastParams = d;
  closeZoom(true);
  viewer.dataset.state = "loading";
  goBtn.disabled = true;
  goBtn.textContent = "Генерируем…";
  $("#hint").hidden = true;
  if (window.matchMedia("(max-width: 900px)").matches) viewer.scrollIntoView({ behavior: "smooth", block: "center" });

  const started = Date.now();
  clearInterval(timer);
  timer = setInterval(() => {
    const s = Math.round((Date.now() - started) / 1000);
    $("#loadTimer").textContent = `прошло ${s} с · обычно 10–40 секунд`;
  }, 1000);

  const seed = Math.floor(Math.random() * 1e9);
  const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(buildPrompt(d)) +
    `?width=1024&height=768&seed=${seed}&nologo=true&model=flux`;

  const pre = new Image();
  const fail = setTimeout(() => done(false), 120000);
  pre.onload = () => done(true);
  pre.onerror = () => done(false);
  pre.src = url;

  function done(ok) {
    clearTimeout(fail);
    clearInterval(timer);
    pre.onload = pre.onerror = null;
    goBtn.disabled = false;
    goBtn.textContent = "Создать дизайн";
    if (lastParams !== d) return;
    zones = pickMaterials(d);
    if (ok) {
      img.src = url;
      $("#demoNote").hidden = true;
    } else {
      // Бесплатный лимит генерации исчерпан или сервис недоступен: показываем пример,
      // чтобы точки, зум и подбор материалов всё равно можно было посмотреть.
      img.src = "demo.jpg";
      for (const z of zones) Object.assign(z, DEMO_SPOTS[z.id]);
      $("#demoNote").hidden = false;
    }
    renderSpots();
    renderCards();
    viewer.dataset.state = "ready";
    $("#hint").hidden = false;
  }
}

// Координаты зон на demo.jpg (тумба слева, ванна справа).
const DEMO_SPOTS = {
  walls: { x: .5, y: .33 },
  wet: { x: .74, y: .74 },
  joints: { x: .3, y: .9 },
  floor: { x: .5, y: .82 },
  seal: { x: .62, y: .67 },
};

// ---------- точки ----------
function renderSpots() {
  spots.innerHTML = "";
  for (const z of zones) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "spot";
    b.style.left = z.x * 100 + "%";
    b.style.top = z.y * 100 + "%";
    b.setAttribute("aria-label", `${z.title}: ${PRODUCTS[z.main].name}`);
    b.innerHTML = `<span class="tip">${z.title}</span>`;
    b._zone = z;
    attachDrag(b);
    spots.append(b);
  }
}

// Точку можно перетащить, если генерация положила зону в другое место.
function attachDrag(b) {
  let start = null, moved = false;
  b.addEventListener("pointerdown", e => {
    if (viewer.classList.contains("zoomed")) return;
    start = { x: e.clientX, y: e.clientY };
    moved = false;
    b.setPointerCapture(e.pointerId);
  });
  b.addEventListener("pointermove", e => {
    if (!start) return;
    if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
    moved = true;
    b.classList.add("dragging");
    const r = stage.getBoundingClientRect();
    const z = b._zone;
    z.x = Math.min(.97, Math.max(.03, (e.clientX - r.left) / r.width));
    z.y = Math.min(.97, Math.max(.03, (e.clientY - r.top) / r.height));
    b.style.left = z.x * 100 + "%";
    b.style.top = z.y * 100 + "%";
  });
  const end = () => { start = null; b.classList.remove("dragging"); };
  b.addEventListener("pointerup", end);
  b.addEventListener("pointercancel", end);
  b.addEventListener("click", e => {
    e.stopPropagation();
    if (moved) { moved = false; return; }
    openZoom(b);
  });
}

// ---------- зум и мини-окно ----------
const SCALE = 2.4;

function openZoom(b) {
  const z = b._zone;
  const W = viewer.clientWidth, H = viewer.clientHeight;
  const mobile = window.matchMedia("(max-width: 600px)").matches;
  // Точку ставим в центр свободной части: слева от окна на десктопе. На телефоне окно снизу экрана,
  // поэтому картинку прокручиваем к верху экрана.
  const cx = mobile ? W / 2 : (W - Math.min(330, W * .42) - 24) / 2;
  const cy = H / 2;
  if (mobile) viewer.scrollIntoView({ behavior: "smooth", block: "start" });
  const tx = Math.min(0, Math.max(W - SCALE * W, cx - SCALE * z.x * W));
  const ty = Math.min(0, Math.max(H - SCALE * H, cy - SCALE * z.y * H));
  stage.style.setProperty("--s", SCALE);
  stage.style.transform = `translate(${tx}px, ${ty}px) scale(${SCALE})`;

  for (const s of spots.children) s.classList.toggle("active", s === b);
  viewer.classList.add("zoomed");
  fillDrawer(z);
  $("#drawer").setAttribute("aria-hidden", "false");
  setTimeout(() => $("#close").focus({ preventScroll: true }), 500);
}

function closeZoom(instant) {
  if (instant) stage.style.transition = "none";
  stage.style.transform = "";
  stage.style.setProperty("--s", 1);
  viewer.classList.remove("zoomed");
  $("#drawer").setAttribute("aria-hidden", "true");
  for (const s of spots.children) s.classList.remove("active");
  if (instant) { stage.offsetWidth; stage.style.transition = ""; }
}

function fillDrawer(z) {
  const p = PRODUCTS[z.main];
  $("#dZone").textContent = z.title;
  $("#dLink").href = p.url;
  $("#dImg").src = p.img;
  $("#dImg").alt = p.name;
  $("#dKind").textContent = p.kind;
  $("#dName").textContent = p.name;
  $("#dDesc").textContent = p.desc;
  const also = $("#dAlso");
  also.innerHTML = z.also.length ? "<h4>Также для этой зоны</h4>" : "";
  for (const id of z.also) {
    const q = PRODUCTS[id];
    const a = document.createElement("a");
    a.href = q.url; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = `<img alt="" src="${q.img}"><span><b></b><br><small></small></span>`;
    a.querySelector("b").textContent = q.name;
    a.querySelector("small").textContent = q.kind;
    also.append(a);
  }
}

$("#close").addEventListener("click", e => { e.stopPropagation(); closeZoom(); });
stage.addEventListener("click", () => viewer.classList.contains("zoomed") && closeZoom());
document.addEventListener("keydown", e => e.key === "Escape" && closeZoom());
window.addEventListener("resize", () => viewer.classList.contains("zoomed") && closeZoom(true));

// ---------- «Для реализации понадобится» ----------
function renderCards() {
  const seen = new Map();
  for (const z of zones) for (const id of [z.main, ...z.also]) if (!seen.has(id)) seen.set(id, z.title);
  const cards = $("#cards");
  cards.innerHTML = "";
  for (const [id, zone] of seen) {
    const p = PRODUCTS[id];
    const a = document.createElement("a");
    a.className = "card"; a.href = p.url; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = `<img loading="lazy" alt=""><span class="tag"></span><span class="n"></span><span class="k"></span>`;
    a.querySelector("img").src = p.img;
    a.querySelector("img").alt = p.name;
    a.querySelector(".tag").textContent = zone;
    a.querySelector(".n").textContent = p.name;
    a.querySelector(".k").textContent = p.kind;
    cards.append(a);
  }
  $("#need").hidden = false;
}
