/* eslint-disable quotes */
module.exports = {
  className: 'sg-find',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.find }}
  <a href="#" class="sg-control-trigger sg-icon sg-icon-search" id="sg-f-toggle" title="${t("Pattern Search")}"><span class="visually-hidden">${t("Pattern Search")}</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist" id="sg-find" style="top: 32px;">
    <li><input class="typeahead" id="typeahead" type="text" placeholder="${t("Pattern Search")}"></li>
  </ul>
{{/ ishControlsHide.find }}
`
  }
};
