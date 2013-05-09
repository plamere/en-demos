
// if you are logged into the Echo Nest, we will try to use the API
// key that is associated with your account. Otherwise we will return
// the demo key

function fetchApiKey(callback) {
    var docKey = "FILDTEOIK2HBORODV";
    var demoKey = 'FHPFXUKUGHZWWUXPR';
    var type = 'demo key';

    $.getJSON('http://developer.echonest.com/user/api_key.json', function(data) {
            var key = data.api_key;
            if (key === docKey) {
                key = demoKey;
                type = 'The demo key';
            } else {
                type = 'Your API key';
            }
            callback(key, type);
    }).error(function() {
        callback(demoKey, 'The demo key (fallback)');
    });
}
