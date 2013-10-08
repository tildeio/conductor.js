(function() {

var qunitFixture;

module("Child Cards", {
  setup: function() {
    qunitFixture = document.getElementById('qunit-fixture');
  }
});

test("A child card can require files through his parent", function() {
  expect(1);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/child/require_parent_card.js");

  card.appendTo(qunitFixture);
  card.render();
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
  card.render();
});

test("A card with child cards loads without new services", function() {
  expect(4);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/child/no_service_parent_card.js");
  card.appendTo(qunitFixture);
  card.render();
});

test("A card with child cards can load without defining `loadDataForChildCards`", function() {
  expect(3);
  stop();

  var conductor = new Conductor({ testing: true }),
      card;

  card = conductor.load("/test/fixtures/child/no_custom_data_parent_card.js");
  card.appendTo(qunitFixture);
  card.render();
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
  card.render();
});

test("A card with child cards loads the data and the associated card", function() {
  expect(3);
  stop();

  var conductor = new Conductor({ testing: true }),
      parentCardUrl = "/test/fixtures/child/config_data_parent_card.js",
      card;

  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
  card.render();
});

test("A card with child cards and `allowSameOrigin` sets to true loads the data and the associated card", function() {
  expect(3);
  stop();

  var conductor = new Conductor({ testing: true }),
      parentCardUrl = "/test/fixtures/child/config_data_parent_card.js",
      card;

  conductor.configure('allowSameOrigin', true);

  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
  card.render();
});

})();
