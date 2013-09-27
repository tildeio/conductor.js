/*global Handlebars*/

Conductor.require('/vendor/jquery.js');
Conductor.require('../../libs/handlebars-1.0.0-rc.3.js');
Conductor.requireCSS('style.css');

var defaultTemplate = '<div><form>{{#each grades}}<input type="radio" name="survey" value="{{this}}">{{this}}</br>{{/each}}<input id="vote" type="button" value="Vote"></div>';
var voteResultTemplate = 'Your rating: {{vote}} <button id="changeVote">Change</button></div>';

Conductor.card({
  consumers: {
    survey: Conductor.Oasis.Consumer
  },

  vote: null,
  grades: ["A", "B", "C", "D", "E", "F"],
  renderMode: 'survey',

  activate: function( data ) {
    this.consumers.height.autoUpdate = false;
    this.compileTemplates();
  },

  compileTemplates: function() {
    defaultTemplate = Handlebars.compile( defaultTemplate );
    voteResultTemplate = Handlebars.compile( voteResultTemplate );
  },

  render: function(intent, dimensions) {
    this.resize( dimensions );

    switch( intent ) {
      case "thumbnail":
      case "small":
      case "large":
        if( this.renderMode === 'survey' ) {
          this.renderSurvey();
        } else {
          this.renderReport();
        }
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

    $('img').css({
      width: size,
      height: size
    });
  },

  renderReport: function() {
    var self = this;
    this.renderMode = 'report';

    $('body').html( voteResultTemplate( this ) );

    $('#changeVote').click( function( event ) {
      $(this).off('click');
      self.renderSurvey();
    });
  },

  renderSurvey: function() {
    var self = this;
    this.renderMode = 'survey';

    $('body').html( defaultTemplate( this ) );

    // See how we can do this with Handlebars
    if( this.vote ) {
      $('input:radio[name=survey][value="' + this.vote + '"]').attr('checked', 'checked');
    }

    $('#vote').click( function( event ) {
      var vote = $('input:radio[name=survey]:checked').val();
      if( vote ) {
        $(this).off('click');
        if( !self.vote ) {
          // Vote counts only once
          self.consumers.survey.send('surveyTaken', vote);
        }
        self.vote = vote;
        self.renderReport();
      }
    });
  }
});
