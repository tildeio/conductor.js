var conductor, card, qunitFixture;

QUnit.config.testTimeout = QUnit.config.testTimeout > 10000 ? QUnit.config.testTimeout : 10000;

module('Height Service', {
  setup: function() {
    conductor = new Conductor({ testing: true });
    qunitFixture = document.getElementById('qunit-fixture');
  }
});

test("on a resize event, HeightService resizes the sandbox", function() {
  stop();

  card = conductor.load('/test/fixtures/resize_card.js');
  card.promise.then(function () {
    card.sandbox.heightPort.on('resize', function () {
      equal($(card.sandbox.el).width(), 55, "HeightService updated width");
      equal($(card.sandbox.el).height(), 55, "HeightService updated height");
      start();
    });
  });
  card.appendTo(qunitFixture);
});

test("HeightService does not resize beyond the sandbox's max-{width, height} properties", function() {
  stop();

  card = conductor.load('/test/fixtures/resize_card.js');
  card.promise.then(function () {
    $(card.sandbox.el).css({
      maxWidth: '35px',
      maxHeight: '25px'
    });

    card.sandbox.heightPort.on('resize', function () {
      equal($(card.sandbox.el).width(), 35, "HeightService updated width");
      equal($(card.sandbox.el).height(), 25, "HeightService updated height");
      start();
    });
  });

  card.appendTo(qunitFixture);
});


test("HeightConsumer's `update` with dimensions sends those dimensions in a resize event", function() {
  stop();

  card = conductor.load('/test/fixtures/resize_explicit_dimensions_card.js');
  card.promise.then(function () {
    card.sandbox.heightPort.on('resize', function () {
      equal($(card.sandbox.el).width(), 55, "HeightService updated width");
      equal($(card.sandbox.el).height(), 55, "HeightService updated height");
      start();
    });
  });

  card.appendTo(qunitFixture);
});

test("HeightConsumer's `update` without dimensions sends the dimensions of the document in a resize event", function() {
  stop();

  card = conductor.load('/test/fixtures/resize_implicit_dimensions_card.js');

  card.promise.then(function () {
    card.sandbox.heightPort.on('resize', function () {
      equal($(card.sandbox.el).width(), 614, "HeightService updated width");
      equal($(card.sandbox.el).height(), 714, "HeightService updated height");
      start();
    });
  });

  card.appendTo(qunitFixture);
});

if (typeof MutationObserver !== 'undefined' || typeof WebkitMutationObserver !== 'undefined') {
  test("HeightConsumer will not autoupdate if autoupdate is set to false during card activation", function() {
    stop();

    card = conductor.load('/test/fixtures/resize_no_auto_card.js');

    card.promise.then(function () {
      card.sandbox.heightPort.on('resize', function () {
        ok(false, "resize should not have been sent");
      });

      card.sandbox.assertionPort.on('go', function () {
        ok(true, "Card activated");
        start();
      });
    });

    card.appendTo(qunitFixture);
  });

  test("HeightConsumer will autoupdate by default", function() {
    expect(3);
    stop();
    stop();

    card = conductor.load('/test/fixtures/resize_auto_card.js');

    card.promise.then(function () {
      card.sandbox.heightPort.on('resize', function () {
        var width = $(card.sandbox.el).width(),
            height = $(card.sandbox.el).height();

        // mutation observer will race and sometimes send us two events: one pre
        // dom enlargement and one post.  This is fine in real life as losing
        // the race only means a benign resize, but we work around it here.
        if (width > 100) {
          equal(width, 614, "HeightService updated width");
          equal(height, 714, "HeightService updated height");
          start();
        }
      });

      card.sandbox.assertionPort.on('go', function () {
        ok(true, "Card activated");
        start();
      });
    });

    card.appendTo(qunitFixture);
  });
}
