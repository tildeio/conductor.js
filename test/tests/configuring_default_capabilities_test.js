(function() {

var conductor, card, qunitFixture;
var defaultCapabilities = [
  'xhr', 'metadata', 'render', 'data', 'lifecycle', 'height',
  'nestedWiretapping' ];

module('Default Capabilities', {
  setup: function() {
    conductor = newConductor();
    qunitFixture = document.getElementById('qunit-fixture');
  }
});


test("conductor.defaultCapabilities returns the list of default capabilities", function() {
  deepEqual(conductor.defaultCapabilities(), defaultCapabilities, "conductor.defaultCapabilities returns the list of default capabilities");
});

test("conductor.removeDefaultCapability removes a default capability", function() {
  conductor.removeDefaultCapability('height');
  conductor.removeDefaultCapability('nestedWiretapping');
  deepEqual(conductor.defaultCapabilities(), defaultCapabilities.slice(0, -2), "conductor.removeDefaultCapability removes default capabilities");
});

test("conductor.removeDefaultCapability does not affect other Conductor instances", function() {
  conductor.removeDefaultCapability('height');
  conductor.removeDefaultCapability('nestedWiretapping');
  deepEqual(newConductor().defaultCapabilities(), defaultCapabilities, "removing default capabilities does not affect other instances");
});

test("conductor.addDefaultCapability adds a default capability", function() {
  var DefaultService = Conductor.Oasis.Service.extend();
  conductor.addDefaultCapability('myDefaultCapability', DefaultService);

  deepEqual(conductor.defaultCapabilities(), defaultCapabilities.concat(['myDefaultCapability']), "can add default capabilities");
  equal(conductor.defaultServices().myDefaultCapability, DefaultService, "can provide service for new default capability");
});

test("conductor.addDefaultCapability defaults the service to a plain `Oasis.Service`", function() {
  conductor.addDefaultCapability('myDefaultCapability');

  deepEqual(conductor.defaultCapabilities(), defaultCapabilities.concat(['myDefaultCapability']), "can add default capabilities");
  equal(conductor.defaultServices().myDefaultCapability, Conductor.Oasis.Service, "default service defaults to Oasis.Service");
});

test("conductor.addDefaultCapability does not affect other Conductor instances", function() {
  conductor.addDefaultCapability('myDefaultCapability');
  deepEqual(newConductor().defaultCapabilities(), defaultCapabilities, "adding default capabilities does not affect other instances");
});

test("conductor.load can load cards with additional default capabilities", function() {
  expect(1);
  stop();
  conductor.addDefaultCapability('myDefaultCapability');
  card = conductor.load('/test/fixtures/custom_default_capability_card.html');

  card.appendTo(qunitFixture);
});

})();
