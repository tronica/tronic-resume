import Component    from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  expandableList: computed('list', 'list.{[],@each}', function () {
      return this.get('list')
        .rejectBy('archived')
        .map(record => {
          return {
            record,
            expanded: !record.id // we expand new ones
          };
        });
    })
});