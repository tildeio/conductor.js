(function() {

var conductor, card, card2;

module("Data Service", {
  setup: function() {
    conductor = newConductor();
  }
});

test("A card receives its data", function() {
  stop();

  conductor.loadData('/test/fixtures/data/activate_data_card.js', 1, {
    all: {
      red: 'light',
      green: 'light',
      one: 23
    }
  });

  card = conductor.load('/test/fixtures/data/activate_data_card.js', 1);

  card.appendTo('#qunit-fixture');
});

test("The containing environment can update the data", function() {
  stop();

  var url = '/test/fixtures/data/data_card.js';

  conductor.loadData(url, 1, {
    all: {
      red: 'light',
      green: 'light',
      one: 23
    }
  });

  card = conductor.load(url, 1);

  card.appendTo('#qunit-fixture');
  card.waitForLoad().then(async(function() {
    conductor.loadData(url, 1, { all: { marco: 'polo' } });
  }));
});

test("The card can notify the parent about data updates", function() {
  stop();

  var url = '/test/fixtures/data/data_changing_card.js';

  conductor.loadData(url, 1, {
    all: {
      red: 'light',
      green: 'light',
      one: 23
    }
  });

  card = conductor.load(url, 1);
  card2 = conductor.load(url, 1);

  card.appendTo('#qunit-fixture');
  card2.appendTo('#qunit-fixture');

  card.waitForLoad().then(async(function() {
    card.instruct('updateYoself');
  }));

  // card 1 will update its data, and card 2 will verify that its data is updated
  // and call start()
});

test("The card can declare a custom data consumer that triggers the activation of the card", function() {
  stop();
  expect(1);

  var url = '/test/fixtures/data/custom_consumer_card.js';

  card = conductor.load( url, 1 );

  card.appendTo('#qunit-fixture');
});

})();
