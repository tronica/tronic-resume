import EmberObject, { computed }      from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { A }                          from '@ember/array';
import _                              from 'lodash';

export default Service.extend({

  intl: service(),

  init() {
    this._super(...arguments);
    this.set('tasks', A([]));
  },

  isLoading: computed('tasks.[]', function() {
    return this.get('tasks.length') > 0;
  }),

  messages: computed('tasks.[]', function () {
    return this.get('tasks').mapBy('text').uniq();
  }),

  defaultText: computed(function () {
    return this.intl.t('async.default_loading');
  }),

  t(text) {
    const translation = _.chain([ text, `async.${text}`])
      .map(key => this.intl.exists(key) && this.intl.t(key))
      .filter(_.isString)
      .first()
      .value();
    
    return translation || text;
  },

  async runTask(text, job) {
    if (!_.isString(text)) {
      job = text;
      text = this.get('defaultText');
    }

    if (_.isFunction(job)) {
      return this.runTask(text, job());
    }

    const tasks = this.get('tasks');
    const ref = EmberObject.create({ text: this.t(text) });

    tasks.pushObject(ref);

    try {
      const res = await job;
      tasks.removeObject(ref);
      return res;
    } catch(e) {
      tasks.removeObject(ref);
      throw e;
    }
  }
});
