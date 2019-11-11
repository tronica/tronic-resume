import Controller             from '@ember/controller';
import { inject as service }  from '@ember/service';
import { computed }           from '@ember/object';
import { getOwner }           from '@ember/application';

export default Controller.extend({

  async:            service(),
  showLoadingView:  computed.alias('async.isLoading'),
  loadingMessages:  computed.alias('async.messages'),

  currentRoute: computed('currentRouteName', function () {
    const routeName = this.get('currentRouteName');
    return getOwner(this).lookup(`route:${routeName}`);
  }),

  showNavBar: computed('currentRoute', function () {
    const route = this.get('currentRoute');
    return route && route.get('showNavBar');
  })
});
