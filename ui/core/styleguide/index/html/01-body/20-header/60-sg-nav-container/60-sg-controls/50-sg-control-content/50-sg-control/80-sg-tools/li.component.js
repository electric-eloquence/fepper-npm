module.exports = {
  className: 'sg-tools',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.tools-all }}
  <a href="#" class="sg-acc-handle sg-control-trigger sg-icon sg-icon-cog" id="sg-tools-toggle" title="Tools"><span class="is-vishidden">Tools</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist">
    {{^ ishControlsHide.tools-fpdocs }}<li><a href="/readme" class="sg-checklist-icon sg-icon-file" target="_blank">Fepper Docs</a>{{/ ishControlsHide.tools-fpdocs }}
    {{^ ishControlsHide.tools-docs }}<li><a href="https://patternlab.io/docs/" class="sg-checklist-icon sg-icon-file" target="_blank">Pattern Lab Docs</a>{{/ ishControlsHide.tools-docs }}
    {{^ ishControlsHide.tools-shortcuts }}<li><a href="/readme#keyboard-shortcuts" class="sg-checklist-icon sg-icon-keyboard" target="_blank">Keyboard Shortcuts</a>{{/ ishControlsHide.tools-shortcuts }}
  </ul>
{{/ ishControlsHide.tools-all }}
`
  }
};