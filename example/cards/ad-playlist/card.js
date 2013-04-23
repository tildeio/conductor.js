Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.requireCSS('/example/cards/ad-playlist/style.css');

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
          card.nextAd(true);
          $('#try-luck').hide();
        }
      }
    })
  },

  activate: function (data) {
    this.conductor = new Conductor();

    for (var prop in data) {
      if ( ! data.hasOwnProperty(prop)) { continue; }

      this.conductor.loadData(AdCardUrl, prop, data[prop]);
    }
    this.adIds = Object.keys(data);

    this.conductor.services.xhr = Conductor.MultiplexService.extend({ upstream: this.consumers.xhr });
    this.conductor.services.survey = SurveyService;
    this.conductor.services.video = VideoService;

    this.setupDom();
    this.nextAd(false);
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
      this.currentAdIndex = 0;
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
