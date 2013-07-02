// if you are logged into the Echo Nest, we will try to use the API
// key that is associated with your account. Otherwise we will return
// the demo key (which has a very low rate limit)

function fetchApiKey(callback) {
    $.getJSON('http://developer.echonest.com/user/api_key.json', function(data) {
        var apiKey = data.api_key;
        var isLoggedIn = 'logged_in' in data && data.logged_in;
        console.log('api key is', apiKey, 'loggedin', isLoggedIn);
        if (callback) {
            callback(apiKey, isLoggedIn);
        }
    }).error(function() {
        var apiKey = 'API_KEY_ERROR'
        var isLoggedIn = false;
        console.log('api retrieval error', apiKey, 'loggedin', isLoggedIn);
        if (callback) {
            callback(null, false);
        }
    });
}



