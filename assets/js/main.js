// ============================================================
// Shared utilities — AX Founder Exchange 2026
// ============================================================

/** Toast notifications */
function toast({ title, message = '', type = 'info', duration = 4200 }) {
  const region = document.getElementById('toast-region');
  if (!region) return;

  const icons = {
    success: '<svg class="w-5 h-5 shrink-0" style="color:var(--axsuccess)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
    error: '<svg class="w-5 h-5 shrink-0" style="color:var(--axerror)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
    info: '<svg class="w-5 h-5 shrink-0" style="color:var(--axblue)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25h.008v4.5H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>'
  };

  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `
    ${icons[type] || icons.info}
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold" style="color:var(--axink)">${title}</p>
      ${message ? `<p class="text-sm mt-0.5" style="color:var(--axslate)">${message}</p>` : ''}
    </div>
    <button aria-label="Dismiss notification" class="shrink-0 text-slate-400 hover:text-slate-600">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
    </button>`;

  const remove = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 180); };
  el.querySelector('button').addEventListener('click', remove);
  region.appendChild(el);
  setTimeout(remove, duration);
}
window.toast = toast;

/** Floating-label inputs: keep a `has-value` class in sync for non-text controls */
function syncFieldState(el) {
  const field = el.closest('.field');
  if (!field) return;
  if (el.tagName === 'SELECT') {
    field.classList.toggle('has-value', !!el.value);
  }
}
document.addEventListener('input', (e) => syncFieldState(e.target));
document.addEventListener('change', (e) => syncFieldState(e.target));
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.field select').forEach(syncFieldState);
});

/** Password visibility toggle */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-toggle-password]');
  if (!btn) return;
  const input = document.getElementById(btn.getAttribute('data-toggle-password'));
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  btn.innerHTML = isHidden
    ? '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.5 10.5 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>'
    : '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>';
});

/** Modal open / close via data attributes */
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-modal]');
  if (opener) {
    const modal = document.getElementById(opener.getAttribute('data-open-modal'));
    if (modal) { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  }
  const closer = e.target.closest('[data-close-modal]');
  if (closer) {
    const modal = closer.closest('.modal-overlay') || document.getElementById(closer.getAttribute('data-close-modal'));
    if (modal) { modal.classList.add('hidden'); document.body.style.overflow = ''; }
  }
});

/** Mobile nav / drawer toggles */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-toggle]');
  if (!btn) return;
  const target = document.getElementById(btn.getAttribute('data-toggle'));
  if (target) target.classList.toggle('hidden');
});
