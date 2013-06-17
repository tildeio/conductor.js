(function() {
  "use strict";

  function capitalize(str) {
    return str.substr(0,1).toUpperCase()+str.substr(1);
  }

  $.extend(Playground, {
    bindReportPopover: function(card) {
      $('.report.popover .metadata').empty();

      card.promise.then(function() {
        return card.metadataFor('*');
      }).then(function(metadata) {
        var table = $('<table>'),
            row;

        if (Object.keys(metadata).length === 0) {
          table.append('<tr><td class="empty">no metadata</td></tr>');
        } else {
          for (var key in metadata) {
            var loc = key.indexOf(':');

            var group = capitalize(key.substr(0, loc));
            var name = capitalize(key.substr(loc+1));

            var label = group + " " + name;

            row = $('<tr><th>'+label+':</th><td>'+metadata[key]+'</td></tr>');
            table.append(row);
          }
        }

        $('.report.popover .metadata').empty().append(table);
        Playground.repositionPopover();
      }, Conductor.error);
    },

    unbindReportPopover: function(card) { }

  });
})();
