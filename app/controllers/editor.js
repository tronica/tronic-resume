import Controller             from '@ember/controller';
import { inject as service }  from '@ember/service';
import { computed }           from '@ember/object';

export default Controller.extend({
  gdrive: service(),

  files: computed('gdrive.files', function () {
    return JSON.stringify(this.get('gdrive.files'));
  })
});
