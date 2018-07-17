'use strict';

// REQUIRES
var Alexa = require('alexa-sdk');
var Speech = require('ssml-builder');
var _ = require("lodash");
const request = require('request');
const constants = require('./constants');

var streamInfo = {
		title: 'Bass Jazz',
		subtitle: 'A DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO and ClassicalRadio aggregator for Alexa.',
		content: 'Playing on JazzRadio',
		welcomePhrase: 'You\'re listening to Bass Jazz on JazzRadio',
		networkId: 'jazzradio',
		networkName: 'JAZZRADIO',
		channelId: 'bassjazz',
		channelName: 'Bass Jazz',
		url: 'https://d3ab9gomv8yjy8.cloudfront.net/jazzradio/bassjazz.pls?listen_key=32667ab0c34b7434f44a024c',
		image: {
			largeImageUrl: 'https://s3.amazonaws.com/cdn.dabblelab.com/img/alexa-card-lg.png',
			smallImageUrl: 'https://s3.amazonaws.com/cdn.dabblelab.com/img/alexa-card-sm.png'
		}
};

// BOILERPLATE
exports.handler = (event, context, callback) => {
	// debug only
	//console.log(JSON.stringify(event));
	var alexa = Alexa.handler(event, context, callback);
	
	alexa.registerHandlers(
			handlers,
			audioEventHandlers
	);
	
	alexa.execute();
};

// UTILITY FUNCTIONS
function findNetworkById(networkId) {
	return _.find(constants.networks, { 'id': networkId})
};

function filterChannelsByNetworkId(networkId) {
	return _.filter(constants.channels, function(o) { return o.id.indexOf(networkId) === 0; });
};

function updateStreamInfo(networkId, networkName, channelId, channelName) {
	streamInfo.networkId = networkId;
	streamInfo.networkName = networkName;
	streamInfo.channelId = channelId;
	streamInfo.channelName = channelName;
	streamInfo.title = channelName;
	streamInfo.content = "Playing on " + networkName;
	streamInfo.url = process.env.CLOUDFRONT_URL + "/" + networkId + "/" + channelId + ".pls?listen_key=" + process.env.LISTEN_KEY;
	streamInfo.welcomePhrase = 'You\'re listening to ' + channelName + " on " + networkName;
}

