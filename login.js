const form = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const message = document.getElementById('form-message');
const emailInput = document.getElementById('email');
let mode = 'signin';

function getAccounts() {
  try { return JSON.parse(localStorage.getItem('theEditAccounts') || '[]'); }
  catch { return []; }
}

async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.classList.toggle('error', error);
}

function setMode(nextMode) {
  mode = nextMode;
  message.textContent = '';
  document.getElementById('submit-label').textContent = mode === 'signup' ? 'Create my account' : 'Sign in';
  document.getElementById('join-note').innerHTML = mode === 'signup'
    ? 'Already have an account? <a href="#" id="join-link">Sign in</a>'
    : 'New around here? <a href="#" id="join-link">Create an account</a>';
  const nameLabel = document.getElementById('name-label');
  if (mode === 'signup' && !nameLabel) {
    const emailLabel = form.querySelector('label[for="email"]');
    const label = document.createElement('label');
    label.id = 'name-label'; label.htmlFor = 'full-name'; label.textContent = 'Your name';
    const input = document.createElement('input');
    input.id = 'full-name'; input.name = 'name'; input.type = 'text'; input.placeholder = 'How should we call you?';
    input.autocomplete = 'name'; input.required = true; input.className = 'signup-name';
    form.insertBefore(label, emailLabel);
    form.insertBefore(input, emailLabel);
  } else if (mode === 'signin' && nameLabel) {
    nameLabel.remove(); document.getElementById('full-name').remove();
  }

  let confirm = document.getElementById('confirm-password');
  if (mode === 'signup' && !confirm) {
    const label = document.createElement('label');
    label.id = 'confirm-label'; label.htmlFor = 'confirm-password'; label.textContent = 'Confirm password';
    label.className = 'confirm-label';
    confirm = document.createElement('input');
    confirm.id = 'confirm-password'; confirm.name = 'confirm-password'; confirm.type = 'password';
    confirm.placeholder = 'Enter your password again'; confirm.autocomplete = 'new-password'; confirm.required = true;
    confirm.minLength = 8; confirm.className = 'confirm-password';
    form.insertBefore(label, document.querySelector('.remember'));
    form.insertBefore(confirm, document.querySelector('.remember'));
  } else if (mode === 'signin' && confirm) {
    confirm.remove(); document.getElementById('confirm-label').remove();
  }

  passwordInput.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  passwordInput.minLength = mode === 'signup' ? 8 : 6;
  const forgot = document.getElementById('forgot-link');
  forgot.hidden = mode === 'signup';
  document.querySelector('.form-intro').textContent = mode === 'signup'
    ? 'Create an account to keep your favorite finds close.'
    : 'Sign in to pick up where you left off.';
  document.getElementById('account-note').hidden = mode !== 'signup';
}

document.getElementById('toggle-password').addEventListener('click', event => {
  const showing = passwordInput.type === 'password';
  passwordInput.type = showing ? 'text' : 'password';
  event.currentTarget.textContent = showing ? 'Hide' : 'Show';
  event.currentTarget.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
});

document.getElementById('join-note').addEventListener('click', event => {
  if (!event.target.closest('#join-link')) return;
  event.preventDefault(); setMode(mode === 'signin' ? 'signup' : 'signin');
});

document.getElementById('forgot-link').addEventListener('click', event => {
  event.preventDefault();
  showMessage('Password reset needs an email service. Contact us if you need help.');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  showMessage('');
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  try {
    if (!crypto.subtle) throw new Error('secure-context');
    const accounts = getAccounts();
    if (mode === 'signup') {
      const name = document.getElementById('full-name').value.trim();
      const confirmation = document.getElementById('confirm-password').value;
      if (password !== confirmation) return showMessage('Those passwords do not match yet.', true);
      if (accounts.some(account => account.email === email)) return showMessage('An account with that email already exists. Sign in instead.', true);
      accounts.push({name,email,passwordHash:await hashPassword(password)});
      localStorage.setItem('theEditAccounts', JSON.stringify(accounts));
      form.reset();
      setMode('signin');
      emailInput.value = email;
      return showMessage('Your account is ready. Sign in to continue.');
    }
    const account = accounts.find(item => item.email === email);
    if (!account || account.passwordHash !== await hashPassword(password))
      return showMessage('That email and password combination was not found.', true);
    sessionStorage.setItem('theEditSignedInAs', account.email);
    showMessage(`Welcome back, ${account.name}! You’re signed in on this browser.`);
  } catch (error) {
    if (error.message === 'secure-context') showMessage('Account creation needs a secure browser context. Open this page on localhost.', true);
    else showMessage('Your browser could not save this account. Check that local storage is enabled.', true);
  }
});
