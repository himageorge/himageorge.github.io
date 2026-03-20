const { createClient } = window.supabase;
const client = createClient(
  'https://fngdqsaszyviqyszrdac.supabase.co',
  'sb_publishable_1YTgYnoqae1IL6tw0N5d-g_X3wNSyTY'
);

const MY_IDS_KEY = 'hima_my_suggestion_ids';

function getMyIds() {
  return JSON.parse(localStorage.getItem(MY_IDS_KEY) || '[]');
}
function addMyId(id) {
  const ids = getMyIds();
  ids.unshift(id);
  localStorage.setItem(MY_IDS_KEY, JSON.stringify(ids));
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function typeClass(type) {
  if (type === 'Issue') return 'badge-issue';
  if (type === 'General Comment') return 'badge-general';
  return 'badge-suggestion';
}

function updateLayout(hasItems) {
  const area = document.querySelector('.suggestion-area');
  if (area) area.classList.toggle('has-suggestions', hasItems);
}

async function renderFeed() {
  const list = document.getElementById('feedList');
  if (!list) return;
  list.innerHTML = '';

  const myIds = getMyIds();
  if (myIds.length === 0) { updateLayout(false); return; }

  const { data, error } = await client
    .from('suggestions')
    .select('*')
    .in('id', myIds)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) { updateLayout(false); return; }

  updateLayout(true);
  data.forEach(s => {
    const el = document.createElement('div');
    el.className = 'feed-item';
    el.style.display = 'grid';
    el.style.gridTemplateColumns = '1fr auto';
    el.style.gap = '0 0.75rem';
    el.innerHTML = `
      <div>
        <div class="feed-item-top">
          <span class="feed-badge ${escapeHtml(typeClass(s.type))}">${escapeHtml(s.type)}</span>
          <span class="feed-tag">${escapeHtml(s.tag)}</span>
        </div>
        <p class="feed-desc">${escapeHtml(s.description)}</p>
        <p class="feed-meta">${new Date(s.created_at).toLocaleDateString('en-CA', {year:'numeric',month:'short',day:'numeric'})}</p>
      </div>
      <button class="feed-delete-btn" title="Delete" data-id="${escapeHtml(s.id)}">&times;</button>`;
    list.appendChild(el);
  });
}

async function deleteMySuggestion(id, btn) {
  btn.disabled = true;
  btn.style.opacity = '0.4';
  const { error } = await client.from('suggestions').delete().eq('id', id);
  if (error) {
    btn.disabled = false;
    btn.style.opacity = '';
    console.error('Delete error:', error);
    return;
  }
  const ids = getMyIds().filter(i => i !== id);
  localStorage.setItem(MY_IDS_KEY, JSON.stringify(ids));
  await renderFeed();
}

function openSuggestionModal() {
  const modal = document.getElementById('suggestionModal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeSuggestionModal() {
  const modal = document.getElementById('suggestionModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

function animatePaperDrop(cb) {
  const slip = document.getElementById('paperSlip');
  if (!slip) { cb && cb(); return; }
  slip.classList.remove('dropping');
  void slip.offsetWidth;
  slip.classList.add('dropping');
  setTimeout(() => { slip.classList.remove('dropping'); cb && cb(); }, 680);
}

async function submitSuggestion() {
  const typeEl = document.querySelector('input[name="sug-type"]:checked');
  const activeChip = document.querySelector('.tag-chip.active');
  const descEl = document.getElementById('sugDescription');
  const type = typeEl ? typeEl.value : 'Suggestion';
  const tag = activeChip ? activeChip.dataset.value : 'General';
  const description = descEl ? descEl.value.trim() : '';
  if (!description) { if (descEl) descEl.focus(); return; }

  const btn = document.querySelector('.submit-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
  closeSuggestionModal();

  animatePaperDrop(async () => {
    const { data, error } = await client
      .from('suggestions')
      .insert({ type, tag, description })
      .select()
      .single();
    if (!error && data) addMyId(data.id);
    if (error) console.error('Submit error:', error);
    if (descEl) descEl.value = '';
    updateCharCount();
    await renderFeed();
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
  });
}

function updateCharCount() {
  const desc = document.getElementById('sugDescription');
  const counter = document.getElementById('charCount');
  if (!desc || !counter) return;
  const remaining = 300 - desc.value.length;
  counter.textContent = remaining + ' left';
  counter.style.color = remaining < 30 ? '#c44' : '';
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeed();

  document.getElementById('feedList')?.addEventListener('click', e => {
    const btn = e.target.closest('.feed-delete-btn');
    if (btn) deleteMySuggestion(btn.dataset.id, btn);
  });

  document.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  const desc = document.getElementById('sugDescription');
  if (desc) {
    desc.addEventListener('input', updateCharCount);
    desc.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitSuggestion();
    });
  }

  const modal = document.getElementById('suggestionModal');
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeSuggestionModal(); });
  }
});
