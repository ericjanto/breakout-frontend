import store from 'store';

function isUserLoggedIn() {
  let tokens = store.get('tokens');
  return !!(tokens && tokens.access_token);
}

function getAccessToken() {
  return store.get('tokens').access_token;
}

function clearAccessTokens() {
  return store.remove('tokens')
}

function storeTokens(tokens) {
  return store.set('tokens', tokens);
}

export {isUserLoggedIn, getAccessToken, storeTokens, clearAccessTokens};