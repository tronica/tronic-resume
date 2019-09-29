import DS from 'ember-data';

export default DS.Model.extend({
  userId:     DS.attr('string'),
  firstName:  DS.attr('string'),
  lastName:   DS.attr('string'),
  title:      DS.attr('string'),
  email:      DS.attr('string'),
  phone:      DS.attr('string'),
  website:    DS.attr('string'),
  jobs:       DS.hasMany('job')
});
