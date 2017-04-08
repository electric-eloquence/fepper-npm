module.exports = {
  className: 'sg-tools',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.tools-all }}
  <a href="#" class="sg-acc-handle sg-tools-toggle sg-icon sg-icon-cog" id="sg-tools-toggle" title="Tools"><span class="is-vishidden">Tools</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist">
    {{^ ishControlsHide.tools-shortcuts }}<li><a href="http://patternlab.io/docs/advanced-keyboard-shortcuts.html" class="sg-icon-keyboard" target="_blank">Keyboard Shortcuts</a>{{/ ishControlsHide.tools-shortcuts }}
    {{^ ishControlsHide.tools-docs }}<li><a href="http://patternlab.io/docs/" class="sg-icon-file" target="_blank">Pattern Lab Docs</a>{{/ ishControlsHide.tools-docs }}
  </ul>
{{/ ishControlsHide.tools-all }}
`
  }
};
