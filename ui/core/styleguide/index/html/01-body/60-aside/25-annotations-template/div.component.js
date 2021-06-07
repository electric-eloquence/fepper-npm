module.exports = {
  className: 'sg-view-scroll-container',
  id: 'sg-annotations-container',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-annotations">
  <div class="sg-annotation">
    <h2>${t('No Annotations')}</h2>
    <div>${t('There are no annotations for this pattern')}</div>
  </div>
</div>
<!-- DEPRECATED SCRIPT FOR BACKWARD-COMPATIBILITY. TO BE REMOVED. -->
<script>
  (function () {
    const sgVpWrap = document.getElementById('sg-vp-wrap');
    const deprecationMessage = document.createElement('code');
    deprecationMessage.id = 'deprecation-message-0.40.0';
    deprecationMessage.innerHTML = 'Update Fepper UI to make this work correctly.';
    deprecationMessage.style.color = 'red';
    deprecationMessage.style.opacity = '0';
    deprecationMessage.style.position = 'absolute';
    deprecationMessage.style.top = 'calc(50% + 1.7rem)';
    deprecationMessage.style.left = '1.4rem';
    deprecationMessage.style.transition = 'opacity 1s';

    sgVpWrap.appendChild(deprecationMessage);

    window.addEventListener('load', () => {
      window.FEPPER_UI.patternViewport = {
        goRandom: window.FEPPER_UI.patternlabViewer.goRandom.bind(window.FEPPER_UI.patternlabViewer),
        goWhole: window.FEPPER_UI.patternlabViewer.goWhole.bind(window.FEPPER_UI.patternlabViewer)
      };

      deprecationMessage.style.opacity = '1';
    });
  })();
</script>
`
  }
};
