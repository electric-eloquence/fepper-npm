module.exports = {
  className: 'is-vishidden',
  id: 'sg-nav-message',
  dangerouslySetInnerHTML: {
    __html: `
<h1>Nothing here yet!</h1>
<ul>
  <li>Make sure there are patterns in source/_patterns</li>
  <li>Run fp ui:compile</li>
  <li>Run fp restart</li>
  <li>Check the console for JavaScript errors</li>
</ul>
`
  }
};
