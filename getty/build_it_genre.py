import pyen
import simplejson as json
import time
import sys

total_artists=30

if len(sys.argv) <> 3:
    print "Usage: build_it_genre.py  getty_api_key genre"
    sys.exit(0)

GETTY_ENABLED_ECHO_NEST_API_KEY = sys.argv[1]
genre = sys.argv[2]


en = pyen.Pyen(GETTY_ENABLED_ECHO_NEST_API_KEY)

response = en.get('artist/search', genre=genre, sort='familiarity-desc', results=total_artists)
artists = response['artists']

out_artists = []

for i, artist in enumerate(artists):
    print i, len(artists), artist['name']
    start = time.time()
    response = en.get('artist/images', id=artist['id'], license='getty')
    images = response['images']
    if len(images) > 0:
        artist['images'] = images
        artist['rank'] = i
        out_artists.append(artist)

out = open(genre + '_images.js', 'w')
js = json.dumps(out_artists)
print >> out, js
out.close()

