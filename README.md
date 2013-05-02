# Conductor.js

Conductor.js is a library for creating sandboxed, re-usable apps that
can be embedded inside a host application.

The advantage of using Conductor.js over a standard `<iframe>` is that
it uses a well-defined set of events that allow the app and its host
environment to communicate. Because of this, apps from different vendors
can be embedded securely, yet still interact in meaningful ways.

## Understanding Conductor.js

To understand the benefit of architecting your application using
Conductor, let's look at an example use case.

Imagine that you are authoring a next-generation banking web
application. When your customers visit their account online, you would
like to present them with a list of their most recent transactions:

![Wireframe of a hypothetical banking application where transactions are
presented as a simple list, showing transaction date, merchant name and
transaction value](doc/images/awesomebank-boring.png)

This is fine, but is the same as every other bank. You, being a
next-generation, technology-driven bank, want to make this data more
meaningful to your customers. Most transactions have some metadata
associated with them. What if you could allow merchants to customize how
their transactions appeared?

![Wireframe of a hypothetical banking application where transactions are
presented in a rich way, including a logo of the merchant, and
additional metadata. The first transaction is from a fast food
restaurant and includes the patron's order in the transaction display.
The second transaction is from an airline and shows the flight origin
and destination, as well as the customer's frequent flyer member number
and point balance. The last transaction is from a hotel chain that shows
the check-in and check-out date as well as the customer's reward points
balance.](doc/images/awesomebank-awesome.png)

Obviously, you could write custom code for each merchant that might have
a transaction go through your bank. But there are many merchants in the
world, and you would most likely only have the resources to customize
the most popular.

The better option is to have each merchant write and maintain their own
transaction card. But how do you run that code in a way that doesn't
make your customers' private financial data vulnerable to attack?

Running the code directly is out of the question. Normally, you might
just create an `<iframe>` for each item in the transaction. That's fine,
but how do provide information about the transaction to each transaction
card? And what if you want to get information _out_ of the card?

For example, imagine we wanted to group transactions by type. Instead of
guessing, we could ask each transaction what category it belongs to,
then show the user only travel-related transactions, for example.

Conductor.js allows you to define interfaces between a host environment
and the cards that run inside of it, without having to write messy and
brittle transports over `postMessage`.

Cards are also designed to be run on the server, so they can be indexed
and otherwise manipulated without having to create a memory- and
CPU-intensive virtual browser.

And, because cards are run inside either iframes or Web Workers, they
cannot get access to any data that is not explicitly provided.

The above example is just one use for Conductor.js. There are many
different scenarios where being able to embed secure, third-party code
can allow you to build a platform of re-usable components that can
interact with their host environment.

## Authoring Conductor.js Cards

A _card_ is an application that can be embedded in a parent environment
using Conductor.js. The entry point to a card is a single JavaScript
file, although the main file may load other resources asynchronously.

At its most basic, your card should call the `Conductor.card` method.
The object passed to `Conductor.card` defines the behavior of the card,
and contains callbacks and other hooks that will be invoked in response
to requests from the containing environment.

For example, the `activate` hook is invoked automatically once all
dependencies have finished loading, and communication with the parent
environment has been set up:

```js
Conductor.card({
  activate: function() {
    this.alert("Hello!")
  }
});
```

### Loading Dependencies

While a card starts off as a single JavaScript file, it can load
additional javascript dependencies by using the `Conductor.require` method:

```js
Conductor.require('alert.js');
```

Note that files loaded via `Conductor.require` are loaded
**asynchronously**. That means that, assuming the `Model` class was
defined in `models.js`, this **would not work**:

```js
Conductor.require('models.js');
var person = new Model();
```

Make sure you only access dependencies once the card's `activate` method
has been called:

```js
Conductor.require('alert.js');

function createModel() {
  var person = new Model();
}

Conductor.card({
  activate: function() {
    createModel();
  }
});
```
You can include CSS files in your card using the `Conductor.requireCSS` method:

```js
Conductor.requireCSS('card.css');
```

The path is relative to the card.

### Tutorial

Learn more about authoring cards in [the tutorial](doc/Tutorial.md).

## Build Tools

Conductor.js uses [Grunt](http://gruntjs.com/) to automate building and
testing. 

### Setup

Before you use any of the commands below, make sure you have
installed node.js, which includes npm, the node package manager.

If you haven't before, install the `grunt` CLI tool:

```sh
$ npm install -g grunt-cli
```

This will put the `grunt` command in your system path, allowing it to be
run from any directory.

Next, install Conductor's dependencies:

```sh
$ npm install
```

This will install all of the packages that Conductor's Gruntfile relies
on into the local `node_modules` directory.

### Building

Conductor is available as either as an AMD module, or as a more
traditional distribution that exports the global variable `Conductor`.
To build both versions, run:

```
grunt build
```

You can find the built versions of the library in the `dist` directory.

### Tests

Run the Conductor tests by starting a test server:

```
grunt server
```

Once the server is running, visit `http://localhost:8000` in your
browser. Conductor will automatically be rebuilt if you make any changes
to its constituent files while the server is running.
