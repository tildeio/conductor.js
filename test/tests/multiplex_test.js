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

test("Multiplexed services can transform request data", function() {
  // composite card, load card, alert2.js x 2
  expect(4);

  stop();
  stop();

  var conductor = new Conductor({ testing: true }),
      card = conductor.load("/test/fixtures/composite_request_transforming_card.js");

  card.appendTo(domFixture);
});

test("Multiplexed services can transform event data", function() {
  // grandchild card activation & transformed data comparison
  expect(2);

  stop();
  stop();

  var conductor = new Conductor({ testing: true }),
      card = conductor.load("/test/fixtures/composite_event_transforming_card.js");

  card.then(function () {
    card.sandbox.assertionPort.on('go', function (data) {
      equal(data, 'transformedData', "data was transformed");
    });
  });

  card.appendTo(domFixture);
});
