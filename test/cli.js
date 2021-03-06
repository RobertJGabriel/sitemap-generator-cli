/* eslint no-unused-vars:0 */
var test = require('ava');
var port = require('./lib/constants').port;
var localhost = require('./lib/constants').localhost;
// test server
var server = require('./lib/server');
var exec = require('child_process').exec;

// start testserver
test.cb.before(function (t) {
  server.listen(port, localhost, function () {
    t.end();
  });
});

test.cb('should return null for invalid URL\'s', function (t) {
  t.plan(3);

  exec('node ../cli.js invalid', function (error, stdout, stderr) {
    t.is(error, null, 'no error');
    t.is(stderr, '');
    t.regex(stdout, /^null/);

    t.end();
  });
});

test.cb('should return valid sitemap', function (t) {
  t.plan(6);

  exec('node ../cli.js ' + localhost, function (error, stdout, stderr) {
    t.is(error, null, 'no error');
    t.is(stderr, '', 'no error messages');
    // sitemap
    t.regex(stdout, /^<\?xml version="1.0" encoding="UTF-8"\?>/, 'has xml header');
    var urlsRegex = /<urlset xmlns=".+?">(.|\n)+<\/urlset>/;
    t.regex(stdout, urlsRegex, 'has urlset property');
    t.is(stdout.match(/<url>(.|\n)+?<\/url>/g).length, 1, 'contains url properties');
    t.is(stdout.match(/<loc>(.|\n)+?<\/loc>/g).length, 1, 'contains loc properties');

    t.end();
  });
});

test.cb('should restrict crawler to baseurl if option is enabled', function (t) {
  t.plan(3);

  exec('node ../cli.js ' + localhost + '/subpage --baseurl', function (error, stdout, stderr) {
    t.is(error, null, 'no error');
    t.is(stderr, '', 'no error messages');
    var regex = new RegExp('http:\/\/' + localhost + ':' + port + '/<');
    t.falsy(regex.test(stdout), 'index page is not included in sitemap');

    t.end();
  });
});

test.cb('should include query strings if enabled', function (t) {
  t.plan(5);

  exec('node ../cli.js ' + localhost + ' --query', function (error, stdout, stderr) {
    t.is(error, null, 'no error');
    t.is(stderr, '', 'no error messages');
    t.not(stdout, '', 'stdout is not empty');
    t.regex(stdout, /[^<\?xml version="1.0" encoding="UTF\-8"\?>]/, 'does not print xml sitemap');

    var regex = new RegExp('/?querypage');
    t.truthy(regex.test(stdout), 'query page included');

    t.end();
  });
});

test.cb('should log requests if dry mode is enabled', function (t) {
  t.plan(4);

  exec('node ../cli.js ' + localhost + ' --dry', function (error, stdout, stderr) {
    t.is(error, null, 'no error');
    t.is(stderr, '', 'no error messages');
    t.not(stdout, '', 'stdout is not empty');
    t.regex(stdout, /[^<\?xml version="1.0" encoding="UTF\-8"\?>]/, 'does not print xml sitemap');

    t.end();
  });
});

test.cb.after(function (t) {
  // stop test server
  server.close(function () {
    t.end();
  });
});
