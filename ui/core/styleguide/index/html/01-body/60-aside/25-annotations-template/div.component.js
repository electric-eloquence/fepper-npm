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
</div>
`
  }
};
