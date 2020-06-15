module.exports = {
  className: 'sg-find',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.find }}
  <a href="#" class="sg-control-trigger sg-icon sg-icon-search" id="sg-f-toggle" title="${t('Search patterns')}"><span class="visually-hidden">${t('Search patterns')}</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist" id="sg-find" style="top: 32px;">
    <li><input class="typeahead" id="typeahead" type="text" placeholder="${t('Search patterns')}"></li>
  </ul>
{{/ ishControlsHide.find }}
`
  }
};
