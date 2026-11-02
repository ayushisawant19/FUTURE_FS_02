document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = document.getElementById('errorMessage');
  const submitBtn = document.getElementById('submitBtn');

  // If already logged in, redirect to dashboard
  const token = localStorage.getItem('crm_token');
  if (token) {
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = '/';
      }
    })
    .catch(() => {
      localStorage.removeItem('crm_token');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.classList.add('hidden');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem('crm_token', result.token);
        localStorage.setItem('crm_user', JSON.stringify(result.user));
        window.location.href = '/';
      } else {
        errorMessage.textContent = result.message || 'Login failed. Please check your credentials.';
        errorAlert.classList.remove('hidden');
      }
    } catch (err) {
      errorMessage.textContent = 'Server connection error. Please make sure the server is running.';
      errorAlert.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Sign In to Dashboard</span> <i class="fa-solid fa-arrow-right text-xs"></i>';
    }
  });
});
