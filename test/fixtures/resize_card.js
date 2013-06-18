Conductor.card({
  activate: function () {
    this.consumers.height.autoUpdate = false;
    this.consumers.height.send('resize', { width: 55, height: 55 });
  }
});
