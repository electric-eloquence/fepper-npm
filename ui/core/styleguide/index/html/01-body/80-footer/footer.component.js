module.exports = {
  id: 'patternlab-foot',
  dangerouslySetInnerHTML: {
    __html: `
{{! Load libraries. }}
<script src="node_modules/he/he.js"></script>
<script src="node_modules/feplet/dist/feplet.browser.min.js"></script>
<script src="node_modules/jquery.cookie/jquery.cookie.js"></script>
<script src="node_modules/js-beautify/js/lib/beautify-html.js"></script>
<script src="node_modules/mousetrap/mousetrap.min.js"></script>
<script src="node_modules/prismjs/prism.js"></script>
<script src="node_modules/typeahead.js/dist/typeahead.bundle.min.js"></script>
<script src="node_modules/wolfy87-eventemitter/EventEmitter.min.js"></script>
{{! Load Fepper UI scripts. }}
<script src="node_modules/fepper-ui/scripts/annotations-viewer.js"></script>
<script src="node_modules/fepper-ui/scripts/code-viewer.js"></script>
<script src="node_modules/fepper-ui/scripts/mustache-browser.js"></script>
<script src="node_modules/fepper-ui/scripts/pattern-finder.js"></script>
<script src="node_modules/fepper-ui/scripts/patternlab-viewer.js"></script>
<script src="node_modules/fepper-ui/scripts/timestamper.js"></script>
<script src="node_modules/fepper-ui/scripts/ui.js"></script>
<script src="node_modules/fepper-ui/scripts/viewport-resizer-btns.js"></script>
{{! Allow end-users to extend and customize the UI. }}
<script src="{{ pathsPublic.js }}/ui-extender.js"></script>
`
  }
};
