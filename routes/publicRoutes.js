const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.post('/contact', publicController.submitContactForm);

module.exports = router;
