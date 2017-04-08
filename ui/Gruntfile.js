module.exports = function (grunt) {

  /**
   * Pattern Lab for Node originally used Grunt + Nodeunit for unit testing.
   * Fepper development will stick with this paradigm for the forseeable future.
   * Run `npm install` in this directory to install the required packages.
   */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodeunit: {
      all: ['test/*_tests.js']
    },
    eslint: {
      options: {
        configFile: './.eslintrc',
        ignorePattern: '!node_modules/*'
      },
      target: [
        './core/lib/*',
        './test/*.js'
      ]
    }
  });

  // load all grunt tasks
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  //travis CI task
  grunt.registerTask('test', ['nodeunit', 'eslint']);
};
