import Component              from '@ember/component';

const REFS = {};

export default Component.extend({
  init(name) {
    this._super();

    if (!name) {
      throw new Error('Singleton component must be named');
    }

    if (REFS[name]) {
      throw new Error('Singleton component cannot be instanciated more than once');
    }

    REFS[name] = true;
  }
});
