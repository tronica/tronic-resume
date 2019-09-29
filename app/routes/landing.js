import Route from '@ember/routing/route';

export default Route.extend({

  setupController(controller) {
    controller.set('signInError', false);
  }

});
