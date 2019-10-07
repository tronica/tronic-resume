import Route                  from '@ember/routing/route';
import { inject as service }  from '@ember/service'

export default Route.extend({

  gdrive: service(),
  async: service(),
  intl: service(),

  run(job) {
    return this.get('async').runTask(
      this.intl.t('async.google_sign_in'),
      job
    );
  },

  beforeModel() {
    const drive = this.get('gdrive');

    if (!drive.isSignedIn()) {
      return this.run(() => drive.signin());
    }

    return this.run(() => drive.ready());
  },

  setupController(controller) {
    controller.on && controller.on();
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.off && controller.off();
    }
  }
});
