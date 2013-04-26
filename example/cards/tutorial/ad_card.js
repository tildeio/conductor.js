Conductor.require('/vendor/jquery.js');
Conductor.requireCSS('/example/cards/tutorial/ad_card.css');

var RSVP = Conductor.Oasis.RSVP;
var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);

var card = Conductor.card({
  videoIds: ['4d8ZDSyFS2g', 'EquPUW83D-Q'],

  consumers: {
    survey: Conductor.Oasis.Consumer,
    video: Conductor.Oasis.Consumer.extend({
      events: {
        play: function () {
          var card = this.card;
          card.waitForActivation().then(function () {
            return card.videoCard.waitForLoad();
          }, RSVP.rethrow).then(function () {
            card.videoCard.sandbox.videoPort.send('play');
          });
        }
      }
    })
  },

  services: {
    video: Conductor.Oasis.Service.extend({
      initialize: function (port) {
        this.sandbox.videoPort = port;
      },
      events: {
        'videoWatched': function () {
          card.render('takeSurvey');
        }
      }
    }),

    survey: Conductor.Oasis.Service.extend({
      events: {
        'surveyTaken': function (grade) {
          card.consumers.survey.send('surveyTaken', {
            videoId: card.videoId,
            grade: grade
          });
        }
      }
    })
  },

  conductorConfiguration: {
    allowSameOrigin: true
  },

  childCards: [
    {url: destinationUrl + '/example/cards/tutorial/youtube_card.html', id: '1', options: { capabilities: ['video']}},
    {url: destinationUrl + '/example/cards/tutorial/survey_card.html', id: '1',  options: { capabilities: ['survey']}}
  ],

  loadDataForChildCards: function(data) {
    var videoCardOptions = this.childCards[0],
        surveyCardOptions = this.childCards[1];

    videoCardOptions.data = { videoId: data.videoId };
  },

  activate: function (data) {
    Conductor.Oasis.RSVP.EventTarget.mixin(this);

    this.videoId = data.videoId;
    this.videoCard = this.childCards[0].card;
    this.surveyCard = this.childCards[1].card;
  },

  render: function (intent, _dimensions) {
    this.setDimensions(_dimensions);

    var dimensions = this.getDimensions();

    switch (intent) {
      case "thumbnail":
      case "video":
        $(this.videoCard.sandbox.el).css({
          width: dimensions.width,
          height: dimensions.height
        });
        this.videoCard.render('small', dimensions);
        $(this.surveyCard.sandbox.el).hide();
        break;
      case "takeSurvey":
        // TODO: change to use height service
        var width = dimensions.width * (1/2);
        $(this.videoCard.sandbox.el).css({
          width: width,
          height: dimensions.height
        });
        $(this.surveyCard.sandbox.el).css({
          width: width,
          height: dimensions.height
        });
        this.videoCard.render('thumbnail',  { width: width,  height: dimensions.height });
        this.surveyCard.render('small',     { width: width, height: dimensions.height });
        $(this.surveyCard.sandbox.el).show();
        break;
      case "summary":
        break;
    }
  },

  initializeDOM: function () {
    this.videoCard.appendTo(document.body);
    this.surveyCard.appendTo(document.body);
  },

  getDimensions: function () {
    if (!this._dimensions) { this.setDimensions(); }
    return this._dimensions;
  },

  setDimensions: function (dimensions) {
    if (dimensions !== undefined) {
      this._dimensions = dimensions;
    } else {
      this._dimensions = {
        height: window.innerHeight,
        width: window.innerWidth
      };
    }
  }
});
