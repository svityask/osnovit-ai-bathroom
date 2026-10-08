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
      id: "walls", title: "Стены", x: .62, y: .25,
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
let lastJob = null;
$("#retry").addEventListener("click", () => lastJob && lastJob());

function generate(d) {
  lastJob = () => generate(d);
  const prompt = buildPrompt(d);
  const seed = Math.floor(Math.random() * 1e9);
  runJob({
    params: d, button: goBtn, idleText: "Создать дизайн", busyText: "Генерируем…",
    title: "Рисуем вашу ванную…", eta: "обычно 5–20 секунд", timeout: 120000,
    work: () => generateFlux(prompt, seed),
  });
}

// Общий запуск генерации или правки: состояние загрузки, таймер, результат, точки.
function runJob({ params: d, button, idleText, busyText, title, eta, timeout, work }) {
  lastParams = d;
  closeZoom(true);
  viewer.dataset.state = "loading";
  viewer.classList.remove("example");
  for (const b of [goBtn, editGo]) b.disabled = true;
  button.textContent = busyText;
  $("#loadTitle").textContent = title;
  $("#hint").hidden = true;
  if (window.matchMedia("(max-width: 900px)").matches) viewer.scrollIntoView({ behavior: "smooth", block: "center" });

  const started = Date.now();
  clearInterval(timer);
  $("#loadTimer").textContent = eta;
  timer = setInterval(() => {
    const s = Math.round((Date.now() - started) / 1000);
    $("#loadTimer").textContent = `прошло ${s} с · ${eta}`;
  }, 1000);

  const fail = setTimeout(() => done(null, new Error("timeout")), timeout);
  getSegmenter().catch(() => {}); // модель сегментации грузится, пока рисуется картинка
  work().then(url => done(url), e => done(null, e));

  let finished = false;
  function done(url, error) {
    if (finished) return;
    finished = true;
    clearTimeout(fail);
    clearInterval(timer);
    for (const b of [goBtn, editGo]) b.disabled = false;
    button.textContent = idleText;
    if (lastParams !== d) return;
    if (!url) { $("#failText").textContent = explain(error); viewer.dataset.state = "error"; return; }
    img.src = url;
    zones = pickMaterials(d);
    spots.innerHTML = "";
    renderCards();
    viewer.dataset.state = "ready";
    const hint = $("#hint");
    hint.hidden = false;
    hint.textContent = "Ищем на картинке стены, пол и мокрую зону…";
    locateZones(url, zones)
      .catch(() => ({ found: false }))
      .then(({ found, isBath }) => {
        if (lastParams !== d) return;
        // На своём фото мокрую зону определяет сегментация: ванна или душ.
        if (d.fromPhoto && isBath !== undefined && (d.wet === "bath") !== isBath) {
          const coords = Object.fromEntries(zones.map(z => [z.id, { x: z.x, y: z.y }]));
          d.wet = isBath ? "bath" : "shower";
          zones = pickMaterials(d);
          for (const z of zones) Object.assign(z, coords[z.id]);
          renderCards();
        }
        renderSpots();
        hint.textContent = found
          ? "Нажмите на точку, чтобы приблизить. Точки расставлены автоматически; если какая-то промахнулась, перетащите её."
          : "Нажмите на точку, чтобы приблизить. Если точка промахнулась, перетащите её на нужное место.";
      });
  }
}

// ---------- вкладки ----------
const editForm = $("#editForm"), editGo = $("#editGo");
function showTab(edit) {
  $("#tabCreate").setAttribute("aria-selected", String(!edit));
  $("#tabEdit").setAttribute("aria-selected", String(edit));
  form.hidden = edit;
  editForm.hidden = !edit;
}
$("#tabCreate").addEventListener("click", () => showTab(false));
$("#tabEdit").addEventListener("click", () => showTab(true));

// ---------- режим «Редактировать своё изображение» ----------
let photoFile = null;
const photo = $("#photo"), drop = $("#drop");

function setPhoto(file) {
  const err = $("#editErr");
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { err.hidden = false; err.textContent = "Нужна картинка JPG, PNG или WebP."; return; }
  if (file.size > 15e6) { err.hidden = false; err.textContent = "Файл больше 15 МБ."; return; }
  err.hidden = true;
  photoFile = file;
  const prev = $("#photoPreview");
  if (prev.src.startsWith("blob:")) URL.revokeObjectURL(prev.src);
  prev.src = URL.createObjectURL(file);
  prev.hidden = false;
  $("#dropText").hidden = true;
}
photo.addEventListener("change", () => setPhoto(photo.files[0]));
drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("over"); setPhoto(e.dataTransfer.files[0]); });

