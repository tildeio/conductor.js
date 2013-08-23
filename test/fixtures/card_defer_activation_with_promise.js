var activated = false;

var card = Conductor.card({
  activate: function () {
    return new Conductor.Oasis.RSVP.Promise(function (resolve, reject) {
      setTimeout( function () {
        ok(!activated, "Card was not immediately activated when returning a promise in `activate`");
        resolve();
      }, 1);
    });
  }
});

card.waitForActivation().then( function () {
  start();
  activated = true;
  ok(true, "Card was activated after user-supplied activation promise resolved.");
}, null);
