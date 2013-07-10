var OauthController = Ember.Controller.extend({
  needs: ['user'],
  allowOauth: Em.computed.alias('controllers.user.model'),
  showModal: false,
  authorizeUrl: function(){
    var oauthOptions = this.get('oauthOptions');
    var url = oauthOptions.authorizeUrl;
    url += "?response_type=token";
    url += "&redirect_uri=" + encodeURIComponent(oauthOptions.redirectUri);
    url += "&client_id=" + encodeURIComponent(oauthOptions.clientId);
    return url;
  }.property('oauthOptions'),
  beginFlow: function(oauthOptions) {
    this.deferred = new Ember.RSVP.defer();
    this.set('oauthOptions', oauthOptions);
    this.set('showModal', true);
    return this.deferred.promise;
  },
  approve: function(){
    // spawn the popup
    var oauthOptions = this.get('oauthOptions'),
        windowUrl = this.get('authorizeUrl'),
        width = oauthOptions.width || 960,
        height = oauthOptions.height || 410;
    window.open(windowUrl, "authwindow", "menubar=0,resizable=1,width=" + width + ",height=" + height);
    var self = this;
    function onmessage(e) {
      self.handleOauthCode(e);
      window.removeEventListener("message", onmessage);
    }
    window.addEventListener("message", onmessage);
  },
  handleOauthCode: function(event){
    this.set('showModal', false);
    if (event.origin !== document.location.origin) {
      Ember.Logger.debug('Invalid origin: ' + event.origin + ' vs ' + document.location.origin);
      return;
    }
    var results = {};
    var params = event.data.split('&');
    for (var i = 0; i < params.length; i++) {
      var param = params[i],
          pair = param.split('=');
      results[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    this.deferred.resolve(results.access_token);
  },
  decline: function(){
    this.set('showModal', false);
    this.deferred.reject("declined");
  },
});

export default OauthController;

