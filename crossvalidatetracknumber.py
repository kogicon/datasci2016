import numpy as np
import matplotlib.pyplot as plt
import json
import simplejson
import random


def printAlbumInfo(album):
    for track in album:
        print track['track_number'], track['popularity'], track['id']

def normalizeAlbum(album):
    pops = map(lambda x: float(x['popularity']), album)
    mean = np.mean(pops)
    stdev = np.std(pops)
    #print mean, stdev
    for track in album:
        if stdev == 0:
            track['popularity'] = 0
        else:
            track['popularity'] = (track['popularity']-mean)/stdev
    return album

albumfilepath = "bigalbumtotracks.txt"

with open(albumfilepath) as fileobj:
    data = simplejson.load(fileobj)

a2afilepath = "bigartisttoalbum.txt"

with open(a2afilepath) as fileobj:
    a2adata = simplejson.load(fileobj)

a2popfilepath = "bigartisttopopularity.txt"

with open(a2popfilepath) as fileobj:
    a2popdata = simplejson.load(fileobj)

artistdata = {}

for artist in a2adata:
    if (a2adata[artist] in data):
        tracks = data[a2adata[artist]]
        if (artist in a2popdata):
            pop = a2popdata[artist]
        else:
            pop = -1
        artistdata[artist] = {'pop': pop, 'tracks': tracks}




track_pop = []
track_count = []
#minpop = 61
#maxpop = 100

adata = artistdata.keys()[:]

adata = random.sample(adata, 100)

print adata

for i in adata:
    album = normalizeAlbum(artistdata[i]['tracks'])
    for i in range(len(album)):
        if i == len(track_pop):
            track_pop.append(0)
            track_count.append(0)
        track_pop[i] += album[i]['popularity']
        track_count[i] += 1




for i in range(len(track_pop)):
    track_pop[i] = track_pop[i]/float(track_count[i])
    print i, track_pop[i], track_count[i]


ax = plt.figure().add_subplot(111)

ax.set_xlabel('Track #')
ax.set_ylabel('Popularity of Track (STDEVs from mean)')
ax.set_title('Track # vs. Track Popularity for Spotify Artists')


x = range(len(track_pop))
width = 1/1.5


plt.bar(x, track_pop, width, color="blue")
plt.axes().set_xticks(map(lambda n: n, x))
plt.show()


