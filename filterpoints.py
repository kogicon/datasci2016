import numpy as np
import matplotlib.pyplot as plt
import json
import simplejson

userfilepath = "newuserwgenres.txt"

with open(userfilepath) as fileobj:
    data = simplejson.load(fileobj)




hipster_scores = []
genres = []
ungenres = []
artist_counts = []

for userid in data:
    user = data[userid]
    if ('pop' in user[1]):
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
    if (artist_counts[i] < 3):
        yi = 0.5
    else:
        yi = (genres[i])/float(artist_counts[i])
    coli = ((hipster_scores[i]-hipmin)/(hipmax-hipmin),0,0)
    colors.append(coli)
    x.append(xi)
    y.append(yi)





m, b = np.polyfit(x, y, 1)
#print fitline
fit = []

for i in range(len(x)):
    fit.append(m*x[i] + b)


meany = sum(y)/float(len(y))

SStot = 0
SSres = 0
for i in range(len(y)):
    SStot += (y[i] - meany)**2
    SSres += (y[i] - fit[i])**2

r2 = 1 - SSres/float(SStot)

print r2, SSres, SStot, meany

plt.scatter(x, y, s=100, c=colors, alpha=0.5)
plt.plot(x, fit, '-', c=(1,.5,0))
plt.show()
    