for (const b of $("#quick").children) {
  b.setAttribute("aria-pressed", "false");
  b.addEventListener("click", () => b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")));
}

editForm.addEventListener("submit", e => {
  e.preventDefault();
  const err = $("#editErr");
  const chips = [...$("#quick").children].filter(b => b.getAttribute("aria-pressed") === "true").map(b => b.dataset.t);
  const own = $("#editPrompt").value.trim();
  const msg = !photoFile ? "Загрузите фото ванной." : !chips.length && !own ? "Напишите, что поменять, или выберите вариант выше." : "";
  err.hidden = !msg;
  err.textContent = msg;
  if (msg) return;
  editPhoto(photoFile, [...chips, own].filter(Boolean).join("; "), new FormData(editForm));
});

function editPhoto(file, changes, f) {
  lastJob = () => editPhoto(file, changes, f);
  const dims = ["length", "width", "height"].map(k => Number(f.get(k)) || 0);
  const size = dims.every(Boolean) ? ` Размер помещения ${dims.join("×")} мм.` : "";
  const prompt = `Отредактируй фото ванной комнаты: ${changes}.${size} ` +
    "Сохрани форму комнаты, ракурс камеры, перспективу и расположение сантехники. Фотореалистичный интерьер.";
  // Материалы подбираем по параметрам первой вкладки, мокрую зону уточнит сегментация.
  const d = { ...readForm(), fromPhoto: true };
  runJob({
    params: d, button: editGo, idleText: "Изменить дизайн", busyText: "Меняем…",
    title: "Меняем дизайн вашей ванной…", eta: "обычно 20–60 секунд", timeout: 240000,
    work: async () => {
      const image = await toFourThree(file);
      // Qwen-Image-Edit понимает русский; FLUX.1 Kontext — запасной вариант.
      return editWithSpace(QWEN_EDIT_SPACE, image, f => [f, prompt, 0, true, 1, 8, false])
        .catch(e => {
          if (/quota/i.test(e.message)) throw e;
          return editWithSpace(KONTEXT_SPACE, image, f => [f, prompt, 0, true, 2.5, 28]);
        });
    },
  });
}

// Фото → JPEG 4:3 до 1024×768 (обрезка по центру), чтобы точки совпадали с картинкой.
async function toFourThree(file) {
  const bmp = await createImageBitmap(file);
  let sw = bmp.width, sh = bmp.height;
  if (sw / sh > 4 / 3) sw = sh * 4 / 3; else sh = sw * 3 / 4;
  const w = Math.min(1024, Math.round(sw)), h = Math.round(w * 3 / 4);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, 0, 0, w, h);
  return new Promise(r => c.toBlob(r, "image/jpeg", .92));
}

// Правка фото открытой моделью в публичном Hugging Face Space.
const QWEN_EDIT_SPACE = "https://multimodalart-qwen-image-edit-fast.hf.space";
const KONTEXT_SPACE = "https://black-forest-labs-flux-1-kontext-dev.hf.space";

async function editWithSpace(space, image, args) {
  const fd = new FormData();
  fd.append("files", image, "bathroom.jpg");
  const up = await fetch(space + "/gradio_api/upload", { method: "POST", body: fd });
  if (!up.ok) throw new Error("upload " + up.status);
  const [path] = await up.json();
  const [result] = await callSpace(space, "infer", args({ path, meta: { _type: "gradio.FileData" } }));
  return keepImage(result.url);
}

// Генерация: открытая модель FLUX.1-schnell в публичном Hugging Face Space.
// Бесплатно, без ключа; у каждого посетителя свой суточный лимит GPU.
const FLUX_SPACE = "https://black-forest-labs-flux-1-schnell.hf.space";

async function generateFlux(prompt, seed) {
  // prompt, seed, randomize_seed, width, height, steps
  const [result] = await callSpace(FLUX_SPACE, "infer", [prompt, seed, false, 1024, 768, 4]);
  return keepImage(result.url);
}

