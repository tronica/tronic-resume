import Mixin                  from '@ember/object/mixin';
import { inject as service }  from '@ember/service';

export default Mixin.create({

  async: service(),

  run(...args) {
    return this.get('async').runTask(...args);
  }

});
