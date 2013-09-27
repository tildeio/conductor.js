Conductor.require('/vendor/jquery.js');

var AdCardUrl = '../cards/ad/card.js';

var VideoService = Conductor.Oasis.Service.extend({
  initialize: function (port) {
    this.sandbox.videoPort = port;
  }
});
var SurveyService = Conductor.Oasis.Service.extend({
  events: {
    surveyTaken: function (data) {
      card.consumers.adPlaylist.send('surveyTaken', data);
      card.render('cta');
      $('#try-luck').show();
    }
  }
});

var card = Conductor.card({
  consumers: {
    adPlaylist: Conductor.Oasis.Consumer.extend({
      events: {
        nextAd: function() {
          this.card.nextAd(true);
          $('#try-luck').hide();
        }
      }
    })
  },

  childCards: [
    {url: AdCardUrl,  id: '1', options: { capabilities: ['video', 'survey'] } }
  ],
  services: {
    survey: SurveyService,
    video: VideoService
  },

  activate: function (data) {
    this.consumers.height.autoUpdate = false;
    // this may need to go in loadDataForChildCards
    this.adIds = [];
    for (var prop in data) {
      if ( ! data.hasOwnProperty(prop)) { continue; }

      this.adIds.push(data[prop]);
    }
  },

  loadDataForChildCards: function( data) {
    this.childCards[0].data = data[ this.childCards[0].id ];

    for (var prop in data) {
      if ( ! data.hasOwnProperty(prop)) { continue; }
      this.conductor.loadData(AdCardUrl, prop, data[prop]);
    }
  },

  initializeDOM: function() {
    this.setupDom();
    this.videoAdCard = this.childCards[0].card;
    this.videoAdCard.appendTo($('#ads')[0]);
    this.videoAdCard.render('video', this.getVideoDimensions());
  },

  render: function (intent, dimensions) {
    var scrollTarget;

    this.setDimensions(dimensions);

    switch (intent) {
      case 'thumbnail':
      case 'small':
      case 'large':
        var videoDimensions = this.getVideoDimensions();

        $('#cta').hide();
        $(this.videoAdCard.sandbox.el).css({
          width: videoDimensions.width,
          height: videoDimensions.height
        });
        break;
      case 'cta':
        $('#cta').show();
        break;
      default:
        throw new Error("Unsupported intent '" + intent +  "'");
    }

    scrollTarget = Math.max($('body').height() - window.innerHeight, 0);
    $('body').animate({ scrollTop: scrollTarget }, 250);
  },

  setupDom: function () {
    $('body').html(
      '<div id="ads"></div>' +
      '<div id="cta">' +
        '<button id="watch-another">Watch Another Ad</button>' +
        '<label for="watch-another">for another chance to win</label>' +
      '</div>' +
      '<div id="try-luck">' +
        "<button id='ready'>I'm ready</button>" +
        '<label for="ready">to try my luck now!</label>' +
      '</div>'
    );
    $('#watch-another').click(function () {
      card.nextAd(true);
    });
    $('#cta').hide();
    $('#ready').click(function () {
      card.consumers.adPlaylist.send('play');
      $('#try-luck').hide();
    });
    $('#try-luck').hide();
  },

  nextAd: function (autoplay) {
    if (typeof this.currentAdIndex === 'undefined') {
      this.currentAdIndex = 1;
    } else {
      this.currentAdIndex = ((this.currentAdIndex + 1) % this.adIds.length);
    }

    var adId = this.adIds[this.currentAdIndex];

    this.videoAdCard = this.conductor.load(AdCardUrl, adId, { capabilities: ['video', 'survey']});
    this.videoAdCard.appendTo($('#ads')[0]);
    this.videoAdCard.render('video', this.getVideoDimensions());
    this.render('small');

    if (autoplay) {
      this.videoAdCard.then(function () {
        card.videoAdCard.sandbox.videoPort.send('play');
      });
    }
  },

  getVideoDimensions: function () {
    return { width: 600, height: 200 };
  },

  getSummaryDimensions: function () {
    return { width: 600, height: 200 };
  },

  setDimensions: function (dimensions) {
    // TODO: resize?
  }
});
