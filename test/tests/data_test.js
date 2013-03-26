(function() {

var conductor, card;

module("Data Service", {
  setup: function() {
    conductor = new Conductor({
      testing: true
    });
  }
});

test("A card receives its data", function() {
  stop();
  card = conductor.load('/test/fixtures/data/activate_data_card.js', {
    all: {
      red: 'light',
      green: 'light',
      one: 23
    }
  });

  card.appendTo('#qunit-fixture');
});

test("The containing environment can update the data", function() {
  stop();
  
  card = conductor.load('/test/fixtures/data/data_card.js', {
    all: {
      red: 'light',
      green: 'light',
      one: 23
    }
  });

  card.appendTo('#qunit-fixture');
  card.then(async(function() {
    card.updateData('all', { marco: 'polo' });
  }));
});

test("The card can notify the parent about data updates", function() {
  expect(0);
});

})();