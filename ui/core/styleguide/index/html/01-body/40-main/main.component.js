module.exports = {
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-vp-wrap">
  <div id="sg-cover"></div>
  <div id="sg-gen-container">
    <iframe id="sg-viewport" name="sg-viewport" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
    <div id="sg-rightpull-container">
      <div id="sg-rightpull"></div>
    </div>
  </div>
</div>
`
  }
};
