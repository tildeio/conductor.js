Conductor.card({
  render: function(intent) {
    ok(intent === 'thumbnail', "The card was rendered with the thumbnail intent");
  }
});
