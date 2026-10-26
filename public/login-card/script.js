/**
 * Custom You Glassmorphic Login Form Interaction
 * Handles dismissal, reopening, and validation based on tutorial markup.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginCard = document.getElementById('loginCard');
  const closeBtn = document.getElementById('closeBtn');
  const reopenBtn = document.getElementById('reopenBtn');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const validationNotice = document.getElementById('validationNotice');

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

  // 3. Clear errors as user types
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
});
