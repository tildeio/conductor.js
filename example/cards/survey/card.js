Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.require('/example/libs/handlebars-1.0.0-rc.3.js');

var defaultTemplate = '<div><form>{{#each grades}}<input type="radio" name="survey" value="{{this}}">{{this}}</br>{{/each}}<input id="vote" type="button" value="Vote"></div>';
var voteResultTemplate = 'Your rating: {{vote}} <button id="changeVote">Change</button></div>'

Conductor.card({
  vote: null,
  grades: ["A", "B", "C"],

  activate: function( data ) {
    this.self = this;
    this.compileTemplates();
  },

  compileTemplates: function() {
    defaultTemplate = Handlebars.compile( defaultTemplate );
    voteResultTemplate = Handlebars.compile( voteResultTemplate );
  },

  render: function(intent, dimensions) {
    var self = this;

    switch( intent ) {
      case "report":
        $('body').html( voteResultTemplate( this ) );
        $('#changeVote').click( function( event ) {
          $(this).off('click');
          self.render('takeSurvey');
        });
        break;
case "thumbnail":
      case "takeSurvey":
        $('body').html( defaultTemplate( this ) );
        // See how we can do this with Handlebars
        if( this.vote ) {
          $('input:radio[name=survey][value="' + this.vote + '"]').attr('checked', 'checked');
        }
        $('#vote').click( function( event ) {
          self.vote = $('input:radio[name=survey]:checked').val();
          $(this).off('click');
          self.render('report');
        });
        break;
      default:
        $('body').html("This card does not support the " + intent + " intent.");
        break;
    }
  }
});
