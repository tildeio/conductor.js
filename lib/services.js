import AssertionService from "conductor/assertion_service";
import XhrService from "conductor/xhr_service";
import RenderService from "conductor/render_service";
import MetadataService from "conductor/metadata_service";
import DataService from "conductor/data_service";
import LifecycleService from "conductor/lifecycle_service";
import HeightService from "conductor/height_service";
import NestedWiretappingService from "conductor/nested_wiretapping_service";

/**
  Default Conductor services provided to every conductor instance.
*/
export var services = {
  xhr: XhrService,
  metadata: MetadataService,
  assertion: AssertionService,
  render: RenderService,
  lifecycle: LifecycleService,
  data: DataService,
  height: HeightService,
  nestedWiretapping: NestedWiretappingService
};

export var capabilities = [
  'xhr', 'metadata', 'render', 'data', 'lifecycle', 'height',
  'nestedWiretapping'
];
