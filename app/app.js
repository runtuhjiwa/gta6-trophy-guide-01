// Leonida Trophy Guide — checklist, filters, spoiler setting, export/import.
// Plain ES module, no build step, works offline from a static file server.
const STORAGE_KEY = 'leonida-trophy-guide-v1';
const ROADMAP = [
  { step: 'Play the story', detail: 'Finish the prologue and Chapters 1-5, then the final mission. Story trophies pop as you go: Welcome to Leonida, Partners in Crime, Out of the Past, A New Leaf, The Big Score, No Turning Back, Family Business, Trust No One, The Long Way Home, and the Gold King of Leonida.' },
  { step: 'Save the missable one', detail: 'Before the mid-story standoff mission, make a manual save. In the mission, pick the calm, positive dialogue option to earn Positive Mental Attitude. It is the only trophy you cannot get later.' },
  { step: 'Do every heist', detail: 'Complete all setup missions and finales. Heist Master (Silver) pops after the last finale, and Clean Getaway (Bronze) comes from escaping a 5-star wanted level during a finale.' },
  { step: 'Clear the map', detail: 'Visit every district for Leonida Explorer, then work the sets: 50 hidden packages (Collector), every stunt jump (Daredevil), every street race (Street King), every Strangers & Freaks mission (Vice City Veteran).' },
  { step: 'Buy and build', detail: 'Buy your first safehouse and car, then all three properties for House Hunter and every property for Property Mogul. Keep businesses running toward Kingpin level 10.' },
  { step: 'Activities and grinds', detail: 'Fishing, hunting, golf (Hole in One), the casino (High Roller), pickpocketing, rampages, headshots, bullets fired, miles driven and cars stolen all count up in the background. Check the summary counts below to see what is left.' },
  { step: 'Finish at 100%', detail: 'When every set is done, 100 Percent (Gold) pops, and the Platinum Leonida Legend follows automatically.' },
];

let trophies = [];
let earned = new Set();
let revealed = new Set();

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.earned)) earned = new Set(parsed.earned.filter((id) => typeof id === 'string'));
    if (Array.isArray(parsed.revealed)) revealed = new Set(parsed.revealed.filter((id) => typeof id === 'string'));
  } catch (_) { /* corrupted save: start fresh */ }
}
function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earned], revealed: [...revealed] }));
}

const $ = (id) => document.getElementById(id);
const gradeLabel = (g) => g[0].toUpperCase() + g.slice(1);

function updateProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('progressText').textContent = `${done} / ${total} unlocked`;
  $('progressPct').textContent = `${pct}%`;
  $('progressFill').style.width = `${pct}%`;
}

function updateSummary(list) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const earnedCounts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  trophies.forEach((t) => { counts[t.grade]++; if (earned.has(t.id)) earnedCounts[t.grade]++; });
  $('summary').textContent =
    `Showing ${list.length} of ${trophies.length} trophies — ` +
    `Platinum ${earnedCounts.platinum}/${counts.platinum}, Gold ${earnedCounts.gold}/${counts.gold}, ` +
    `Silver ${earnedCounts.silver}/${counts.silver}, Bronze ${earnedCounts.bronze}/${counts.bronze}. ` +
    `${trophies.filter((t) => t.hidden).length} hidden, 1 missable.`;
}

function visibleTrophies() {
  const q = $('searchBox').value.trim().toLowerCase();
  const grade = $('gradeFilter').value;
  const hideEarned = $('hideEarned').checked;
  return trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (hideEarned && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function render() {
  const list = visibleTrophies();
  const showSpoilers = $('spoilerToggle').checked;
  const el = $('trophyList');
  el.innerHTML = '';
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No trophies match the current filters.';
    el.appendChild(p);
  }
  for (const t of list) {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
    card.tabIndex = 0;
    card.setAttribute('role', 'checkbox');
    card.setAttribute('aria-checked', earned.has(t.id) ? 'true' : 'false');

    const icon = document.createElement('div');
    icon.className = 'ticon ' + t.grade;
    icon.textContent = t.grade === 'platinum' ? 'Plat' : t.grade.slice(0, 4);
    card.appendChild(icon);

    const name = document.createElement('div');
    name.className = 'tname';
    const isHidden = t.hidden && !showSpoilers && !revealed.has(t.id);
    name.textContent = isHidden ? 'Hidden Trophy' : t.name;
    const tags = document.createElement('span');
    tags.className = 'tags';
    tags.textContent = gradeLabel(t.grade) + (t.hidden ? ' · Hidden' : '') + (t.missable ? ' · Missable' : '');
    name.appendChild(tags);
    card.appendChild(name);

    const desc = document.createElement('div');
    desc.className = 'tdesc';
    desc.textContent = isHidden ? 'Hidden Trophy — tap to reveal' : t.description;
    card.appendChild(desc);

    const guide = document.createElement('div');
    guide.className = 'tguide';
    if (isHidden) {
      const mask = document.createElement('span');
      mask.className = 'hidden-mask';
      mask.textContent = 'Details hidden to avoid spoilers. Turn on “Show hidden trophy details” or tap this card to reveal it.';
      guide.appendChild(mask);
    } else {
      guide.textContent = t.guide + ' ';
      const src = document.createElement('span');
      src.className = 'src';
      src.textContent = 'Source: ' + t.source + '.';
      guide.appendChild(src);
    }
    card.appendChild(guide);

    const check = document.createElement('label');
    check.className = 'tcheck';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveEarned();
      render();
    });
    check.appendChild(box);
    check.appendChild(document.createTextNode(' Earned'));
    card.appendChild(check);

    const toggle = () => {
      if (t.hidden && !showSpoilers && !revealed.has(t.id)) {
        revealed.add(t.id);
        saveEarned();
        render();
        return;
      }
      if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
      saveEarned();
      render();
    };
    card.addEventListener('click', (e) => { if (e.target !== box) toggle(); });
    card.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    el.appendChild(card);
  }
  updateProgress();
  updateSummary(list);
}

function renderRoadmap() {
  const ol = $('roadmapList');
  ol.innerHTML = '';
  ROADMAP.forEach((item, i) => {
    const li = document.createElement('li');
    const b = document.createElement('strong');
    b.textContent = `${i + 1}. ${item.step} — `;
    li.appendChild(b);
    li.appendChild(document.createTextNode(item.detail));
    ol.appendChild(li);
  });
}

function exportChecklist() {
  const blob = new Blob([JSON.stringify({ earned: [...earned], revealed: [...revealed] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-checklist.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importChecklist(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const ids = new Set(trophies.map((t) => t.id));
      const next = new Set((parsed.earned || []).filter((id) => ids.has(id)));
      const nextRevealed = new Set((parsed.revealed || []).filter((id) => ids.has(id)));
      earned = next;
      revealed = nextRevealed;
      saveEarned();
      render();
    } catch (_) {
      alert('That file is not a valid checklist JSON file.');
    }
  };
  reader.readAsText(file);
}

async function init() {
  loadEarned();
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies;
  renderRoadmap();
  $('searchBox').addEventListener('input', render);
  $('gradeFilter').addEventListener('change', render);
  $('hideEarned').addEventListener('change', render);
  $('spoilerToggle').addEventListener('change', render);
  $('exportBtn').addEventListener('click', exportChecklist);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importChecklist(e.target.files[0]); });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Reset the whole checklist?')) { earned = new Set(); revealed = new Set(); saveEarned(); render(); }
  });
  render();
}

init();
