import Service      from '@ember/service';
import { defer }    from 'rsvp';

export default Service.extend({

  confirm({ title = '', body = '' }) {
    const deferred = defer();

    const result = (val) => {
      deferred.resolve(val);
      this.set('showConfirmModal', false);
    }

    this.set('showConfirmModal', true);
    this.set('confirmTitle', title);
    this.set('confirmBody', body);
    this.set('onConfirm', () => {
      this.set('onConfirm', null);
      result(true);
    });

    this.set('onCancel', () => {
      this.set('onCancel', null);
      result(false);
    });

    return deferred.promise;
  }

});
