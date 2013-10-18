/*global Handlebars*/

Conductor.require('/vendor/jquery.js');
Conductor.require('/example/libs/handlebars-1.0.0-rc.3.js');

var gradingTemplate = '<div><form>{{#each grades}}<input type="radio" name="survey" value="{{this}}">{{this}}</br>{{/each}}<input id="grade" type="button" value="Grade"></div>';
var gradeResultTemplate = '<div>Your rating: {{grade}} <button id="changeGrade">Change</button></div>';

Conductor.card({
  consumers: { survey: Conductor.Oasis.Consumer },

  grade: null,
  grades: ["A", "B", "C", "D", "F"],
  renderMode: 'survey',

  activate: function( data ) {
    this.consumers.height.autoUpdate = false;
    this.compileTemplates();
  },

  compileTemplates: function() {
    gradingTemplate = Handlebars.compile(gradingTemplate);
    gradeResultTemplate = Handlebars.compile(gradeResultTemplate);
  },

  render: function () {
    if (this.renderMode === 'survey') {
      this.renderSurvey();
    } else {
      this.renderReport();
    }
  },

  renderReport: function() {
    var card = this;
    this.renderMode = 'report';

    $('body').html(gradeResultTemplate( this ));

    $('#changeGrade').click( function( event ) {
      $(this).off('click');
      card.renderSurvey();
    });
  },

  renderSurvey: function() {
    var card = this;
    this.renderMode = 'survey';

    $('body').html(gradingTemplate(this));

    if (this.grade) {
      $('input:radio[name=survey][value="' + this.grade + '"]').attr('checked', 'checked');
    }

    $('#grade').click( function( event ) {
      var grade = $('input:radio[name=survey]:checked').val();
      if (grade) {
        $(this).off('click');
        if (card.consumers.survey) {
          if (!card.grade) {
            card.consumers.survey.send('surveyTaken', grade);
          } else {
            card.consumers.survey.send('gradeChanged', grade);
          }
        }
        card.grade = grade;
        card.renderReport();
      }
    });
  }
});
