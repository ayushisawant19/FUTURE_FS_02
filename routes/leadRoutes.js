const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');

// All lead routes require authentication
router.use(authMiddleware);

router.get('/analytics/overview', leadController.getAnalytics);
router.get('/export/csv', leadController.exportCsv);
router.get('/', leadController.getLeads);
router.post('/', leadController.createLead);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);
router.post('/:id/notes', leadController.addNote);

module.exports = router;
