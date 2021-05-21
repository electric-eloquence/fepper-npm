module.exports = {
  className: 'anim-ready',
  id: 'sg-vp-wrap',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-gen-container">
  <iframe id="sg-viewport" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
  <div id="sg-cover"></div>
  <div id="sg-rightpull"></div>
</div>
`
  }
};
