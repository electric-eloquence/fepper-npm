module.exports = {
  className: 'sg-view-container',
  id: 'sg-annotations-container',
  style: {
    bottom: 'auto'
  },
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-annotations-close" class="sg-view-close">
  <a href="#" id="sg-annotations-close-btn" class="sg-view-close-btn">&#x2715;</a>
</div>
<div id="sg-annotations">
  <div class="sg-annotation">
    <h2>No Annotations</h2>
    <div>There are no annotations for this pattern.</div>
  </div>
</div>
`
  }
};
