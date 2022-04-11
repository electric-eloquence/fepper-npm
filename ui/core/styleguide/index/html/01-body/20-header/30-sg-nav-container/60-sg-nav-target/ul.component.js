/* eslint-disable quotes */
module.exports = {
  className: 'sg-nav visually-hidden',
  id: 'sg-nav-target',
  dangerouslySetInnerHTML: {
    __html: `
{{# patternTypes }}
  <li class="sg-nav-{{ patternTypeLC }}"><a class="sg-acc-handle">{{ patternTypeUC }}</a><ul class="sg-acc-panel sg-sub-nav">
  {{# patternSubTypes }}
    <li class="sg-sub-nav-{{ patternSubTypeLC }}"><a class="sg-acc-handle">{{ patternSubTypeUC }}</a><ul class="sg-acc-panel sg-item-nav">
    {{# patternSubTypeItems }}
      <li class="sg-item-nav-{{ patternPartial }}">
        <a
          href="{{ pathsPublic.patterns }}/{{ patternLink }}"
          class="sg-pop {{# patternState }}sg-pattern-state {{ patternState }}{{/ patternState }}"
          data-patternpartial="{{ patternPartial }}"
        >{{ patternName }}</a>
      </li>
    {{/ patternSubTypeItems }}
    </ul></li>
  {{/ patternSubTypes }}
  {{# patternTypeItems }}
    <li class="sg-item-nav-{{ patternPartial }}">
      <a
        href="{{ pathsPublic.patterns }}/{{ patternLink }}"
        class="sg-pop {{# patternState }}sg-pattern-state {{ patternState }}{{/ patternState }}"
        data-patternpartial="{{ patternPartial }}"
      >{{ patternName }}</a>
    </li>
  {{/ patternTypeItems }}
  </ul></li>
{{/ patternTypes }}
<li><a href="{{ pathsPublic.patterns }}/viewall/viewall.html" class="sg-pop" data-patternpartial="viewall">${t("All")}</a></li>
`
  }
};
