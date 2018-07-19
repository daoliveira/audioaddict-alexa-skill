# AudioAddict Alexa Skill
Unofficial DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO and ClassicalRadio skill for Alexa.

## Introduction
This Alexa skill allows you to listen to 300+ streams from DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO and ClassicalRadio.

## Example Utterances (Using "my radio" as the skill invocation name)
> "Alexa, ask *my radio* to play Bossa Nova."
> "You're listening to Bossa Nova on JAZZRADIO."

> "Alexa, ask *my radio* what song is this."
> "This is The Girl from Ipanema by Frank Sinatra."

> "Alexa, ask *my radio* to play any channel from ClassicalRadio."
> "You're listening to Piano Works on ClassicalRadio."

> "Alexa, ask *my radio* to play anything."
> "You're listening to Top Hits on RadioTunes."

> "Alexa, ask *my radio* what is this station."
> "You're listening to Top Hits on RadioTunes."

> "Alexa, stop."
> (streaming stops)

> "Alexa, resume."
> "You're listening to Top Hits on RadioTunes." (streaming resumes)

> "Alexa, play Vocal Trance from *my radio*." (using the skill invocation name at the end is less reliable and Alexa might not understand the channel name)
> "You're listening to Vocal Trance on DI.FM."

> "Alexa, next."
> "You're listening to Chillout on DI.FM."

> "Alexa, previous."
> "You're listening to Vocal Trance on DI.FM."

## The Bad News
Alexa only supports audio streaming through HTTPS and DI.FM (and its sister networks) only provide audio streaming through HTTP.

## The Good News
We can set up an http-to-https proxy using AWS S3 and CloudFront. There's a cost though, if you're not in the Free Tier's first year, that would cost you roughly $0.10 per month.  

## What you'll need?
- A DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO and ClassicalRadio Premium subscription
- An AWS account 
- An Amazon Developer account

## Setting up the http-to-https proxy using AWS S3 and CloudFront

### AWS S3 Bucket Setup
1. From the AWS Console go to S3, click Create bucket, a Wizard pop up will open;
2. Choose a Bucket name and the Region closest to you in the first Step, click Next;
3. Keep all the defaults in the second step, click Next;
4. In the third step, under Manage public permissions, select Grant public read access to this bucket, click Next;
5. In the last screen, click Create bucket;
6. The bucket you just created should be  in the buckets list now, click on it.
7. Click the tab Properties and then on the "Static website hosting" card;
8. Click "Use this bucket to host a website";
9. Copy the "Endpoint" Url and save it for later
10. In the "Index document" field type index.html and under "Redirection rules" paste the following

```
<RoutingRules>
  <RoutingRule>
    <Condition>
      <KeyPrefixEquals>jazzradio/</KeyPrefixEquals>
    </Condition>
    <Redirect>
      <Protocol>http</Protocol>
      <HostName>listen.jazzradio.com</HostName>
      <ReplaceKeyPrefixWith>premium/</ReplaceKeyPrefixWith>
    </Redirect>
  </RoutingRule>
  <RoutingRule>
    <Condition>
      <KeyPrefixEquals>radiotunes/</KeyPrefixEquals>
    </Condition>
    <Redirect>
      <Protocol>http</Protocol>
      <HostName>listen.radiotunes.com</HostName>
      <ReplaceKeyPrefixWith>premium/</ReplaceKeyPrefixWith>
    </Redirect>
  </RoutingRule>
  <RoutingRule>
    <Condition>
      <KeyPrefixEquals>di/</KeyPrefixEquals>
    </Condition>
    <Redirect>
      <Protocol>http</Protocol>
      <HostName>listen.di.fm</HostName>
      <ReplaceKeyPrefixWith>premium/</ReplaceKeyPrefixWith>
    </Redirect>
  </RoutingRule>
  <RoutingRule>
    <Condition>
      <KeyPrefixEquals>rockradio/</KeyPrefixEquals>
    </Condition>
    <Redirect>
      <Protocol>http</Protocol>
      <HostName>listen.rockradio.com</HostName>
      <ReplaceKeyPrefixWith>premium/</ReplaceKeyPrefixWith>
    </Redirect>
  </RoutingRule>
  <RoutingRule>
    <Condition>
      <KeyPrefixEquals>classicalradio/</KeyPrefixEquals>
    </Condition>
    <Redirect>
      <Protocol>http</Protocol>
      <HostName>listen.classicalradio.com</HostName>
      <ReplaceKeyPrefixWith>premium/</ReplaceKeyPrefixWith>
    </Redirect>
  </RoutingRule>
</RoutingRules>
```

10. Click Save;
11. Before setting up CloudFront, check if the redirection is working by opening `<Endpoint Url from Step 9>/jazzradio/bassjazz.pls?listen_key=<Your DI.FM Listen Key>` in any streaming client, i.e VLC, iTunes, Windows Media Player, etc. The URL will look like: http://my-bucket-name.s3-website-us-east-1.amazonaws.com/jazzradio/bassjazz.pls?listen_key=78920bc0a43b8543a33a013f (You can obtain your Listen Key from DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO or ClassicalRadio websites under Player Settings, the same Listen Key is shared by all five);
12. If the stream is playing you can proceed to the next section.

