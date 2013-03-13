/*globals $*/

(function() {

  "use strict";

  addStringExtensions();

  var conductor;

  $(function() {
    loadCard();
    initializeAnalytics();
  });

  function loadCard() {
    var card;

    conductor = new Conductor();

    card = conductor.load('../cards/render_card.js');

    card.appendTo('.cards').then(function() {
      card.render('thumbnail', {
        width: 100,
        height: 100
      });
    });
  }

  // Setup event listeners for the analytics panel
  function initializeAnalytics() {
    var $analytics = $('.analytics');

    $('.analytics .tab').on('click', function() {
      $analytics.toggleClass('showing');
    });

    printAnalytics("✔ Analytics monitoring active".green);
  }

  function timestamp() {
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth()+1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes();

    function pad(number) {
      number = number+'';
      if (number.length === 1) {
        return "0"+number;
      }
      return number;
    }

    return "%@-%@-%@ %@:%@ ".fmt(year, pad(month), pad(day), pad(hour), pad(minute));
  }

  function printAnalytics(string) {
    var $output = $('.analytics .output'),
        atBottom;

    atBottom = ($output.scrollTop() === ($output[0].scrollHeight - $output.height()));

    // Append the new message
    $output.append("<p>%@%@</p>".fmt(timestamp().yellow, string));

    if (atBottom) {
      // Scroll the div to show the new message
      $output.scrollTop($output[0].scrollHeight);
    }
  }


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

    var colors = {
      red: '#a00',
      green: '#0a0',
      blue: '#4839de',
      yellow: '#aa0'
    };

    Object.keys(colors).forEach(function(color) {
      extend(color, function() {
        return "<span style='color: "+colors[color]+";'>"+this+"</span>";
      });
    });
  }
})();
