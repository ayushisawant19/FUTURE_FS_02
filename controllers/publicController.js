const db = require('../config/db');

// @desc    Submit public contact form to generate a new CRM lead
// @route   POST /api/public/contact
exports.submitContactForm = (req, res) => {
  try {
    const { name, email, phone, company, message, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required to submit the inquiry.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const lead = db.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      company: company ? company.trim() : '',
      source: source || 'Website Contact Form',
      status: 'new',
      message: message ? message.trim() : '',
      notes: [
        {
          id: 'note-' + Date.now(),
          text: `Inquiry submitted via public website contact form at ${new Date().toLocaleString()}`,
          createdAt: new Date().toISOString(),
          author: 'Website Form'
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you shortly.',
      referenceId: lead.id
    });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message. Please try again.'
    });
  }
};
