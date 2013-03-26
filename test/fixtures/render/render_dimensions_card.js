Conductor.card({
  render: function(intent, dimensions) {
    ok(intent === 'thumbnail', "The card was rendered with the thumbnail intent");
    ok(dimensions.width === 100, "The width is 100");
    ok(dimensions.height === 100, "The height is 100");
    start();
  }
});