### AWS CloudFront Setup
1. Back to AWS Console, navigate to CloudFront;
2. Click "Create Distribution";
3. Under Web click "Get Started";
4. In the "Origin Settings" section, field "Origin Domain Name" paste the Endpoint Url you saved from AWS S3 Bucket Setup - Step 9. IMPORTANT: DO NOT SELECT ANY SUGGESTED VALUES FROM THE DROP DOWN BOX, MAKE SURE TO PASTE THE ENDPOINT URL;
5. In the "Default Cache Behavior Settings", field "Query String Forwarding and Caching", select "Forward all, cache based on all" (this will make sure the listen_key parameter is passed forward)
6. In the Distribution Settings, Price Class, try to reduce it down to your location, as I'm connecting from Canada I selected Use Only U.S., Canada and Europe. I'm still not sure how much this affects pricing.
7. For the rest keep all the defaults and click "Create Distribution".
8. You'll see your new distribution under CloudFront Distribution, wait for the Status to change from In Progress to Deployed then move to the next step.
8. Before moving to deploying the Alexa skill, let's make sure the http-to-https redirection works. Double click the value under Domain Name to select your CloudFront distribution URL and copy this value;
9. Back to your streaming client, try to open `https://<Domain Name you copied from last step>/jazzradio/bassjazz.pls?listen_key=<Your DI.FM Listen Key>`, it should look like https://d7a2idjk9dhjd.cloudfront.net/jazzradio/bassjazz.pls?listen_key=78920bc0a43b8543a33a013f (this URL is just an example, don't use it, it's not a real CloudFront URL and Listen Key)
10. If there's sound coming from your streaming client you can move to the next section.
11. It goes without saying you shouldn't share your CloudFront URL, unless you're OK with the costs associated with other people's traffic through your CloudFront Distribution.

## Deploying AWS Lambda function and Alexa Skill
When I started writing this guide my idea was to have steps for setting up the AWS Lambda function and Alexa Skill manually through AWS and Amazon Developer web UIs. As the skill's interaction model grew in number of intents, utterances, slot types and values, it became clear that setting this up manually would be painful and extremely error prone. That's why we're using the good old command line to automate things for us.
1. [Install GIT](https://git-scm.com/downloads) if you haven't already and clone this project OR download this project directly using this [link](https://github.com/daoliveira/the-big-five/archive/master.zip)
2. Use a version manager to install Node.js and npn, follow the instructions [here](https://docs.npmjs.com/getting-started/installing-node#using-a-version-manager-to-install-nodejs-and-npm)
3. After installation open a Terminal and try both commands

```
$ node -v
v10.6.0

$ npm -v
6.1.0
``` 

4. Notice that the node version is higher then what is supported by AWS Lambda right now (v8.10). We have to fix that by issuing `$nvm install 8.10`. Now `$ node -v` should return v8.10.0
5. Install ASK CLI following this [guide](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html). When issuing `$ ask init` choose the "Yes. Set up the AWS credentials" and enter your AWS Access Key ID and AWS Secret Access Key, instructions on how to obtain these keys [here](https://developer.amazon.com/docs/smapi/set-up-credentials-for-an-amazon-web-services-account.html)
6. Navigate to the lambda/streamer directory of the project you cloned or downloaded in Step 1 and run `$ npm install`.
7. Navigate to the root directory of the project (the-big-five) and run `$ ask deploy`. This will deploy the AWS Lambda function and the Skill interaction models.
8. Before start talking to Alexa, we have to set up a couple of environment variables in the AWS Lambda web UI.
9. From the AWS Console, navigate to Lambda.
10. Click on the recently created ask-custom-streamer-default Lambda Function.
11. Scroll down to "Environment variables" add the following key-value pairs:

```
CLOUDFRONT_URL			https://<CloudFront Domain Name>
LISTEN_KEY			<Your DI.FM Listen Key>
```

example (the values below are just an example, not a real CloudFront URL and DI.FM Listen Key):

```
CLOUDFRONT_URL			https://d7a2idjk9dhjd.cloudfront.net
LISTEN_KEY			78920bc0a43b8543a33a013f
```

12. Click Save
13. We can test this Lambda function to make sure everything is working so far.
14. At the top, in the "Select a test event..." dropdown, select "Configure test events"
15. In the "Event template" dropdown, select "Alexa Start Session", in Event name you can type AlexaStartSession
16. Click Create at the bottom
17. You should be back to the main screen with AlexaStartSession selected in the dropdown. Click Test.
13. You should get a green card saying "Execution result: succeeded".
14. You look at your Echo and say "Alexa, ask *my radio* to play any channel from ClassicalRadio."
15. To play with the Skill invocation, intents and utterances go to developer.amazon.com/alexa/console/ask

## To Do List
- [ ] Integrate with DI.FM Favorites list (figure out if there's a public API for that and how we'd benefit from it, maybe "Alexa, ask *my radio* to play any channel from my favorites" or "Alexa, ask *my radio* to play any channel from ClassicalRadio's favorites" then "Alexa, next/previous." would navigate in the favorites list only)
- [ ] Add more exploration. "You're listening to New Age on RadioTunes." "Alexa, ask *my radio* if there are any similar channels." "I'd suggest World, Nature or Vocal New Age channels."
- [ ] Implement name-free interaction (CanFulfillIntentRequest) so we can say things like "Alexa, play Tech House station." and Alexa directs the intent to this skill (not sure how to do this, this became available to dev recently and documentation is still blurry)
- [ ] Multi-room playback. **Not available to skill developers, only Amazon's inner circle.**
- [ ] Implement "Alexa, what song is this?" (without skill invocation name).  **Not available to skill developers, only Amazon's inner circle.** From Dev forums people believe that NowPlaying should be part of the AudioPlayer interface (like AMAZON.PauseIntent, AMAZON.NextIntent, etc) but according to Amazon this is not supported yet (https://forums.developer.amazon.com/questions/70131/alexa-whats-playing-custom-information.html).
- [ ] Enable UI controls (play, pause, next, previous) like the ones that show up on alexa.amazon.com when you stream from TuneIn, Spotify or Amazon Music (not sure how to do this)
