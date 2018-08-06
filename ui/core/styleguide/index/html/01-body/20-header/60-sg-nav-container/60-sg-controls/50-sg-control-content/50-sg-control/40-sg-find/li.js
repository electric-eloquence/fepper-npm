module.exports = {
  className: 'sg-find',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.find }}
  <a href="#" class="sg-acc-handle sg-control-trigger sg-icon sg-icon-search" id="sg-f-toggle" title="Search Patterns"><span class="is-vishidden">Search Patterns</span></a>
  <ul class="sg-view sg-acc-panel sg-right sg-checklist" id="sg-find" style="top: 32px;">
      <li><input class="typeahead" id="typeahead" type="text" placeholder="search for a pattern..."></li>
  </ul>
{{/ ishControlsHide.find }}
`
  }
};
