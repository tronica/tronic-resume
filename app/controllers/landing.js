import Controller             from '@ember/controller';
import { inject as service }  from '@ember/service';

export default Controller.extend({

  store: service(),
  intl: service(),
  async: service(),
  gdrive: service(),
  signInError: false,

  actions: {
    signIn() {
      const msg = this.intl.t('async.google_sign_in');
      const job = async () => {
        try {
          await this.get('gdrive').signin();
          this.transitionToRoute('editor');
        } catch (e) {
          this.set('signInError', true);
        }
      };

      this.set('signInError', false);
      this.get('async').runTask(msg, job);
    }
  }

});
