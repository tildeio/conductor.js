# API Wrapper Issues

Some APIs cannot trivially be sandboxed.  Here are some known issues with
sandboxing APIs in Conductor cards.

## General Issues

### Plugins

Plugins such as flash are a likely source of sandboxing issues.  Sandboxing does
not prevent plugin execution *per se*.  Sandboxes are disabled:
> [when] a plugin is to be instantiated but it cannot be secured
and a plugin can be secured if it can be made to honor the iframe sandbox
attribute.

Since flash cannot be configured to honor the iframe sandbox attribute, it
cannot currently be run in a Conductor card.

## YouTube

Users can play sandboxed youtube videos provided they are:

  - logged in
  - opted in to the [html5 beta program](http://youtube.com/html5)

Unfortunately the youtube html5 iframe API is less reliable for the html5
player.