// Вызов функции Gradio Space через очередь. В отличие от /call, очередь возвращает текст ошибки,
// например «ZeroGPU quota exceeded … Try again in 0:12:00», и его можно показать человеку.
const spaceConfigs = {};
async function callSpace(space, apiName, data) {
  spaceConfigs[space] ??= fetch(space + "/config").then(r => r.json())
    .catch(e => { delete spaceConfigs[space]; throw e; });
  const cfg = await spaceConfigs[space];
  const fn_index = cfg.dependencies.findIndex(d => d.api_name === apiName);
  const session_hash = Math.random().toString(36).slice(2);
  const join = await fetch(space + "/gradio_api/queue/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, fn_index, session_hash, event_data: null, trigger_id: null }),
  });
  if (!join.ok) throw new Error("join " + join.status);
  const stream = await (await fetch(`${space}/gradio_api/queue/data?session_hash=${session_hash}`)).text();
  for (const line of stream.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const m = JSON.parse(line.slice(6));
    if (m.msg !== "process_completed") continue;
    if (m.success) return m.output.data;
    throw new Error(m.output?.error || m.title || "failed");
  }
  throw new Error("no result");
}

// Файлы Space временные, поэтому сразу сохраняем картинку в память браузера.
async function keepImage(remoteUrl) {
  const blob = await (await fetch(remoteUrl)).blob();
  const url = URL.createObjectURL(blob);
  await preload(url);
  return url;
}

// Понятный текст ошибки для экрана «не получилось».
function explain(err) {
  const msg = String(err?.message || err);
  if (/quota/i.test(msg)) {
    const t = msg.match(/Try again in (\d+):(\d+):(\d+)/);
    const min = t ? Number(t[1]) * 60 + Number(t[2]) + (Number(t[3]) > 0 ? 1 : 0) : 0;
    return "Закончился бесплатный лимит GPU на Hugging Face. У каждого посетителя он свой и восстанавливается со временем" +
      (min > 1 ? `: попробуйте примерно через ${min} мин.` : ". Попробуйте чуть позже.");
  }
  return "Hugging Face не ответил: сервер перегружен или временно недоступен. Попробуйте ещё раз чуть позже.";
}

function preload(url) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = resolve;
    im.onerror = reject;
    im.src = url;
  });
}

// ---------- автоматические точки: сегментация в браузере ----------
// Модель SegFormer (ADE20K, обучена на интерьерах) скачивается с Hugging Face Hub
// и работает прямо в браузере через transformers.js: без сервера и без лимитов.
const TRANSFORMERS_JS = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";
const SEG_MODEL = "Xenova/segformer-b0-finetuned-ade-512-512";
let segmenter = null;

function getSegmenter() {
  segmenter ??= import(TRANSFORMERS_JS)
    .then(({ pipeline }) => pipeline("image-segmentation", SEG_MODEL, { dtype: "q8" }))
    .catch(e => { segmenter = null; throw e; });
  return segmenter;
}

const GW = 64, GH = 48; // сетка, на которой ищем точки

// Маски классов → сетка GW×GH: клетка «внутри», если в ней больше половины пикселей класса.
function toGrid(masks) {
  const g = new Uint8Array(GW * GH);
  if (!masks.length) return g;
  const { width: w, height: h } = masks[0];
  const cw = w / GW, chh = h / GH;
  for (let gy = 0; gy < GH; gy++) {
    for (let gx = 0; gx < GW; gx++) {
      let inside = 0, total = 0;
      for (let y = Math.floor(gy * chh); y < (gy + 1) * chh; y += 2) {
        for (let x = Math.floor(gx * cw); x < (gx + 1) * cw; x += 2) {
          total++;
          if (masks.some(m => m.data[y * w + x])) inside++;
        }
      }
      g[gy * GW + gx] = inside * 2 > total ? 1 : 0;
    }
  }
  return g;
}

// Расстояние от каждой клетки до края маски (или края картинки): чем больше, тем «глубже» точка.
function depth(g) {
  const d = new Float32Array(GW * GH);
  const at = (x, y) => (x < 0 || y < 0 || x >= GW || y >= GH ? 0 : d[y * GW + x]);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++)
    d[y * GW + x] = g[y * GW + x] ? Math.min(at(x - 1, y), at(x, y - 1)) + 1 : 0;
  for (let y = GH - 1; y >= 0; y--) for (let x = GW - 1; x >= 0; x--)
    if (g[y * GW + x]) d[y * GW + x] = Math.min(d[y * GW + x], at(x + 1, y) + 1, at(x, y + 1) + 1);
  return d;
}

