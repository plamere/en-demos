import pyen
import simplejson as json
import time

total_artists=30

GETTY_ENABLED_ECHO_NEST_API_KEY = 'XXXX'
en = pyen.Pyen(GETTY_ENABLED_ECHO_NEST_API_KEY)

response = en.get('artist/top_hottt', results=total_artists)
artists = response['artists']

for i, artist in enumerate(artists):
    print i, len(artists), artist['name']
    start = time.time()
    response = en.get('artist/images', id=artist['id'], license='getty')
    images = response['images']
    artist['images'] = images
    artist['rank'] = i

out = open('images.js', 'w')
js = json.dumps(artists)
print >> out, js
out.close()

