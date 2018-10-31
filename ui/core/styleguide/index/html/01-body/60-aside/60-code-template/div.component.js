module.exports = {
  className: 'sg-view-container',
  id: 'sg-code-container',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-code-close" class="sg-view-close">
  <a href="#" id="sg-code-close-btn" class="sg-view-close-btn">&#x2715;</a>
</div>
<div id="sg-code-pattern-state" style="display: none;">
  <p>
    The state of the <span id="sg-code-pattern-state-pattern-name" class="sg-code-pattern-name"></span> pattern is: <span id="sg-code-pattern-state-fill"></span>
  </p>
</div>
<div id="sg-code-lineage" style="display: none;">
  <p>
    The <span id="sg-code-lineage-pattern-name" class="sg-code-pattern-name"></span> pattern includes the following patterns: <span id="sg-code-lineage-fill"></span>
  </p>
</div>
<div id="sg-code-lineager" style="display: none;">
  <p>
    The <span id="sg-code-lineager-pattern-name" class="sg-code-pattern-name"></span> pattern is included by the following patterns: <span id="sg-code-lineager-fill"></span>
  </p>
</div>
<div id="sg-code-markup">
  <ul id="sg-code-tabs">
    <li id="sg-code-title-html" class="sg-code-title">HTML</li>
    <li id="sg-code-title-mustache" class="sg-code-title sg-code-title-active">Mustache</li>
  </ul>
  <div class="sg-language-markup-container">
    <pre><code id="sg-code-fill"></code></pre>
  </div>
</div>
`
  }
};
