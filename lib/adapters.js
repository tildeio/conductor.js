import Oasis from "oasis";
import inlineAdapter from "conductor/inline_adapter";

var adapters = {
  iframe: Oasis.adapters.iframe,
  inline: inlineAdapter
};

export default adapters;
