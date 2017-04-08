module.exports = {
  className: 'sg-nav is-vishidden',
  id: 'pl-pattern-nav-target',
  dangerouslySetInnerHTML: {
    __html: `
{{# patternTypes }}
  <li><a class="sg-acc-handle">{{ patternTypeUC }}</a><ol class="sg-acc-panel">
  {{# patternTypeItems }}
    <li><a class="sg-acc-handle">{{ patternSubtypeUC }}</a><ol class="sg-acc-panel sg-sub-nav">
    {{# patternSubtypeItems }}
      <li>
        <a
          href="patterns/{{ patternPath }}"
          class="sg-pop  {{# patternState }}sg-pattern-state {{ patternState }}{{/ patternState }}"
          data-patternpartial="{{ patternPartial }}"
        >{{ patternName }}</a>
      </li>
    {{/ patternSubtypeItems }}
    </ol></li>
  {{/ patternTypeItems }}
  {{# patternItems }}
    <li>
      <a
        href="patterns/{{ patternPath }}"
        class="sg-pop {{# patternState }}sg-pattern-state {{ patternState }}{{/ patternState }}"
        data-patternpartial="{{ patternPartial }}"
      >{{ patternName }}</a>
    </li>
  {{/ patternItems }}
  </ol></li>
{{/ patternTypes }}
<li><a href="node_modules/fepper-ui/markup/styleguide.html" class="sg-pop" data-patternpartial="all">All</a></li>
`
  }
};
