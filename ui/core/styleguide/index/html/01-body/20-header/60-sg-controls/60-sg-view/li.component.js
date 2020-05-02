module.exports = {
  className: 'sg-view',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.views-all }}
  <a href="#" class="sg-acc-handle sg-control-trigger sg-icon sg-icon-eye" id="sg-t-toggle" title="${t('View')}"><span class="is-vishidden">${t('View')}</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist" id="sg-view">
    {{^ ishControlsHide.views-annotations }}<li><a href="#" class="sg-checklist-icon sg-icon sg-icon-radio" id="sg-t-annotations">${t('Annotations')}</a></li>{{/ ishControlsHide.views-annotations }}
    {{^ ishControlsHide.views-code }}<li><a href="#" class="sg-checklist-icon sg-icon sg-icon-radio" id="sg-t-code">${t('Code')}</a></li>{{/ ishControlsHide.views-code }}
    {{^ ishControlsHide.views-new }}<li><a href="#" target="_blank" id="sg-raw" class="sg-checklist-icon sg-icon sg-icon-link">${t('Open in new window')}</a></li>{{/ ishControlsHide.views-new }}
  </ul>
{{/ ishControlsHide.views-all }}
`
  }
};
