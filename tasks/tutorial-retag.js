var exec = require('child_process').exec;

module.exports = function(grunt) {
  grunt.registerTask('tutorial:retag', function () {
    var done = this.async();

    exec('git log -n 1 --format=%s | grep -q -p ^Tutorial', function (sin, sout, serr) {
      if (sin instanceof Error) {
        grunt.fail.fatal("The commit message of HEAD does not begin with 'Tutorial:'.  You must run 'tutorial:retag' from the last tutorial commit.");
      }
    });

    exec('git rev-list --reverse tutorial-setup..', function (sin, sout, serr) {
      var lastSha, cmd;
      sout.replace(/\n$/, '').split("\n").forEach(function (sha, i) {
        var cmd = "git tag -f tutorial-" + (i+1) + " " + sha;
        exec(cmd);
        grunt.log.write(cmd + "\n");
        lastSha = sha;
      });

      cmd = "git tag -f tutorial " + lastSha;
      exec(cmd);
      grunt.log.write(cmd + "\n");

      done();
    });
  });
};
