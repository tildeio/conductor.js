(function() {

var conductor, card;

module("Metadata Service", {
  setup: function() {
    conductor = new Conductor({
      testing: true
    });

    card = conductor.load('/test/fixtures/metadata/multi_metadata_card.js');
    card.appendTo('#qunit-fixture');
  },

  teardown: function() {

  }
});

test("A card can return metadata for some type", function() {
  stop();

  card.waitForLoad().then(async(function() {
    return card.metadataFor('document');
  })).then(async(function(documentMetadata) {
    equal(documentMetadata.title, "Rails is omakase");
    start();
  }));
});

test("A card carn return all of its metadata at once", function() {
  stop();

  card.waitForLoad().then(async(function() {
    return card.metadataFor('*');
  })).then(async(function(metadata) {
    equal(metadata['document:title'], "Rails is omakase");
    equal(metadata['image:width'], 100);
    equal(metadata['image:height'], 100);
    start();
  }));
});

})();

