import Service        from '@ember/service';
import { computed }   from '@ember/object';
import ENV            from '../config/environment';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.set('selectedTheme', this.get('all.firstObject'))
  },

  all: computed(function () {
    return ENV.APP.THEMES.map((theme, idx) => ({
      ...theme,
      id: idx + 1
    }))
  })
});
