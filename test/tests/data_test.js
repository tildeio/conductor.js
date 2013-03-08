(function() {

var conductor;

module("Data Service", {
  setup: function() {
    conductor = new Conductor({
      testing: true
    });
  }
});

test("A card receives its data", function() {
  var card = conductor.load('/test/fixtures/data/data_card.js', {
    red: 'light',
    green: 'light',
    one: 23
  });

  stop();
  stop();
  stop();

  card.appendTo('#qunit-fixture');
});

test("The containing environment can update the data", function() {
  var card = conductor.load('/test/fixtures/data/data_card.js', {
    red: 'light',
    green: 'light',
    one: 23
  });

  stop();
  stop();
  stop();
  stop();

  card.appendTo('#qunit-fixture');
  card.then(function() {
    card.updateData({ marco: 'polo' });
  });
});

test("The card can notify the parent about data updates", function() {
  expect(0);
});

})();

