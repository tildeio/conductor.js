Conductor.require('/test/lib/sinon.js');
Conductor.require('stub_errors.js');

var card = Conductor.card({
  activate: function () {
    throw "Error in activation";
  }
});

card.promise.then(function () {
  start();
  ok(false, "activation promise failed");
}, function (error) {
  start();
  equal(error, "Error in activation", "activation promise failed");
});
