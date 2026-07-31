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

  const $showcaseCards = $('.class-showcase-card');

  // Switch the visible timetable when a showcase card is selected
  function activateClassSelection(target, shouldScroll) {
    const $targetPanel = $('#class-panel-' + target);

    if (!$targetPanel.length) {
      return;
    }

    $showcaseCards.removeClass('active').attr('aria-selected', 'false');
    $showcaseCards.filter('[data-class-target="' + target + '"]').addClass('active').attr('aria-selected', 'true');

    $('.class-schedule-panel.active').removeClass('active').attr('hidden', true).stop(true, true).hide();
    $targetPanel.removeAttr('hidden').hide().addClass('active').fadeIn(200);

    if (shouldScroll) {
      const classesOverviewTop = $('.classes-overview').offset();
      if (classesOverviewTop) {
        $('html, body').stop(true).animate({ scrollTop: classesOverviewTop.top - 80 }, 350);
      }
    }
  }

  // Allow the image showcase tiles to drive the timetable below
  if ($showcaseCards.length) {
    $showcaseCards.on('click', function () {
      activateClassSelection($(this).data('class-target'), true);
    });
  }

  // Class booking state is stored locally so selections persist after reload
  const bookingStorageKey = 'peak-performance-class-bookings';
  const $scheduleCards = $('.schedule-card');

  if ($scheduleCards.length) {
    const $bookingStatus = $('#booking-status');
    const $bookingList = $('#booking-list');
    let bookings = [];

    try {
      bookings = JSON.parse(localStorage.getItem(bookingStorageKey) || '[]');
    } catch (error) {
      bookings = [];
    }

    // Build a stable identifier for each booking slot
    function getBookingId(booking) {
      return [booking.className, booking.day, booking.time].join('::');
    }

    // Read the current class key from the active timetable panel
    function getClassKeyFromPanel($panel) {
      return ($panel.attr('id') || '').replace('class-panel-', '');
    }

    // Fall back to a CSS-friendly class key when older bookings have no stored key
    function getClassKeyFromName(className) {
      return className.toLowerCase().replace(/\s+/g, '-');
    }

    // Persist the current booking list to localStorage
    function saveBookings() {
      localStorage.setItem(bookingStorageKey, JSON.stringify(bookings));
    }

    // Mark timetable cards that are already booked
    function updateCardState() {
      $scheduleCards.each(function () {
        const $card = $(this);
        const booking = {
          classKey: getClassKeyFromPanel($card.closest('.class-schedule-panel')),
          className: $card.closest('.class-schedule-panel').find('h3').text().replace(' Timetable', ''),
          day: $card.find('.schedule-day').text().trim(),
          time: $card.find('.schedule-time').text().trim()
        };
        const isBooked = bookings.some(function (item) {
          return getBookingId(item) === getBookingId(booking);
        });

        $card.toggleClass('booked', isBooked).attr('aria-pressed', isBooked ? 'true' : 'false');
      });
    }

    // Rebuild the booking summary and status message from the saved bookings array
    function renderBookingList(message, isSuccess) {
      $bookingList.empty();

      if (!bookings.length) {
        $bookingList.append('<li class="booking-empty">No sessions booked. Select any slot above to reserve a place.</li>');
        $bookingStatus.removeClass('success').text(message || 'No classes booked yet.');
        updateCardState();
        return;
      }

      bookings.forEach(function (booking) {
        const classKey = booking.classKey || getClassKeyFromName(booking.className);
        $bookingList.append(
          '<li class="booking-item class-' + classKey + '">' +
            '<div><strong>' + booking.className + '</strong><span>' + booking.day + ' at ' + booking.time + '</span></div>' +
            '<span>' + booking.coach + '</span>' +
          '</li>'
        );
      });

      $bookingStatus.toggleClass('success', !!isSuccess).text(message || 'Your selected sessions are saved on this device.');
      updateCardState();
    }

    // Expose each timetable slot as a keyboard-focusable booking control
    $scheduleCards.each(function () {
      const $card = $(this);
      $card.attr({
        tabindex: '0',
        role: 'button',
        'aria-pressed': 'false'
      });
    });

    // Toggle a class booking on click or keyboard activation
    $scheduleCards.on('click keydown', function (event) {
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();

      const $card = $(this);
      const booking = {
        classKey: getClassKeyFromPanel($card.closest('.class-schedule-panel')),
        className: $card.closest('.class-schedule-panel').find('h3').text().replace(' Timetable', ''),
        day: $card.find('.schedule-day').text().trim(),
        time: $card.find('.schedule-time').text().trim(),
        coach: $card.find('.schedule-coach').text().trim()
      };
      const bookingId = getBookingId(booking);
      const existingIndex = bookings.findIndex(function (item) {
        return getBookingId(item) === bookingId;
      });

      if (existingIndex >= 0) {
        bookings.splice(existingIndex, 1);
        saveBookings();
        renderBookingList(booking.className + ' on ' + booking.day + ' at ' + booking.time + ' was cancelled.', false);
        return;
      }

      bookings.push(booking);
      bookings.sort(function (left, right) {
        return left.className.localeCompare(right.className) || left.day.localeCompare(right.day) || left.time.localeCompare(right.time);
      });
      saveBookings();
      renderBookingList('Booked ' + booking.className + ' on ' + booking.day + ' at ' + booking.time + '.', true);
    });

    renderBookingList();
  }
});
