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
  var card = conductor.load('/test/fixtures/metadata/multi_metadata_card.js');

  stop();

  card.appendTo('#qunit-fixture');
  card.then(function() {
    return card.metadataFor('document');
  }).then(function(documentMetadata) {
    start();

    equal(documentMetadata.title, "Rails is omakase");
  });

  stop();

  card.then(function() {
    return card.metadataFor('*');
  }).then(function(metadata) {
    start();

    equal(metadata['document:title'], "Rails is omakase");
    equal(metadata['image:width'], 100);
    equal(metadata['image:height'], 100);
  });
});

})();

