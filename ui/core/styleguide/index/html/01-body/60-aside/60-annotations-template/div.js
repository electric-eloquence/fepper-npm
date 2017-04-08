module.exports = {
  className: 'sg-view-container',
  id: 'sg-annotation-container',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-annotation-close" class="sg-view-close">
  <a href="#" id="sg-annotation-close-btn" class="sg-view-close-btn">Close</a>
</div>
<div id="sg-comments-container"></div>
`
  }
};
