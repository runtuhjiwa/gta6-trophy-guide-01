// Leonida Trophy Guide: checklist + detail pane + roadmap, saved in localStorage.
// Data comes from data/trophies.json (official names/descriptions/grades, our own
// guides, and a "when" note per trophy). Everything runs offline: no network
// request is made at run time — the only fetch is the relative data/trophies.json.
const KEY = 'gta6-trophy-guide-progress-v1';
const SETTINGS_KEY = 'gta6-trophy-guide-settings-v1';

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const roadmap = doc.roadmap || [];

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let settings = { spoiler: false, kind: 'all', grade: 'all', earnedOnly: false, todoOnly: false, search: '' };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')); } catch { /* keep defaults */ }
if (params.get('spoiler') === '1') settings.spoiler = true;
if (params.get('kind')) settings.kind = params.get('kind');
if (params.get('select')) settings.selected = Number(params.get('select'));
if (params.get('demo') === '1') {
  // Demo progress for the screenshots: six early trophies already earned.
  for (const id of [2, 3, 4, 8, 20, 21]) earned.add(trophies.find((t) => t.id === id).name);
  settings.selected = settings.selected ?? 28;
}
let selected = settings.selected ?? trophies[0].id;

const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const detailEl = $('detail');

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', platinum: 'Platinum' };
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoiler: settings.spoiler, kind: settings.kind, grade: settings.grade, earnedOnly: settings.earnedOnly, todoOnly: settings.todoOnly }));
}

function isHidden(t) { return t.hidden && !earned.has(t.name); }
function displayName(t) { return settings.spoiler && isHidden(t) ? 'Hidden trophy' : t.name; }
function displayDesc(t) { return settings.spoiler && isHidden(t) ? 'Earn this trophy to reveal its name and description.' : t.description; }

function kindCount(kind) {
  if (kind === 'missable') return trophies.filter((t) => t.missable).length;
  if (kind === 'online') return 0;
  return trophies.filter((t) => t.kind === kind).length;
}

function matches(t) {
  if (settings.kind === 'missable') { if (!t.missable) return false; }
  else if (settings.kind === 'online') { return false; }
  else if (settings.kind !== 'all' && t.kind !== settings.kind) { return false; }
  if (settings.grade !== 'all' && t.grade !== settings.grade) return false;
  if (settings.earnedOnly && !earned.has(t.name)) return false;
  if (settings.todoOnly && earned.has(t.name)) return false;
  if (settings.search) {
    const q = settings.search.toLowerCase();
    if (!`${t.name} ${t.description} ${t.guide} ${t.when || ''}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

function renderFacts() {
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${trophies.filter((t) => t.grade === g).length} ${GRADE_LABELS[g].toLowerCase()}`)
    .join(' · ');
  $('facts').textContent = `${trophies.length} trophies — ${counts} · ${trophies.filter((t) => t.hidden).length} hidden · ${trophies.filter((t) => t.missable).length} missable`;
}

function renderRoadmap() {
  const grid = $('roadmap-grid');
  grid.replaceChildren();
  for (const stage of roadmap) {
    const members = trophies.filter((t) => t.roadmap === stage.stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('article');
    card.className = 'roadmap-card';
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.stage} — ${stage.title}`;
    const meta = document.createElement('p');
    meta.className = 'roadmap-meta';
    meta.textContent = `${done} of ${members.length} earned · ~${stage.hours} hours`;
    const bar = document.createElement('div');
    bar.className = 'roadmap-bar';
    const fill = document.createElement('div');
    fill.className = 'roadmap-fill';
    fill.style.width = `${members.length ? Math.round((done / members.length) * 100) : 0}%`;
    bar.append(fill);
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('p');
    chips.className = 'roadmap-chips';
    for (const t of members.slice(0, 8)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'mini-chip' + (earned.has(t.name) ? ' done' : '');
      chip.textContent = displayName(t);
      chip.addEventListener('click', () => select(t.id, true));
      chips.append(chip);
    }
    if (members.length > 8) {
      const more = document.createElement('span');
      more.className = 'mini-chip more';
      more.textContent = `+${members.length - 8} more`;
      chips.append(more);
    }
    card.append(h, meta, bar, p, chips);
    grid.append(card);
  }
}

function renderChips() {
  const wrap = $('kind-chips');
  wrap.replaceChildren();
  for (const kind of ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'platinum']) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (settings.kind === kind ? ' active' : '');
    const n = kind === 'all' ? trophies.length : kindCount(kind);
    b.textContent = kind === 'all' ? `All kinds (${n})` : `${KIND_LABELS[kind]} (${n})`;
    b.addEventListener('click', () => { settings.kind = kind; save(); render(); });
    wrap.append(b);
  }
}

function renderList() {
  rowsEl.replaceChildren();
  const shown = trophies.filter(matches);
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.name) ? ' earned' : '') + (t.id === selected ? ' selected' : '');
    li.dataset.id = t.id;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${displayName(t)} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      save(); render();
    });
    const body = document.createElement('button');
    body.type = 'button';
    body.className = 'trophy-body';
    body.addEventListener('click', () => select(t.id, false));
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(t);
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = displayDesc(t);
    const when = document.createElement('span');
    when.className = 'trophy-when';
    when.textContent = t.when ? `Earliest: ${t.when}` : '';
    const tags = document.createElement('span');
    tags.className = 'trophy-tags';
    const grade = document.createElement('span');
    grade.className = `grade grade-${t.grade}`;
    grade.textContent = GRADE_LABELS[t.grade];
    tags.append(grade);
    if (t.missable) { const m = document.createElement('span'); m.className = 'tag tag-missable'; m.textContent = 'MISSABLE'; tags.append(m); }
    if (t.hidden) { const h = document.createElement('span'); h.className = 'tag tag-hidden'; h.textContent = 'HIDDEN'; tags.append(h); }
    const kind = document.createElement('span');
    kind.className = 'tag';
    kind.textContent = KIND_LABELS[t.kind] || t.kind;
    tags.append(kind);
    body.append(name, desc, when, tags);
    li.append(box, body);
    rowsEl.append(li);
  }
  $('result-count').textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selected) || trophies[0];
  detailEl.replaceChildren();
  const hidden = settings.spoiler && isHidden(t);
  const h = document.createElement('h2');
  h.textContent = hidden ? 'Hidden trophy' : t.name;
  const grade = document.createElement('p');
  grade.className = `grade grade-${t.grade} grade-big`;
  grade.textContent = `${GRADE_LABELS[t.grade]}${t.hidden ? ' · Hidden on PlayStation' : ''}${t.missable ? ' · Missable' : ''}`;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = hidden ? 'Earn this trophy to reveal its name and description.' : `Official description: “${t.description}”`;
  detailEl.append(h, grade, desc);
  if (hidden) {
    const note = document.createElement('p');
    note.className = 'detail-spoiler-note';
    note.textContent = 'Spoiler hiding is on. Untick “Hide story spoilers” above, or earn this trophy, to read its guide.';
    detailEl.append(note);
    return;
  }
  const when = document.createElement('p');
  when.className = 'detail-when';
  when.textContent = t.when ? `Earliest you can earn it: ${t.when}.` : '';
  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  const src = document.createElement('p');
  src.className = 'detail-source';
  const srcLabel = document.createElement('span');
  srcLabel.textContent = 'Source: ';
  const a = document.createElement('a');
  a.href = t.source_url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = t.source;
  src.append(srcLabel, a);
  const stage = roadmap.find((s) => s.stage === t.roadmap);
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = `Kind: ${KIND_LABELS[t.kind] || t.kind} · ${stage ? `Roadmap stage ${stage.stage} — ${stage.title}` : ''} · ${earned.has(t.name) ? 'Earned ✓' : 'Not earned yet'}`;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'detail-toggle';
  toggle.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name); else earned.add(t.name);
    save(); render();
  });
  detailEl.append(when, guideTitle, guide, src, meta, toggle);
}

function renderProgress() {
  $('earned-count').textContent = earned.size;
  $('progress-fill').style.width = `${Math.round((earned.size / trophies.length) * 100)}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const total = trophies.filter((t) => t.grade === g).length;
    const done = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    return `${done}/${total} ${GRADE_LABELS[g].toLowerCase()}`;
  });
  $('grade-counts').textContent = counts.join(' · ');
  const kinds = ['story', 'collectibles', 'activities'].map((k) => {
    const total = kindCount(k);
    const done = trophies.filter((t) => t.kind === k && earned.has(t.name)).length;
    return `${done}/${total} ${KIND_LABELS[k].toLowerCase()}`;
  });
  $('kind-counts').textContent = `${kinds.join(' · ')} · ${trophies.filter((t) => t.missable && earned.has(t.name)).length}/1 missable`;
}

