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

  // Wait for card
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

test("instances can add custom services", function() {
  stop();

  var conductor = new Conductor({ testing: true }),
      CustomService = Conductor.Oasis.Service.extend({
        events: {
          result: function (result) {
            start();
            equal(result,"success", "Custom Service received message");
          }
        }
      }),
      card;

  conductor.services.custom = CustomService;
  card = conductor.load(  "/test/fixtures/custom_consumer_card.js",
                          1,
                          { capabilities: ['custom'] });

  card.appendTo(qunitFixture);
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

test("A child card can require files through his parent", function() {
  expect(1);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/child/require_parent_card.js");

  card.appendTo(qunitFixture);
});

// Better way to test if no new services were declared?
// this doesn't seem to be enough
test("A card with child cards loads the needed services", function() {
  expect(1);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/child/service_parent_card.js");

  card.appendTo(qunitFixture);
});

test("A card with child cards loads without new services", function() {
  expect(4);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/child/no_service_parent_card.js");
  card.appendTo(qunitFixture);
});

test("A card with child cards can load without defining `loadDataForChildCards`", function() {
  expect(3);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/child/no_custom_data_parent_card.js");
  card.appendTo(qunitFixture);
});

test("A card with child cards calls `loadDataForChildCards` if available before loading the child cards", function() {
  expect(3);
  stop();

  var conductor = new Conductor({ testing: true }),
      parentCardUrl = "/test/fixtures/child/custom_data_parent_card.js",
      card;

  conductor.loadData(parentCardUrl, 1, "food for cards");
  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
});

test("A card with child cards loads the data and the associated card", function() {
  expect(3);
  stop();

  var conductor = new Conductor({ testing: true }),
      parentCardUrl = "/test/fixtures/child/config_data_parent_card.js",
      card;

  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
});

test("`Conductor.require` uses relative path to the card", function() {
  expect(1);
  stop();

  var conductor = new Conductor({ testing: true }),
      card = conductor.load("/test/fixtures/require_relative_card.js");

  card.appendTo(qunitFixture);
});

})();
