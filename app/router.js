import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('landing', { path: '/' });
  this.route('renderer', { path: 'renderer/:render_id' });
  this.route('editor');
});

export default Router;
