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

test("the conductor will load cards", function() {
  expect(2);

  var conductor = new Conductor({ testing: true });
  var card = conductor.load("/test/fixtures/test_card.js");
  card.appendTo(qunitFixture);

  // Wait for assertion from card
  stop();

  equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");
});

test("cards can require dependencies", function() {
  expect(3);

  var conductor = new Conductor({testing: true});
  var card = conductor.load("/test/fixtures/load_card.js");
  card.appendTo(qunitFixture);

  // Wait for two assertions from cards
  stop();
  stop();

  equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");
});

test("cards can require CSS dependencies", function() {
  expect(1);

  var conductor = new Conductor({ testing: true });
  var card = conductor.load("/test/fixtures/load_css_card.js");
  card.appendTo(qunitFixture);

  stop();
});


})();
