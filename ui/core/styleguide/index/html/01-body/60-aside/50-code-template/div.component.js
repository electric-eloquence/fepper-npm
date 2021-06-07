module.exports = {
  className: 'sg-view-scroll-container',
  id: 'sg-code-container',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-code-pattern-info">
  <p>
    <span id="sg-code-pattern-info-pattern-name" class="sg-code-pattern-name"></span>
    <code id="sg-code-pattern-info-rel-path" title="${t('Click to copy path')}"></code> &nbsp;
    <span id="sg-code-pattern-info-state"></span>
  </p>
</div>
<div id="sg-code-lineage" style="display: none;">
  <p>
    ${t('includes')}: <span id="sg-code-lineage-fill"></span>
  </p>
</div>
<div id="sg-code-lineager" style="display: none;">
  <p>
    ${t('included by')}: <span id="sg-code-lineager-fill"></span>
  </p>
</div>
<div id="sg-code-missing-partials" style="display: none;">
  <p>
    ${t('missing')}: <span id="sg-code-missing-partials-fill"></span>
  </p>
</div>
<ul id="sg-code-tabs">
  <li id="sg-code-tab-feplet" class="sg-code-tab sg-code-tab-active" title="${t('Browse Fepper\'s Mustache templates')}">Feplet</li>
  <li id="sg-code-tab-markdown" class="sg-code-tab" title="${t('Edit this pattern\'s Markdown content')}">Markdown</li>
  <li id="sg-code-tab-git" class="sg-code-tab" title="${t('Download and upload revisions to this project')}">Git</li>
  <li id="sg-code-tab-requerio" class="sg-code-tab" title="${t('Time-travel through Fepper\'s application states')}">Requerio</li>
</ul>
<div id="sg-code-panels">
  <iframe id="sg-code-panel-feplet" class="sg-code-panel sg-code-panel-active" sandbox="allow-same-origin allow-scripts allow-top-navigation"></iframe>
  <div id="sg-code-panel-markdown" class="sg-code-panel">
    <div id="sg-code-pane-no-markdown" class="sg-code-outcome">
      <p>${t('There is no .md file associated with this pattern.')}</p>
      <p>${t('Please refer to <a href="/readme#markdown-content" target="_blank">the docs</a> for additional information.')}</p>
    </div>
    <div id="sg-code-pane-markdown" class="sg-code-outcome">
      <pre id="sg-code-pre-language-markdown"><code id="sg-code-code-language-markdown" class="language-markdown"></code></pre>
      <button id="sg-code-btn-markdown-edit" class="sg-code-btn" title="${t('Edit this pattern\'s Markdown content')}">${t('Edit')}</button>
    </div>
    <div id="sg-code-pane-markdown-edit" class="sg-code-outcome">
      <textarea id="sg-code-textarea-markdown" class="language-markdown" name="markdown_edited"></textarea>
      <button id="sg-code-btn-markdown-save" class="sg-code-btn" title="${t('Save Markdown content')}">${t('Save')}</button>
    </div>
  </div>
  <div id="sg-code-panel-git" class="sg-code-panel"></div>
  <div id="sg-code-panel-requerio" class="sg-code-panel"></div>
</div>
`
  }
};
