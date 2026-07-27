$(function () {
  // Dynamic footer year
  $('#year').text(new Date().getFullYear());

  // Mobile nav toggle
  const $toggle = $('.nav-toggle');
  const $nav = $('#main-nav');

  $toggle.on('click', function () {
    const isOpen = $nav.hasClass('open');
    $nav.toggleClass('open');
    $toggle.attr('aria-expanded', !isOpen);
  });

  // Close nav when a link is clicked (mobile)
  $nav.find('a').on('click', function () {
    $nav.removeClass('open');
    $toggle.attr('aria-expanded', false);
  });

  // Contact form validation
  const $contactForm = $('#contact-form');

  if ($contactForm.length) {
    const $status = $('#form-status');
    const fields = [
      { id: 'name', message: 'Please enter your name.' },
      { id: 'email', message: 'Please enter a valid email address.', isEmail: true },
      { id: 'message', message: 'Please enter a message.' }
    ];

    $contactForm.on('submit', function (e) {
      e.preventDefault();
      let isValid = true;

      fields.forEach(function (field) {
        const $input = $('#' + field.id);
        const $error = $('#' + field.id + '-error');
        const value = $input.val().trim();
        let fieldValid = value.length > 0;

        if (fieldValid && field.isEmail) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        if (!fieldValid) {
          isValid = false;
          $input.addClass('invalid');
          $error.text(field.message);
        } else {
          $input.removeClass('invalid');
          $error.text('');
        }
      });

      if (!isValid) {
        $status.removeClass('success').addClass('error')
          .text('Please fix the errors above and try again.');
        return;
      }

      // No backend is wired up yet — simulate a successful send.
      console.log('Form submitted:', {
        name: $('#name').val(),
        email: $('#email').val(),
        subject: $('#subject').val(),
        message: $('#message').val()
      });
      $status.removeClass('error').addClass('success')
        .text("Thanks! Your message has been sent \u2014 we'll get back to you soon.");
      $contactForm[0].reset();
    });

    // Clear individual field errors as the user types
    fields.forEach(function (field) {
      $('#' + field.id).on('input', function () {
        $(this).removeClass('invalid');
        $('#' + field.id + '-error').text('');
      });
    });
  }
});