const far = (p, others, min) => others.every(o => Math.hypot((p.x - o.x) * 4 / 3, p.y - o.y) >= min);

// Самая «глубокая» клетка маски, не ближе min к уже поставленным точкам.
function deepest(g, taken = [], min = .18) {
  const d = depth(g);
  let best = null, bestD = 1.5;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const p = { x: (x + .5) / GW, y: (y + .5) / GH };
    if (d[y * GW + x] > bestD && far(p, taken, min)) { bestD = d[y * GW + x]; best = p; }
  }
  return best;
}

// Середина области, которую ограничивает тонкая маска (стекло душевой): точка внутри душа.
function boxPoint(g) {
  let x0 = GW, y0 = GH, x1 = -1, y1 = -1;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (g[y * GW + x]) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return x1 < 0 ? null : { x: (x0 + x1 + 1) / 2 / GW, y: (y0 + (y1 - y0 + 1) * .6) / GH };
}

// Нижний край мокрой зоны там, где она касается пола или стены: место для герметика.
function junction(wet, around) {
  let best = null;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if (!wet[y * GW + x]) continue;
    const touches = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < GW && ny < GH && around[ny * GW + nx];
    });
    if (touches && (!best || y > best.gy)) best = { gy: y, x: (x + .5) / GW, y: (y + .5) / GH };
  }
  return best && { x: best.x, y: best.y };
}

async function locateZones(url, zones) {
  const seg = await getSegmenter();
  const out = await seg(url);
  const masks = names => out.filter(o => names.includes(o.label)).map(o => o.mask);
  const area = g => g.reduce((a, b) => a + b, 0) / g.length;

  const wall = toGrid(masks(["wall"]));
  const floor = toGrid(masks(["floor"]));
  let wet = toGrid(masks(["bathtub"]));
  const isBath = area(wet) >= .004;
  if (!isBath) wet = toGrid(masks(["shower", "screen door"]));
  const hasWet = area(wet) >= .004;
  const around = wall.map((v, i) => v | floor[i]);

  const taken = [];
  const put = (id, p) => {
    const z = zones.find(z => z.id === id);
    if (z && p) { Object.assign(z, p); taken.push(p); }
    return !!p;
  };
  let found = 0;
  if (hasWet) {
    found += put("wet", isBath ? deepest(wet) : boxPoint(wet));
    found += put("seal", junction(wet, around));
  } else {
    found += put("seal", junction(floor, wall));
  }
  found += put("walls", deepest(wall, taken, .3) || deepest(wall, taken));
  found += put("floor", deepest(floor, taken));
  found += put("joints", deepest(wall, taken, .25) || deepest(floor, taken, .2));
  return { found: found >= 3, isBath: hasWet ? isBath : undefined };
}

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
    b.innerHTML = `<span class="wave"></span><span class="tip">${z.title}</span>`;
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
  $("#drawer").inert = false;
  setTimeout(() => $("#close").focus({ preventScroll: true }), 500);
}

function closeZoom(instant) {
  if (instant) stage.style.transition = "none";
  stage.style.transform = "";
  stage.style.setProperty("--s", 1);
  viewer.classList.remove("zoomed");
  $("#drawer").inert = true;
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

// ---------- пример при открытии страницы ----------
// Картинка нарисована той же моделью FLUX.1-schnell на Hugging Face с параметрами формы по умолчанию,
// точки расставлены автоматической сегментацией (координаты сохранены, чтобы не грузить модель зря).
const EXAMPLE_SPOTS = {
  walls: { x: .85, y: .18 },
  wet: { x: .22, y: .53 },
  joints: { x: .10, y: .28 },
  floor: { x: .41, y: .84 },
  seal: { x: .18, y: .78 },
};

function showExample() {
  img.src = "example.webp";
  zones = pickMaterials(readForm());
  for (const z of zones) Object.assign(z, EXAMPLE_SPOTS[z.id]);
  renderSpots();
  renderCards();
  viewer.dataset.state = "ready";
  viewer.classList.add("example");
  const hint = $("#hint");
  hint.hidden = false;
  hint.textContent = "Это пример. Нажмите на точку, чтобы посмотреть материал. Заполните форму и нажмите «Создать дизайн», чтобы получить свой вариант.";
}
showExample();
