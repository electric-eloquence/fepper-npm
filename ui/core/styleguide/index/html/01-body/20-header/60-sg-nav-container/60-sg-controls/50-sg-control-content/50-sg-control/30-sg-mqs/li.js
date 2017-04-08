module.exports = {
  className: 'sg-mqs',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.mqs }}
  <a href="#" class="mode-link sg-acc-handle" id="sg-size-mq" title="Media queries in stylesheet">MQ</a>
  <ul class="sg-acc-panel sg-left" id="sg-mq">
    {{^ mqs }}
      <li><a href="#">{{ . }}</a></li>
    {{/ mqs }}
  </ul>
{{/ ishControlsHide.mqs }}
`
  },
  onLoad: (() => {
    'use strict';
    if (typeof window === 'object') {

      // handle the MQ click
      const mqs = [];
      $('#sg-mq a').each(function (i) {

        mqs.push($(this).html());

        // bind the click
        $(this).on('click', function (i, k) {
          return function (e) {
            e.preventDefault();
            var val = $(k).html();
            var type = (val.indexOf('px') !== -1) ? 'px' : 'em';
            val = val.replace(type, '');
            var width = (type === 'px') ? val * 1 : val * $bodySize;
            sizeiframe(width, true);
          };
        }(i, this));

        // bind the keyboard shortcut. can't use cmd on a mac because 3 & 4 are for screenshots
        jwerty.key('ctrl+shift+' + (i + 1), function (k) {
          return function (e) {
            var val = $(k).html();
            var type = (val.indexOf('px') !== -1) ? 'px' : 'em';
            val = val.replace(type, '');
            var width = (type === 'px') ? val * 1 : val * $bodySize;
            sizeiframe(width, true);
            return false;
          };
        }(this));

      });
    }
  })()
};
