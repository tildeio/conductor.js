# Conductor.js

Conductor.js is a library for creating sandboxed, re-usable apps that
can be embedded inside a host application.

The advantage of using Conductor apps over a standard `<iframe>` is that
they use a well-defined set of events to allow the app and its host
environment to communicate. Because of this, many different apps from
different vendors can be embedded on the same page and interact in
meaningful ways.
