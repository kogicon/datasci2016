'''
    Visualizing Track Number
    This script allows us to visualize and compare the different components 
    of the music dataset. We used it to create all of our graphs to test our 
    track number hypothesis, manually editing the code to fliter out parts of
    the dataset and altering the visualization. It also gives us information 
    on the dataset (mean, stdev), correlation scores, regression lines and 
    associated data. 
'''

import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import json
import simplejson
import random
import math


'''
    Print Album Info - prints all the tracks w/ track num and popularity for each
    in - album - as list of tracks, holding track_number, popularity, and id
    out - none
'''
def printAlbumInfo(album):
    for track in album:
        print track['track_number'], track['popularity'], track['id']

'''
    Normalize Album Info - normalizes all albums using the Zscore calculation as
    specified in SparkClassifiers, setting all track popularities to their Zscore
    above the album mean.
    in - album - as list of tracks, holding track_number, popularity, and id
    out - a normalized album of tracks
'''
def normalizeAlbum(album):
    pops = map(lambda x: float(x['popularity']), album)
    mean = np.mean(pops)
    stdev = np.std(pops)
    for track in album:
        if stdev == 0:
            track['popularity'] = 0
        else:
            track['popularity'] = (track['popularity']-mean)/stdev
    return album

'''
    T-Test - calculates a t-score given sample and expected data
    in - samp_mean - the mean of the sample
        samp_stdev - the standard deviation of the sample
        num_samp - the number of samples in the dataset
        exp_mean -  the expected mean of the dataset
'''
def tTest(samp_mean, samp_stdev, num_samp, exp_mean):
    t = math.sqrt(num_samp)*(samp_mean-exp_mean)/samp_stdev
    return t


#Loads the dictionary of albums to tracks from json using the specfied filepath
albumfilepath = "final_data/bigalbumtotracks.txt"
with open(albumfilepath) as fileobj:
    data = simplejson.load(fileobj)

#Loads the dictionary of artists to albums (by id) from json using the specfied filepath
a2afilepath = "final_data/bigartisttoalbum.txt"
with open(a2afilepath) as fileobj:
    a2adata = simplejson.load(fileobj)

#Loads the dictionary of artists to popularity (by id) from json using the specfied filepath
a2popfilepath = "final_data/bigartisttopopularity.txt"
with open(a2popfilepath) as fileobj:
    a2popdata = simplejson.load(fileobj)


#Compiles three previous dictionaries into conglomerated dictionary, 
#with artist id as keys, and popularity and tracks as values 
#(we only grabbed 1 album per artist)
artistdata = {}
for artist in a2adata:
    if (a2adata[artist] in data):
        tracks = data[a2adata[artist]]
        if (artist in a2popdata):
            pop = a2popdata[artist]
        else:
            pop = -1
        artistdata[artist] = {'pop': pop, 'tracks': tracks}



#Intializes lists for grouping track numbers together with popularity and artist data
track_pop = []
track_count = []
track_group = []
all_track_pop = []
all_track_num= []


#Groups tracks by track number for popularity usage
for j in artistdata:
    #Uncomment below if you wish to filter the album data by the artist popularity
    #(to only visualize data from super popular artists (90+) or not as popular ones)
    #if artistdata[i]['pop'] >= 101 or artistdata[i]['pop'] < 90:
    #    continue
    album = normalizeAlbum(artistdata[j]['tracks'])
    for i in range(len(album)):
        if i == len(track_pop):
            track_pop.append(0)
            track_count.append(0)
            track_group.append([])
        track_pop[i] += album[i]['popularity']
        all_track_pop.append(artistdata[j]['tracks'][i]['popularity'])
        all_track_num.append(i+1)
        track_count[i] += 1
        track_group[i].append(album[i]['popularity'])

#Creates list of non-normalized track popularities to get info on the dataset
apop = [artistdata[i]['pop'] for i in artistdata]

#Prints out mean and StDev of each data feature
print "Artists", np.mean(apop), np.std(apop)
print "Track num", np.mean(all_track_num), np.std(all_track_num)
print "Track pop", np.mean(all_track_pop), np.std(all_track_pop)





##### Creates scatterplot for track numbers vs popularity w/ regression line

#Initializes datapoint lists for visualization
x = []
y = []

for i in range(len(track_group)):
    group = track_group[i]
    mean = np.mean(group)
    stdev = np.std(group)    
    print i, mean, stdev, len(group), tTest(mean, stdev, len(group), 0)
    for val in group:
        x.append(i+1)
        y.append(val)

#Uses scipy.stats to get a regression line, providing the following information
#slope - the slope of the regression line
#intercept - the intercept of the regression line
#r-squared - the correlation coefficient- measuring how correlated the line makes the data
#pval - the p-value from the t-test given the hypothesis that the line has a zero slope
#stderr - the standard error of the data around the regression line
slope, intercept, rval, pval, stderr = stats.linregress(x, y)
print "Slope:", slope
print "intercept:", intercept
print "r-squared:", rval**2
print "Pval:",pval
print "Stderr:",stderr

#Prints the number of tracks to be displayed
print "numtracks:", len(x)

#Creates a set of points to visualize the line in the plot
#(Taken from the scipy linregress example)
fit = []
for i in range(len(x)):
    fit.append(slope*x[i] + intercept)

#Label axes of plot for scatterplot (Should be changed manually if tesing different part of dataset)
ax = plt.figure().add_subplot(111)
ax.set_xlabel('Track #')
ax.set_ylabel('Popularity of Track (STDEVs from mean)')
ax.set_title('Track # vs. Track Popularity w/ Regression Line')






##### Creates barchart from data

#Plots scatterplot of all datapoints 
m = range(1,21)
plt.scatter(x, y, s=10, alpha=0.1)
plt.plot(x, fit, '-')
plt.axes().set_xticks(map(lambda n: n, m))
plt.show()

#Get mean of StDevs away from mean for each track position and print them
for i in range(len(track_pop)):
    track_pop[i] = track_pop[i]/float(track_count[i])
    print i, track_pop[i], track_count[i]

#Label axes of plot for barchart (Should be changed manually if tesing different part of dataset)
ax = plt.figure().add_subplot(111)
ax.set_xlabel('Track #')
ax.set_ylabel('Popularity of Track (STDEVs from mean)')
ax.set_title('Track # vs. Track Popularity for Spotify Artists')

#Set up tick marks and bar widths
x = range(len(track_pop))
width = 1/1.5

#Plot barchart with adjusted ticks to show track numbers
plt.bar(x, track_pop, width, color="blue")
plt.axes().set_xticks(map(lambda n: n, x))
plt.axes().set_xticklabels(map(lambda n: str(n+1), x))
plt.show()


