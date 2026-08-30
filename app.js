const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button'); const flyout = document.querySelector('.flyout');
  if (menuButton && flyout) { menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); flyout.classList.toggle('open', open); }); flyout.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menuButton.setAttribute('aria-expanded', 'false'); flyout.classList.remove('open'); })); }
  const cards = document.querySelectorAll('.world-card'); cards.forEach(card => card.addEventListener('mouseenter', () => cards.forEach(item => item.classList.toggle('is-featured', item === card))));
  if (!prefersReduced) { const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); reveal.unobserve(entry.target); } }), { threshold: .18 }); document.querySelectorAll('.reveal-up').forEach(el => reveal.observe(el)); } else document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('in-view'));

  const authForm = document.querySelector('#auth-form');
  if (authForm) {
    const page = document.querySelector('.auth-page'); const switcher = document.querySelector('#auth-switch');
    const setMode = mode => { const signingUp = mode === 'signup'; page.dataset.mode = mode; document.querySelector('#mode-label').textContent = signingUp ? 'CREATE YOUR ACCESS' : 'WELCOME BACK'; document.querySelector('#auth-title').innerHTML = signingUp ? 'MAKE IT<br><em>OFFICIAL.</em>' : 'ENTER THE<br><em>LOOP.</em>'; document.querySelector('#auth-subtitle').textContent = signingUp ? 'Claim your spot in the world before the doors open.' : 'New to SIGNAL? Your world is one click away.'; document.querySelector('#auth-button-text').textContent = signingUp ? 'CREATE MY ACCESS' : 'ENTER SIGNAL'; authForm.password.autocomplete = signingUp ? 'new-password' : 'current-password'; switcher.innerHTML = signingUp ? 'Already a member? <button type="button" data-mode="signin">SIGN IN</button>' : 'Not a member? <button type="button" data-mode="signup">CREATE YOUR ACCESS</button>'; };
    switcher.addEventListener('click', event => { const button = event.target.closest('[data-mode]'); if (button) setMode(button.dataset.mode); }); setMode('signin');
    authForm.addEventListener('submit', event => { event.preventDefault(); if (!authForm.reportValidity()) return; const modal = document.querySelector('#success-modal'); modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); });
  }
});
