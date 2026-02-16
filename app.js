/* Link Organizer — Full app logic */

const STORAGE_KEY = 'linkOrganizer';

const defaultCollections = [
  { id: 'all', name: 'All Links', isDefault: true },
  { id: 'content', name: 'Content', isDefault: true },
  { id: 'quizzes', name: 'Quizzes', isDefault: true },
  { id: 'lab-docs', name: 'Lab Documents', isDefault: true },
  { id: 'lab-videos', name: 'Lab Videos', isDefault: true },
];

const defaultLinks = [
  { id: '1', collectionId: 'content', title: "Introducing Today's Technologies", url: '#', meta: 'Chapter 1', type: 'drive', openNewTab: true },
  { id: '2', collectionId: 'content', title: 'Connecting and Communicating Online', url: '#', meta: 'Chapter 2', type: 'drive', openNewTab: true },
  { id: '3', collectionId: 'content', title: 'Computer and Mobile Devices', url: '#', meta: 'Chapter 3', type: 'drive', openNewTab: true },
  { id: '4', collectionId: 'content', title: 'Digital Security, Ethics, and Privacy', url: '#', meta: 'Chapter 5', type: 'drive', openNewTab: true },
  { id: '5', collectionId: 'content', title: 'IT Law', url: '#', meta: 'Chapter 12', type: 'drive', openNewTab: true },
  { id: '6', collectionId: 'quizzes', title: 'แบบทดสอบบทที่ 1', url: '#', meta: 'Quiz', type: 'drive', openNewTab: true },
  { id: '7', collectionId: 'quizzes', title: 'แบบทดสอบบทที่ 2', url: '#', meta: 'Quiz', type: 'drive', openNewTab: true },
  { id: '8', collectionId: 'quizzes', title: 'แบบทดสอบบทที่ 3', url: '#', meta: 'Quiz', type: 'drive', openNewTab: true },
  { id: '9', collectionId: 'lab-docs', title: 'example.docx', url: '#', meta: 'MS Word', type: 'drive', openNewTab: true },
  { id: '10', collectionId: 'lab-docs', title: 'mail merge list.xls', url: '#', meta: 'MS Word', type: 'drive', openNewTab: true },
  { id: '11', collectionId: 'lab-docs', title: 'Work1.xls', url: '#', meta: 'MS Excel', type: 'drive', openNewTab: true },
  { id: '12', collectionId: 'lab-docs', title: 'IF Example.rar', url: '#', meta: 'MS Excel', type: 'drive', openNewTab: true },
  { id: '13', collectionId: 'lab-videos', title: 'Word Basic | ทำสารบัญ | จดหมายเวียน', url: '#', meta: 'Tutorial', type: 'drive', openNewTab: true },
  { id: '14', collectionId: 'lab-videos', title: 'Excel Basic | if function | VlookUP', url: '#', meta: 'Tutorial', type: 'drive', openNewTab: true },
  { id: '15', collectionId: 'lab-videos', title: 'ใช้ Trigger สร้างสื่อแบบมีปฏิสัมพันธ์', url: 'https://www.youtube.com/watch?v=7RxHeh03Rs8', meta: 'youtube.com', type: 'youtube', openNewTab: true },
];

// State
let state = {
  collections: [],
  links: [],
  collectionNames: {}, // Override names: { content: "Study Materials", ... }
  activeCollection: 'all',
  editingLinkId: null,
  deleteLinkId: null,
};

// Load from localStorage
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const customCollections = parsed.collections || [];
    state.collectionNames = parsed.collectionNames || {};
    state.collections = [...defaultCollections, ...customCollections];
    state.links = parsed.links?.length ? parsed.links : [...defaultLinks];
  } catch {
    state.collectionNames = {};
    state.collections = [...defaultCollections];
    state.links = [...defaultLinks];
  }
}

