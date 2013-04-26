var card = Conductor.card({
  activate: function(data) {
    ok(true, "child card activated");
    start();
  }
});
