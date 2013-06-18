(function() {

var qunitFixture;

module('Promise Functionality', {
  setup: function() {
    qunitFixture = document.getElementById('qunit-fixture');
  }
});

test("card references have a promise resolved when the sandbox is ready", function() {
  expect(2);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/empty_card.js");

  equal(undefined, card.sandbox.dataPort, "sandbox is not initially initialised");

  card.promise.then(function () {
    start();
    notEqual(undefined, card.sandbox.dataPort, "sandbox is initialised when promise is resolved");
  });
  card.appendTo(qunitFixture);
});

test("cards have a promise resolved when the card is activated", function() {
  expect(2);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/promise_card.js");
  card.appendTo(qunitFixture);
});

test("errors in `activate` cause the card's promise to fail", function() {
  var conductor = new Conductor({ testing: true }),
      card;

  stop();

  card = conductor.load("/test/fixtures/activation_error_card.js");
  card.appendTo(qunitFixture);
});

})();
