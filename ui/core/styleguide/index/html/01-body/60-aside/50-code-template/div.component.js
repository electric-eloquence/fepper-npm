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
  <li id="sg-code-tab-requerio" class="sg-code-tab" title="${t("Inspect this pattern's Requerio states")}">Requerio</li>
</ul>
<div id="sg-code-panels">
  <iframe id="sg-code-panel-feplet" class="sg-code-panel sg-code-panel-active" sandbox="allow-same-origin allow-scripts allow-top-navigation"></iframe>
  <div id="sg-code-panel-markdown" class="sg-code-panel">
` /* Using inline css on the following line so js can use logic which unsets the rule instead of resetting it. */ +
`    <div id="sg-code-pane-markdown-na" class="sg-code-pane sg-code-pane-na" style="display: block;">
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
      <label id="sg-code-label-commit-message" for="sg-code-textarea-commit-message">${t("Please enter a Git commit message that describes this edit:")}</label>
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
    <div id="sg-code-pane-git-na" class="sg-code-pane sg-code-pane-na">
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
  <div id="sg-code-panel-requerio" class="sg-code-panel">
    <div id="sg-code-pane-requerio-na" class="sg-code-pane sg-code-pane-na">
      <p>${t("Use the Requerio Inspector to display the real-time JavaScript state of elements in your site!")}</p>
      <p id="sg-code-requerio-demo-link-container" style="display: none;">
        <a id="sg-code-requerio-demo-link">${t("<a href='/?p=pages-requerio-inspector-basics'>Click here to view the demo.</a>")}</a>
      </p>
      <p id="sg-code-main-distro-link-container" style="display: none;">${t("The demo site packaged with <a href='https://github.com/electric-eloquence/fepper/releases' target='_blank'>Fepper's main distro</a> serves as documentation for setup and use.")}</p>
      <p>${t("You can also view documentation on <a href='https://fepper.io/docpage--requerio-inspector.html' target='_blank'>Fepper's website</a>.")}</p>
    </div>
    <div id="sg-code-pane-requerio" class="sg-code-pane">
      <ul id="sg-code-tree-requerio-help" class="sg-code-tree-requerio">
        <li class="sg-code-tree-requerio sg-code-tree-requerio-branch">
          <span class="clickable">${t("How to dispatch actions in your browser's Developer Tools:")}</span>
          <ul class="sg-code-tree-requerio sg-code-tree-requerio-branch">
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("Use your cursor to inspect the Requerio organism you wish to dispatch actions on.")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("This should open the Inspector or Elements tab of the Developer Tools.")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("Click the adjacent tab to open the Console of the Developer Tools.")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("Enter the following example in the Console:")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("requerio.$orgs['#nav'].dispatchAction('css', {backgroundColor: 'green'})")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("The state change should be immediately visible.")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("If the nav is hidden because the viewport is too narrow, either widen the viewport, or click the sidebar toggle to show the nav.")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
>${t("If not on the default demo site, or if the #nav element doesn't exist, replace '#nav' with your own selector, and the arguments with your own arguments.")}</li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
><a href="https://github.com/electric-eloquence/requerio#readme" target="_blank">${t("Main Requerio docs.")}</a></li>
            <li class="sg-code-tree-requerio sg-code-tree-requerio-node sg-code-tree-requerio-leaf"
><a href="https://github.com/electric-eloquence/requerio/blob/dev/docs/methods.md" target="_blank">${t("Action methods and their arguments.")}</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</div>
`
  }
};
