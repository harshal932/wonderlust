// Bootstrap 5 Custom Validation
// Prevents browser native popups and shows Bootstrap styled errors instead
// The form must have: class="needs-validation" and novalidate attribute

(() => {
  'use strict'

  // Select all forms with needs-validation class
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over and prevent submission if invalid
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()      // Stop form submission
        event.stopPropagation()     // Stop event bubbling
      }

      form.classList.add('was-validated')  // Trigger Bootstrap red/green styles
    }, false)
  })
})()