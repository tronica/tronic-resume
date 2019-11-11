import SingletonComponent     from './base/singleton';
import { inject as service }  from '@ember/service';
import { computed }           from '@ember/object';

export default SingletonComponent.extend({
  messageBox: service(),

  init() {
    this._super('confirm-modal');
  },

  show:       computed.alias('messageBox.showConfirmModal'),
  title:      computed.alias('messageBox.confirmTitle'),
  body:       computed.alias('messageBox.confirmBody'),
  onConfirm:  computed.alias('messageBox.onConfirm'),
  onCancel:   computed.alias('messageBox.onCancel')
});