// HANDLERS
var handlers = {
		// CAN_FULFILL_INTENT_REQUEST INTERFACE START
		// NOT READY
//		'CanFulfillIntentRequest': function() {
//			var intentName = this.event.request.intent.name;
//			console.log("Can fulfill intent? ---> " + intentName);
//			var slots = this.event.request.intent.slots;
//			console.log("Can fulfill slots? ---> " + JSON.stringify(slots));
//			
//			this.response._responseObject.response["canFulfillIntent"] = {
//				"canFulfill": "YES",
//				"slots":{
//					"name": {
//						"canUnderstand": "YES",
//						"canFulfill": "YES"
//					}
//				}
//			};
//			this.emit(':responseReady');
//		},
		// CAN_FULFILL_INTENT_REQUEST INTERFACE END
		
		'LaunchRequest': function() {
			this.emit('Play');
		},
		// When user wants to play a random channel from all networks
		'PlayRandomChannel': function() {
			var rdnIndex = Math.floor((Math.random() * constants.channels.length));
			var channel = constants.channels[rdnIndex];
			
			var tokens = channel.id.split("-");
			var networkId = tokens[0];
			var networkName = findNetworkById(networkId).name.value;
			var channelId = tokens[1];
			var channelName = channel.name.value;
			
			updateStreamInfo(networkId, networkName, channelId, channelName);
			
			this.response.cardRenderer(streamInfo.title, streamInfo.content, streamInfo.image);
			
			this.emit('Play');
		},
		// When user wants to play a random channel from a specific network (DI, RadioTunes, ClassicalRadio...) 
		'PlayNetworkRandomChannel': function() {
			var iHeard = this.event.request.intent.slots.Network.value;
			var valueMatches = this.event.request.intent.slots.Network.resolutions.resolutionsPerAuthority[0].values;
			console.log(valueMatches);
			
			if (!valueMatches) {
				this.response.speak('Sorry, I couldn\'t find a network called ' + iHeard + ".");
				this.emit(':responseReady');
				return;
			}
			
			var networkId = valueMatches[0].value.id;
			var networkName = valueMatches[0].value.name;
			var channels = filterChannelsByNetworkId(networkId);
			var rdnIndex = Math.floor((Math.random() * channels.length));
			var channel = channels[rdnIndex];
			var channelId = channel.id.split("-")[1];
			var channelName = channel.name.value;
			
			updateStreamInfo(networkId, networkName, channelId, channelName);
			
			this.response.cardRenderer(streamInfo.title, streamInfo.content, streamInfo.image);
			
			this.emit('Play');
		},
		'Play': function() {
			// Using 'ssml-builder' to avoid errors with special characters in SSML, ex ampersand
			var speech = new Speech();
			speech.say(streamInfo.welcomePhrase);
			this.response.speak(speech.ssml(/*excludeSpeakTag=*/true)).audioPlayerPlay('REPLACE_ALL', streamInfo.url, streamInfo.url, null, 0);
			this.emit(':responseReady');
		},
		'ChangeChannel': function() {
			var iHeard = this.event.request.intent.slots.Channel.value;
			var valueMatches = this.event.request.intent.slots.Channel.resolutions.resolutionsPerAuthority[0].values;
			console.log(valueMatches);
			
			if (!valueMatches) {
				this.response.speak('Sorry, couldn\'t find a channel called ' + iHeard + ".");
				this.emit(':responseReady');
				return;
			}
			
			var slotValue = valueMatches[0].value;
			var tokens = slotValue.id.split("-");
			var networkId = tokens[0];
			var networkName = findNetworkById(networkId).name.value;
			var channelId = tokens[1];
			var channelName = slotValue.name;
			
			updateStreamInfo(networkId, networkName, channelId, channelName);
			
			this.response.cardRenderer(streamInfo.title, streamInfo.content, streamInfo.image);
			
			this.emit('Play');
		},
		'NowPlaying': function() {
			var currentlyPlayingUrl = findNetworkById(streamInfo.networkId).currentlyPlayingUrl;
			
			request.get(currentlyPlayingUrl, (error, response, body) => {
				if (error) {
					this.response.speak("Sorry, " + streamInfo.networkName + " was naughty-naughty when I tried to find out this information.");
					this.emit(':responseReady');
					return;
				}
				
				var whatIsPlayingInNetwork = JSON.parse(body);
				var whatIsPlayingInChannel = _.find(whatIsPlayingInNetwork, { 'channel_key' : streamInfo.channelId });
				if (!whatIsPlayingInChannel) {
					this.response.speak("Sorry, " + streamInfo.networkName + " was naughty-naughty when I tried to find out this information.");
					this.emit(':responseReady');
					return;
				}
				
				var track = whatIsPlayingInChannel.track;
				if (!track) {
					this.response.speak("Sorry, " + streamInfo.networkName + " was naughty-naughty when I tried to find out this information.");
					this.emit(':responseReady');
					return;
				}
				
				var speech = new Speech();
				speech.say("This is " + track.display_title).pause('250ms').say("by " + track.display_artist);
				this.response.speak(speech.ssml(/*excludeSpeakTag=*/true));
				this.emit(':responseReady');
			});
	    },
		'ChannelNowPlaying': function() {
			// Using 'ssml-builder' to avoid errors with special characters in SSML
			var speech = new Speech();
			speech.say(streamInfo.welcomePhrase);
			this.response.speak(speech.ssml(/*excludeSpeakTag=*/true));
			this.emit(':responseReady');
	    },
		'SessionEndedRequest': function() {
			// no session ended logic needed
		},
		'ExceptionEncountered': function() {
			console.log("\n---------- ERROR ----------");
			console.log("\n" + JSON.stringify(this.event.request, null, 2));
			this.callback(null, null)
		},
		'Unhandled': function() {
			this.response.speak('Sorry. Something went wrong.');
			this.emit(':responseReady');
		},

		
		// AUDIO PLAYER INTERFACE START
		'AMAZON.PauseIntent': function() {
			this.emit('AMAZON.StopIntent');
		},
		'AMAZON.ResumeIntent': function() {
			this.emit('Play');
		},
		'AMAZON.CancelIntent': function() {
			this.emit('AMAZON.StopIntent');
		},
		'AMAZON.LoopOffIntent': function() {
			this.emit('AMAZON.StartOverIntent');
		},
		'AMAZON.LoopOnIntent': function() {
			this.emit('AMAZON.StartOverIntent');
		},
		'AMAZON.NextIntent': function() {
			// We can't skip tracks but we can switch to another channel, decided to go to the next channel in the same network we're currently in
			var networkChannels = filterChannelsByNetworkId(streamInfo.networkId);
			var currChannelIndex = _.findIndex(networkChannels, { 'id': streamInfo.networkId+"-"+streamInfo.channelId });
			var nextChannelIndex = (currChannelIndex + 1) % networkChannels.length; // mod so we loop through the channels and don't get array out of bounds
			var nextChannel = networkChannels[nextChannelIndex];
			
			updateStreamInfo(streamInfo.networkId, streamInfo.networkName, nextChannel.id.split("-")[1], nextChannel.name.value);
			this.response.cardRenderer(streamInfo.title, streamInfo.content, streamInfo.image);
			this.emit('Play');
		},
		'AMAZON.PreviousIntent': function() {
			// We can't skip tracks but we can switch to another channel, decided to go to the previous channel in the same network we're currently in
			var networkChannels = filterChannelsByNetworkId(streamInfo.networkId);
			var currChannelIndex = _.findIndex(networkChannels, { 'id': streamInfo.networkId+"-"+streamInfo.channelId });
			var nextChannelIndex = (currChannelIndex - 1) % networkChannels.length; // mod so we loop through the channels and don't get array out of bounds
			var nextChannel = networkChannels[nextChannelIndex];
			
			updateStreamInfo(streamInfo.networkId, streamInfo.networkName, nextChannel.id.split("-")[1], nextChannel.name.value);
			this.response.cardRenderer(streamInfo.title, streamInfo.content, streamInfo.image);
			this.emit('Play');
		},
		'AMAZON.RepeatIntent': function() {
			this.response.speak('Sorry. I can\'t do that yet.');
			this.emit(':responseReady');
		},
		'AMAZON.ShuffleOffIntent': function() {
			this.emit('AMAZON.StartOverIntent');
		},
		'AMAZON.ShuffleOnIntent': function() {
			this.emit('AMAZON.StartOverIntent');
		},
		'AMAZON.StartOverIntent': function() {
			this.response.speak('Sorry. I can\'t do that yet.');
			this.emit(':responseReady');
		},
		// AUDIO PLAYER INTERFACE END
		
		// PLAYBACK CONTROLLER INTERFACE START
		'PlaybackController.NextCommandIssued' : function() {
	        //Your skill can respond to NextCommandIssued with any AudioPlayer directive.
			this.emit('AMAZON.NextIntent');
	    },
	    'PlaybackController.PauseCommandIssued' : function() {
	        //Your skill can respond to PauseCommandIssued with any AudioPlayer directive.
	    	this.emit('AMAZON.PauseIntent');
	    },
	    'PlaybackController.PlayCommandIssued' : function() {
	        //Your skill can respond to PlayCommandIssued with any AudioPlayer directive.
	    	this.emit('AMAZON.ResumeIntent');
	    },
	    'PlaybackController.PreviousCommandIssued' : function() {
	        //Your skill can respond to PreviousCommandIssued with any AudioPlayer directive.
	    	this.emit('AMAZON.PreviousIntent');
	    },
	    // PLAYBACK CONTROLLER INTERFACE END
		
		// OTHER BUILT-IN INTENTS START
		'AMAZON.StopIntent': function() {
			this.response.audioPlayerStop();
			this.emit(':responseReady');
		},
		'AMAZON.HelpIntent': function() {
			// skill help logic goes here
			this.emit(':responseReady');
		}
		// OTHER BUILT-IN INTENTS END
}

var audioEventHandlers = {
		'PlaybackStarted': function() {
			this.emit(':responseReady');
		},
		'PlaybackFinished': function() {
			this.emit(':responseReady');
		},
		'PlaybackStopped': function() {
			this.emit(':responseReady');
		},
		'PlaybackNearlyFinished': function() {
			this.response.audioPlayerPlay('REPLACE_ALL', streamInfo.url, streamInfo.url, null, 0);
			this.emit(':responseReady');
		},
		'PlaybackFailed': function() {
			this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
			this.emit(':responseReady');
		}
}
