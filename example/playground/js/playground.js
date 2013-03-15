/*globals $*/

// Pluck off the RSVP object from Conductor and
// re-export it to the global scope.
window.RSVP = Conductor.Oasis.RSVP;

// Create a namespace for the Playground jQuery app
// to live in.
window.Playground = {
  initialize: function() {
    // Create a new Conductor instance that will
    // manage all of the cards on the page.
    this.conductor = new Conductor();

    // Create the initial Conductor card and
    // insert it into the page.
    this.initializeCard();

    // Wiretap the card and configure any events
    // to be displayed in the analytics panel on
    // screen.
    this.initializeAnalytics();
  }
};

RSVP.EventTarget.mixin(window.Playground);

// Initialize the Playground application once the
// page has finished loading.
$(function() {
  Playground.initialize();
});


(function() {
  "use strict";

  addStringExtensions();

  function addStringExtensions() {
    var stringProto = String.prototype;

    function fmt(str, formats) {
      // first, replace any ORDERED replacements.
      var idx  = 0; // the current index for non-numerical replacements
      return str.replace(/%@([0-9]+)?/g, function(s, argIndex) {
        argIndex = (argIndex) ? parseInt(argIndex,0) - 1 : idx++ ;
        s = formats[argIndex];
        return ((s === null) ? '(null)' : (s === undefined) ? '' : s).toString();
      }) ;
    }

    stringProto.fmt = function() {
      return fmt(this, arguments);
    };

    function extend(prop, getter) {
      Object.defineProperty(stringProto, prop, {
        get: getter
      });
    }

    extend('p', function() {
      return '<p>'+this+'</p>';
    });

    extend('bold', function() {
      return '<span style="font-weight: bold;">'+this+'</span>';
    });

    var colors = {
      red: '#a00',
      green: '#0a0',
      blue: '#4866ff',
      yellow: '#aa0',
      teal: '#0aa',
      magenta: '#a0a',
      lightGrey: '#aaa'
    };

    Object.keys(colors).forEach(function(color) {
      extend(color, function() {
        return "<span style='color: "+colors[color]+";'>"+this+"</span>";
      });
    });
  }
})();
