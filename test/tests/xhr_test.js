(function() {

var conductor, card;

module("XHR Service", {
  setup: function() {
    conductor = new Conductor({
      testing: true
    });
  }
});

test("The card can declare a custom xhr consumer that triggers the activation of the card", function() {
  stop();
  expect(5);

  var url = '/test/fixtures/custom_xhr_consumer_card.js';

  card = conductor.load( url, 1 );

  card.appendTo('#qunit-fixture');
});

})();
