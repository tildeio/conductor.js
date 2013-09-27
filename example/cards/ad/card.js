Conductor.require('/vendor/jquery.js');
Conductor.requireCSS('style.css');

var card = Conductor.card({
  consumers: {
    survey: Conductor.Oasis.Consumer,
    video: Conductor.Oasis.Consumer.extend({
      events: {
        play: function () {
          var card = this.card;

          card.waitForLoad().then(function () {
            return card.videoCard.waitForLoad();
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

  loadDataForChildCards: function(data) {
    var videoCardOptions = this.childCards[0],
        surveyCardOptions = this.childCards[1];

    videoCardOptions.id = data.videoId;
    videoCardOptions.data = { videoId: data.videoId };

    surveyCardOptions.id = data.videoId;
  },

  activate: function (data) {
    Conductor.Oasis.RSVP.EventTarget.mixin(this);

    this.consumers.height.autoUpdate = false;

    this.videoId = data.videoId;
    this.videoCard = this.childCards[0].card;
    this.surveyCard = this.childCards[1].card;

    this.videoCard.waitForLoad().then(function () {
      card.videoCard.sandbox.el.on('resize', function (dimensions) {
        card.videoCardDidResize(dimensions);
      });
    });
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
        var width = dimensions.width * (1/2);
        $(this.videoCard.sandbox.el).css({
          width: width,
          height: dimensions.height
        });
        $(this.surveyCard.sandbox.el).css({
          width: width,
          height: dimensions.height
        });
        this.videoCard.render('thumbnail', {width: width, height: dimensions.height });
        this.surveyCard.render('small', {width: width, height: dimensions.height });
        $(this.surveyCard.sandbox.el).show();
        break;
      case "summary":
        break;
    }
  },

  videoCardDidResize: function (videoCardDimensions) {
    if (this.renderIntent === "takeSurvey") {
      var surveyWidth = this.getDimensions().width - videoCardDimensions.width;
      this.surveyCard.render('small', {width: surveyWidth, height: videoCardDimensions.height });
      $(this.surveyCard.sandbox.el).css({
        width: surveyWidth,
        height: videoCardDimensions.height
      });
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