// Save to localStorage
function saveState() {
  const customCollections = state.collections.filter(c => !c.isDefault);
  const toSave = {
    collections: customCollections,
    links: state.links,
    collectionNames: state.collectionNames,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

// Generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Get collection name (uses overrides for default collections)
function getCollectionName(id) {
  if (id === 'all') return 'All Links';
  if (state.collectionNames[id]) return state.collectionNames[id];
  const c = state.collections.find(x => x.id === id);
  return c ? c.name : id;
}

// Render
function render() {
  renderSidebar();
  renderContent();
  updateLinkCount();
}

function renderSidebar() {
  const navCountAll = document.getElementById('countAll');
  if (navCountAll) navCountAll.textContent = state.links.length;

  const collectionsToShow = state.collections.filter(c => c.id !== 'all');
  const defaultIds = ['content', 'quizzes', 'lab-docs', 'lab-videos'];

  // Render all collections with rename button
  const navContainer = document.getElementById('navCollections');
  if (navContainer) {
    navContainer.innerHTML = collectionsToShow.map(c => {
      const n = state.links.filter(l => l.collectionId === c.id).length;
      const name = getCollectionName(c.id);
      const canRename = defaultIds.includes(c.id) || !c.isDefault;
      return `<div class="nav-item-wrap" data-collection="${c.id}">
        <button class="nav-item ${state.activeCollection === c.id ? 'active' : ''}" data-collection="${c.id}">
          <span class="nav-icon">◉</span>
          <span class="nav-label">${escapeHtml(name)}</span>
          <span class="nav-count">${n}</span>
        </button>
        ${canRename ? `<button class="nav-rename" data-collection="${c.id}" aria-label="Rename" title="Rename">✎</button>` : ''}
      </div>`;
    }).join('');
  }

  // Update select options
  const select = document.getElementById('linkCollection');
  if (select) {
    const current = select.value;
    const opts = collectionsToShow.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(getCollectionName(c.id))}</option>`).join('');
    select.innerHTML = opts;
    if (select.querySelector(`option[value="${current}"]`)) {
      select.value = current;
    }
  }
}

function renderContent() {
  const grid = document.getElementById('contentGrid');
  const emptyState = document.getElementById('emptyState');
  const pageTitle = document.getElementById('pageTitle');

  const active = state.activeCollection;
  let filtered = state.links;
  if (active !== 'all') {
    filtered = state.links.filter(l => l.collectionId === active);
  }

  // Search
  const searchVal = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  if (searchVal) {
    filtered = filtered.filter(l =>
      l.title.toLowerCase().includes(searchVal) ||
      (l.meta || '').toLowerCase().includes(searchVal) ||
      (l.url || '').toLowerCase().includes(searchVal)
    );
  }

  pageTitle.textContent = getCollectionName(active);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.id = 'emptyState';
    empty.innerHTML = searchVal
      ? `<div class="empty-icon">🔍</div><p class="empty-title">No matches</p><p class="empty-desc">Try a different search term.</p>`
      : state.links.length === 0
        ? `<div class="empty-icon">📎</div><p class="empty-title">No links yet</p><p class="empty-desc">Click <strong>Add Link</strong> to save your first URL.</p><button class="btn-primary btn-empty" id="btnAddLinkEmpty">Add Link</button>`
        : `<div class="empty-icon">📂</div><p class="empty-title">No links here</p><p class="empty-desc">This collection is empty. <strong>Add Link</strong> to get started.</p><button class="btn-primary btn-empty" id="btnAddLinkEmpty">Add Link</button>`;
    grid.appendChild(empty);
    empty.querySelector('#btnAddLinkEmpty')?.addEventListener('click', openAddModal);
    return;
  }

  // Group by collection
  const byCollection = {};
  filtered.forEach(link => {
    const id = link.collectionId;
    if (!byCollection[id]) byCollection[id] = [];
    byCollection[id].push(link);
  });

  const order = ['content', 'quizzes', 'lab-docs', 'lab-videos', ...state.collections.filter(c => !c.isDefault).map(c => c.id)];
  const sections = [];

  order.forEach(id => {
    const links = byCollection[id];
    if (!links?.length) return;
    const name = getCollectionName(id);
    sections.push(renderSection(id, name, links));
  });

  // Any remaining
  Object.keys(byCollection).forEach(id => {
    if (order.includes(id)) return;
    sections.push(renderSection(id, getCollectionName(id), byCollection[id]));
  });

  grid.innerHTML = sections.join('');
  attachCardListeners();
}

function renderSection(collectionId, title, links) {
  const cards = links.map(link => {
    const typeClass = link.type === 'youtube' ? 'link-youtube' : 'link-drive';
    const arrow = link.openNewTab ? '↗' : '→';
    const target = link.openNewTab ? ' target="_blank" rel="noopener"' : '';
    const badge = link.type === 'youtube' ? 'YouTube' : link.type === 'drive' ? 'Drive' : 'Link';

    return `<div class="link-card-wrap" data-link-id="${link.id}">
      <a href="${escapeHtml(link.url)}" class="link-card ${typeClass}"${target}>
        <span class="card-badge">${escapeHtml(badge)}</span>
        <span class="card-title">${escapeHtml(link.title)}</span>
        <span class="card-meta">${escapeHtml(link.meta || '')}</span>
        <span class="card-arrow">${arrow}</span>
      </a>
      <div class="card-actions">
        <button class="card-action card-edit" data-id="${link.id}" aria-label="Edit">✎</button>
        <button class="card-action card-delete" data-id="${link.id}" aria-label="Delete">×</button>
      </div>
    </div>`;
  }).join('');

  return `<section class="category">
    <div class="category-header">
      <span class="category-icon">◈</span>
      <h3 class="category-title">${escapeHtml(title)}</h3>
    </div>
    <div class="link-cards">${cards}</div>
  </section>`;
}

function attachCardListeners() {
  document.querySelectorAll('.card-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openEditModal(btn.dataset.id);
    });
  });
  document.querySelectorAll('.card-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openDeleteModal(btn.dataset.id);
    });
  });
}

function updateLinkCount() {
  const el = document.getElementById('linkCount');
  if (el) el.textContent = `${state.links.length} link${state.links.length !== 1 ? 's' : ''}`;
}

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// Modals
function openAddModal(collectionId) {
  state.editingLinkId = null;
  document.getElementById('modalTitle').textContent = 'Add Link';
  document.getElementById('linkForm').reset();
  document.getElementById('linkId').value = '';
  if (collectionId) document.getElementById('linkCollection').value = collectionId;
  document.getElementById('linkModal').classList.add('active');
  document.getElementById('linkModal').setAttribute('aria-hidden', 'false');
}

function openEditModal(id) {
  const link = state.links.find(l => l.id === id);
  if (!link) return;
  state.editingLinkId = id;
  document.getElementById('modalTitle').textContent = 'Edit Link';
  document.getElementById('linkId').value = link.id;
  document.getElementById('linkTitle').value = link.title;
  document.getElementById('linkUrl').value = link.url;
  document.getElementById('linkMeta').value = link.meta || '';
  document.getElementById('linkCollection').value = link.collectionId;
  document.getElementById('linkType').value = link.type;
  document.getElementById('linkNewTab').checked = link.openNewTab !== false;
  document.getElementById('linkModal').classList.add('active');
  document.getElementById('linkModal').setAttribute('aria-hidden', 'false');
}

function closeLinkModal() {
  document.getElementById('linkModal').classList.remove('active');
  document.getElementById('linkModal').setAttribute('aria-hidden', 'true');
  state.editingLinkId = null;
}

function openDeleteModal(id) {
  state.deleteLinkId = id;
  document.getElementById('deleteModal').classList.add('active');
  document.getElementById('deleteModal').setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  document.getElementById('deleteModal').setAttribute('aria-hidden', 'true');
  state.deleteLinkId = null;
}

function openCollectionModal() {
  document.getElementById('collectionForm').reset();
  document.getElementById('collectionModal').classList.add('active');
  document.getElementById('collectionModal').setAttribute('aria-hidden', 'false');
}

function closeCollectionModal() {
  document.getElementById('collectionModal').classList.remove('active');
  document.getElementById('collectionModal').setAttribute('aria-hidden', 'true');
}

function openRenameModal(collectionId) {
  const name = getCollectionName(collectionId);
  document.getElementById('renameCollectionId').value = collectionId;
  document.getElementById('renameCollectionName').value = name;
  document.getElementById('renameCollectionName').focus();
  document.getElementById('renameModal').classList.add('active');
  document.getElementById('renameModal').setAttribute('aria-hidden', 'false');
}

function closeRenameModal() {
  document.getElementById('renameModal').classList.remove('active');
  document.getElementById('renameModal').setAttribute('aria-hidden', 'true');
}

// Handlers
function handleLinkSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('linkId').value;
  const title = document.getElementById('linkTitle').value.trim();
  const url = document.getElementById('linkUrl').value.trim();
  const meta = document.getElementById('linkMeta').value.trim();
  const collectionId = document.getElementById('linkCollection').value;
  const type = document.getElementById('linkType').value;
  const openNewTab = document.getElementById('linkNewTab').checked;

  if (!title || !url) return;

  if (id && state.editingLinkId) {
    const link = state.links.find(l => l.id === id);
    if (link) {
      link.title = title;
      link.url = url;
      link.meta = meta;
      link.collectionId = collectionId;
      link.type = type;
      link.openNewTab = openNewTab;
    }
  } else {
    const newLink = { id: generateId(), collectionId, title, url, meta, type, openNewTab };
    state.links.push(newLink);
  }

  saveState();
  closeLinkModal();
  render();
}

function handleDelete() {
  if (!state.deleteLinkId) return;
  state.links = state.links.filter(l => l.id !== state.deleteLinkId);
  saveState();
  closeDeleteModal();
  render();
}

function handleCollectionSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('collectionName').value.trim();
  if (!name) return;

  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (!id) return;
  if (state.collections.some(c => c.id === id)) {
    alert('A collection with that name already exists.');
    return;
  }

  state.collections.push({ id, name, isDefault: false });
  saveState();
  closeCollectionModal();
  render();
}

function handleRenameSubmit(e) {
  e.preventDefault();
  const collectionId = document.getElementById('renameCollectionId').value;
  const name = document.getElementById('renameCollectionName').value.trim();
  if (!name) return;

  const defaultIds = ['content', 'quizzes', 'lab-docs', 'lab-videos'];
  if (defaultIds.includes(collectionId)) {
    state.collectionNames[collectionId] = name;
  } else {
    const c = state.collections.find(x => x.id === collectionId);
    if (c) c.name = name;
  }
  saveState();
  closeRenameModal();
  render();
}

// Export / Import
function exportData() {
  const data = {
    collections: state.collections.filter(c => !c.isDefault),
    links: state.links,
    collectionNames: state.collectionNames,
    exportedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert('Copied to clipboard! Paste into Import on another device.');
  }).catch(() => {
    const a = document.createElement('a');
    a.href = 'data:application/json,' + encodeURIComponent(json);
    a.download = 'link-organizer-export.json';
    a.click();
  });
}

function openImportModal() {
  document.getElementById('importData').value = '';
  document.getElementById('importError').textContent = '';
  document.getElementById('importModal').classList.add('active');
  document.getElementById('importModal').setAttribute('aria-hidden', 'false');
}

function closeImportModal() {
  document.getElementById('importModal').classList.remove('active');
  document.getElementById('importModal').setAttribute('aria-hidden', 'true');
}

function handleImport() {
  const raw = document.getElementById('importData').value.trim();
  const errEl = document.getElementById('importError');
  if (!raw) {
    errEl.textContent = 'Paste exported data first.';
    return;
  }
  try {
    const data = JSON.parse(raw);
    const customCollections = data.collections || [];
    state.collectionNames = data.collectionNames || {};
    state.collections = [...defaultCollections, ...customCollections];
    state.links = Array.isArray(data.links) ? data.links : state.links;
    saveState();
    closeImportModal();
    render();
    alert('Import successful!');
  } catch (e) {
    errEl.textContent = 'Invalid JSON. Use data from Export.';
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  render();

  document.getElementById('btnAddLink')?.addEventListener('click', () => openAddModal());
  document.getElementById('btnNewCollection')?.addEventListener('click', openCollectionModal);

  document.getElementById('linkForm')?.addEventListener('submit', handleLinkSubmit);
  document.getElementById('collectionForm')?.addEventListener('submit', handleCollectionSubmit);
  document.getElementById('renameForm')?.addEventListener('submit', handleRenameSubmit);

  document.getElementById('modalClose')?.addEventListener('click', closeLinkModal);
  document.getElementById('modalCancel')?.addEventListener('click', closeLinkModal);
  document.getElementById('collectionModalClose')?.addEventListener('click', closeCollectionModal);
  document.getElementById('collectionCancel')?.addEventListener('click', closeCollectionModal);
  document.getElementById('renameModalClose')?.addEventListener('click', closeRenameModal);
  document.getElementById('renameCancel')?.addEventListener('click', closeRenameModal);
  document.getElementById('deleteModalClose')?.addEventListener('click', closeDeleteModal);
  document.getElementById('deleteCancel')?.addEventListener('click', closeDeleteModal);
  document.getElementById('deleteConfirm')?.addEventListener('click', handleDelete);
  document.getElementById('btnExport')?.addEventListener('click', exportData);
  document.getElementById('btnImport')?.addEventListener('click', openImportModal);
  document.getElementById('importModalClose')?.addEventListener('click', closeImportModal);
  document.getElementById('importCancel')?.addEventListener('click', closeImportModal);
  document.getElementById('importConfirm')?.addEventListener('click', handleImport);
  document.getElementById('btnLock')?.addEventListener('click', () => {
    if (typeof showAuthScreen === 'function') showAuthScreen('login');
  });

  // Sidebar nav
  document.getElementById('sidebarNav')?.addEventListener('click', e => {
    const renameBtn = e.target.closest('.nav-rename');
    if (renameBtn) {
      e.preventDefault();
      openRenameModal(renameBtn.dataset.collection);
      return;
    }
    const btn = e.target.closest('.nav-item[data-collection]');
    if (!btn) return;
    state.activeCollection = btn.dataset.collection;
    document.querySelectorAll('.nav-item[data-collection]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('input', () => render());
  document.getElementById('searchInput')?.addEventListener('keyup', e => {
    if (e.key === 'Escape') {
      e.target.value = '';
      render();
    }
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        if (overlay.id === 'linkModal') closeLinkModal();
        if (overlay.id === 'deleteModal') closeDeleteModal();
        if (overlay.id === 'collectionModal') closeCollectionModal();
        if (overlay.id === 'renameModal') closeRenameModal();
        if (overlay.id === 'importModal') closeImportModal();
      }
    });
  });

  // ESC to close modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
      });
      closeLinkModal();
      closeDeleteModal();
      closeCollectionModal();
      closeRenameModal();
      closeImportModal();
    }
  });
});
