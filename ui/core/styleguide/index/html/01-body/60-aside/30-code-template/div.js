module.exports = {
  className: 'sg-view-container',
  id: 'sg-code-container',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-code-close" class="sg-view-close">
  <a href="#" id="sg-code-close-btn" class="sg-view-close-btn">Close</a>
</div>
<div id="sg-code-loader">
  <div class="spinner"></div>
  Loading pattern...
</div>
<div id="sg-code-patternstate" style="display: none;">
  <p>
    The state of the <span id="sg-code-patternstate-patternname" class="sg-code-patternname"></span> pattern is: <span id="sg-code-patternstate-fill"></span>
  </p>
</div>
<div id="sg-code-lineage" style="display: none;">
  <p>
    The <span id="sg-code-lineager-patternname" class="sg-code-patternname"></span> pattern contains the following patterns: <span id="sg-code-lineage-fill"></span>
  </p>
</div>
<div id="sg-code-lineager" style="display: none;">
  <p>
    The <span id="sg-code-lineager-patternname" class="sg-code-patternname"></span> pattern is included in the following patterns: <span id="sg-code-lineager-fill"></span>
  </p>
</div>
<div id="sg-code-markup">
  <ul id="sg-code-tabs">
    <li id="sg-code-title-html" class="sg-code-title-active">HTML</li>
    <li id="sg-code-title-mustache">Mustache</li>
    <li id="sg-code-title-css" style="display: none;">CSS</li>
  </ul>
  <div class="clear">
    <pre><code id="sg-code-fill"></code></pre>
  </div>
</div>
`
  }
};
