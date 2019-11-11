import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const renderId =  params['render_id'];
    const renders =   JSON.parse(window.localStorage.getItem('renders'));

    return renders[renderId];
  }
});
