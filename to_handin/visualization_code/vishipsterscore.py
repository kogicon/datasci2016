'''
    Visualizing Hipster Scores
    This script allows us to visualize and compare the different components 
    of the user dataset. We used it to create all of our graphs to test our 
    hipster score hypothesis, manually editing the code to change variables
    compared. It also gives us information on the dataset (mean, stdev), 
    correlation scores, regression lines and associated data. 
'''


import numpy as np
import matplotlib.pyplot as plt
import json
import simplejson
from scipy import stats
import math


'''
    correlation - gets the correlation score of two sets of data. 
    (Taken from the SparkClassifiers project)
    in: n - number of samples
        sum_x, sum_y, sum_xx, sum_yy, sum_xy - sum over data points of x, y, xx, yy, and xy respectively.
    out: the correlation score of the two datasets
'''
def correlation(n, sum_x, sum_y, sum_xx, sum_yy, sum_xy):
    # http://en.wikipedia.org/wiki/Correlation_and_dependence
    numerator = n * sum_xy - sum_x * sum_y
    denominator = math.sqrt(n * sum_xx - sum_x * sum_x) * math.sqrt(n * sum_yy - sum_y * sum_y)
    if denominator == 0:
        return 0.0
    return numerator / denominator



#Filepath 
userfilepath = "final_data/newuserwgenres.txt"

#Loads file into "data" from json
with open(userfilepath) as fileobj:
    data = simplejson.load(fileobj)

#Initializing datacolumns
hipster_scores = []
genres = []
ungenres = []
artist_counts = []

#Filling datacolumns with user data (1 user per line)
for userid in data:
    user = data[userid]
    hipster_scores.append(user[0])
    genres.append(len(user[1]))
    ungenres.append(user[2])
    artist_counts.append(user[3])

#Prints out mean and StDev of datacolumns
print "artist_counts", np.mean(artist_counts), np.std(artist_counts)
print "genres", np.mean(genres), np.std(genres)
print "ungenres", np.mean(ungenres), np.std(ungenres)
print "hipster_scores", np.mean(hipster_scores), np.std(hipster_scores)

#Initializes datapoint lists for visualization
x = []
y = []
colors = []

#Retrive min and max hipster score for normalizing for color display of points
hipmax = max(hipster_scores)
hipmin = min(hipster_scores)


#Loops through indexes in all datacolumns to fill datapoint sets
for i in range(len(hipster_scores)):

    #Removing low artist_count outliers (removes 2 users) 
    #so that visualization focuses on majority of group
    if artist_counts[i] < 4:
        yi = 0
    else:
        #Should be changed depending on visualization you want
        yi = (genres[i])/float(artist_counts[i]) 

    #Should be changed depending on visualization you want
    xi = hipster_scores[i] 
    
    #Creates coloring for points based on hipster score
    coli = (0,(hipster_scores[i]-hipmin)/(hipmax-hipmin)*3/4,(hipster_scores[i]-hipmin)/(hipmax-hipmin)*3/4)
    
    #Adds datapoint to datapoint sets
    colors.append(coli)
    x.append(xi)
    y.append(yi)


#Calculates n, sum_x, sum_y, sum_xx, sum_yy, sum_xy 
#for use in generating the correlation score.
n = len(x)
sum_x = sum(x)
sum_y = sum(y)
sum_xx = sum(map(lambda b: b**2, x))
sum_yy = sum(map(lambda b: b**2, y))
sum_xy = sum([x[i]*y[i] for i in range(len(x))])
print "correlation score:", correlation(n, sum_x, sum_y, sum_xx, sum_yy, sum_xy)


#Uses scipy.stats to get a regression line, providing the following information
#slope - the slope of the regression line
#intercept - the intercept of the regression line
#r-squared - the correlation coefficient- measuring how correlated the line makes the data
#pval - the p-value from the t-test given the hypothesis that the line has a zero slope
#stderr - the standard error of the data around the regression line
slope, intercept, rval, pval, stderr = stats.linregress(x, y)
print "slope:", slope
print "intercept:", intercept
print "r-squared:", rval**2
print "pval:",pval
print "stderr:",stderr

#Creates a set of points to visualize the line in the plot
#(Taken from the scipy linregress example)
fit = []
for i in range(len(x)):
    fit.append(slope*x[i] + intercept)


meany = sum(y)/float(len(y))

SStot = 0
SSres = 0
for i in range(len(y)):
    SStot += (y[i] - meany)**2
    SSres += (y[i] - fit[i])**2
r2 = 1 - SSres/float(SStot)
print r2, SSres, SStot, meany


#Creates subplot using matplotlib to write labes for axes
ax = plt.figure().add_subplot(111)

#Sets labels for graph (should be manually edited when visualizing different part of the dataset)
ax.set_xlabel('Hipster Score')
ax.set_ylabel('# of Genres / # of Artists Listened to by User')
ax.set_title('# of Genres / # of Artists vs. Hipster Score for All Sampled Users')

#Displays a scatterplot of the datapoint sets, using the colors list to determine colors of points
plt.scatter(x, y, s=50, c=colors, alpha=0.5)
#Comment out the line below to hide the regression line over the data
plt.plot(x, fit, '-', c=(0,.25,.5))
plt.show()
    
