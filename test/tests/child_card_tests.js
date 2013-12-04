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

  var conductor = newConductor(),
      card;

  card = conductor.load(crossOrigin + "/test/fixtures/child/require_parent_card.html");

  card.appendTo(qunitFixture);
  card.render();
});

// Better way to test if no new services were declared?
// this doesn't seem to be enough
test("A card with child cards loads the needed services", function() {
  expect(1);
  stop();

  var conductor = newConductor(),
      card;

  card = conductor.load(crossOrigin + "/test/fixtures/child/service_parent_card.html");

  card.appendTo(qunitFixture);
  card.render();
});

test("A card with child cards loads without new services", function() {
  expect(4);
  stop();

  var conductor = newConductor(),
      card;

  card = conductor.load(crossOrigin + "/test/fixtures/child/no_service_parent_card.html");
  card.appendTo(qunitFixture);
  card.render();
});

test("A card with child cards can load without defining `loadDataForChildCards`", function() {
  expect(3);
  stop();

  var conductor = newConductor(),
      card;

  card = conductor.load(crossOrigin + "/test/fixtures/child/no_custom_data_parent_card.html");
  card.appendTo(qunitFixture);
  card.render();
});

test("A card with child cards calls `loadDataForChildCards` if available before loading the child cards", function() {
  expect(3);
  stop();

  var conductor = newConductor(),
      parentCardUrl = crossOrigin + "/test/fixtures/child/custom_data_parent_card.html",
      card;

  conductor.loadData(parentCardUrl, 1, "food for cards");
  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
  card.render();
});

test("A card with child cards loads the data and the associated card", function() {
  expect(3);
  stop();

  var conductor = newConductor(),
      parentCardUrl = crossOrigin + "/test/fixtures/child/config_data_parent_card.html",
      card;

  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
  card.render();
});

test("A card with child cards and `allowSameOrigin` sets to true loads the data and the associated card", function() {
  expect(3);
  stop(1);

  var conductor = newConductor(),
      parentCardUrl = crossOrigin + "/test/fixtures/child/config_conductor_parent_card.html",
      card;

  conductor.configure('allowSameOrigin', true);

  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
  card.render();
});

test("A child card can load and communicate with an iframe on the same origin", function() {
  expect(2);
  stop(1);

  var conductor = newConductor(),
      parentCardUrl = crossOrigin + "/test/fixtures/child/simple_iframe_parent_card.html",
      card;

  conductor.configure('allowSameOrigin', true);

  card = conductor.load(parentCardUrl, 1);
  card.appendTo(qunitFixture);
  card.render();
});

})();
