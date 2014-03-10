/**
 * Created with JetBrains WebStorm.
 * User: vikram
 * Date: 6/3/14
 * Time: 6:45 PM
 * To change this template use File | Settings | File Templates.
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            angular: {
                src: ['public/js/**/*.js', '!public/js/lib/**/*.js', 'public/js/lib/ngAutocomplete.js'],
                dest: 'public/build/concat.js'
            },
            extras: {
                src: ['public/js/lib/xeditable.min.js', 'public/js/lib/strophe.min.js', 'public/js/lib/jquery.slimscroll.min.js', 'public/js/lib/bootstrap/jasny-bootstrap.min.js', 'public/js/lib/xml2json.min.js', 'public/build/ang.min.js'],
                dest: 'public/build/app.min.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['public/build/concat.annotated.js', 'public/js/lib/jquery.fileupload.js', 'public/js/lib/jquery.iframe-transport.js'],
                dest: 'public/build/ang.min.js'
            }
        },
        ngmin: {
            build: {
                src: ['public/build/concat.js'],
                dest: 'public/build/concat.annotated.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-ngmin');

    // Default task(s).
    grunt.registerTask('default', ['concat:angular','ngmin','uglify', 'concat:extras']);

};