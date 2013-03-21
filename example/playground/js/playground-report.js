(function() {
  "use strict";

  $.extend(Playground, {
    initializeReport: function() {
      var card = this.card;
      card.then(function() {
        return card.metadataFor('*');
      }).then(function(metadata) {
        var table = $('<table>'),
            row;

        for (var key in metadata) {
          row = $('<tr><th>'+key+':</th><td>'+metadata[key]+'</td></tr>');
          table.append(row);
        }

        $('.report.popover .metadata').empty().append(table);
      });
    }
  });
})();
