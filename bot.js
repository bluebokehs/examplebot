// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// This is the URL of a search for the latest tweets on the '#squidgame' hashtag.
var squidGameSearch = {q: "#squidgame", count: 10, result_type: "recent"}; 

// This function finds the latest tweet with the #squidgame hashtag, and retweets it.
function retweetLatest() {
	T.get('search/tweets', squidGameSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If our search request to the server had no errors...
	  if (!error) {
	  	// ...then we grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].id_str;
		// ...and then we tell Twitter we want to retweet it!
		

		T.post('statuses/retweets/' + retweetId, { }, function (error, response) {
			if (response) {
				console.log('Success! Check your bot, it should have tweeted something.')
			}
			// If there was an error with our Twitter call, we print it out here.
			if (error) {
				console.log('There was an error with Twitter:', error);
			}
		})
		
		T.post('favorites/create', {id:retweetId}, function(err, data, response){console.log("just liked a post")});
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	})

	// gets a list of followers of a squid game fan account
	T.get('followers/list', { screen_name: 'nocontextsquidg'}, function(err, data, response) {

		if (!err) {
			// creates a random number between 0 and 100, this number is used for picking a 
			// random user and also giving them a random percentage chance of winning Squid Game
			var randomNum = Math.floor(Math.random() * 101)
			//account is the screen name of the account that the bot will mention
			var account = data.users[randomNum].screen_name;
			//the tweet that the bot posts
			var tweet = {
				status: '@' + account + ' has a ' + randomNum + '% chance to win Squid Game.'
			}
			//actually posting the tweet
			T.post('statuses/update', tweet, function(err, data, response) {
				console.log(data)
			})
		}
	});
}

// Try to retweet something as soon as we run the program...
retweetLatest();
// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetLatest, 1000 * 60 * 60 * 6);
