module.exports = {
  className: 'sg-view-container',
  id: 'sg-code-container',
  style: {
    bottom: 'auto'
  },
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-code-close" class="sg-view-close">
  <a href="#" id="sg-code-close-btn" class="sg-view-close-btn">&#x2715;</a>
</div>
<div id="sg-code-pattern-state" style="display: none;">
  <p>
    ${t('The state of')} <span id="sg-code-pattern-state-pattern-name" class="sg-code-pattern-name"></span>: <span id="sg-code-pattern-state-fill"></span>
  </p>
</div>
<div id="sg-code-lineage" style="display: none;">
  <p>
    <span id="sg-code-lineage-pattern-name" class="sg-code-pattern-name"></span> ${t('includes the following patterns')}: <span id="sg-code-lineage-fill"></span>
  </p>
</div>
<div id="sg-code-lineager" style="display: none;">
  <p>
    <span id="sg-code-lineager-pattern-name" class="sg-code-pattern-name"></span> ${t('is included by the following patterns')}: <span id="sg-code-lineager-fill"></span>
  </p>
</div>
<div id="sg-code-markup">
  <ul id="sg-code-tabs">
    <li id="sg-code-title-html" class="sg-code-title">HTML</li>
    <li id="sg-code-title-mustache" class="sg-code-title sg-code-title-active">Mustache</li>
  </ul>
  <div class="sg-language-markup-container">
    <pre><code id="sg-code-fill" class="language-markup"></code></pre>
  </div>
</div>
`
  }
};
