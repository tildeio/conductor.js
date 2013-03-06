(function() {

var conductor;

module("Render Service", {
  setup: function() {
    conductor = new Conductor({
      testing: true
    });
  }
});

test("A card can be rendered", function() {
  var card = conductor.load('/test/fixtures/render/render_card.js');

  stop();

  card.appendTo('#qunit-fixture').then(function() {
    card.render('thumbnail');
  });
});

})();
