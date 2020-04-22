module.exports = {
  className: 'sg-find',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.find }}
  <a href="#" class="sg-control-trigger sg-icon sg-icon-search" id="sg-f-toggle" title="${t('Search Patterns')}"><span class="is-vishidden">${t('Search Patterns')}</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist" id="sg-find" style="top: 32px;">
    <li><input class="typeahead" id="typeahead" type="text" placeholder="${t('Search Patterns')}"></li>
  </ul>
{{/ ishControlsHide.find }}
`
  }
};
