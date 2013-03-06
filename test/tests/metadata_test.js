(function() {

var conductor;

module("Metadata Service", {
  setup: function() {
    conductor = new Conductor({
      testing: true
    });
  },

  teardown: function() {

  }
});

test("A card can return a title", function() {
  var card = conductor.load('/test/fixtures/metadata/title_card.js');

  stop();

  card.appendTo('#qunit-fixture');
  card.then(function() {
    debugger;
    return card.metadataFor('title');
  }).then(function(title) {
    start();

    equal(title, "Rails is omakase");
  });
});

})();

