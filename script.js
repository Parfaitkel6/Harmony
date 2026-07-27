document.addEventListener('DOMContentLoaded', () => {
  const audioInput = document.getElementById('audioInput');
  const audioPlayer = document.getElementById('audioPlayer');
  const nowPlaying = document.getElementById('nowPlaying');

  // Handle File Input Selection
  if (audioInput && audioPlayer) {
    audioInput.addEventListener('change', (event) => {
      const files = event.target.files;

      if (files && files.length > 0) {
        const selectedFile = files[0];

        // Generate temporary Blob URL compatible with Mobile Safari
        const fileURL = URL.createObjectURL(selectedFile);

        audioPlayer.src = fileURL;
        nowPlaying.textContent = `Playing: ${selectedFile.name}`;
        
        // Auto play track after loading
        audioPlayer.play().catch(err => {
          console.log("Autoplay prevented by iOS user interaction policy:", err);
        });
      }
    });
  }

  // Reset Modal Logic
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const resetModal = document.getElementById('resetModal');
  const closeResetModal = document.getElementById('closeResetModal');
  const resetForm = document.getElementById('resetForm');

  if (forgotPasswordLink && resetModal) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      resetModal.style.display = 'block';
    });
  }

  if (closeResetModal && resetModal) {
    closeResetModal.addEventListener('click', () => {
      resetModal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === resetModal) {
      resetModal.style.display = 'none';
    }
  });

  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = document.getElementById('resetEmail').value;
      alert(`Password reset link sent to: ${emailVal}`);
      resetModal.style.display = 'none';
      resetForm.reset();
    });
  }
});
