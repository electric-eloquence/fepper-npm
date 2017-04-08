module.exports = {
  className: 'sg-view',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.views-all }}
  <a href="#" class="sg-acc-handle sg-control-trigger sg-icon sg-icon-eye" id="sg-t-toggle" title="View"><span class="is-vishidden">View</span></a>
  <ul class="sg-view sg-acc-panel sg-right sg-checklist" id="sg-view">
    {{^ ishControlsHide.views-annotations }}<li><a href="#" class="sg-checkbox" id="sg-t-annotations">Annotations</a></li>{{/ ishControlsHide.views-annotations }}
    {{^ ishControlsHide.views-code }}<li><a href="#" class="sg-checkbox" id="sg-t-code">Code</a></li>{{/ ishControlsHide.views-code }}
    {{^ ishControlsHide.views-new }}<li><a href="#" target="_blank" id="sg-raw" class="sg-icon-link">Open in new window</a></li>{{/ ishControlsHide.views-new }}
  </ul>
{{/ ishControlsHide.views-all }}
`
  },
  onLoad: (() => {
    'use strict';
    if (typeof window === 'object') {

      // "View (containing clean, code, raw, etc options) Trigger
      $('#sg-t-toggle').on('click', function (e) {
        e.preventDefault();
        $(this).parents('ul').toggleClass('active');
      });
    }
  })()
};
