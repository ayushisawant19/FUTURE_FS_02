const http = require('http');

// Start server programmatically
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const PORT = 5055; // Test port

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/public', publicRoutes);

const server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);

  try {
    // Helper function for json requests
    async function request(method, path, body = null, token = null) {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:${PORT}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch { data = text; }
      return { status: res.status, data };
    }

    console.log('--- TEST 1: Public Contact Form Submission ---');
    const contactRes = await request('POST', '/api/public/contact', {
      name: 'Michael Scott',
      email: 'mscott@dundermifflin.com',
      phone: '555-123-4567',
      company: 'Dunder Mifflin Paper Co',
      source: 'Website Contact Form',
      message: 'Need 10,000 sheets of paper and custom CRM integration ASAP!'
    });
    console.log('Status:', contactRes.status, 'Response:', contactRes.data);
    if (contactRes.status !== 201) throw new Error('Test 1 failed');
    const createdLeadId = contactRes.data.referenceId;

    console.log('\n--- TEST 2: Admin Login ---');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    console.log('Status:', loginRes.status, 'Token acquired:', Boolean(loginRes.data.token));
    if (loginRes.status !== 200 || !loginRes.data.token) throw new Error('Test 2 failed');
    const token = loginRes.data.token;

    console.log('\n--- TEST 3: Get Leads with Auth ---');
    const leadsRes = await request('GET', '/api/leads', null, token);
    console.log('Status:', leadsRes.status, 'Total Leads:', leadsRes.data.count);
    if (leadsRes.status !== 200 || leadsRes.data.count < 1) throw new Error('Test 3 failed');

    console.log('\n--- TEST 4: Get Analytics Overview ---');
    const analyticsRes = await request('GET', '/api/leads/analytics/overview', null, token);
    console.log('Status:', analyticsRes.status, 'Analytics:', analyticsRes.data.data);
    if (analyticsRes.status !== 200) throw new Error('Test 4 failed');

    console.log('\n--- TEST 5: Update Lead Status to "contacted" ---');
    const updateRes = await request('PUT', `/api/leads/${createdLeadId}`, { status: 'contacted' }, token);
    console.log('Status:', updateRes.status, 'New status:', updateRes.data.data.status);
    if (updateRes.status !== 200 || updateRes.data.data.status !== 'contacted') throw new Error('Test 5 failed');

    console.log('\n--- TEST 6: Add Follow-up Note ---');
    const noteRes = await request('POST', `/api/leads/${createdLeadId}/notes`, {
      text: 'Spoke with Michael on the phone. Sent sample pricing sheet.',
      nextFollowUp: '2026-10-20T14:00:00.000Z'
    }, token);
    console.log('Status:', noteRes.status, 'Note added:', noteRes.data.data.note.text);
    if (noteRes.status !== 201) throw new Error('Test 6 failed');

    console.log('\n--- TEST 7: Delete Lead ---');
    const delRes = await request('DELETE', `/api/leads/${createdLeadId}`, null, token);
    console.log('Status:', delRes.status, 'Message:', delRes.data.message);
    if (delRes.status !== 200) throw new Error('Test 7 failed');

    console.log('\n🎉 ALL 7 SYSTEM TESTS PASSED SUCCESSFULLY! The CRM application is 100% operational.');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    server.close();
    process.exit(1);
  }
});
