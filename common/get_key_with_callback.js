// if you are logged into the Echo Nest, we will try to use the API
// key that is associated with your account. Otherwise we will return
// the demo key (which has a very low rate limit)

function fetchApiKeyV1(callback) {
    $.getJSON('http://developer.echonest.com/user/api_key.json', function(data) {
        var apiKey = data.api_key;
        var isLoggedIn = 'logged_in' in data && data.logged_in;
        if (callback) {
            callback(apiKey, isLoggedIn);
        }
    }).error(function() {
        var apiKey = 'API_KEY_ERROR'
        var isLoggedIn = false;
        if (callback) {
            callback(null, false);
        }
    });
}



function fetchApiKey(callback) {
    var spareKey = 'FEQK8YEAC4WDXAWSP';
    $.ajax( {
            type:"GET", 
            dataType: "json", 
            xhrFields: { withCredentials: true }, 
            url: "http://developer.echonest.com/user/api_key.json"
        }).then(
            function(data){
                if (callback) {
                    if (data.logged_in) {
                        callback(data.api_key, data.logged_in);
                    } else {
                        callback(spareKey, data.logged_in);
                    }
                }
            }, 
            function(data){
                if (callback) {
                    callback(spareKey, false);
                }
            }
        );
}
