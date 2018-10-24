$('.sg-tools .sg-checklist-icon').click(function (e) {
  e.preventDefault();

  const $this = $(this);
  const $sgChecklist = $this.parents('.sg-checklist');
  const $sgToolsToggle = $sgChecklist.prev('#sg-tools-toggle');

  $sgChecklist.removeClass('active');
  $sgToolsToggle.removeClass('active');
});
