/* eslint-disable quotes */
module.exports = {
  className: 'visually-hidden',
  id: 'sg-nav-message',
  dangerouslySetInnerHTML: {
    __html: `
<h1>${t("Nothing here yet!")}</h1>
<ul id="sg-nav-message-test">
  <li>${t("Make sure there are patterns in source/_patterns")}</li>
  <li>${t("Run fp ui:compile")}</li>
  <li>${t("Run fp restart")}</li>
  <li>${t("Check the console for JavaScript errors")}</li>
</ul>
`
  }
};
