var http = require('http');
var request = require('request');
var cheerio = require('cheerio');
var RSS = require('rss');


function createFeed(html) {
	var $ = cheerio.load(html);
	var feed = new RSS({
		title: 'JSHint Changelog',
		description: 'JSHint is a community-driven tool to detect errors and potential problems in JavaScript code and to enforce your teams coding conventions.',
		feed_url: 'http://feeds.feedburner.com/JSHint-Changelog',
		site_url: 'http://www.jshint.com'
	});

	// Remove the last "Hello" row
	$('.row').last().remove();

	$('.row').each(function() {
		var $this = $( this );
		var title = $this.find('h2').text();
		var date = $this.find('.span5 h3').text();

		// Remove title and date from body
		$this.find('h2, h3').remove();

		feed.item({
			title: title,
			description: $this.html(),
			url: 'http://www.jshint.com/changelog/',
			// Make the data parseable by removing the `th` after the month
			date: date.replace(/ \d{1,2}\w{0,2}/, function(match) {
				return ' ' + parseInt(match, 10);
			})
		});
	});

	return feed.xml();
}

http.createServer(function(req, res) {
	var serverRes = res;

	request('http://www.jshint.com/changelog/', function(err, res, body) {
		if (!err && res.statusCode === 200) {
			serverRes.writeHead(200, {'Content-Type': 'application/rss+xml'});
			serverRes.end(createFeed(body));
		}
	});
}).listen(process.env.PORT || 5000);
