import Oasis from "oasis";
import { services } from "conductor/services";
import { copy } from "conductor/lang";
import { a_indexOf } from "oasis/shims";

function ConductorCapabilities() {
  this.capabilities = [
    'xhr', 'metadata', 'render', 'data', 'lifecycle', 'height',
    'nestedWiretapping' ];
  this.services = copy(services);
}

ConductorCapabilities.prototype = {
  defaultCapabilities: function () {
    return this.capabilities;
  },

  defaultServices: function () {
    return this.services;
  },

  addDefaultCapability: function (capability, service) {
    if (!service) { service = Oasis.Service; }
    this.capabilities.push(capability);
    this.services[capability] = service;
  },

  removeDefaultCapability: function (capability) {
    var index = a_indexOf.call(this.capabilities, capability);
    if (index !== -1) {
      return this.capabilities.splice(index, 1);
    }
  }
};

export default ConductorCapabilities;
