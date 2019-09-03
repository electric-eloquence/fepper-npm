module.exports = {
  id: 'patternlab-foot',
  dangerouslySetInnerHTML: {
    __html: `
<script src="node_modules/fepper-ui/scripts/index.js" type="module"></script>
{{! Allow end-users to extend and customize the UI. }}
<script src="{{ pathsPublic.js }}/ui-extender.js"></script>
`
  }
};
