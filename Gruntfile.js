/*!
 * Bootstrap's Gruntfile
 * http://getbootstrap.com
 * Copyright 2013-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    less: {
      development: {
        files: {
          "static/compiled.css": "static/less/main.less"
        }
      }
    },
    watch: {
      options: {
        livereload: false
      },
      less: {
        files: ['static/less/*.less'],
        tasks: ['less'],
        options: { livereload: false }
      }
    }
  });

  grunt.registerTask("build", ['less:development']);

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
}
