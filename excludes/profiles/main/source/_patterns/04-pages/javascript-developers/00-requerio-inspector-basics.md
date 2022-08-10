---
content_key: main_content
---
# For JavaScript Developers

This demo site has its client-side application state managed by Requerio. To 
inspect the application state of the homepage, click the eyeball icon on the 
right side of the top menu. Then click "CODE". Click on the "Requerio" tab in 
the open Code Viewer. You can then hover over the state tree and hightlight the 
corresponding element. (HTML elements given state are referred to as 
"organisms".) The state tree will display changes to state in real time.

You can even dispatch changes ("actions") to the organisms via your browser's 
Developer Tools:

* Use your cursor to inspect the Requerio organism you wish to dispatch actions 
  on.
* This should open the Inspector or Elements tab of the Developer Tools.
* Click the adjacent tab to open the Console of the Developer Tools.
* Enter the following example in the Console:
* `requerio.$orgs['#nav'].dispatchAction('css', {backgroundColor: 'green'})`
* The state change should be immediately visible.
* If the nav is hidden because the viewport is too narrow, either widen the 
  viewport, or click the sidebar toggle to show the nav.
* If not on this demo site, or if the `#nav` element doesn't exist, replace 
  `'#nav'` with your own selector, and the arguments with your own arguments.
* Action methods and their arguments:<br>
  <a href="https://github.com/electric-eloquence/requerio/blob/dev/docs/methods.md"
  target="_blank">https://github.com/electric-eloquence/requerio/blob/dev/docs/methods.md
  </a>

Here's a hint to help develop client-side JavaScript in Fepper: Dock the Code 
Viewer to the right or left side of the browser. It will stay open even after 
refreshing the browser.

You are not required to use or even keep Requerio to build sites in Fepper.
