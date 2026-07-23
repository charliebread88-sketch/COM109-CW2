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
});
