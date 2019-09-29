import { computed }                   from '@ember/object';
import { run }                        from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

export default Service.extend({

  intl: service(),

  tasks: [],

  init() {
    this._super(...arguments);
    this.set('counter', 0);
  },

  isLoading: computed('tasks.[]', function() {
    return this.get('tasks.length') > 0;
  }),

  // counter: computed('tasks.length', function () {
  //   return this.get('tasks.length');
  // }),

  messages: computed('tasks.[]', function () {
    return this.get('tasks').mapBy('text').uniq();
  }),

  async runTask(text, job) {
    run(async () => {
      if (typeof text !== 'string') {
        job = text;
        text = this.intl.t('async.default_loading');
      }

      if (typeof job === 'function') {
        return this.runTask(text, job());
      }

      const tasks = this.get('tasks');
      const ref = { text };

      try {
        tasks.pushObject(ref);
        await job;
        tasks.removeObject(ref);
      } catch(e) {
        tasks.removeObject(ref);
        throw e;
      }
    });
  }
});
