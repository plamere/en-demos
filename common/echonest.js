
function EchoNest(apiKey) {
    this.end_point = 'http://developer.echonest.com/api/v4/';
    this.api_key = apiKey;

    this.artist = new Artist(this);
    this.playlist = new Playlist(this);
    this.catalog = new Catalog(this);
    this.tracer = null;

    this.defaultErrorHandler = function() {
        console.log('Unhandled Echo Nest error');
    };
}

EchoNest.prototype.now = function() {
    return new Date().getTime();
}

EchoNest.prototype.apiRequest = function(method, args, callback, error, type) {
    var url = this.end_point + method;
    var that = this;

    args.api_key = this.api_key;
    if (!type) {
        type = 'GET'
    }

    function isOK(data) {
        return data && data.response && data.response.status && data.response.status.code == 0;
    }

    function handleError(data) {
        if (error) {
            error(data);
        } else {
            that.defaultErrorHandler(data);
        } 
    }

    function myCallback(data) {
        console.log('apiRequest results', url, data);
        console.log('apiRequest time', that.now() - start, 'ms');
        if (isOK(data)) {
            if (callback) {
                callback(data);
            } else {
                console.log('apiRequest OK', data);
            }
        } else {
            handleError(data);
        }
    }

    var start = this.now();
    console.log('apiRequest', url, args);

    if (this.tracer) {
        this.tracer(method, args);
    }
    return $.ajax(url, {cache:false,  data:args, error: handleError,
            success:myCallback, traditional:true, type:type});
}


function Artist(en) {
    this.en = en;
}


Artist.prototype.biographies = function(args, callback, error) {
    this.en.apiRequest('artist/biographies', args, callback, error);
}

Artist.prototype.images = function(args, callback, error) {
    this.en.apiRequest('artist/images', args, callback, error);
}


function Playlist(en) {
    this.en = en;
}


Playlist.prototype.create = function(config, callback, error) {   
    var that = this;
    this.config = config;
    this.en.apiRequest('playlist/dynamic/create', config, 
        function(data) {
            console.log('create', data);
            that.sessionID = data.response.session_id;
            callback(data);
        }, error
    );
};

Playlist.prototype.restart = function(config, callback, error) {
    var that = this;
    config.session_id = this.sessionID;

    this.en.apiRequest('playlist/dynamic/restart', config, 
        function(data) {
            that.config = config;
            callback(data);
        }, error
    );

};


Playlist.prototype.nextSong = function(results, lookahead, callback, error) {
    var config = {
        session_id:this.sessionID,
        results: results,
        lookahead:lookahead
    };
    this.en.apiRequest('playlist/dynamic/next', config, callback, error);
};

Playlist.prototype.connect = function(id, callback) {   
    this.sessionID = id;
};

Playlist.prototype.info = function(callback, error) {   
    // get the new session info goodness
    var oldEndpoint = this.end_point;
    this.end_point = 'http://ci.sandpit.us/api/v4/';
    this.en.apiRequest('playlist/dynamic/info', {session_id:this.sessionID}, callback, error);
    this.end_point = oldEndpoint;
};

Playlist.prototype.multifeedback = function(args, callback, error) {   
    args.session_id = this.sessionID;
    this.en.apiRequest('playlist/dynamic/feedback', args, callback, error);
};

Playlist.prototype.steer = function(param, value, callback, error) {   
    var config = {
        session_id: this.sessionID,
    }
    config[param] = value;

    this.en.apiRequest('playlist/dynamic/steer', config, callback, error);
};

Playlist.prototype.feedback = function(param, value, callback, error) {   
    var config = {
        session_id: this.sessionID,
    }
    config[param] = value;

    this.en.apiRequest('playlist/dynamic/feedback', config, callback, error);
};


function Catalog(en) {
    this.en = en;
}

Catalog.prototype.create = function(name, callback, error) {
    this.en.apiRequest('catalog/create', {name:name, type:'general'}, callback, error, 'POST');
};

Catalog.prototype.addArtists = function(catalogID, updateBlock, callback, error) {
    var data = JSON.stringify(updateBlock);
    this.en.apiRequest('catalog/update', {id:catalogID, data:data, data_type:'json'}, callback, error, 'POST');
};

Catalog.prototype.delete = function(catalogID, callback, error) {
    this.en.apiRequest('catalog/delete', {id:catalogID}, callback, error, 'POST');
};

Catalog.prototype.status = function(ticket, callback, error) {
    this.en.apiRequest('catalog/status', {ticket:ticket}, callback, error);
};

Catalog.prototype.read = function(id, start, results, bucket, callback, error) {
    this.en.apiRequest('catalog/read', {id:id, start:start, results:results, bucket:bucket}, callback, error);
};

Catalog.prototype.pollForStatus = function(ticket, callback, error) {
    var that = this;
    var pollPeriod = 1000;

    function poll() {
        that.status(ticket, localCallback, error);
    }

    function localCallback(data) {
        if (data.response.ticket_status === 'pending') {
            callback(data);
            setTimeout(poll, pollPeriod);
        } else if (data.response.ticket_status === 'complete') {
            callback(data);
        } else {
            error(data);
        }
    }

    poll();
};

Catalog.prototype.profileByName = function(name, callback, error) {
    this.en.apiRequest('catalog/profile', {name:name},  callback, error);
};

Catalog.prototype.profile = function(id, callback, error) {
    this.en.apiRequest('catalog/profile', {id:id},  callback, error);
};

