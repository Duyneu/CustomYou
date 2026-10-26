/**
 * Custom You Glassmorphic Login Form Interaction
 * Includes Apple-style parallax background elevation on mouse hover
 * and the standard Glassmorphism freeze & state inspection harness.
 */

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.querySelector('.viewport-wrapper');
  const loginCard = document.getElementById('loginCard');
  const orb1 = document.querySelector('.glass-orb-1');
  const orb2 = document.querySelector('.glass-orb-2');
  const orbCenter = document.querySelector('.glass-orb-center');
  const closeBtn = document.getElementById('closeBtn');
  const reopenBtn = document.getElementById('reopenBtn');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const validationNotice = document.getElementById('validationNotice');

  // High-performance requestAnimationFrame mouse tracking for 120 FPS Apple Glass parallax
  const fluidLayer = document.getElementById('ambientFluidLayer');
  let rafId = null;

  if (viewport && loginCard) {
    viewport.addEventListener('mousemove', (e) => {
      const rect = viewport.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Single GPU compositor transform for all orbs
        if (fluidLayer) {
          fluidLayer.style.transform = `translate3d(${x * 16}px, ${y * 16 - 10}px, 0)`;
        }
        // Subtle 3D tilt on card
        loginCard.style.transform = `translate3d(0, -6px, 0) rotateX(${-y * 2.5}deg) rotateY(${x * 2.5}deg)`;
      });
    }, { passive: true });

    viewport.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (fluidLayer) {
        fluidLayer.style.transform = 'translate3d(0, 0, 0)';
      }
      loginCard.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
    });
  }

  function showError(message) {
    if (!validationNotice) return;
    validationNotice.textContent = message;
    validationNotice.hidden = false;
  }

  function clearError() {
    if (!validationNotice) return;
    validationNotice.textContent = '';
    validationNotice.hidden = true;
  }

  // 1. Close Button handler: plays reverse exit animation
  if (closeBtn && loginCard) {
    closeBtn.addEventListener('click', () => {
      clearError();
      loginCard.classList.remove('is-hidden');
      loginCard.classList.add('is-closing');

      const handleAnimationEnd = () => {
        loginCard.classList.remove('is-closing');
        loginCard.classList.add('is-hidden');
        loginCard.removeEventListener('animationend', handleAnimationEnd);

        if (reopenBtn) {
          reopenBtn.hidden = false;
          reopenBtn.focus();
        }
      };

      loginCard.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
  }

  // 2. Reopen Button handler: restores the card
  if (reopenBtn && loginCard) {
    reopenBtn.addEventListener('click', () => {
      reopenBtn.hidden = true;
      loginCard.classList.remove('is-hidden', 'is-closing');
      void loginCard.offsetWidth; // Reflow
      if (usernameInput) {
        usernameInput.focus();
      }
    });
  }

  // 3. Clear errors as user types & Password visibility toggle
  const pwdToggle = document.getElementById('pwdToggle');
  const pwdIcon = document.getElementById('pwdIcon');

  if (pwdToggle && passwordInput && pwdIcon) {
    pwdToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      pwdIcon.className = isPassword ? 'bx bx-hide' : 'bx bx-show';
    });
  }

  [usernameInput, passwordInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        if (!validationNotice.hidden) {
          clearError();
        }
      });
    }
  });

  // 4. Form Submission & Validation
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError();

      const userVal = usernameInput ? usernameInput.value.trim() : '';
      const passVal = passwordInput ? passwordInput.value : '';

      if (!userVal) {
        showError('Please enter your username or email.');
        usernameInput?.focus();
        return;
      }

      if (!passVal) {
        showError('Please enter your password.');
        passwordInput?.focus();
        return;
      }

      const submitBtn = document.getElementById('loginBtn');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          alert(`Welcome back, ${userVal}! Authentication successful.`);
        }, 800);
      }
    });
  }

  // 5. Glassmorphism Freeze & State Harness (SKILL.md Contract)
  // ?state=hover -> forces hover state
  // ?t=N -> freezes CSS animations & SVG refraction at N seconds
  const p = new URLSearchParams(window.location.search);
  const state = p.get('state');
  if (state) {
    document.documentElement.dataset.state = state;
  }
  const t = p.get('t');
  if (t !== null) {
    const timeMs = parseFloat(t) * 1000;
    document.getAnimations().forEach((a) => {
      a.currentTime = timeMs;
      a.pause();
    });
    const svg = document.querySelector('svg');
    svg?.pauseAnimations?.();
    svg?.setCurrentTime?.(parseFloat(t));
  }
  window.__ready = true;
});
