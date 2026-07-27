document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const closeResetModal = document.getElementById('closeResetModal');
  const resetModal = document.getElementById('resetModal');
  const resetForm = document.getElementById('resetForm');
  const audioInput = document.getElementById('audioInput');
  const audioPlayer = document.getElementById('audioPlayer');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');

  // --- Reset Password Modal Functions ---
  const openModal = () => {
    resetModal.classList.add('active');
    resetModal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    resetModal.classList.remove('active');
    resetModal.setAttribute('aria-hidden', 'true');
    if (resetForm) resetForm.reset();
  };

  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (closeResetModal) {
    closeResetModal.addEventListener('click', closeModal);
  }

  // Close modal when tapping outside card
  window.addEventListener('click', (e) => {
    if (e.target === resetModal) {
      closeModal();
    }
  });

  // Handle Reset Form Submit
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value;
      
      alert(`Password reset link successfully sent to: ${email}`);
      closeModal();
    });
  }

  // --- Audio Upload & Playback (iOS Compatible) ---
  if (audioInput && audioPlayer) {
    audioInput.addEventListener('change', (event) => {
      const files = event.target.files;

      if (files && files.length > 0) {
        const file = files[0];

        // Create object URL compatible with Safari / WebKit
        const audioUrl = URL.createObjectURL(file);
        
        audioPlayer.src = audioUrl;
        nowPlayingTitle.textContent = file.name;

        // Auto play track after loading
        audioPlayer.play().catch((err) => {
          console.log("Autoplay deferred until user interaction:", err);
        });
      }
    });
  }
});
