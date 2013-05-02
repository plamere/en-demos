


function getRdioPlayer(readyCallback, as) {
    var curSongIndex = 0;
    var curSongs = [];
    var autoStop = as === undefined ? true : as;
    var callback = null;

    console.log('as ', as, autoStop);

    function getRdioID(song) {
        var id = song.tracks[0].foreign_id;
        var rawID = id.split(':')[2]
        return rawID;
    }

    function hasTrack(song) {
        return song.tracks.length > 0;
    }

    function playSong(song) {
        if (hasTrack(song)) {
            var rdioID = getRdioID(song);
            R.player.play({
                source: rdioID
            });

            if (callback) {
                callback(song);
            }
            $("#rp-song-title").text(song.title);
            var link = $("<a>")
                .attr('href', 'http://static.echonest.com/echotron/?id=' + song.artist_id)
                .attr('target', 'echotron')
                .text(song.artist_name);
            $("#rp-artist-name").empty();
            $("#rp-artist-name").append(link);
        }
    }


    function playSongAndAdjustIndex(song) {
        playSong(song);

        for (var i = 0; i < curSongs.length; i++) {
            var csong = curSongs[i];
            if (csong.id == song.id) {
                curSongIndex = i + 1;
                break;
            }
        }
    }

    function playNextSong() {
        while (curSongIndex < curSongs.length) {
            var song = curSongs[curSongIndex++];
            if (hasTrack(song)) {
                playSong(song);
                break;
            }
        }
    }

    function playPreviousSong() {
        while (curSongIndex > 0) {
            var song = curSongs[--curSongIndex];
            if (hasTrack(song)) {
                playSong(song);
                break;
            }
        }
    }

    function startPlayingSongs(songs) {
        if (curSongs != songs) {
            curSongIndex = 0;
            curSongs = songs;
        }
        playNextSong();
    }

    function setCallback(cb) {
        callback = cb;
    }

    function addSongs(songs, playNow) {
        curSongIndex = 0;
        curSongs = songs;

        if (playNow) {
            playNextSong();
        } else if (! (R.player.playState() == R.player.PLAYSTATE_PLAYING) && (curSongs.length > 0)) {
            autoStop = true;
            playNextSong();
        }
    }

    function getTrackInfo(trackIDs, successCallback, errorCallback) {
        R.request( {
            method:'get',
            content: {
                keys: $.join(trackIDs, ',')
            },
            success: successCallback,
            error: errorCallback
        });
    }


    R.ready(function() {
        R.player.on("change:playingTrack", function(track) {
            if (track) {
                var image = track.attributes.icon;
                $("#rp-album-art").attr('src', image);
            } else {
                playNextSong();
            }
        });

        R.player.on("change:playState", function(state) {
            if (state == R.player.PLAYSTATE_PAUSED) {
                $("#rp-pause-play i").removeClass("icon-pause");
                $("#rp-pause-play i").addClass("icon-play");
            }
            if (state == R.player.PLAYSTATE_PLAYING) {
                if (autoStop) {
                    autoStop = false;
                    R.player.pause();
                }
                $("#rp-pause-play i").removeClass("icon-play");
                $("#rp-pause-play i").addClass("icon-pause");
            }
        });

        R.player.on("change:playingSource", function(track) {});

        $("#rp-pause-play").click(function() {
            R.player.togglePause();
        });

        $("#rp-play-next").click(function() {
            playNextSong();
        });

        $("#rp-play-prev").click(function() {
            playPreviousSong();
        });

        readyCallback();
    });


    var methods = {   
        addSongs : addSongs,
        playSong: playSongAndAdjustIndex,
        setCallback:setCallback
    }

    return methods;
}


