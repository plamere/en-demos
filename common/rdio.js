

function getRdioPlayer(readyCallback) {
    var curSongIndex = 0;
    var curSongs = [];
    var autoStop = true;

    function getRdioID(song) {
        var id = song.tracks[0].foreign_id;
        var rawID = id.split(':')[2]
        return rawID;
    }

    function playSong(song) {
        var rdioID = getRdioID(song);
        R.player.play({
            source: rdioID
        });
        $("#rp-song-title").text(song.title);
        $("#rp-artist-name").text(song.artist_name);
    }


    function playSongAndAdjustIndex(song) {
        playSong(song);

        for (var i = 0; i < curSongs.length; i++) {
            var csong = curSongs[i];
            console.log('   ', csong.id, song.id);
            if (csong.id == song.id) {
                curSongIndex = i + 1;
                console.log('YEP   ', curSongs.length, i, csong.id, song.id);
                break;
            }
        }
        console.log('psaai', curSongs.length, song, curSongIndex);
    }

    function playNextSong() {
        if (curSongIndex >= curSongs.length) {
            curSongIndex = 0;
        }

        if (curSongIndex < curSongs.length) {
            playSong(curSongs[curSongIndex++]);
        }
    }

    function playPreviousSong() {
        if (curSongIndex >= 2) {
            curSongIndex -= 2;
            playNextSong();
        }
    }

    function startPlayingSongs(songs) {
        if (curSongs != songs) {
            curSongIndex = 0;
            curSongs = songs;
        }
        playNextSong();
    }

    function addSongs(songs, playNow) {
        console.log('addSongs', songs);
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
        console.log('rdio ready');
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
        playSong: playSongAndAdjustIndex
    }

    return methods;
}


