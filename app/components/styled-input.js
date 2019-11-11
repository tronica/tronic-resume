import _          from 'lodash';
import Component  from '@ember/component';

export default Component.extend({

  init() {
    this._super(...arguments);
    this.set('html', this.get('value'));
  },

  actions: {
    setHTML(quill) {
      this.send('setValue', quill.root.innerHTML);
    },

    selectOption({ id }) {
      this.send('setValue', this.get('options').findBy('id', id));
    },

    setValue(value) {
      this.set('value', value);
      this.send('notifyChange');
    },

    notifyChange() {
      this.getWithDefault('on-change', _.noop)();
    }
  }
});
