var card = Conductor.card({
  activate: function () {
    equal(false, !!card.activated, "card is not initially activated");
    this.activated = true;
  }
});

card.promise.then(function () {
  start();
  equal(true, card.activated, "card is activated when its promise is resolved");
});
