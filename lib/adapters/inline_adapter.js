import { extend } from "oasis/util";
import OasisInlineAdapter from "oasis/inline_adapter";

var InlineAdapter = extend(OasisInlineAdapter, {
  wrapResource: function (data, oasis) {
    var functionDef = 
      'var _globalOasis = window.oasis; window.oasis = oasis;' +
      'try {' +
      data +
      ' } finally {' +
      'window.oasis = _globalOasis;' +
      '}';
    return new Function("oasis", functionDef);
    }
});

var inlineAdapter = new InlineAdapter();

inlineAdapter.addUnsupportedCapability('height');

export default inlineAdapter;
