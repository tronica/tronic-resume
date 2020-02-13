import Controller                   from '@ember/controller'
import { inject as service }        from '@ember/service'
import EmberObj, { computed, set }  from '@ember/object'
import RSVP                         from 'rsvp'
import _                            from 'lodash'
import Async                        from '../mixins/async'
import { debounce }                 from '@ember/runloop'

export default Controller.extend(Async, {
  gdrive:     service(),
  messageBox: service(),
  intl:       service(),
  themes:     service(),

  init() {
    this._super(...arguments);
    this.set('model', null);
    this.set('tabs', [
      EmberObj.create({ name: 'info',       enabled: true }),
      EmberObj.create({ name: 'jobs',       enabled: false }),
      EmberObj.create({ name: 'studies',    enabled: false }),
      EmberObj.create({ name: 'preview',    enabled: false, beforeEnter: 'prepareRender' })
    ]);
  },

  tabIdx: computed('tabs.@each.enabled', function () {
    return this.get('tabs').findIndex(t => t.enabled);
  }),

  nextTab: computed('tabIdx', function () {
    return this.get('tabs')[this.get('tabIdx') + 1];
  }),

  previousTab: computed('tabs.@each.enabled', function () {
    const tabs  = this.get('tabs');
    const idx   = this.get('tabIdx');

    return idx === 0 ? null : tabs[idx - 1];
  }),

  readFrameHTML() {
    return window.frames[this.get('renderId')].contentDocument.documentElement.innerHTML;
  },

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
        jobs: this.resource('jobs').find({ resumeId: resume.id }),
        studies: this.resource('studies').find({ resumeId: resume.id })
      });
    });
  },

  persistRecord(record) {
    const records = _.flatten([
      _.isString(record) ? this.get(record) : record
    ]);
    return {
      to: async (resource) => {
        const db = this.resource(resource);
        for (let i = 0; i < records.length; ++i) {
          let obj = records[i];
          let res = await db.upsert(obj);
          _.extend(obj, res);
        }
      }
    }
  },

  prepareRender() {
    const renderId = Date.now().toString(24);

    window.localStorage.setItem('renders', JSON.stringify({
      [renderId]: {
        theme: this.get('themes.selectedTheme'),
        info: this.get('resume.info'),
        jobs: this.get('resume.jobs').rejectBy('archived'),
        studies: this.get('resume.studies').rejectBy('archived')
      }
    }));

    this.set('renderId', renderId);
  },

  async save() {
    this.set('saving', true);
    this.set('saveError', false);
    try {
      await this.persistRecord('resume.info').to('resumes');
      await this.persistRecord('resume.jobs').to('jobs');
      await this.persistRecord('resume.studies').to('studies');
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
        const enabled = tab == t;
        t.set('enabled', enabled);

        if (enabled && t.get('beforeEnter')) {
          this.send(t.get('beforeEnter'));
        }
      });
    },

    persist() {
      debounce(this, this.save, 1000);
    },

    async addJob() {
      this.get('resume.jobs').pushObject({
        resumeId: this.get('resume.info.id')
      });
    },

    async addStudy() {
      this.get('resume.studies').pushObject({
        resumeId: this.get('resume.info.id')
      });
    },

    async archiveRecord(record) {
      const proceed = await this.get('messageBox').confirm({
        body: this.get('intl').t('form.job.modal.confirm_delete_body')
      });

      if (proceed) {
        set(record, 'archived', true);
        this.send('persist');
      }
    },

    prepareRender() {
      this.prepareRender();
    }
  }
});
