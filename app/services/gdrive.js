// @ts-nocheck
import $                              from 'jquery';
import ENV                            from '../config/environment';
import { defer }                      from 'rsvp';
import Service, { inject as service } from '@ember/service';
import SheetDB                        from '../db/sheet-db';

const ONLOAD_HANDLER = 'gapiReady';

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  "https://sheets.googleapis.com/$discovery/rest?version=v4"
];

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

const SCRIPT_URL = `https://apis.google.com/js/api.js?onload=${ONLOAD_HANDLER}`;

const FILE_NAME = 'tronic-resume.sheet';

export default Service.extend({

  intl: service(),
  async: service(),

  init() {
    this._super(...arguments);
    this.set('deferredLoad', defer());

    window[ONLOAD_HANDLER] = this.onScriptLoad.bind(this);

    $.getScript(SCRIPT_URL);
  },

  onScriptLoad() {
    const gapi = window['gapi'];
    this.set('gapi', gapi);

    gapi.load('client:auth2', async () => {

      try {
        await gapi.client.init({
          apiKey: ENV.DRIVE_API_KEY,
          clientId: ENV.DRIVE_API_CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        });

        this.get('deferredLoad').resolve();
      } catch (e) {
        this.get('deferredLoad').reject(e);
      }
    });
  },

  updateSigninStatus(isSignedIn) {
    this.set('isSignedIn', isSignedIn);
  },

  ready() {
    return this.get('deferredLoad').promise;
  },

  isSignedIn() {
    const gapi = this.get('gapi');
    return gapi && gapi.auth2.getAuthInstance().isSignedIn.get();
  },

  async signin() {
    await this.ready();

    if (!this.isSignedIn()) {
      await this.get('gapi').auth2.getAuthInstance().signIn();
    }

    await this.prepareFiles();
  },

  async signout() {
    await this.ready();

    if (this.isSignedIn()) {
      await this.get('gapi').auth2.getAuthInstance().signOut();
    }
  },

  async getSpreadSheet() {
    await this.ready();

    const { result : { files } } = await this.gapi.client.drive.files.list({
      'pageSize': 10,
      'q': `mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false and name = '${FILE_NAME}'`,
      'fields': "nextPageToken, files(id, name)"
    });

    return files[0] && files[0].id;
  },

  async createFile() {
    const { result: { spreadsheetId } } = await this.get('gapi').client.sheets.spreadsheets.create({
      properties: {
        title: FILE_NAME
      }
    })

    return spreadsheetId;
  },

  async prepareFiles() {
    await this.ready();

    let sheetId = await this.getSpreadSheet();

    if (!sheetId) {
      console.log('Creating spreadhsheet');
      sheetId = await this.createFile();
    }

    this.set('sheetId', sheetId);
    this.set('db', new SheetDB(sheetId, this.gapi));
    this.get('db').table('resumes');
  }
});
