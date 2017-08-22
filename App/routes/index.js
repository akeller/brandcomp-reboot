/**************************************************************

					BRAND COMPARISON

***************************************************************/
//var dotenv = require('dotenv');
var express = require('express');
var Twitter = require('twitter');
var dotenv = require('dotenv').config({path: __dirname + '/../.env'});

var router = express.Router();

/////////////////////////
// Twitter Access Keys //
/////////////////////////

//updated

var consumer_key = process.env.CONSUMER_KEY;
var consumer_secret = process.env.CONSUMER_SECRET;
var access_token_key = process.env.ACCESS_TOKEN_KEY;
var access_token_secret = process.env.ACCESS_TOKEN_SECRET;



/////////////////////////
// Pubnub Init & Keys  //
/////////////////////////

//do as I say not as I do -> not ideal for production, secrets are passed in plain text
var pubnub = require("pubnub")({
    ssl           : true,  // <- enable TLS Tunneling over TCP
    publish_key   : process.env.PUBLISH_KEY,
    subscribe_key : process.env.SUBSCRIBE_KEY
});



////////////////////////////
// Create twitter client  //
////////////////////////////

//https://dev.twitter.com/rest/reference/get/search/tweets

var client = new Twitter({
  	consumer_key: consumer_key,
  	consumer_secret: consumer_secret,
  	access_token_key: access_token_key,
  	access_token_secret: access_token_secret
});

var tweetResulttype = 'recent'; // only popular tweets mixed, popular,recent
var tweetLanguage = 'en'; // only english language tweets
var count = 3; // limit tweets to 3

var brandList = []

twitterapi_output = {};

pubnub.subscribe({
    channel  : "realtimebrandmonitor-brands",
    message : function(brands) {
    	getTweetsForBrands(brands)
    }
});

//////////////////////////////////////////////////////////////////////
// Fetches tweets for requested brand names and publises to blocks  //
//////////////////////////////////////////////////////////////////////

	function getTweetsForBrands(brands){

		var brandList = [brands.brand1,brands.brand2]
		var finalListbrand1 = []
		var finalListbrand2 = []
		console.log(brandList)
		var tweetArray1 = [];
		var tweetArray2 = [];

	//////////////////////////////////////////////////////
	// Publish Tweets to blocks for getting tone score  //
	//////////////////////////////////////////////////////

	    var params = { q:brandList[0], result_type:tweetResulttype, lang:tweetLanguage, count:count };

	    client.get('search/tweets', params, function (error, tweets, response) {

		    if (!error) {
		    	if(tweets.statuses.length >= 0){
		    		console.log("tweet length :",tweets.statuses.length);
			    	for (var j=0;j<tweets.statuses.length;j++) {
				    	var key = (tweets.statuses[j].id_str).toString();
				    	tweetArray1.push({[key]:tweets.statuses[j].text});
				    }
				}else{
					console.log("error in tweet statuses length")
				}
            console.log(tweetArray1);
		        twitterapi_output[params.q] = tweetArray1;

		        toblock = {"twitterfeed":tweetArray1,"brandname":brandList[0]};
		        finalListbrand1.push(toblock);
		        // console.log("finalListbrand1: ",finalListbrand1[0]);
		    	pubPublish(finalListbrand1[0])
			}
			else {
				console.log("error")
			}
		});

		setTimeout(function(){
			var params1 = { q:brandList[1], result_type:tweetResulttype, lang:tweetLanguage, count:count };

			    client.get('search/tweets', params1, function(error, tweets, response) {

				    if (!error) {
				    	if(tweets.statuses.length >= 0){
				    		console.log("tweet length :",tweets.statuses.length);
				    		for (var j=0;j<tweets.statuses.length;j++) {
						       var key = (tweets.statuses[j].id_str).toString();
						       tweetArray2.push({[key]:tweets.statuses[j].text});
						    }
				    	}else{
				    		console.log("error in tweet statuses length")
				    	}
                console.log(tweetArray2);
				        twitterapi_output[params.q] = tweetArray2;

				        toblock = {"twitterfeed":tweetArray2,"brandname":brandList[1]};
				        finalListbrand2.push(toblock);
				        // console.log("finalListbrand2: ",finalListbrand2[0]);
				        pubPublish(finalListbrand2[0])
					}
					else {
						console.log("error")
					}
				});
		},10000);
	};

///////////////////////////////
// Publish Tweets to blocks  //
///////////////////////////////

	function pubPublish(tweets){
    	pubnub.publish({
		    channel   : 'realtimebrandmonitor',
		    message   : tweets,
		    callback  : function(e) {
		        console.log( "SUCCESS!", e );
		    },
		    error     : function(e) {
		        console.log( "FAILED! RETRY PUBLISH!", e );
		    }
		});
    }

router.get('/', function(req, res, next) {

    res.status(200).render('index', { title: 'Brand Comparison'});

});

module.exports = router;
