QUnit.config.testTimeout = 500;

(function() {

var qunitFixture;

module("Conductor", {
  setup: function() {
    qunitFixture = document.getElementById('qunit-fixture');
  }
});

test("it works", function() {
  ok(Conductor);
});

asyncTest("the conductor will load cards", function() {
  expect(2);

  var conductor = new Conductor({testing: true});
  var card = conductor.load("/test/fixtures/test_card.js");
  card.appendTo(qunitFixture);

  card.sandbox.connect('assertion').then(function(port) {
    port.on('greatSuccess', function() {
      start();
      ok(true, "The card was loaded and sent an event");
    });
  });

  equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");
});

test("cards can require dependencies", function() {
  expect(3);

  var conductor = new Conductor({testing: true});
  var card = conductor.load("/test/fixtures/load_card.js");
  card.appendTo(qunitFixture);

  card.sandbox.connect('assertion').then(function(port) {
    port.on('assetRequired', function() {
      start();
      ok(true, "The card's asset was required");
    });

    port.on('cardActivated', function() {
      start();
      ok(true, "The card was activated after requiring dependencies");
    });
  });

  stop();
  stop();

  equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");
});


})();
