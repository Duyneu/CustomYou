/**
 * Login Card Interactive Behaviors
 * Handles entry/exit animations, validation, and accessible state management.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginCard = document.getElementById('loginCard');
  const closeBtn = document.getElementById('closeBtn');
  const reopenBtn = document.getElementById('reopenBtn');
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const validationNotice = document.getElementById('validationNotice');

  /**
   * Helper to display validation messages
   * @param {string} message - Error description
   */
  function showError(message) {
    if (!validationNotice) return;
    validationNotice.textContent = message;
    validationNotice.hidden = false;
  }

  /**
   * Helper to clear validation messages
   */
  function clearError() {
    if (!validationNotice) return;
    validationNotice.textContent = '';
    validationNotice.hidden = true;
  }

  /**
   * 1. Close Button Handler:
   * Plays reverse exit animation (scale to 0 & fade out), then hides the card.
   */
  if (closeBtn && loginCard) {
    closeBtn.addEventListener('click', () => {
      clearError();
      loginCard.classList.remove('is-hidden');
      loginCard.classList.add('is-closing');

      const handleAnimationEnd = () => {
        loginCard.classList.remove('is-closing');
        loginCard.classList.add('is-hidden');
        loginCard.removeEventListener('animationend', handleAnimationEnd);

        // Show the reopen button so the user can easily reopen the modal
        if (reopenBtn) {
          reopenBtn.hidden = false;
          reopenBtn.focus();
        }
      };

      loginCard.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
  }

  /**
   * 2. Reopen Button Handler:
   * Restores the card and re-runs the entry animation.
   */
  if (reopenBtn && loginCard) {
    reopenBtn.addEventListener('click', () => {
      reopenBtn.hidden = true;
      loginCard.classList.remove('is-hidden', 'is-closing');
      // Reflow trigger to restart keyframe animation cleanly
      void loginCard.offsetWidth;
      if (emailInput) {
        emailInput.focus();
      }
    });
  }

  /**
   * 3. Clear errors on user input
   */
  [emailInput, passwordInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        if (!validationNotice.hidden) {
          clearError();
        }
      });
    }
  });

  /**
   * 4. Form Submission & Basic Validation:
   * Blocks submit if email or password is empty.
   */
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError();

      const emailVal = emailInput ? emailInput.value.trim() : '';
      const passwordVal = passwordInput ? passwordInput.value : '';

      if (!emailVal) {
        showError('Please enter your email address.');
        emailInput?.focus();
        return;
      }

      // Simple email pattern check
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailVal)) {
        showError('Please enter a valid email address.');
        emailInput?.focus();
        return;
      }

      if (!passwordVal) {
        showError('Please enter your password.');
        passwordInput?.focus();
        return;
      }

      // Simulated success feedback
      const submitBtn = document.getElementById('loginBtn');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          alert(`Welcome back, ${emailVal}! Login successful.`);
        }, 900);
      }
    });
  }
});
