Conductor.card({
  activate: function () {
    this.consumers.assertion.send('go', 'data');
    start();
  }
});
