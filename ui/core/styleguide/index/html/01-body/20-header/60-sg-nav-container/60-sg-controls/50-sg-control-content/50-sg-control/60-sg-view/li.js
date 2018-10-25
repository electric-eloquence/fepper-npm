const annotationsViewer = window.annotationsViewer;
const codeViewer = window.codeViewer;
const uiProps = window.FEPPER_UI.uiProps;

// Annotations toggle click handler.
uiProps.sgTAnnotations.addEventListener(
  'click',
  function (e) {
    e.preventDefault();

    if (annotationsViewer.mustacheBrowser) {
      return;
    }

    annotationsViewer.toggleAnnotations();

    // If viewall, scroll to the focused pattern.
    if (annotationsViewer.viewall) {
      annotationsViewer.scrollViewall();
    }
  },
  false
);

// Code toggle click handler.
uiProps.sgTCode.addEventListener(
  'click',
  function (e) {
    e.preventDefault();

    if (codeViewer.mustacheBrowser) {
      return;
    }

    codeViewer.toggleCode();

    // If viewall, scroll to the focused pattern.
    if (codeViewer.viewall) {
      codeViewer.scrollViewall();
    }
  },
  false
);

// Click handler for "Open in new window" link.
// Do not use Event.preventDefault().
$('#sg-view li a').click(function () {
  $(this).parent().parent().removeClass('active');
  uiProps.sgTToggle.classList.remove('active');
});
