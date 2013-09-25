
(function() {

var qunitFixture,
    destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 1);

module("Conductor", {
  setup: function() {
    qunitFixture = document.getElementById('qunit-fixture');
  }
});

test("it works", function() {
  ok(Conductor);
});

test("the conductor will load cards", function() {
  expect(2);

  var conductor = newConductor();
  var card = conductor.load("/test/fixtures/test_card.js");
  card.appendTo(qunitFixture);

  // Wait for assertion from card
  stop();

  equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");
});

test("the conductor can unload cards", function() {
  var conductor = newConductor(),
      card = conductor.load("/test/fixtures/test_card.js");

  stop();

  card.appendTo(qunitFixture).then( function() {
    equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");

    conductor.unload(card);

    equal(document.querySelectorAll('#qunit-fixture iframe').length, 0, "The card is removed from the DOM");

    start();
  });
});

test("card.destroy unloads the card", function() {
  var conductor = newConductor(),
      card = conductor.load("/test/fixtures/test_card.js");

  stop();

  card.appendTo(qunitFixture);

  card.waitForLoad().then( function() {
    equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");

    card.destroy();

    equal(document.querySelectorAll('#qunit-fixture iframe').length, 0, "The card is removed from the DOM");

    start();
  });
});

test("cards can require dependencies", function() {
  expect(3);

  var conductor = newConductor();
  var card = conductor.load("/test/fixtures/load_card.js");
  card.appendTo(qunitFixture);

  // Wait for card
  stop();

  equal(document.querySelectorAll('#qunit-fixture iframe').length, 1, "The card is in the DOM");
});

test("cards can require CSS dependencies", function() {
  expect(1);

  var conductor = newConductor();
  var card = conductor.load("/test/fixtures/load_css_card.js");
  card.appendTo(qunitFixture);

  stop();
});

test("instances can add custom services", function() {
  stop();

  var conductor = newConductor(),
      CustomService = Conductor.Oasis.Service.extend({
        events: {
          result: function (result) {
            start();
            equal(result,"success", "Custom Service received message");
          }
        }
      }),
      card;

  conductor.services.custom = CustomService;
  card = conductor.load(  "/test/fixtures/custom_consumer_card.js",
                          1,
                          { capabilities: ['custom'] });

  card.appendTo(qunitFixture);
});

test("instances can add custom services when loading a card", function() {
  stop();

  var conductor = newConductor(),
      CustomService = Conductor.Oasis.Service.extend({
        events: {
          result: function (result) {
            start();
            equal(result,"success", "Custom Service received message");
          }
        }
      }),
      card;

  card = conductor.load(  "/test/fixtures/custom_consumer_card.js",
                          1,
                          {
                            capabilities: ['custom'],
                            services: {
                              custom: CustomService
                            }
                          });

  ok(!conductor.services.custom, "The service isn't added to the default services of the conductor");

  card.appendTo(qunitFixture);
});

test("A custom conductorURL can be specified in `new Conductor({conductorURL: 'myURL'})`", function() {
  expect(1);
  stop();

  var conductor = newConductor({
    conductorURL: destinationUrl + '/vendor/conductor-custom-url.js.html'
  });

  conductor.services.urlChecker = Conductor.Oasis.Service.extend({
    events: {
      checkURL: function (conductorURL) {
        var expected = 'conductor-custom-url.js.html';
        start();
        equal(conductorURL.substring(conductorURL.length - expected.length), expected, "Cards are loaded with correct conductor url");
      }
    }
  });
  var card = conductor.load("/test/fixtures/check_conductor_url.js",
                            1,
                            { capabilities: ['urlChecker']});
  card.appendTo(qunitFixture);
});

test("A custom conductorURL can be hosted on a separate domain", function() {
  expect(1);
  stop();

  var conductor = newConductor({
    conductorURL: destinationUrl + '/vendor/conductor-custom-url.js.html'
  });
  conductor.services.urlChecker = Conductor.Oasis.Service.extend({
    events: {
      checkURL: function (conductorURL) {
        var expected = 'conductor-custom-url.js.html';
        start();
        equal(conductorURL.substring(conductorURL.length - expected.length), expected, "Cards are loaded with correct conductor url");
      }
    }
  });
  var card = conductor.load("/test/fixtures/check_conductor_url.js",
                            1,
                            { capabilities: ['urlChecker']});
  card.appendTo(qunitFixture);
});

test("Child cards reuse `conductor.conductorURL`", function() {
  expect(1);
  stop();

  var conductor = newConductor({
    conductorURL: destinationUrl + '/vendor/conductor-custom-url.js.html'
  });
  conductor.services.urlChecker = Conductor.Oasis.Service.extend({
    events: {
      checkURL: function (conductorURL) {
        var expected = 'conductor-custom-url.js.html';
        start();
        equal(conductorURL.substring(conductorURL.length - expected.length), expected, "Cards are loaded with correct conductor url");
      }
    }
  });
  var card = conductor.load("/test/fixtures/check_conductor_url_parent.js",
                            1,
                            { capabilities: ['urlChecker']});
  card.appendTo(qunitFixture);
});

test("`Conductor.require` uses relative path to the card", function() {
  expect(1);
  stop();

  var conductor = newConductor(),
      card = conductor.load("/test/fixtures/require_relative_card.js");

  card.appendTo(qunitFixture);
});

test("Cards' consumers have access to the card", function() {
  stop();

  var conductor = newConductor(),
      CustomService = Conductor.Oasis.Service.extend({
        events: {
          result: function (result) {
            start();
            equal(result,"success", "Cards consumers have access to the card");
          }
        }
      }),
      card;

  conductor.services.custom = CustomService;
  card = conductor.load(  "/test/fixtures/consumer_access_card.js",
                          1,
                          { capabilities: ['custom'] });

  card.appendTo(qunitFixture);
});

})();
