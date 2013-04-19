Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.require('/example/playground/js/playground-nested-analytics.js');
Conductor.requireCSS('/example/cards/superbowl/style.css');

var AdPlaylistCardUrl = '../cards/ad-playlist/card.js';
var SlotMachineCardUrl = '../cards/slot_machine/card.js';

var SlotMachineService = Conductor.Oasis.Service.extend({
  initialize: function (port) {
    this.sandbox.slotMachinePort = port;
  },

  events: {
    getCoins: function() {
      card.adPlaylistCard.sandbox.adPlaylistPort.send('nextAd');
      card.slotMachineCard.render('small', { width: 600, height: 200 });
    }
  }
});

var AdPlaylistService = Conductor.Oasis.Service.extend({
  initialize: function (port) {
    this.sandbox.adPlaylistPort = port;
  },

  events: {
    surveyTaken: function (data) {
      $('#slot_machine').show();
      card.slotMachineCard.sandbox.slotMachinePort.send('addCoin');
    },
    play: function(data) {
      card.slotMachineCard.render('large', { width: 600, height: 200 });
      card.slotMachineCard.sandbox.slotMachinePort.send('play');
    }
  }
});

var card = Conductor.card({
  activate: function(data) {
    this.conductor = new Conductor();

    this.conductor.services.xhr = Conductor.MultiplexService.extend({ upstream: this.consumers.xhr });
    this.conductor.services.adPlaylist = AdPlaylistService;
    this.conductor.services.slotMachine = SlotMachineService;

    this.conductor.loadData(AdPlaylistCardUrl, '1', data);
    this.conductor.loadData(SlotMachineCardUrl, '1', { coins: 0, insertCoinsLabel: 'Watch another ad' });

    this.adPlaylistCard = this.conductor.load(AdPlaylistCardUrl, 1, { capabilities: ['adPlaylist']});
    this.slotMachineCard = this.conductor.load(SlotMachineCardUrl, 1, { capabilities: ['slotMachine']});

    $('body').html('<div id="playlist"></div><div id="slot_machine"></div>');
    this.adPlaylistCard.appendTo($('#playlist')[0]);
    this.adPlaylistCard.render('thumbnail', { width: 600, height: 400 });
    this.slotMachineCard.appendTo($('#slot_machine')[0]);
    this.slotMachineCard.render('small', { width: 600, height: 200 });
    $('#slot_machine').hide();
  },

  render: function(intent, dimensions) {
    this.resize( dimensions );

    switch( intent ) {
      case "thumbnail":
      case "small":
      case "large":
        $(this.adPlaylistCard.sandbox.el).css({
          width: dimensions.width,
          height: 400
        });
        break;
      default:
        $('body').html("This card does not support the " + intent + " intent.");
        break;
    }
  },

  resize: function(dimensions) {
    var width = Math.min(dimensions.width, 50);
    var height = Math.min(dimensions.height, 50);
    var size = Math.min(width, height);
  }
});
