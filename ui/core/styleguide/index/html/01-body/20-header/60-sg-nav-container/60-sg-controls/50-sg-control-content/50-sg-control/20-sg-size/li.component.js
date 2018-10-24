module.exports = {
  className: 'sg-size',
  dangerouslySetInnerHTML: {
    __html: `
<div class="sg-current-size">
  <form id="sg-form">
    <a class="sg-acc-handle sg-size-label" id="sg-form-label">Size</a
    ><input type="text" class="sg-input" id="sg-size-px" value="---"
    ><div class="sg-size-label">px /</div
    ><input type="text" class="sg-input" id="sg-size-em" value="---"
    ><div class="sg-size-label">em</div>
  </form>
</div>
<ul class="sg-acc-panel sg-size-options">
  {{^ ishControlsHide.whole }}<li><a href="#" id="sg-size-w">W</a></li>{{/ ishControlsHide.whole }}
  {{^ ishControlsHide.grow }}<li><a href="#" class="mode-link" id="sg-size-grow">Grow</a></li>{{/ ishControlsHide.grow }}
  {{^ ishControlsHide.random }}<li><a href="#" id="sg-size-random">Random</a></li>{{/ ishControlsHide.random }}
  {{^ ishControlsHide.disco }}<li><a href="#" class="mode-link" id="sg-size-disco">Disco</a></li>{{/ ishControlsHide.disco }}
</ul>
`
  }
};
