import numpy as np
import matplotlib.pyplot as plt
import json
import simplejson
from scipy import stats

userfilepath = "newuserwgenres.txt"

with open(userfilepath) as fileobj:
    data = simplejson.load(fileobj)




hipster_scores = []
genres = []
ungenres = []
artist_counts = []

for userid in data:
    user = data[userid]

    hipster_scores.append(user[0])
    genres.append(len(user[1]))
    ungenres.append(user[2])
    artist_counts.append(user[3])

x = []

y = []

colors = []

hipmax = max(hipster_scores)
hipmin = min(hipster_scores)

for i in range(len(hipster_scores)):
    xi = hipster_scores[i]
    yi = genres[i]+ungenres[i]
    coli = (0,(hipster_scores[i]-hipmin)/(hipmax-hipmin)*3/4,(hipster_scores[i]-hipmin)/(hipmax-hipmin)*3/4)
    colors.append(coli)
    x.append(xi)
    y.append(yi)





slope, intercept, rval, pval, stderr = stats.linregress(x, y)
print "Slope:", slope
print "intercept:", intercept
print "Rval:",rval
print "r-squared:", rval**2
print "Pval:",pval
print "Stderr:",stderr
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

ax = plt.figure().add_subplot(111)

ax.set_xlabel('Hipster Score')
ax.set_ylabel('# of Genres & Ungenred Artists Listened to by User')
ax.set_title('# of Genres w/ Ungenred Artists vs. Hipster Score for All Sampled Users')

plt.scatter(x, y, s=50, c=colors, alpha=0.5)
#plt.plot(x, fit, '-', c=(0,.25,.5))
plt.show()
    
