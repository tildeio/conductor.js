/*global DomUtils*/

function maxDim(element, dim) {
  var max = DomUtils.getComputedStyleProperty(element, 'max' + dim);
  return (max === "none") ? Infinity : parseInt(max, 10);
}

Conductor.HeightService = Conductor.Oasis.Service.extend({
  initialize: function (port) {
    var el;
    if (el = this.sandbox.el) {
      Conductor.Oasis.RSVP.EventTarget.mixin(el);
    }
    this.sandbox.heightPort = port;
  },

  events: {
    resize: function (data) {
      // height service is meaningless for DOMless sandboxes, eg sandboxed as
      // web workers.
      if (! this.sandbox.el) { return; }

      var el = this.sandbox.el,
          maxWidth = maxDim(el, 'Width'),
          maxHeight = maxDim(el, 'Height'),
          width = Math.min(data.width, maxWidth),
          height = Math.min(data.height, maxHeight);

      el.style.width = width + "px";
      el.style.height = height + "px";

      el.trigger('resize', { width: width, height: height });
    }
  }
});
