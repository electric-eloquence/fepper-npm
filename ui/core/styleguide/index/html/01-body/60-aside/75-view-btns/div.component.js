module.exports = {
  className: 'sg-view-btns',
  dangerouslySetInnerHTML: {
    __html: `
<svg id="sg-view-btn-dock-left" class="sg-view-btn-dock-left sg-view-btn"
  xmlns="http://www.w3.org/2000/svg"
  width="72"
  height="72"
  viewBox="0 0 72 72"
>
  <rect x="4" y="-8" width="64" height="76" rx="4" ry="4" fill="transparent" stroke-width="8" />
  <rect x="6" y="0" width="30" height="66" opacity="50%" />
  <line x1="36" y1="0" x2="36" y2="72" stroke-width="8" />
</svg>
<svg id="sg-view-btn-dock-bottom" class="sg-view-btn-dock-bottom sg-view-btn"
  xmlns="http://www.w3.org/2000/svg"
  width="72"
  height="72"
  viewBox="0 0 72 72"
>
  <rect x="4" y="-8" width="64" height="76" rx="4" ry="4" fill="transparent" stroke-width="8" />
  <rect x="0" y="32" width="72" height="8" />
  <rect x="2" y="36" width="68" height="28" opacity="50%" />
</svg>
<svg id="sg-view-btn-dock-right" class="sg-view-btn-dock-right sg-view-btn"
  xmlns="http://www.w3.org/2000/svg"
  width="72"
  height="72"
  viewBox="0 0 72 72"
>
  <rect x="4" y="-8" width="64" height="76" rx="4" ry="4" fill="transparent" stroke-width="8" />
  <line x1="36" y1="0" x2="36" y2="72" stroke-width="8" />
  <rect x="36" y="0" width="30" height="66" opacity="50%" />
</svg>
<svg id="sg-view-btn-close" class="sg-view-btn-close sg-view-btn"
  xmlns="http://www.w3.org/2000/svg"
  width="72"
  height="72"
  viewBox="0 0 72 72"
>
  <line x1="3" y1="3" x2="69" y2="69" stroke-width="8" />
  <line x1="69" y1="3" x2="3" y2="69" stroke-width="8" />
</svg>
`
  }
};
