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

  // Testimonials rotator
  const testimonials = [
    { quote: "Best gym I've ever joined. The trainers are incredible and the atmosphere keeps me coming back.", name: "Sarah M." },
    { quote: "Lost 15kg in 6 months thanks to the PT programme. Couldn't recommend it more.", name: "James T." },
    { quote: "The 24/7 access is a game changer. I train at 5am before work and it's always clean and well-staffed.", name: "Priya K." },
    { quote: "The coaches here actually care about your progress. Best investment I've made in my health.", name: "Marcus L." },
    { quote: "Switched from a big chain gym and I'll never go back. The community here is something else.", name: "Donna F." },
    { quote: "The nutrition bar is a brilliant touch. Post-workout shakes on site makes such a difference.", name: "Tom H." },
    { quote: "I was nervous joining as a complete beginner but everyone made me feel so welcome from day one.", name: "Aisha R." },
    { quote: "Three months in and I've hit every goal I set. The PT sessions are worth every penny.", name: "Connor B." },
    { quote: "Cleanest gym I've ever been in. Changing rooms are always spotless and the equipment is top notch.", name: "Rachel W." },
    { quote: "The spin classes are absolutely brilliant. Lisa is an amazing instructor — so motivating.", name: "Niamh O." },
    { quote: "Free parking right outside is such a small thing but it makes a huge difference to my routine.", name: "Gary S." },
    { quote: "I've tried every gym in the city. This one is on another level for equipment and atmosphere.", name: "Zara A." },
    { quote: "The HIIT classes with Danny are brutal in the best way. I've never been fitter in my life.", name: "Luke P." },
    { quote: "Sophie's nutrition coaching completely changed how I fuel my training. Highly recommend.", name: "Emma C." },
    { quote: "Joined on the Standard plan and it's incredible value. Unlimited classes alone is worth it.", name: "Ryan M." }
  ];

  const $grid = $('#testimonials-grid');
  if ($grid.length) {
    let current = 0;

    function showTestimonials() {
      const batch = [
        testimonials[current % testimonials.length],
        testimonials[(current + 1) % testimonials.length],
        testimonials[(current + 2) % testimonials.length]
      ];
      $grid.fadeOut(400, function () {
        $grid.html(batch.map(function (t) {
          return '<blockquote class="testimonial-card"><p>"' + t.quote + '"</p><footer>— <cite>' + t.name + '</cite></footer></blockquote>';
        }).join(''));
        $grid.fadeIn(400);
      });
      current = (current + 3) % testimonials.length;
    }

    showTestimonials();
    setInterval(showTestimonials, 30000);
  }

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

$(document).ready(function () {
  // Mobile nav toggle
  $('.nav-toggle').on('click', function () {
    const nav = $('#main-nav');
    const isOpen = nav.hasClass('open');

    nav.toggleClass('open');
    $(this).attr('aria-expanded', !isOpen);
  });

  // Footer year
  $('#year').text(new Date().getFullYear());

  // Picks plan based off what plan is clicked on index form
  if (window.location.pathname.endsWith('membership.html')) {
    const planParam = new URLSearchParams(window.location.search).get('plan');
    const allowedPlans = ['basic', 'standard', 'premium'];

    if (planParam && allowedPlans.includes(planParam) && $('select[name="plan"]').length) {
      $('select[name="plan"]').val(planParam).trigger('change');
    }
  }

  // Show success banner on index page if redirected after join
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    const joined = sessionStorage.getItem('gymJoinSuccess');

    if (joined === 'true') {
      if ($('.success-banner').length === 0) {
        $('body').prepend('<div class="success-banner">Successfully joined! Welcome to Peak Performance Gym.</div>');
      } else {
        $('.success-banner').removeClass('hidden');
      }

      sessionStorage.removeItem('gymJoinSuccess');

      setTimeout(function () {
        $('.success-banner').fadeOut(300, function () {
          $(this).remove();
        });
      }, 4000);
    }
  }

  // Membership form validation
  $('.join-form').on('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    // Clear previous errors
    $('.invalid-field').removeClass('invalid-field');
    $('.invalid-message').text('');

    const name = $('input[name="full-name"]');
    const email = $('input[name="email"]');
    const phone = $('input[name="phone"]');
    const plan = $('select[name="plan"]');
    const notes = $('textarea[name="notes"]');

    function markInvalid(field, message) {
      field.addClass('invalid-field');
      field.next('.invalid-message').text(message);
      isValid = false;
    }

    // Name
    if ($.trim(name.val()) === '') {
      markInvalid(name, 'Please enter your full name.');
    }

    // Email
    const emailValue = $.trim(email.val());
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailValue === '') {
      markInvalid(email, 'Please enter your email address.');
    } else if (!emailPattern.test(emailValue)) {
      markInvalid(email, 'Please enter a valid email address.');
    }

    // Phone (not required)
    const phoneValue = $.trim(phone.val());
    const phonePattern = /^[0-9+\-\s]{7,20}$/;
    if (phoneValue !== '' && !phonePattern.test(phoneValue)) {
      markInvalid(phone, 'Please enter a valid phone number.');
    }

    // Plan
    if (plan.val() === '') {
      markInvalid(plan, 'Please choose a membership plan.');
    }

    // Notes
    if ($.trim(notes.val()).length > 300) {
      markInvalid(notes, 'Notes must be 300 characters or fewer.');
    }

    if (isValid) {
      sessionStorage.setItem('gymJoinSuccess', 'true');
      window.location.href = 'index.html';
    }
  });

  // Clear invalid style as user edits fields
  $('.join-form input, .join-form select, .join-form textarea').on('input change', function () {
    $(this).removeClass('invalid-field');
    $(this).next('.invalid-message').text('');
  });
});
