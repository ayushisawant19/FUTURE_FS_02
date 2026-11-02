document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('successBox');
  const successDetails = document.getElementById('successDetails');
  const formError = document.getElementById('formError');
  const errorMessageText = document.getElementById('errorMessageText');
  const submitLeadBtn = document.getElementById('submitLeadBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');
    successBox.classList.add('hidden');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const company = document.getElementById('company').value.trim();
    const source = document.getElementById('source').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      errorMessageText.textContent = 'Please fill out all required fields (Name, Email, Message).';
      formError.classList.remove('hidden');
      return;
    }

    submitLeadBtn.disabled = true;
    submitLeadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Inquiry...';

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, source, message })
      });

      const result = await response.json();

      if (result.success) {
        successDetails.innerHTML = `Lead successfully captured! <b>Lead Ref ID:</b> <code>${result.referenceId}</code>. You can now track it in real-time in the admin dashboard.`;
        successBox.classList.remove('hidden');
        form.reset();
        window.scrollTo({ top: successBox.offsetTop - 80, behavior: 'smooth' });
      } else {
        errorMessageText.textContent = result.message || 'Error sending inquiry.';
        formError.classList.remove('hidden');
      }
    } catch (err) {
      errorMessageText.textContent = 'Could not reach server. Please ensure the CRM backend is active.';
      formError.classList.remove('hidden');
    } finally {
      submitLeadBtn.disabled = false;
      submitLeadBtn.innerHTML = '<span>Send Inquiry & Generate Lead</span> <i class="fa-solid fa-paper-plane text-xs"></i>';
    }
  });
});
