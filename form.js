document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("givingForm");
  const submitBtn = form.querySelector('button[type="submit"]');
  const confirmationMessage = document.getElementById("confirmationMessage");
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const paymentTypeInput = document.getElementById("paymentTypeInput");
  const receiptGroup = document.getElementById("receiptUploadGroup");
  const receiptInput = document.getElementById("receiptInput");
  const installationLabel = document.getElementById("installationName");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHXn-KvKQggR-q3z_qeSoliL97eLiRQTaJW82jLhaiCnXwsPIN9cBLflm1QtdI0A6-/exec";

  /* ============================
     INSTALLATION HANDLING
  ============================ */
  function getInstallation() {
    const params = new URLSearchParams(window.location.search);
    return params.get("installation") || "global";
  }

  installationLabel.textContent =
    "Word Sanctuary – " + getInstallation().replace(/_/g, " ").toUpperCase();

  /* ============================
     PAYMENT TOGGLE
  ============================ */
  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      toggleButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      paymentTypeInput.value = button.dataset.type;
      receiptGroup.style.display =
        paymentTypeInput.value === "e-banking" ? "block" : "none";
    });
  });

  /* ============================
     FORM SUBMISSION
  ============================ */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (
      paymentTypeInput.value === "e-banking" &&
      receiptInput.files.length === 0
    ) {
      alert("Please upload your payment receipt.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const fd = new FormData(form);
    fd.append("installation", getInstallation());

    if (paymentTypeInput.value === "e-banking") {
      const file = receiptInput.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
        fd.append("receipt", reader.result.split(",")[1]);
        fd.append("contentType", file.type);
        submit(fd);
      };
      reader.readAsDataURL(file);
    } else {
      submit(fd);
    }
  });

  function submit(data) {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: data
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          confirmationMessage.style.display = "block";
          form.reset();
          document.querySelector('.toggle-btn[data-type="cash"]').click();
        } else {
          alert(result.message || "Submission failed.");
        }
      })
      .catch(err => alert("Error: " + err.message))
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Giving Details";
        setTimeout(() => confirmationMessage.style.display = "none", 4000);
      });
  }
});
