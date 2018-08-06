module.exports = {
  href: '#sg-nav-container',
  className: 'sg-nav-toggle',
  dangerouslySetInnerHTML: {
    __html: 'Menu'
  },
  onClick: (ev) => {
    window.FEPPER_UI.reRenderFns.push(() => {
      ev.preventDefault();
      $('.sg-nav-container').toggleClass('active');
    });
    window.uiInst.handleEvent();
  }
};
