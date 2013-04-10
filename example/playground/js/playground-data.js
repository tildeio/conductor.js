(function() {
  "use strict";

  var CardData = {
    "../cards/video/card.js": {
      '1': { videoId: '4d8ZDSyFS2g' },
      '2': { videoId: '6kMWLYYcAYw' },
      '3': { videoId: 'EquPUW83D-Q' }
    }
  }

  function coerceId(id) {
    return '' + id;
  };

  $.extend(Playground, {
    loadData: function (url, id) {
      var id = coerceId(id),
          data = CardData[url] && CardData[url][id];

      console.log("loaddata", url, id, data);
      if (data) {
        this.conductor.loadData(url, id, data);
      }
    }
  });
})();
