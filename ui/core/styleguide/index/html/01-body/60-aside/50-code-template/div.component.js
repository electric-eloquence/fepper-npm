/* eslint-disable quotes */
module.exports = {
  className: 'sg-view-scroll-container',
  id: 'sg-code-container',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-code-pattern-info">
  <p>
    <span id="sg-code-pattern-info-pattern-name" class="sg-code-pattern-name"></span>
    <code id="sg-code-pattern-info-rel-path" title="${t("Click to copy path")}"></code> &nbsp;
    <span id="sg-code-pattern-info-state"></span>
  </p>
</div>
<div id="sg-code-lineage" style="display: none;">
  <p>
    ${t("includes")}: <span id="sg-code-lineage-fill"></span>
  </p>
</div>
<div id="sg-code-lineager" style="display: none;">
  <p>
    ${t("included by")}: <span id="sg-code-lineager-fill"></span>
  </p>
</div>
<div id="sg-code-missing-partials" style="display: none;">
  <p>
    ${t("missing")}: <span id="sg-code-missing-partials-fill"></span>
  </p>
</div>
<ul id="sg-code-tabs">
  <li id="sg-code-tab-feplet" class="sg-code-tab sg-code-tab-active" title="${t("Browse Fepper's Mustache templates")}">Feplet</li>
  <li id="sg-code-tab-markdown" class="sg-code-tab" title="${t("Edit this pattern's Markdown content")}">Markdown</li>
  <li id="sg-code-tab-git" class="sg-code-tab" title="${t("Download and upload revisions to this project")}">Git</li>
  <!--<li id="sg-code-tab-requerio" class="sg-code-tab" title="${t("Inspect this pattern's Requerio states")}">Requerio</li>-->
</ul>
<div id="sg-code-panels">
  <iframe id="sg-code-panel-feplet" class="sg-code-panel sg-code-panel-active" sandbox="allow-same-origin allow-scripts allow-top-navigation"></iframe>
  <div id="sg-code-panel-markdown" class="sg-code-panel">
    <div id="sg-code-pane-markdown-na" class="sg-code-pane" style="display: block;">
      <p>${t("There is no .md file associated with this pattern.")}</p>
      <p>${t("Please refer to <a href=\"/readme#markdown-content\" target=\"_blank\">the docs</a> for additional information.")}</p>
    </div>
    <div id="sg-code-pane-markdown" class="sg-code-pane">
      <pre id="sg-code-pre-language-markdown"><code id="sg-code-code-language-markdown" class="language-markdown"></code></pre>
      <button id="sg-code-btn-markdown-edit" class="sg-code-btn" title="${t("Edit this pattern's Markdown content")}">${t("Edit")}</button>
    </div>
    <div id="sg-code-pane-markdown-edit" class="sg-code-pane">
      <textarea id="sg-code-textarea-markdown" name="markdown_edited"></textarea>
      <button id="sg-code-btn-markdown-save" class="sg-code-btn" title="${t("Save Markdown content")}">${t("Save")}</button>
      <button id="sg-code-btn-markdown-save-cancel" class="sg-code-btn" title="${t("Cancel")}">${t("Cancel")}</button>
    </div>
    <div id="sg-code-pane-markdown-load-anim" class="sg-code-load-anim">
      <div></div><div></div><div></div><div></div>
    </div>
    <div id="sg-code-pane-markdown-commit" class="sg-code-pane">
      <label id="sg-code-label-commit-message" for="sg-code-textarea-commit-message">${t("Please enter a commit message that describes this edit:")}</label>
      <textarea id="sg-code-textarea-commit-message" name="commit_message"></textarea>
      <button id="sg-code-btn-markdown-commit" class="sg-code-btn" title="${t("Commit this revision")}">${t("Commit")}</button>
      <button id="sg-code-btn-markdown-commit-cancel" class="sg-code-btn" title="${t("Cancel")}">${t("Cancel")}</button>
    </div>
    <div id="sg-code-pane-markdown-console" class="sg-code-pane">
      <pre><code id="sg-code-console-markdown-log"></code></pre>
      <pre><code id="sg-code-console-markdown-error"></code></pre>
      <button id="sg-code-btn-markdown-continue" class="sg-code-btn" title="${t("Continue")}">${t("Continue")}</button>
      <div id="sg-code-console-markdown-load-anim" class="sg-code-load-anim">
        <div></div><div></div><div></div><div></div>
      </div>
    </div>
  </div>
  <div id="sg-code-panel-git" class="sg-code-panel">
    <div id="sg-code-pane-git-na" class="sg-code-pane">
      <p>${t("Ready to version control?")}</p>
      <p><a href="/readme#code-viewer" target="_blank">${t("Instructions on interfacing with Git.")}</a></p>
      <div id="sg-code-message-git-na"></div>
    </div>
    <div id="sg-code-pane-git" class="sg-code-pane">
      <form id="sg-code-radio-git">
        <legend id="sg-code-radio-git-legend">${t("Git Interface:")}</legend>
        <input id="sg-code-radio-git-off" class="sg-code-radio-git" name="sg-code-radio-git" type="radio" checked><label>${t("OFF")}</label>
        <input id="sg-code-radio-git-on" class="sg-code-radio-git" name="sg-code-radio-git" type="radio"><label>${t("ON")}</label>
      </form>
      <p>${t("Fepper's Markdown Editor can interface with Git.")}</p>
      <p>${t("When interfaced with Git, Fepper will automatically pull edits made by other team members each time the Markdown Editor is opened.")}</p>
      <p>${t("It will commit and push changes each time a Markdown edit is saved.")}</p>
      <p>${t("However, if a team member pushes changes to a Markdown file while it is being edited by someone else, there is a chance that a merge conflict will occur.")}</p>
      <p>${t("Strategies to avoid merge conflicts:")}</p>
      <ul>
        <li>${t("Communicate and agree that only one person edits a file at a time.")}</li>
        <li>${t("Restrict editors to their own Git branch, which must get synced regularly with the main branch.")}</li>
      </ul>
    </div>
    <button id="sg-code-btn-git-disable" class="sg-code-btn" title="${t("Disable Git Interface")}">${t("Disable Git")}</button>
  </div>
  <!--
  <div id="sg-code-panel-requerio" class="sg-code-panel">
    <div id="sg-code-pane-requerio-placeholder" class="sg-code-pane" style="display: block;">
      <code>${t("The Requerio Inspector is a work in progress. Please stay tuned as it comes to life!")}</code>
    </div>
  </div>
  -->
</div>
`
  }
};
