import Controller                   from '@ember/controller'
import { inject as service }        from '@ember/service'
import { computed }                 from '@ember/object'

export default Controller.extend({
  intl:       service(),

  init() {
    this._super(...arguments);
  },

  resume: computed.alias('model'),

  themeName: computed('resume.theme.name', function() {
    return this.get('resume.theme.name').toLowerCase();
  }),

  themePath: computed('themeName', function() {
    return `themes/${this.get('themeName')}`;
  })
});
