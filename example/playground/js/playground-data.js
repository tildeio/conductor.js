(function() {
  "use strict";

  var VideoIds = {
    '1': { videoId: '4d8ZDSyFS2g' },
    '2': { videoId: 'dJOn3jG5tUk' },
    '3': { videoId: 'EquPUW83D-Q' }
  },  CardData = {
    "../cards/video/card.js": VideoIds,
    "../cards/ad/card.js": VideoIds,
    "../cards/ad-playlist/card.js": {
        '1': VideoIds
    },
    "../cards/superbowl/card.js": {
        '1': VideoIds
    },
    "../cards/slot_machine/card.js": {
      '1': { coins: 1, insertCoinsLabel: 'Watch another ad'},
      '2': { coins: 2, insertCoinsLabel: 'Watch another ad'},
      '3': { coins: 3, insertCoinsLabel: 'Watch another ad'}
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
