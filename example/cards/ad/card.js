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

  activate: function (data) {
    var conductor,
        videoCard,
        videoCardId = data.videoId,
        surveyCard;

    Conductor.Oasis.RSVP.EventTarget.mixin(this);

    this.conductor = new Conductor();
    this.conductor.services.xhr = Conductor.MultiplexService.extend({ upstream: this.consumers.xhr });
    this.conductor.services.video = VideoService;
    this.conductor.services.survey = SurveyService;

    this.videoId = data.videoId;
    this.loadCards();
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

  loadCards: function () {
    this.loadVideoCard();
    this.loadSurveyCard();
  },

  loadVideoCard: function () {
    var videoCard,
        videoCardUrl = '../cards/video/card.js';

    this.conductor.loadData(videoCardUrl, this.videoId, { videoId: this.videoId});

    videoCard = this.videoCard = this.conductor.load(videoCardUrl, this.videoId, { capabilities: ['video']});
    videoCard.appendTo(document.body);
  },

  loadSurveyCard: function () {
    var surveyCard,
        surveyCardUrl = '../cards/survey/card.js';

    surveyCard = this.surveyCard = this.conductor.load(surveyCardUrl, this.videoId, { capabilities: ['survey']});
    surveyCard.appendTo(document.body);
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
