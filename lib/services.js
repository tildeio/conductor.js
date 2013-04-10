/**
  Default Conductor services provided to every conductor instance.
*/
Conductor.services = {
  xhr: Conductor.XHRService,
  metadata: Conductor.MetadataService,
  assertion: Conductor.AssertionService,
  render: Conductor.RenderService,
  lifecycle: Conductor.LifecycleService,
  data: Conductor.DataService
};
