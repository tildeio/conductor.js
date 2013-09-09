Conductor.Oasis.RSVP.rethrow = function(exception) {
  throw exception;
};

var card = Conductor.card({
  activate: function () {
    throw "Error in activation";
  }
});

card.waitForActivation().then(function () {
  start();
  ok(false, "activation promise failed");
}, function (error) {
  start();
  equal(error, "Error in activation", "activation promise failed");
});
