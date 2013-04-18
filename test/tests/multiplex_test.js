var domFixture;

module('MultiplexService', {
  setup: function() {
    domFixture = document.getElementById('qunit-fixture');
  }
});

test("Multiple grandchild cards can share a child's xhr service", function() {
  // each card has two assertions: one for activation and one for loading
  // alert.js
  //
  // we have three cards: composite, and load_card (loaded twice).
  expect(6);

  // We seem to only be able to up the semaphore at the top level; we need an up
  // for each of the three cards.
  stop();
  stop();
  stop();

  var conductor = new Conductor({ testing: true }),
      card = conductor.load("/test/fixtures/composite_card.js");

  card.appendTo(domFixture);
});
