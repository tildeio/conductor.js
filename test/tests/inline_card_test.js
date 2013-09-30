(function(){

var conductor, card, qunitFixture;

// This is an advanced feature.  Please be EXTREMELY careful before using inline
// cards.
module('Inline Conductor Cards', {
  setup: function() {
    conductor = newConductor();
    qunitFixture = document.getElementById('qunit-fixture');
    $(qunitFixture).html();
  }
});

test("inline adapter does not support `height` capability", function() {
  deepEqual(Conductor.adapters.inline.unsupportedCapabilities(), ['height'], "inline adapter does not support `height` capability");
});

test("Conductor cards can be loaded with the inline adapter", function() {
  // one assertion will come from the card's activation
  expect(3);
  stop();
  card = conductor.load("/test/fixtures/test_card.js", 1, { adapter: Conductor.adapters.inline });

  card.appendTo(qunitFixture);
  card.render();

  equal($(qunitFixture).find('iframe:first').length, 0, "the iframe adapter was not used");
  equal($(qunitFixture).find('div:first').length, 1, "the inline adapter was used");
});

test("Cards loaded with the inline adapter can still `conductor.require` resources", function() {
  // card require, card activation
  expect(2);
  stop();

  card = conductor.load('/test/fixtures/load_card.js', 1, { adapter: Conductor.adapters.inline });
  card.appendTo(qunitFixture);
});

test("Cards loaded with the inline adapter can still `conductor.require` cross-domain resources", function() {
  // card require, card activation
  expect(2);
  stop();

  /*global crossOrigin */
  card = conductor.load(crossOrigin + '/test/fixtures/load_card.js', 1, { adapter: Conductor.adapters.inline });
  card.appendTo(qunitFixture);
});

})();