function render() {
  renderFacts();
  renderRoadmap();
  renderChips();
  renderList();
  renderDetail();
  renderProgress();
  $('spoiler').checked = settings.spoiler;
  $('earned-only').checked = settings.earnedOnly;
  $('todo-only').checked = settings.todoOnly;
  $('grade').value = settings.grade;
  $('search').value = settings.search;
}

function select(id, scroll) {
  selected = id;
  render();
  if (scroll) detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function nextNotEarned() {
  // First not-earned trophy in roadmap order (stage, then list order).
  const ordered = [...trophies].sort((a, b) => (a.roadmap - b.roadmap) || (a.id - b.id));
  const next = ordered.find((t) => !earned.has(t.name));
  if (next) {
    settings.kind = 'all'; settings.grade = 'all'; settings.search = ''; settings.earnedOnly = false; settings.todoOnly = false;
    select(next.id, true);
  }
}

$('search').addEventListener('input', (e) => { settings.search = e.target.value; renderList(); });
$('spoiler').addEventListener('change', (e) => { settings.spoiler = e.target.checked; save(); render(); });
$('earned-only').addEventListener('change', (e) => { settings.earnedOnly = e.target.checked; settings.todoOnly = false; save(); render(); });
$('todo-only').addEventListener('change', (e) => { settings.todoOnly = e.target.checked; settings.earnedOnly = false; save(); render(); });
$('grade').addEventListener('change', (e) => { settings.grade = e.target.value; save(); render(); });
$('next').addEventListener('click', nextNotEarned);
$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    const incoming = Array.isArray(data) ? data : data.earned;
    earned = new Set((incoming || []).filter((n) => names.has(n)));
    save(); render();
  } catch { alert('That file is not a valid progress export.'); }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) { earned = new Set(); save(); render(); }
});

render();
// Screenshot-friendly views: ?focus=roadmap shows only the roadmap, ?focus=tracker
// shows only the tracker (no scrolling, so the shot is deterministic).
const focus = params.get('focus');
if (focus === 'roadmap' || focus === 'tracker') document.body.classList.add(`focus-${focus}`);
