# The Big Five
A DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO and ClassicalRadio aggregator for Alexa.

# Introduction
This Alexa skill allows you to listen to 300+ streams from DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO and ClassicalRadio.

# Example Utterances (Using "my radio" as the skill invocation name)
- Alexa, ask *my radio* to play Bossa Nova.
- You're listening to Bossa Nova on JAZZRADIO.

- Alexa, ask *my radio* what song is this.
- This is The Girl from Ipanema by Frank Sinatra.

- Alexa, ask *my radio* to play any channel from ClassicalRadio.
- You're listening to Piano Works on ClassicalRadio.

- Alexa, ask *my radio* to play anything.
- You're listening to Top Hits on RadioTunes.

- Alexa, ask *my radio* what is this station.
- You're listening to Top Hits on RadioTunes.

- Alexa, stop.
- (streaming stops)

- Alexa, resume.
- You're listening to Top Hits on RadioTunes. (streaming resumes)

- Alexa, play Vocal Trance from *my radio*. (using the skill invocation name at the end is less reliable and Alexa might not understand the channel name)
- You're listening to Vocal Trance on DI.FM.

- Alexa, next.
- You're listening to Chillout on DI.FM.

- Alexa, previous.
- You're listening to Vocal Trance on DI.FM.


# The Bad News
Alexa only supports audio streaming through HTTPS and DI.FM (and its sister networks) only provide audio streaming through HTTP.

# The Good News
We can set up an http-to-https proxy using AWS S3 and CloudFront. There's a cost though, if you're not in the Free Tier's first year, that would cost you roughly $0.10 per month.  

# What you'll need?
- A DI.FM, RadioTunes, ROCKRADIO, JAZZRADIO and ClassicalRadio Premium subscription
- An AWS account 
- An Amazon Developer account

# Setting up the http-to-https proxy using AWS S3 and CloudFront
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras justo libero, placerat id sapien ac, laoreet dictum lacus. Cras tempus sit amet erat non consequat. Quisque aliquam, purus at scelerisque gravida, erat nunc ultrices tortor, eget dapibus augue velit in tellus. Donec vel eros tempus, tempor sapien vitae, interdum justo. Integer sed tortor in odio hendrerit luctus. Mauris vitae dapibus nisl, non accumsan erat. 

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

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec nisi risus, cursus at eros id, pellentesque porttitor odio. Nullam placerat vehicula lectus luctus vestibulum. Aliquam tristique, nisl eget ornare maximus, mi leo feugiat tellus, ac pellentesque nibh purus eget leo. Etiam facilisis, urna eu pharetra dapibus, nisl sem hendrerit arcu, id dignissim risus eros a neque. Donec ultrices tincidunt sem, a placerat quam posuere et. Aliquam a cursus ex, vitae eleifend nibh.

# Creating the AWS Lambda function
Sed viverra tellus at imperdiet mollis. Nullam auctor, dolor ac malesuada aliquet, leo quam iaculis orci, a egestas mauris justo et nibh. Sed fringilla consectetur nisl, id commodo magna fermentum in. Donec imperdiet quis urna quis accumsan. Aliquam blandit non eros a consectetur. Donec et venenatis urna, ut consequat ex. Nullam eget ipsum ante. Nulla tempor nibh sit amet nulla imperdiet, sed rutrum nulla sollicitudin. Morbi quis nisl tempor, efficitur ante eu, porta erat. Quisque eget tristique orci. Nulla vitae accumsan diam. Donec arcu tellus, viverra a cursus finibus, auctor vel magna. Phasellus eget ligula sed orci fringilla fermentum. Nullam auctor sapien vitae nulla euismod, non suscipit mi porttitor.

# Creating the Alexa skill
Sed viverra tellus at imperdiet mollis. Nullam auctor, dolor ac malesuada aliquet, leo quam iaculis orci, a egestas mauris justo et nibh. Sed fringilla consectetur nisl, id commodo magna fermentum in. Donec imperdiet quis urna quis accumsan. Aliquam blandit non eros a consectetur. Donec et venenatis urna, ut consequat ex. Nullam eget ipsum ante. Nulla tempor nibh sit amet nulla imperdiet, sed rutrum nulla sollicitudin. Morbi quis nisl tempor, efficitur ante eu, porta erat. Quisque eget tristique orci. Nulla vitae accumsan diam. Donec arcu tellus, viverra a cursus finibus, auctor vel magna. Phasellus eget ligula sed orci fringilla fermentum. Nullam auctor sapien vitae nulla euismod, non suscipit mi porttitor.

# To Do List / Help Needed
- Implement name-free interaction (CanFulfillIntentRequest) so we can say things like "Alexa, play Tech House station." and Alexa directs the intent to this skill (not sure how to do this, this became available to dev recently and documentation is still blurry)
- Enable UI controls (play, pause, next, previous) like the ones that show up on alexa.amazon.com when you stream from TuneIn, Spotify or Amazon Music (not sure how to do this)
- Implement "Alexa, what song is this?" (without skill invocation name). From Dev forums people believe that NowPlaying should be part of the AudioPlayer interface (like AMAZON.PauseIntent, AMAZON.NextIntent, etc) but according to Amazon this is not supported yet (https://forums.developer.amazon.com/questions/70131/alexa-whats-playing-custom-information.html).
