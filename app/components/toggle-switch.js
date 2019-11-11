import Component  from '@ember/component';
import { run }    from '@ember/runloop';
import _          from 'lodash'

export default Component.extend({
  attributeBindings: ["value"],
  disabled: false,

  init() {
    this._super(...arguments);
    this.addObserver("value", () => {
      run.next(this, function () {
        const val = this.get("value");
        this.getWithDefault("on-change", _.noop)(val);
      });
    });
  }
});
