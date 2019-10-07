import EmberObject from '@ember/object';
import AsyncMixin from 'tronic-resume/mixins/async';
import { module, test } from 'qunit';

module('Unit | Mixin | async', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let AsyncObject = EmberObject.extend(AsyncMixin);
    let subject = AsyncObject.create();
    assert.ok(subject);
  });
});
