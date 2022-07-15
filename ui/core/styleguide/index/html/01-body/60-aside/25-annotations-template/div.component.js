/* eslint-disable quotes */
module.exports = {
  className: 'sg-view-scroll-container',
  id: 'sg-annotations-container',
  dangerouslySetInnerHTML: {
    __html: `
<div id="sg-annotations-na">
  <div class="sg-annotation-na">
    <h2>${t("No Annotations")}</h2>
    <div><p>${t("There are no annotations for this pattern.")}</p></div>
  </div>
</div>
<div id="sg-annotations"></div>
`
  }
};
