// Our Twitter library
var Twit = require('twit');

var fs = require("fs");
const { text } = require('stream/consumers');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// This creates the path to all of the reaction pictures.
var picture1 = fs.readFileSync('./sq1.jpeg', {encoding: 'base64'})
var picture2 = fs.readFileSync('./sq2.jpeg', {encoding: 'base64'})
var picture3 = fs.readFileSync('./sq3.jpeg', {encoding: 'base64'})
var picture4 = fs.readFileSync('./sq4.jpeg', {encoding: 'base64'})
var picture5 = fs.readFileSync('./sq5.jpeg', {encoding: 'base64'})


// This is the URL of a search for the latest tweets on the '#mediaarts' hashtag.
var squidGameSearch = {q: "#SquidGame", count: 10, result_type: "recent" };

// This function finds the latest tweet with the #mediaarts hashtag, and retweets it.
function retweetLatest() {
	T.get('search/tweets', squidGameSearch, function (error, data) {
		// log out any errors and responses
		console.log(error, data);
		// If our search request to the server had no errors...
		if (!error) {
			// ...then we grab the ID of the tweet we want to retweet...
			var retweetId = data.statuses[0].id_str;
			// ...and then we tell Twitter we want to retweet it!
			T.post('statuses/retweet/' + retweetId, {}, function (error, response) {
				if (response) {
					console.log(retweetId)
					console.log('Success! Check your bot, it should have retweeted something.')
				}
				// If there was an error with our Twitter call, we print it out here.
				if (error) {
					console.log('There was an error with Twitter:', error);
				}

				T.post('favorites/create', { id: retweetId }, function (err, data, response) {
					console.log("\nJust liked and retweeted a post.")
				});
				console.log(data);
			})
		}
		// However, if our original search request had an error, we want to print it out here.
		else {
			console.log('There was an error with your hashtag search:', error);
		}
	});
} 

function scoreAssignment () {
	// This method gets a list of followers of a squid game fan account called nocontectsquidg.
	T.get('followers/list', { screen_name: 'nocontextsquidg'}, function(err, data, response) {

		if (!err) {
			// RandomUser picks a random number between 0 and number of followers of user nocontextsquidg.
			var randomUser = Math.floor(Math.random() * (data.users.length - 1))
			
			// Account uses the RandomUser index to pick a follower of nocontextsquidg.
			var account = data.users[randomUser].screen_name;
			
			// RandomNum creates a random percentage chance of winning Squid Game for the post.
			var randomNum = Math.floor(Math.random() * 101)
			
			// This variable keeps track of the custom message to put in the post based on the random score.
			var customMessage = "";

			// This variable keeps track of the raction image for each score range.
			var currentPicture = picture1;

			// This series of if statements will change customMessage and currentPicture based on score.
			// The ranges are 0 - 20%, 20 - 40%, 40 - 60%, 60 - 80%, and 80 - 100%.
			if (randomNum <= 20) {
				customMessage = "Don’t even try dialing the number on that card, you have no chance.";
				currentPicture = picture5;
			} else if (randomNum > 20 && randomNum <= 40) {
				customMessage = "Maybe don’t quit your day job or if you do, say bye to your family!";
				currentPicture = picture4;
			} else if (randomNum > 40 && randomNum <= 60) {
				customMessage = "You have a mediocre chance of winning, but make sure you find some strong and smart people to team up with!";
				currentPicture = picture3;
			} else if (randomNum > 60 && randomNum <= 80) {
				customMessage = "Keep your eye on the prize and stay focused in order to win!";
				currentPicture = picture2;
			} else {
				customMessage = "You have a really good chance of winning so quit that job and call the number on the card. Good luck!";
			}
			
			// This method is responsible for uploading the pictures to twitter.
			T.post('media/upload', { media_data: currentPicture}, function (err, data, response){
				// These variables are responsible for keeping track of the media id to link to the post.
				var mediaIdStr = data.media_id_string;
				var altText = "Squid Game reaction picture.";
				var meta_params = { media_id:mediaIdStr, altText: { text: altText} };
				
				// Method is responsible for initiating the media for posting.
				T.post('media/metadata/create', meta_params, function (err, data, response) {
					if (!err) {
						// This combines the random user and the random percentage into the actual post.
						var tweet = {
							status: '@' + account + ' has a ' + randomNum + '% chance to win Squid Game. ' + customMessage, media_ids:[mediaIdStr]
						}
						// This method is responsible for actually posting the tweet.
						T.post('statuses/update', tweet, function (err, data, response) {
							console.log(data);
							console.log("\n Finished!");
						});
					}
				});
			});
		}

	});
}
// Try to retweet something as soon as we run the program...
retweetLatest();

// Calls the second function of the bot.
scoreAssignment();
// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetLatest, 1000 * 60 * 60);
