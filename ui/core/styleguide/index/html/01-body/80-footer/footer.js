module.exports = {
  id: 'patternlab-head',
  dangerouslySetInnerHTML: {
    __html: `
{{! load external libraries }}
<script src="node_modules/hogan.js/web/builds/3.0.2/hogan-3.0.2.min.js"></script>
<script src="node_modules/prismjs/prism.js"></script>
<script src="node_modules/jwerty/jwerty.js"></script>
<script src="node_modules/typeahead.js/dist/typeahead.bundle.min.js"></script>
<script src="node_modules/wolfy87-eventemitter/EventEmitter.min.js"></script>
<script src="node_modules/he/he.js"></script>
<script src="node_modules/js-beautify/js/lib/beautify-html.js"></script>
{{! load some pattern lab scripts }}
<script src="node_modules/fepper-ui/scripts/annotations-viewer.js"></script>
<script src="node_modules/fepper-ui/scripts/code-viewer.js"></script>
{{! set-up the dispatcher }}
<script>
  var Dispatcher = new EventEmitter();
</script>
{{! load more pattern lab scripts }}
<script src="node_modules/fepper-ui/scripts/patternlab-viewer.js"></script>
{{! load fepper scripts }}
<script src="_scripts/src/variables.styl" type="text/javascript"></script>
<script src="_scripts/src/fepper-obj.js"></script>
<script src="node_modules/fepper-ui/scripts/viewport-resizer-btns.js"></script>
`
  }
};
