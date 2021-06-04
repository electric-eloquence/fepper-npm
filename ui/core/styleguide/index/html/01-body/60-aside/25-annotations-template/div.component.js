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
  const sgVpWrap = document.getElementById('sg-vp-wrap');

  const deprecationMessage = document.createElement('code');
  deprecationMessage.innerHTML = 'The annotations viewer requires Fepper-NPM to be updated in order to work properly.';
  deprecationMessage.style.color = 'red';
  deprecationMessage.style.position = 'absolute';
  deprecationMessage.style.top = 'calc(50% + 2rem)';
  deprecationMessage.style.left = '2.8rem';
  deprecationMessage.style.zIndex = '-1';

  sgVpWrap.appendChild(deprecationMessage);
</script>
`
  }
};
