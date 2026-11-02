let statusChartInstance = null;
let sourceChartInstance = null;
let currentActiveLeadId = null;
let allLeadsCache = [];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Authentication Check
  const token = localStorage.getItem('crm_token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  // Set user avatar if stored
  const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
  if (user && user.email) {
    const initials = user.email.substring(0, 2).toUpperCase();
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = initials;
  }

  // 2. Initialize Event Listeners
  initEventListeners();

  // 3. Load initial data
  loadAnalytics();
  loadLeads();
});

// Toast notification helper (Bright White UI)
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  toastMessage.textContent = message;
  if (isError) {
    toastIcon.className = 'fa-solid fa-circle-exclamation text-rose-600 text-sm';
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800';
  } else {
    toastIcon.className = 'fa-solid fa-circle-check text-emerald-600 text-sm';
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800';
  }

  setTimeout(() => {
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800';
  }, 3200);
}

// Authenticated fetch wrapper
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('crm_token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('crm_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return response;
}

// Load KPIs and Charts
async function loadAnalytics() {
  try {
    const res = await apiFetch('/api/leads/analytics/overview');
    const result = await res.json();
    if (!result.success) return;

    const data = result.data;
    document.getElementById('statTotal').textContent = data.total;
    document.getElementById('statNew').textContent = data.new;
    document.getElementById('statContacted').textContent = data.contacted;
    document.getElementById('statConverted').textContent = data.converted;
    document.getElementById('statConversionRate').textContent = `${data.conversionRate}% Conv. Rate`;

    renderCharts(data);
  } catch (err) {
    console.error('Error fetching analytics:', err);
  }
}

// Render Status and Source Charts (Bright Theme)
function renderCharts(analytics) {
  // 1. Status Donut Chart
  const statusCtx = document.getElementById('statusChart').getContext('2d');
  const statusData = [
    analytics.new || 0,
    analytics.contacted || 0,
    analytics.converted || 0,
    analytics.lost || 0
  ];

  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  statusChartInstance = new Chart(statusCtx, {
    type: 'doughnut',
    data: {
      labels: ['New', 'Contacted', 'Converted', 'Lost'],
      datasets: [{
        data: statusData,
        backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#475569', font: { size: 12, weight: '500' }, boxWidth: 12 }
        }
      },
      cutout: '72%'
    }
  });

  // 2. Source Bar Chart
  const sourceCtx = document.getElementById('sourceChart').getContext('2d');
  const sourceLabels = Object.keys(analytics.sourceBreakdown || {});
  const sourceCounts = Object.values(analytics.sourceBreakdown || {});

  if (sourceChartInstance) {
    sourceChartInstance.destroy();
  }

  sourceChartInstance = new Chart(sourceCtx, {
    type: 'bar',
    data: {
      labels: sourceLabels.length ? sourceLabels : ['None'],
      datasets: [{
        label: 'Leads',
        data: sourceCounts.length ? sourceCounts : [0],
        backgroundColor: '#4f46e5',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', font: { size: 11, weight: '500' } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#64748b', stepSize: 1, font: { size: 11 } },
          grid: { color: '#f1f5f9' }
        }
      }
    }
  });
}

