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
    window.addEventListener('load', () => {
      window.FEPPER_UI.patternViewport = {
        goRandom: window.FEPPER_UI.patternlabViewer.goRandom.bind(window.FEPPER_UI.patternlabViewer),
        goWhole: window.FEPPER_UI.patternlabViewer.goWhole.bind(window.FEPPER_UI.patternlabViewer)
      };
    });

    const sgVpWrap = document.getElementById('sg-vp-wrap');
    const deprecationMessage = document.createElement('code');
    deprecationMessage.innerHTML = '${t('Update Fepper UI to get this working correctly.')}';
    deprecationMessage.style.color = 'red';
    deprecationMessage.style.position = 'absolute';
    deprecationMessage.style.top = 'calc(50% + 1.7rem)';
    deprecationMessage.style.left = '1.4rem';
    deprecationMessage.style.zIndex = '-1';

    sgVpWrap.appendChild(deprecationMessage);
  })();
</script>
`
  }
};
