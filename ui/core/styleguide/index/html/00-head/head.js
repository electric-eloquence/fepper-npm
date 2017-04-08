module.exports = {
  id: 'patternlab-head',
  dangerouslySetInnerHTML: {
    __html: `
<title id="title">Fepper</title>
<meta charset="UTF-8">
{{! never cache patterns }}
<meta http-equiv="cache-control" content="max-age=0">
<meta http-equiv="cache-control" content="no-cache">
<meta http-equiv="expires" content="0">
<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT">
<meta http-equiv="pragma" content="no-cache">
{{! handle the viewport }}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
{{! load the ui styles }}
<link rel="stylesheet" href="node_modules/fepper-ui/styles/styleguide.css" media="all">
<link rel="stylesheet" href="node_modules/fepper-ui/styles/ui.css" media="all">
<link rel="stylesheet" href="node_modules/fepper-ui/styles/prism-typeahead.css" media="all">
{{! namespace a window.FEPPER_UI object to contain globals }}
<script>window.FEPPER_UI = {};</script>
{{! load external libraries }}
<script src="node_modules/react/dist/react.min.js"></script>
<script src="node_modules/react-dom/dist/react-dom.min.js"></script>
<script src="node_modules/jquery/dist/jquery.min.js"></script>
{{! load the componentizing scripts }}
<script src="node_modules/fepper-ui/scripts/componentized-ui.js"></script>
<script id="components-for-client">
  {{{ components_for_client }}}
</script>
<script src="node_modules/fepper-ui/scripts/components-on-client.js"></script>
<script src="node_modules/fepper-ui/data/patternlab-data.js"></script>
<script src="node_modules/fepper-ui/scripts/ui-functions.js"></script>
{{! allow end-users to extend and customize the ui }}
<script src="_scripts/ui-extender.js"></script>
`
  }
};
