Conductor.require('/example/libs/jquery-1.9.1.js');
Conductor.require('/example/libs/handlebars-1.0.0-rc.3.js');

var defaultTemplate = '{{vote}}<div><form><input type="radio" name="survey" value="A">A</br><input type="radio" name="survey" value="B">B</br><input id="vote" type="button" value="Vote"></div>';
var voteResultTemplate = '<div>Your rating: {{vote}}  <button id="changeVote">Change</button></div>'

Conductor.card({
  vote: null,

  activate: function( data ) {
    this.self = this;
    this.compileTemplates();
    this.vote = data.vote;
  },

  compileTemplates: function() {
    defaultTemplate = Handlebars.compile( defaultTemplate );
    voteResultTemplate = Handlebars.compile( voteResultTemplate );
  },

  render: function(intent, dimensions) {
    var self = this,
        clickHandler = function( event ) {
          self.vote = $('input:radio[name=survey]:checked').val();
          $(this).off('click');
          self.render();
        };

    if( this.vote ) {
      $('body').html( voteResultTemplate( this ) );
      $('#changeVote').click( clickHandler );
    } else {
      $('body').html( defaultTemplate( this ) );
      $('#vote').click( clickHandler );
    }
  }
});
