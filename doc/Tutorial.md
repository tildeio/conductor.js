# Card Authoring Tutorial

This 11-step tutorial will guide you through building a handful of cards in the
playground.  By the end of this tutorial you will know how to:

- create cards;
- load and use external resources in cards;
- compose cards and
- synchronize data between cards.

Each step in the tutorial has an associated git tag, for example
[tutorial-1](https://github.com/tildeio/conductor.js/commit/tutorial-1).
It is recommended that you checkout the corresponding tag as you read a section
and view the state of the cards in the browser.

In this tutorial we'll be building a very tiny app that shows the user a SuperBowl
ad and then asks them to rate the ad.  We'll have three cards: one for playing a
video through a third-party service (YouTube), one for showing a survey, and one
for coordinating the two.

##  Setup

Start by checking out the repository, installing grunt, and starting the server.

```sh
git clone git://github.com/tildeio/conductor.js.git
cd conductor.js

# Install grunt-cli
npm install -g grunt-cli

# Install conductor.js dependencies
npm install

# Start the server
grunt server
```

Now navigate to
[http://localhost:8000/example/playground/](http://localhost:8000/example/playground/).
At each step of the tutorial, it is recommended that you checkout that step's
tag, refresh the browser and open the analytics tab at the bottom of the page so
you can see the cross-card communication.

##  Step 1 - Hello World

[tutorial-1](https://github.com/tildeio/conductor.js/commit/tutorial-1) starts
us off with a simple hello world card.

In the containing environment we load the card via `conductor.load`.  The
playground does some more work for the sake of the UI: don't worry, we'll see
card loading when we get to nested cards.

In the card's js file we create the card with a call to `Conductor.card`.  This
connects the sandbox with the containing environment, and wires up services in
the containing environment to consumers in the card.

`activate` is invoked once the sandbox is fully initialized and all resources
have been loaded.

It will usually be necessary for cards to have their own consumers, but some
functionality is so common that Conductor.js provides it via a set of standard
service-consumer pairs.  One of these is the render service.  The `render`
function we pass to `Conductor.card` is invoked when the containing environment
asks the card to render itself.

##  Step 2 - Loading Dependencies

[tutorial-2](https://github.com/tildeio/conductor.js/commit/tutorial-2) shows us
how to use `Conductor.require` to load external resources like jQuery and
handlebars.

It's important to note that these resources are loaded asynchronously: they
won't be loaded right after the call to `Conductor.require`, but they'll be
available once your card is activated.

That's why we wait to compile the Handlebars template until `activate` is
invoked.

##  Step 3 - Finishing the Simple Survey Card

[tutorial-3](https://github.com/tildeio/conductor.js/commit/tutorial-3) finishes
the basic functionality of the survey card.  Now we can initially render a list
of grade options and switch to a report mode once the user has picked a grade.

##  Step 4 - Sending Events

[tutorial-4](https://github.com/tildeio/conductor.js/commit/tutorial-4) adds
events to the survey card: after all, our goal is to communicate between
sandboxed cards!

The card communicates with its parent environment through its card-specific
consumers passed to `Conductor.card`, as well as the standard consumers.

`consumers` is a map of *capability* names matched to consumer classes.
Normally we'd need to extend `Conductor.Oasis.Consumer`, as in the following:

```js
Conductor.card({
  consumers: {
    myCapability: Conductor.Oasis.Consumer.extend({
      requests: {
        // …
      },
      events: {
        // …
      }
    })
  }

  // …
});
```

However, we don't need to respond to events or requests from the containing
environment: we just need to establish a channel to send messages across.

Notice that the code to send the `surveyTaken` and `gradeChanged` events is
guarded by `card.consumers.survey`.  That's because consumers are not
necessarily connected: only consumers with capabilities specified by the
containing environment are connected.

When writing cards, some capabilities might be optional and others required.  If
you require capabilities, you should check for them in your card's `activate`
function.

You may have noticed that the analytics tab in the playground didn't show us our
events.  This is precisely because the playground hadn't provided the `survey`
capability via a service.


##  Step 5 - Responding to Child Card Events

[tutorial-5](https://github.com/tildeio/conductor.js/commit/tutorial-5) adds the
`survey` capability.  Now when we give a grade, we can see the events in the
analytics panel!

##  Step 6 - Creating a YouTube Wrapper Card

[tutorial-6](https://github.com/tildeio/conductor.js/commit/tutorial-6) is the
first step in creating a simple YouTube card so that we can use the YouTube
player API safely.

We already knew that `Conductor.require` would load additional JavaScript
resources, and here we can see that `Conductor.requireCSS` loads CSS resources.

Notice that the containing environment (the playground) loads data for our card
via `conductor.loadData`.  This data is passed to our card in `activate`.

##  Step 7 - Promises

[tutorial-7](https://github.com/tildeio/conductor.js/commit/tutorial-7) actually
loads the YouTube API.  It makes use of promises via
[RSVP](https://github.com/tildeio/rsvp.js) - a great way to handle asynchronous
resources in JavaScript.

It's important to note that because flash cannot yet be run in a sandboxed
`<iframe>`, you have to be logged in to YouTube and opted in to YouTube's [html5
beta program](http://youtube.com/html5) for this part of the tutorial.

##  Step 8 - Receiving Events in a Card

[tutorial-8](https://github.com/tildeio/conductor.js/commit/tutorial-8) adds a
consumer to our YouTube card, but this time we *do* want to respond to events
from our containing environment, so that it can remotely start the video.

It's important to note that the `play` event handler in the video consumer uses
`loadPlayer` to guard the call to `playVideo` behind a promise.  That's because
it's possible for consumers to receive events before a card is activated, and
certainly before external resources like the YouTube API have been loaded.

Try starting the video programmatically: in your browser console, run the
following:

```js
videoPort.send('play');
```

This will send the `play` event to our video consumer which will in response
start the player.  We can also see this event appear in the analytics tab.

Note that we put the video service's port in the global scope in the service
initializer: this is obviously not a best practice, it's done here for
convenience in the tutorial.

##  Step 9 - Nested Cards

[tutorial-9](https://github.com/tildeio/conductor.js/commit/tutorial-9) puts our
two cards together.  Much of this step should be familiar, but now we introduce
a card that has its own child cards.

This is common enough that there's a convenient shorthand: an array of
`childCards` can be passed to `Conductor.card`.  This will create a nested
`Conductor` and load each specified card.  Before the cards are loaded,
`loadDataForChildCards` is invoked and passed this card's data so you can
extract any data your child cards need.

##  Step 10 - Updating Child Card Data

[tutorial-10](https://github.com/tildeio/conductor.js/commit/tutorial-10) shows
us how to use the data service to inform child cards that their data has changed
so we can keep data in sync.

We've added a little UI widget that lets the user load either of two SuperBowl
ads, reusing the YouTube card.  All we need to do is make another call to
`conductor.loadData` - Conductor realizes the data has changed and informs the
child.

But the child card still needs to do something about it.

##  Step 11 - Responding to Data Changes

[tutorial-11](https://github.com/tildeio/conductor.js/commit/tutorial-11) is the
last step of our tutorial and completes the data synchronization picture.
Recall that when a card is initially created `activate` is called and passed the
initial data.  When the containing environment updates the data, the data
consumer invokes `didUpdateData` so your card can respond and stay in sync.

