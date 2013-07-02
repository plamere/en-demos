// if you are logged into the Echo Nest, we will try to use the API
// key that is associated with your account. Otherwise we will return
// the demo key (which has a very low rate limit)

var apiKey ='NO_API_KEY';
var isLoggedIn = false;

function fetchApiKey() {
    $.getJSON('http://developer.echonest.com/user/api_key.json', function(data) {
        apiKey = data.api_key;
        isLoggedIn = 'logged_in' in data && data.logged_in;
        console.log('api key is', apiKey, 'loggedin', isLoggedIn);
    }).error(function() {
        apiKey = 'API_KEY_ERROR'
        isLoggedIn = false;
        console.log('api retrieval error', apiKey, 'loggedin', isLoggedIn);
    });
}

fetchApiKey();



