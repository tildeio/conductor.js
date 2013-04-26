Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.requireCSS('/example/cards/ad/style.css');

var VideoService = Conductor.Oasis.Service.extend({
  initialize: function (port) {
    this.sandbox.videoPort = port;
  },
  events: {
    'videoWatched': function () {
      card.render('takeSurvey');
    }
  }
});

var SurveyService = Conductor.Oasis.Service.extend({
  events: {
    'surveyTaken': function (grade) {
      card.consumers.survey.send('surveyTaken', {
        videoId: card.videoId,
        grade: grade
      });
    }
  }
});

var card = Conductor.card({
  consumers: {
    survey: Conductor.Oasis.Consumer,
    video: Conductor.Oasis.Consumer.extend({
      events: {
        play: function () {
          card.promise.then(function () {
            return card.videoCard.promise;
          }).then(function () {
            card.videoCard.sandbox.videoPort.send('play');
          });
        }
      }
    })
  },

  childCards: [
    {url: '../cards/video/card.js', options: { capabilities: ['video']}},
    {url: '../cards/survey/card.js', options: { capabilities: ['survey']}}
  ],
  services: {
    video: VideoService,
    survey: SurveyService
  },

  loadDataForChildCards: function(data) {
    var videoCardOptions = this.childCards[0],
        surveyCardOptions = this.childCards[1];

    videoCardOptions.id = data.videoId;
    videoCardOptions.data = { videoId: data.videoId };

    surveyCardOptions.id = data.videoId;
  },

  activate: function (data) {
    Conductor.Oasis.RSVP.EventTarget.mixin(this);

    this.videoId = data.videoId;
    this.videoCard = this.childCards[0].card;
    this.surveyCard = this.childCards[1].card;
  },

  render: function (intent, _dimensions) {
    this.renderIntent = intent;
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
        var videoWidth = dimensions.height * (267/200),
            surveyWidth = dimensions.width - videoWidth;
        $(this.videoCard.sandbox.el).css({
          width: videoWidth,
          height: dimensions.height
        });
        $(this.surveyCard.sandbox.el).css({
          width: surveyWidth,
          height: dimensions.height
        });
        this.videoCard.render('thumbnail', {width: videoWidth,    height: dimensions.height });
        this.surveyCard.render('small', {width: surveyWidth, height: dimensions.height });
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
