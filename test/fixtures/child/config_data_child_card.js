var card = Conductor.card({
  activate: function(data) {
    ok(true, "child card activated");
    equal( data, 'food for card', "A child card is initialized with data");
    start();
  }
});
