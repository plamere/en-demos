#
# builds track lists for the acrostic playlist maker.
# ensures that we have enough tracks for each letter
# based on letter frequencies


import sys
import pyen
import simplejson as json
import collections


en = pyen.Pyen()
total = 1000
max_calls = 1000

session_id = None

frequency_table = {
    'a':   8.167  ,
    'b':   1.492  ,
    'c':   2.782  ,
    'd':   4.253  ,
    'e':   12.702 ,
    'f':   2.228  ,
    'g':   2.015  ,
    'h':   6.094  ,
    'i':   6.966  ,
    'j':   0.153  ,
    'k':   0.772  ,
    'l':   4.025  ,
    'm':   2.406  ,
    'n':   6.749  ,
    'o':   7.507  ,
    'p':   1.929  ,
    'q':   0.095  ,
    'r':   5.987  ,
    's':   6.327  ,
    't':   9.056  ,
    'u':   2.758  ,
    'v':   0.978  ,
    'w':   2.360  ,
    'x':   0.150  ,
    'y':   1.974  ,
    'z':   0.074  ,
}     

norm_freq_table = {}

def build_norm_table():
    total_count = 0
    for key, percent in frequency_table.items():
        count = int(total * percent / 100.)
        if key <> 'x' and count < 4:
            count = 4
        elif  count < 4:
            count = 4

        total_count += count
        norm_freq_table[key] = count
    return total_count

def build_precache(genre):
    ''' gets mores songs in the genre
    '''

    cur_calls = 0
    total_count = build_norm_table()
    response = en.get('playlist/dynamic/create', type='genre-radio', genre=genre, 
        variety=1, distribution='wandering', bucket=['id:rdio-US', 'tracks'], limit=True)
    session_id = response['session_id']

    songs = []
    while len(songs) < total_count and cur_calls < max_calls:
        cur_calls += 1
        print 'calls', cur_calls
        report_hist(songs)
        response = en.get('playlist/dynamic/next', session_id=session_id, results=5)

        for song in response['songs']:
            if ok_to_add(song, songs):
                song = filter_song(song)
                songs.append(song)
            # print '      ', song['title'] + ' by' + song['artist_name']

    report_hist(songs)
    f = open(genre +'.js', 'w')
    print >>f, json.dumps(songs)
    f.close()

def ok_to_add(song, songs):
    letter = get_first_letter(song)
    letter = letter.lower()

    if letter in norm_freq_table:
        target = norm_freq_table[letter]
        cur = count_songs_that_start_with(letter, songs)
        return cur < target
    else:
        return False

def report_hist(songs):
    counts = collections.defaultdict(int)
    for s in songs:
        counts[ get_first_letter(s)] += 1

    list = [(c, l) for l, c in counts.items()]
    list.sort()

    for alpha in xrange(ord('a'), ord('z')):
        l = chr(alpha)
        print counts[l], norm_freq_table[l], l, '**' if counts[l] < norm_freq_table[l] else ''
    print

def get_first_letter(song):
    return song['title'][0].lower()

def count_songs_that_start_with(c, songs):
    count = 0
    for s in songs:
        if get_first_letter(s) == c:
            count += 1
    return count
        

    return True

def filter_song(song):
    '''
        {
            "artist_foreign_ids": [
                {
                    "catalog": "rdio-US",
                    "foreign_id": "rdio-US:artist:r194376"
                }
            ],
            "artist_id": "ARAAQLO1187B993017",
            "artist_name": "Richie Sambora",
            "id": "SODYXGC12A6D4F6F3C",
            "title": "Ballad Of Youth",
            "tracks": [
                {
                    "catalog": "rdio-US",
                    "foreign_id": "rdio-US:track:t2715655",
                    "foreign_release_id": "rdio-US:release:a224436",
                    "id": "TRQHGUL136E83607C1"
                }
            ]
        }
    '''
    song['tracks'] = song['tracks'][:1]
    try:
        del song['tracks'][0]['catalog']
        del song['tracks'][0]['foreign_release_id']
        del song['tracks'][0]['id']

        del song['artist_id']
        del song['artist_foreign_ids']
    except:
        print "couldn't delete something in", song
    return song

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "python build_precache.py  genre'"
    else:
        build_precache(sys.argv[1])
