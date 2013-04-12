(function() {
  "use strict";

  var CardData = {
    "../cards/video/card.js": {
      '1': { videoId: '4d8ZDSyFS2g' },
      '2': { videoId: 'dJOn3jG5tUk' },
      '3': { videoId: 'EquPUW83D-Q' }
    },
    "../cards/ad/card.js": {
      '1': { videoId: '4d8ZDSyFS2g' },
      '2': { videoId: 'dJOn3jG5tUk' },
      '3': { videoId: 'EquPUW83D-Q' }
    }
  };

  function coerceId(id) {
    return '' + id;
  }

  $.extend(Playground, {
    loadData: function (url, _id) {
      var id = coerceId(_id),
          data = CardData[url] && CardData[url][id];

      if (data) {
        this.conductor.loadData(url, id, data);
      }
    }
  });
})();
