/*
*
*/

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015', 'react']
      },
      files: {
        expand: true,
        cwd: 'public/js/components/client/',
        ext: '.js',
        src: ['login.js'],
        dest: 'public/js/'
      }
    }
  });

  grunt.registerTask('default', ['babel']);
  grunt.registerTask('login', ['babel']);
};