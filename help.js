
// Get elements
const helpModal = document.getElementById("help-modal");
const helpButton = document.getElementById("help-button");
const closeHelp = document.getElementById("close-help");

// Show modal on page load
window.addEventListener("load", () => {
  helpModal.style.display = "block";
});

// Click ? button to open
helpButton.addEventListener("click", () => {
  helpModal.style.display = "block";
});

// Click X to close
closeHelp.addEventListener("click", () => {
  helpModal.style.display = "none";
});

// Click outside modal content to close
window.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    helpModal.style.display = "none";
  }
});
