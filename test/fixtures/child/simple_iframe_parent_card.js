var destinationUrl = location.protocol + "//" + location.hostname + ":" + (parseInt( location.port, 10) + 2);

function _addEventListener(receiver, eventName, fn) {
  if (receiver.addEventListener) {
    return receiver.addEventListener(eventName, fn);
  } else if (receiver.attachEvent) {
    return receiver.attachEvent('on' + eventName, fn);
  }
}

Conductor.card({
  activate: function() {
    ok(true, "parent card activated");
  },

  initializeDOM: function() {
    var card = this,
        iframe = document.createElement('iframe'),
        origin = destinationUrl;

    iframe.src = origin + "/test/fixtures/child/same_origin.html";

    _addEventListener(window, "message", function (event) {
      if( event.data === "childInitialized" ) {
        ok(true, "iframe initialized");
        start();
      }
    });

    document.body.appendChild(iframe);
  }
});
