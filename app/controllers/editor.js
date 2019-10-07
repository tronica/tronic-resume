import Controller               from '@ember/controller'
import { inject as service }    from '@ember/service'
import EmberObj, { computed }   from '@ember/object'
import RSVP                     from 'rsvp'
import Async                    from '../mixins/async'
import { debounce }             from '@ember/runloop'

export default Controller.extend(Async, {
  gdrive: service(),

  init() {
    this._super(...arguments);
    this.set('model', null);
    this.set('tabs', [
      EmberObj.create({ name: 'edit',    enabled: true,  icon: 'edit' }),
      EmberObj.create({ name: 'preview', enabled: false, icon: 'desktop' })
    ]);
  },

  mode: computed('tabs.@each.enabled', function () {
    const name = this.get('tabs').findBy('enabled', true).get('name');
    return {
      name:     name,
      edit:     name === 'edit',
      preview:  name === 'preview'
    }
  }),

  resource(name) {
    return this.get('gdrive').resource(name);
  },

  async getResume() {
    const res = this.resource('resumes');
    return (await res.first()) || (await res.create({}));
  },

  fetchModel() {
    return this.run('loading_resume', async () => {
      const resume = await this.getResume();
      return RSVP.hash({
        info: resume,
        jobs: this.resource('jobs').find({ resumeId: resume.id })
      });
    });
  },

  async save() {
    this.set('saving', true);
    this.set('saveError', false);
    try {
      await this.resource('resumes').upsert(this.get('resume.info'));
    } catch (e) {
      this.set('saveError', true);
    } finally {
      this.set('saving', false);
    }
  },

  async on() {
    this.set('saveError', false);
    this.set('isEditing', true);
    this.set('isViewing', false);
    this.set('resume', await this.fetchModel());
  },

  off() {
    this.set('resume', null);
  },

  actions: {
    selectTab(tab) {
      this.get('tabs').forEach(t => {
        t.set('enabled', tab == t);
      });
    },

    persist() {
      debounce(this, this.save, 1000);
    }
  }
});