// Fetch and render Leads Table
async function loadLeads() {
  const search = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('statusFilter').value;
  const source = document.getElementById('sourceFilter').value;

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'all') params.append('status', status);
  if (source && source !== 'all') params.append('source', source);

  try {
    const res = await apiFetch(`/api/leads?${params.toString()}`);
    const result = await res.json();
    if (!result.success) return;

    allLeadsCache = result.data;
    document.getElementById('leadsCountBadge').textContent = `${result.count} leads`;
    renderLeadsTable(result.data);
  } catch (err) {
    console.error('Error fetching leads:', err);
    document.getElementById('leadsTableBody').innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-rose-600">
          Failed to load leads from server.
        </td>
      </tr>
    `;
  }
}

// Render rows in table (Bright White Theme)
function renderLeadsTable(leads) {
  const tbody = document.getElementById('leadsTableBody');
  if (!leads || leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-500">
          <i class="fa-solid fa-inbox text-3xl mb-2 text-slate-300"></i>
          <p class="font-semibold text-slate-700">No leads found matching your criteria</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or reset the filters</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = leads.map(lead => {
    const formattedDate = new Date(lead.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    const notesCount = Array.isArray(lead.notes) ? lead.notes.length : 0;
    const badgeClass = `badge-${lead.status}`;

    return `
      <tr class="hover:bg-slate-50/80 transition group">
        <!-- Contact -->
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${escapeHtml(lead.name)}</div>
          <div class="text-[11px] text-slate-500 font-medium">${escapeHtml(lead.email)}</div>
          ${lead.message ? `<div class="text-[11px] text-slate-400 truncate max-w-xs mt-0.5 italic">"${escapeHtml(lead.message)}"</div>` : ''}
        </td>

        <!-- Company & Phone -->
        <td class="py-3 px-4">
          <div class="text-slate-700 font-medium">${lead.company ? escapeHtml(lead.company) : '<span class="text-slate-300">-</span>'}</div>
          <div class="text-[11px] text-slate-500">${lead.phone ? escapeHtml(lead.phone) : '<span class="text-slate-300">-</span>'}</div>
        </td>

        <!-- Source -->
        <td class="py-3 px-4">
          <span class="inline-block px-2.5 py-0.5 rounded-lg text-[11px] bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            ${escapeHtml(lead.source || 'Website Form')}
          </span>
        </td>

        <!-- Status Dropdown (Quick Update) -->
        <td class="py-3 px-4">
          <select 
            onchange="updateLeadStatus('${lead.id}', this.value)"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer outline-none transition shadow-2xs ${badgeClass}"
          >
            <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
            <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
            <option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>Lost</option>
          </select>
        </td>

        <!-- Date Received -->
        <td class="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
          ${formattedDate}
        </td>

        <!-- Follow-ups / Notes button -->
        <td class="py-3 px-4">
          <button 
            onclick="openNotesModal('${lead.id}')"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <i class="fa-solid fa-clipboard-list text-blue-600"></i>
            <span>${notesCount} note${notesCount === 1 ? '' : 's'}</span>
          </button>
        </td>

        <!-- Actions -->
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            <button 
              onclick="openEditLeadModal('${lead.id}')" 
              title="Edit lead" 
              class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button 
              onclick="deleteLead('${lead.id}')" 
              title="Delete lead" 
              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Quick status change from table dropdown
window.updateLeadStatus = async function(leadId, newStatus) {
  try {
    const res = await apiFetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    const result = await res.json();
    if (result.success) {
      showToast(`Lead status updated to "${newStatus}"`);
      loadAnalytics();
      loadLeads();
    } else {
      showToast(result.message || 'Failed to update status', true);
    }
  } catch (err) {
    showToast('Failed to update status', true);
  }
};

// Open Notes & Follow-up Timeline Modal
window.openNotesModal = function(leadId) {
  const lead = allLeadsCache.find(l => l.id === leadId);
  if (!lead) return;

  currentActiveLeadId = leadId;
  document.getElementById('notesModalLeadName').textContent = lead.name;
  document.getElementById('notesModalLeadEmail').textContent = lead.email;
  document.getElementById('notesModalMessage').textContent = lead.message || 'No initial message provided.';
  document.getElementById('newNoteText').value = '';
  document.getElementById('newNoteFollowUpDate').value = lead.nextFollowUp ? lead.nextFollowUp.substring(0, 16) : '';

  renderNotesTimeline(lead.notes || []);
  document.getElementById('notesModal').classList.remove('hidden');
};

function renderNotesTimeline(notes) {
  const container = document.getElementById('notesTimelineContainer');
  if (!notes || notes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400">
        <i class="fa-regular fa-comment-dots text-2xl mb-2 text-slate-300"></i>
        <p class="text-xs font-semibold text-slate-600">No follow-up notes recorded yet.</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Add your first follow-up note below.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map(n => {
    const time = new Date(n.createdAt).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <div class="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mt-0.5">
          <i class="fa-solid fa-message text-[10px]"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span class="font-bold text-slate-800">${escapeHtml(n.author || 'Admin')}</span>
            <span>${time}</span>
          </div>
          <p class="text-xs text-slate-700 font-medium">${escapeHtml(n.text)}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Save follow-up note
async function handleSaveNote() {
  if (!currentActiveLeadId) return;

  const text = document.getElementById('newNoteText').value.trim();
  const nextFollowUp = document.getElementById('newNoteFollowUpDate').value;

  if (!text) {
    showToast('Please type a note before saving.', true);
    return;
  }

  const saveBtn = document.getElementById('saveNoteBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i> Saving...';

  try {
    const res = await apiFetch(`/api/leads/${currentActiveLeadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text, nextFollowUp })
    });

    const result = await res.json();
    if (result.success) {
      showToast('Follow-up note logged!');
      document.getElementById('newNoteText').value = '';
      
      // Update modal timeline
      renderNotesTimeline(result.data.lead.notes);

      // Refresh background table
      loadLeads();
    } else {
      showToast(result.message || 'Error saving note', true);
    }
  } catch (err) {
    showToast('Failed to save note', true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-paper-plane text-[10px]"></i> <span>Add Note</span>';
  }
}

// Open Add / Edit Modal
window.openEditLeadModal = function(leadId) {
  const lead = allLeadsCache.find(l => l.id === leadId);
  if (!lead) return;

  document.getElementById('leadModalTitle').textContent = 'Edit Lead Details';
  document.getElementById('editLeadId').value = lead.id;
  document.getElementById('modalName').value = lead.name || '';
  document.getElementById('modalEmail').value = lead.email || '';
  document.getElementById('modalPhone').value = lead.phone || '';
  document.getElementById('modalCompany').value = lead.company || '';
  document.getElementById('modalSource').value = lead.source || 'Website Contact Form';
  document.getElementById('modalStatus').value = lead.status || 'new';
  document.getElementById('modalMessage').value = lead.message || '';

  document.getElementById('leadModal').classList.remove('hidden');
};

function openAddLeadModal() {
  document.getElementById('leadModalTitle').textContent = 'Add New Client Lead';
  document.getElementById('editLeadId').value = '';
  document.getElementById('leadForm').reset();
  document.getElementById('modalStatus').value = 'new';
  document.getElementById('modalSource').value = 'Admin Manual Entry';

  document.getElementById('leadModal').classList.remove('hidden');
}

// Save Add/Edit Lead Form
async function handleSaveLead(e) {
  e.preventDefault();
  const id = document.getElementById('editLeadId').value;
  const name = document.getElementById('modalName').value.trim();
  const email = document.getElementById('modalEmail').value.trim();
  const phone = document.getElementById('modalPhone').value.trim();
  const company = document.getElementById('modalCompany').value.trim();
  const source = document.getElementById('modalSource').value;
  const status = document.getElementById('modalStatus').value;
  const message = document.getElementById('modalMessage').value.trim();

  const isEdit = Boolean(id);
  const url = isEdit ? `/api/leads/${id}` : '/api/leads';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await apiFetch(url, {
      method,
      body: JSON.stringify({ name, email, phone, company, source, status, message })
    });

    const result = await res.json();
    if (result.success) {
      showToast(isEdit ? 'Lead updated successfully' : 'New lead created');
      document.getElementById('leadModal').classList.add('hidden');
      loadAnalytics();
      loadLeads();
    } else {
      showToast(result.message || 'Error saving lead', true);
    }
  } catch (err) {
    showToast('Failed to save lead', true);
  }
}

// Delete Lead
window.deleteLead = async function(leadId) {
  if (!confirm('Are you sure you want to permanently delete this lead?')) {
    return;
  }

  try {
    const res = await apiFetch(`/api/leads/${leadId}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast('Lead deleted');
      loadAnalytics();
      loadLeads();
    } else {
      showToast(result.message || 'Failed to delete lead', true);
    }
  } catch (err) {
    showToast('Failed to delete lead', true);
  }
};

// Export to CSV
function handleExportCsv() {
  const token = localStorage.getItem('crm_token');
  fetch('/api/leads/export/csv', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Leads exported to CSV successfully');
  })
  .catch(() => {
    showToast('Failed to export CSV', true);
  });
}

// Event Listeners registration
function initEventListeners() {
  // Search & Filter change
  let debounceTimeout = null;
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => loadLeads(), 250);
  });

  document.getElementById('statusFilter').addEventListener('change', () => loadLeads());
  document.getElementById('sourceFilter').addEventListener('change', () => loadLeads());
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadAnalytics();
    loadLeads();
    showToast('Data refreshed');
  });

  // Export CSV
  document.getElementById('exportCsvBtn').addEventListener('click', handleExportCsv);

  // Modals Open/Close
  document.getElementById('openAddModalBtn').addEventListener('click', openAddLeadModal);

  document.querySelectorAll('.closeModalBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('notesModal').classList.add('hidden');
    });
  });

  document.querySelectorAll('.closeLeadModalBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('leadModal').classList.add('hidden');
    });
  });

  // Note save button
  document.getElementById('saveNoteBtn').addEventListener('click', handleSaveNote);

  // Lead Add/Edit Form submit
  document.getElementById('leadForm').addEventListener('submit', handleSaveLead);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    window.location.href = '/login';
  });
}

// Utility: escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
