/* eslint-disable quotes */
module.exports = {
  className: 'sg-tools',
  dangerouslySetInnerHTML: {
    __html: `
{{^ ishControlsHide.tools-all }}
  <a href="#" class="sg-acc-handle sg-control-trigger sg-icon sg-icon-cog" id="sg-tools-toggle" title="${t("Tools")}"><span class="visually-hidden">${t("Tools")}</span></a>
  <ul class="sg-acc-panel sg-right sg-checklist" id="sg-tools">
    {{^ ishControlsHide.tools-docs }}<li><a href="https://fepper.io/docpage" class="sg-tool sg-checklist-icon sg-icon sg-icon-file" target="_blank">${t("Fepper docs")}</a></li>{{/ ishControlsHide.tools-docs }}
    {{^ ishControlsHide.tools-shortcuts }}<li><a href="/readme#keyboard-shortcuts" class="sg-tool sg-checklist-icon sg-icon sg-icon-keyboard" target="_blank">${t("Keyboard shortcuts")}</a></li>{{/ ishControlsHide.tools-shortcuts }}
  </ul>
{{/ ishControlsHide.tools-all }}
`
  }
};
