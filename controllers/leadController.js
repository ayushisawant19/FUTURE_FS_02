const db = require('../config/db');

// @desc    Get all leads with optional filtering and search
// @route   GET /api/leads
exports.getLeads = (req, res) => {
  try {
    const { search, status, source } = req.query;
    const leads = db.getAll({ search, status, source });
    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
exports.getLeadById = (req, res) => {
  try {
    const lead = db.getById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new lead manually from admin
// @route   POST /api/leads
exports.createLead = (req, res) => {
  try {
    const { name, email, phone, company, source, status, message, nextFollowUp } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields.'
      });
    }

    const newLead = db.create({
      name,
      email,
      phone,
      company,
      source: source || 'Admin Manual Entry',
      status: status || 'new',
      message: message || '',
      nextFollowUp
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lead details / status
// @route   PUT /api/leads/:id
exports.updateLead = (req, res) => {
  try {
    const updated = db.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = (req, res) => {
  try {
    const deleted = db.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add follow-up note to lead
// @route   POST /api/leads/:id/notes
exports.addNote = (req, res) => {
  try {
    const { text, nextFollowUp } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note text cannot be empty.'
      });
    }

    const note = db.addNote(req.params.id, {
      text,
      author: req.user?.name || 'Admin',
      nextFollowUp
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const updatedLead = db.getById(req.params.id);
    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: { note, lead: updatedLead }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get CRM analytics & metrics
// @route   GET /api/leads/analytics/overview
exports.getAnalytics = (req, res) => {
  try {
    const metrics = db.getAnalytics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export leads to CSV format
// @route   GET /api/leads/export/csv
exports.exportCsv = (req, res) => {
  try {
    const leads = db.getAll();
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Message', 'Notes Count', 'Created At'];
    
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.source || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(l.notes ? l.notes.length : 0)}"`,
      `"${l.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="crm_leads_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
