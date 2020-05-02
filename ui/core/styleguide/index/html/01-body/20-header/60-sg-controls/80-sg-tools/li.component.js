module.exports = {
  className: 'sg-tools',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.tools-all }}
  <a href="#" class="sg-acc-handle sg-control-trigger sg-icon sg-icon-cog" id="sg-tools-toggle" title="${t('Tools')}"><span class="is-vishidden">${t('Tools')}</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist" id="sg-tools">
    {{^ ishControlsHide.tools-fpdocs }}<li><a href="/readme" class="sg-tool sg-checklist-icon sg-icon sg-icon-file" target="_blank">${t('Fepper Docs')}</a>{{/ ishControlsHide.tools-fpdocs }}
    {{^ ishControlsHide.tools-docs }}<li><a href="https://patternlab.io/docs/" class="sg-tool sg-checklist-icon sg-icon sg-icon-file" target="_blank">${t('Pattern Lab Docs')}</a>{{/ ishControlsHide.tools-docs }}
    {{^ ishControlsHide.tools-shortcuts }}<li><a href="/readme#keyboard-shortcuts" class="sg-tool sg-checklist-icon sg-icon sg-icon-keyboard" target="_blank">${t('Keyboard Shortcuts')}</a>{{/ ishControlsHide.tools-shortcuts }}
  </ul>
{{/ ishControlsHide.tools-all }}
`
  }
};
