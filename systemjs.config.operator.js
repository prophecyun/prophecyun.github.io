/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',

      // angular bundles
      '@angular/core': 'js/@angular/core/bundles/core.umd.js',
      '@angular/common': 'js/@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'js/@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'js/@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'js/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'js/@angular/http/bundles/http.umd.js',
      // '@angular/router': 'js/@angular/router/bundles/router.umd.js',
      '@angular/forms': 'js/@angular/forms/bundles/forms.umd.js',
      // '@angular/upgrade': 'js/@angular/upgrade/bundles/upgrade.umd.js',
      // '@angular/material': 'npm:@angular/material/material.umd.js',

  
        'rxjs':                       'js/rxjs',
        // 'angular2-in-memory-web-api': 'js/angular2-in-memory-web-api',
        // '@angular':                   'js/@angular',
  
    

      // other libraries
      // 'rxjs': 'npm:rxjs',
      // 'angular-in-memory-web-api': 'npm:angular-in-memory-web-api',
      // 'ng2-dragula': 'npm:ng2-dragula',
      // 'dragula': 'npm:dragula',
      // 'contra': 'npm:contra',
      // 'crossvent': 'npm:crossvent',
      // 'atoa': 'npm:atoa',
      // 'ticky': 'npm:ticky',
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './mainoperator.js',
        defaultExtension: 'js'
      },
      rxjs: {
        defaultExtension: 'js'
      },
      'angular-in-memory-web-api': {
        main: './index.js',
        defaultExtension: 'js'
      }
      // 'ng2-dragula': {
      //   main: './ng2-dragula.js',
      //   defaultExtension: 'js'
      // },
      // 'dragula': {
      //   main: './dragula.js',
      //   defaultExtension: 'js'
      // },
      // 'contra': {
      //   main: './contra.js',
      //   defaultExtension: 'js'
      // },
      // 'crossvent': {
      //   main: './dist/crossvent.min.js',
      //   defaultExtension: 'js'
      // },
      // 'atoa': {
      //   main: './atoa.js',
      //   defaultExtension: 'js'
      // },
      // 'ticky': {
      //   main: './ticky.js',
      //   defaultExtension: 'js'
      // },
    }
  });
})(this);
