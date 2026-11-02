const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '..', 'data', 'leads.json');

// Ensure data folder and file exist
function initDb() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

initDb();

function readLeads() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading leads from JSON:', err);
    return [];
  }
}

function writeLeads(leads) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing leads to JSON:', err);
    return false;
  }
}

const db = {
  getAll: (filters = {}) => {
    let leads = readLeads();

    // Search query (name, email, company, message)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      leads = leads.filter(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      leads = leads.filter(l => l.status.toLowerCase() === filters.status.toLowerCase());
    }

    // Source filter
    if (filters.source && filters.source !== 'all') {
      leads = leads.filter(l => l.source.toLowerCase() === filters.source.toLowerCase());
    }

    // Sort by createdAt descending (newest first)
    leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return leads;
  },

  getById: (id) => {
    const leads = readLeads();
    return leads.find(l => l.id === id) || null;
  },

  create: (data) => {
    const leads = readLeads();
    const now = new Date().toISOString();
    const newLead = {
      id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: data.name ? data.name.trim() : 'Unknown Lead',
      email: data.email ? data.email.trim() : '',
      phone: data.phone ? data.phone.trim() : '',
      company: data.company ? data.company.trim() : '',
      source: data.source ? data.source.trim() : 'Website Contact Form',
      status: data.status ? data.status.toLowerCase() : 'new',
      message: data.message ? data.message.trim() : '',
      nextFollowUp: data.nextFollowUp || null,
      notes: Array.isArray(data.notes) ? data.notes : [],
      createdAt: now,
      updatedAt: now
    };

    leads.unshift(newLead);
    writeLeads(leads);
    return newLead;
  },

  update: (id, updates) => {
    const leads = readLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) return null;

    const existing = leads[index];
    const updatedLead = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable
      createdAt: existing.createdAt, // Immutable
      updatedAt: new Date().toISOString()
    };

    leads[index] = updatedLead;
    writeLeads(leads);
    return updatedLead;
  },

  delete: (id) => {
    const leads = readLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) return false;

    leads.splice(index, 1);
    writeLeads(leads);
    return true;
  },

  addNote: (leadId, noteData) => {
    const leads = readLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return null;

    if (!Array.isArray(lead.notes)) {
      lead.notes = [];
    }

    const newNote = {
      id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      text: noteData.text ? noteData.text.trim() : '',
      createdAt: new Date().toISOString(),
      author: noteData.author || 'Admin'
    };

    lead.notes.unshift(newNote);
    lead.updatedAt = new Date().toISOString();

    if (noteData.nextFollowUp) {
      lead.nextFollowUp = noteData.nextFollowUp;
    }

    writeLeads(leads);
    return newNote;
  },

  getAnalytics: () => {
    const leads = readLeads();
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const contactedCount = leads.filter(l => l.status === 'contacted').length;
    const convertedCount = leads.filter(l => l.status === 'converted').length;
    const lostCount = leads.filter(l => l.status === 'lost').length;

    const conversionRate = total > 0 ? ((convertedCount / total) * 100).toFixed(1) : 0;

    // Group by source
    const sourceBreakdown = {};
    leads.forEach(l => {
      const src = l.source || 'Website Contact Form';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    });

    // Recent 7 days leads count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLeadsCount = leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length;

    return {
      total,
      new: newCount,
      contacted: contactedCount,
      converted: convertedCount,
      lost: lostCount,
      conversionRate: Number(conversionRate),
      sourceBreakdown,
      recentLeadsCount
    };
  }
};

module.exports = db;
