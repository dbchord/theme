const path = require("path");
const sass = require("node-sass");

module.exports = grunt => {
  "use strict";

  // Force use of Unix newlines
  grunt.util.linefeed = "\n";

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    clean: {
      dist: "dist",
      tmp: "src/tmp"
    },

    bake: {
      options: {
        content: () => {
          const files = [
            {
              path: "src/config/blog.json",
              alias: "blog"
            },
            {
              path: "src/config/blog2.json",
              alias: "blog2"
            },
            {
              path: "src/config/cond.json",
              alias: "cond"
            },
            {
              path: "src/config/msg.json",
              alias: "msg"
            },
            {
              path: "src/config/msg2.json",
              alias: "msg2"
            },
            {
              path: "src/config/page.json",
              alias: "page"
            },
            {
              path: "src/config/view.json",
              alias: "view"
            },
            {
              path: "src/config/view2.json",
              alias: "view2"
            },
            {
              path: "src/config/config.json",
              alias: "config"
            },
            {
              path: "package.json",
              alias: "pkg"
            }
          ];
          return files.reduce(
            (content, file) => {
              content[file.alias] = grunt.file.readJSON(file.path);
              return content;
            },
            {
              rootDir: __dirname.split(path.sep).pop()
            }
          );
        }
      },
      theme: {
        options: {
          basePath: "src"
        },
        files: [
          {
            expand: true,
            cwd: "src/",
            src: "theme.xml",
            dest: "dist"
          },
          {
            expand: true,
            cwd: "src/",
            src: "empty.xml",
            dest: "dist"
          }
        ]
      },
      coreCss: {
        options: {
          basePath: "src"
        },
        files: [
          {
            expand: true,
            cwd: "dist/css/",
            src: "main.css",
            dest: "dist/css"
          }
        ]
      },
      coreJs: {
        options: {
          basePath: "src"
        },
        files: [
          {
            expand: true,
            cwd: "dist/js/",
            src: "main.js",
            dest: "dist/js"
          }
        ]
      }
    },

    stylelint: {
      options: {
        configFile: ".stylelintrc",
        formatter: "string",
        ignoreDisables: false,
        failOnError: true,
        outputFile: "",
        reportNeedlessDisables: false,
        syntax: ""
      },
      coreCss: {
        src: "src/**/*.scss"
      }
    },

    sass: {
      options: {
        implementation: sass,
        outputStyle: "expanded",
        sourceMap: false,
        sourceMapContents: false
      },
      coreCss: {
        files: [{ "dist/css/main.css": "src/scss/index.scss" }]
      }
    },

    postcss: {
      options: {
        map: false,
        processors: [require("autoprefixer")({ cascade: false })]
      },
      coreCss: {
        src: "dist/css/**/*.css"
      }
    },

    cssmin: {
      options: {
        level: 1,
        sourceMap: false,
        sourceMapInlineSources: false,
        advanced: false
      },
      themeCss: {
        files: [
          {
            expand: true,
            cwd: "src/css/",
            src: "**/*.css",
            dest: "dist/css",
            ext: ".min.css"
          }
        ]
      },
      coreCss: {
        files: [
          {
            expand: true,
            cwd: "dist/css/",
            src: "**/*.css",
            dest: "dist/css",
            ext: ".min.css"
          }
        ]
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: false
        },
        transform: [
          [
            "babelify",
            {
              presets: ["@babel/preset-env"],
              plugins: ["babel-plugin-root-import"]
            }
          ]
        ]
      },
      coreJs: {
        files: [{ "dist/js/main.js": "src/scripts/index.js" }]
      }
    },

    uglify: {
      options: {
        mangle: true,
        sourceMap: false,
        compress: {
          warnings: true
        }
      },
      coreJs: {
        files: [
          {
            expand: true,
            cwd: "dist/js/",
            src: "main.js",
            dest: "dist/js",
            ext: ".min.js"
          }
        ]
      }
    },

    jsObfuscate: {
      dist: {
        options: {
          concurrency: 2,
          keepLinefeeds: false,
          keepIndentations: false,
          encodeStrings: true,
          encodeNumbers: true,
          moveStrings: true,
          replaceNames: true,
          variableExclusions: ["^_get_", "^_set_", "^_mtd_"]
        },
        files: {
          "dist/js/main-obfuscated.min.js": ["dist/js/main.min.js"]
        }
      }
    },

    htmlentities: {
      options: {},
      files: {
        src: [
          // "src/scripts/lozad.js",
          // "src/scripts/lazyload.js",
          "src/scripts/lazy.min.js",
          "dist/js/main.min.js",
          "dist/css/amp.min.css",
          "dist/css/amp-noscript.min.css",
          "dist/css/skin.min.css",
          "dist/css/template-skin.min.css",
          "dist/css/main.min.css"
          // "dist/js/main-obfuscated.min.js",
        ],
        dest: "dist/encoded/"
      }
    },

    xmlmin: {
      dist: {
        options: {
          preserveComments: false
        },
        files: {
          "dist/theme-min.xml": "dist/theme.xml"
        }
      }
    },

    json_minification: {
      target: {
        files: [
          {
            expand: true,
            cwd: "src/config",
            src: ["*.json", "!*.min.json"],
            dest: "dist/json",
            ext: ".min.json"
          }
        ]
      }
    },

    watch: {
      main: {
        files: ["src/**/*"],
        tasks: ["default"]
      }
    },

    compress: {
      theme: {
        options: {
          archive:
            __dirname.split(path.sep).pop() +
            "-<%= pkg.name %>-<%= pkg.version %>.zip",
          mode: "zip",
          level: 9,
          pretty: true
        },
        files: [
          {
            expand: true,
            src: ["**", ".*", "!.git", "!*.zip", "!node_modules/**"]
          }
        ]
      },
      starter: {
        options: {
          archive: "<%= pkg.name %>-<%= pkg.version %>.zip",
          mode: "zip",
          level: 9,
          pretty: true
        },
        files: [
          {
            expand: true,
            src: ["**", ".*", "!.git", "!*.zip", "!node_modules/**"]
          }
        ]
      }
    }
  });

  require("load-grunt-tasks")(grunt, { scope: "devDependencies" });
  grunt.loadNpmTasks("js-obfuscator");
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-htmlentities");
  grunt.loadNpmTasks("grunt-xmlmin");
  grunt.loadNpmTasks("grunt-json-minification");

  // Theme task.
  grunt.registerTask("theme-compile", ["bake:theme"]);
  grunt.registerTask("dist-theme", ["theme-compile"]);

  // JSON task
  grunt.registerTask("dist-json", ["json_minification"]);

  // CSS task.
  grunt.registerTask("concatXmlSass", () => {
    grunt.file.expand("src/template").forEach(dir => {
      const concat = {
        options: {
          sourceMap: false
        },
        [dir]: {
          src: [dir + "/**/*.scss"],
          dest: "src/tmp/xml-sass.scss"
        }
      };
      grunt.config.set("concat", concat);
    });
    grunt.task.run("concat");
  });
  grunt.registerTask("css-lint", ["stylelint:coreCss"]);
  grunt.registerTask("css-compile", [
    "concatXmlSass",
    "sass:coreCss",
    "postcss:coreCss",
    "bake:coreCss"
  ]);
  grunt.registerTask("css-minify", ["cssmin:themeCss", "cssmin:coreCss"]);
  grunt.registerTask("dist-css", ["css-lint", "css-compile", "css-minify"]);

  // JS task.
  grunt.registerTask("concatXmlJs", () => {
    grunt.file.expand("src/template").forEach(dir => {
      const concat = {
        options: {
          sourceMap: false
        },
        [dir]: {
          src: [dir + "/**/*.js"],
          dest: "src/tmp/xml-js.js"
        }
      };
      grunt.config.set("concat", concat);
    });
    grunt.task.run("concat");
  });
  grunt.registerTask("js-compile", [
    "concatXmlJs",
    "browserify:coreJs",
    "bake:coreJs"
  ]);
  grunt.registerTask("js-minify", ["uglify:coreJs"]);
  grunt.registerTask("dist-js", [
    "js-compile",
    "js-minify",
    // "jsObfuscate",
    "htmlentities"
  ]);

  // Test task.
  grunt.registerTask("dist", [
    "dist-css",
    "dist-js",
    "dist-json",
    "dist-theme"
  ]);

  // Default task.
  grunt.registerTask("default", [
    "clean:dist",
    "clean:tmp",
    "dist",
    "xmlmin",
    "clean:tmp"
  ]);

  // Release task.
  grunt.registerTask("release", ["default", "compress:theme"]);
  grunt.registerTask("release-starter", ["default", "compress:starter"]);
};
