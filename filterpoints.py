import re

string1 = ''' anthonylennon: [ 73.15625, 160, 678, 939 ],
  kieronjr: [ 52.76923076923077, 1, 4, 5 ],
  kr1978: [ 82.65973254086181, 25, 56, 76 ],
  legcow: [ 46.88, 49, 24, 61 ],
  stokedpepsi: [ 44.81818181818182, 7, 16, 21 ],
  djelito: [ 68.38317757009347, 75, 84, 168 ],
  niffle7: [ 40.98, 33, 30, 69 ],
  '12170982700': [ 76.5, 0, 2, 2 ],
  '12122592020': [ 50.5, 31, 39, 68 ],
  miguelmarquez: [ 65.82127659574468, 127, 203, 345 ],
  brenna_camille: [ 46.857142857142854, 25, 29, 46 ],
  alisonwerder: [ 49.6, 5, 1, 5 ],
  manakahofski: [ NaN, 0, 0, 0 ],
  sigoptic: [ 57.49700598802395, 47, 130, 173 ],
  caamich: [ 63.29943502824859, 159, 399, 631 ],
  brianawills05: [ 41.173018292682926, 160, 528, 795 ],
  harmonyjanay: [ 32.23809523809524, 3, 11, 14 ],
  hietschb: [ 53.314199395770395, 63, 155, 244 ],
  bassman999: [ 91, 0, 2, 2 ],
  kylobren: [ 62.704918032786885, 68, 70, 121 ],
  imaustinjacobm: [ 54.35395189003437, 122, 110, 254 ],
  atorres922: [ NaN, 0, 0, 0 ],
  testdummy1122: [ NaN, 0, 0, 0 ],
  judahg: [ 56.17159199237369, 153, 173, 401 ],
  soulamusic: [ 64.06666666666666, 13, 10, 17 ],
  amendy: [ 74.83, 25, 36, 53 ],
  garrett_carder: [ 38.14878892733564, 53, 98, 162 ],
  rcerwin09: [ 63.10679611650485, 46, 35, 81 ],
  tresand12: [ 58.53270348837209, 177, 339, 634 ],
  lhmoore: [ 35.25, 58, 72, 138 ],
  danilions: [ 73.84, 43, 68, 131 ],
  cbmdlt: [ 56.826603325415675, 67, 203, 299 ],
  sarauc28: [ 79.94007989347537, 38, 126, 161 ],
  pjwpkm: [ NaN, 0, 0, 0 ],
  xka22: [ 48.12422360248447, 37, 96, 141 ],
  niightmarez: [ 47.6963249516441, 114, 147, 321 ],
  alibretz: [ NaN, 0, 0, 0 ],
  mikedurelli: [ 35.95601851851852, 103, 208, 343 ],
  wjtan123: [ 67.5, 6, 10, 23 ],
  maham: [ 90.94117647058823, 1, 16, 20 ],
  mansoa4: [ 48.0675, 85, 145, 246 ],
  laffysapphy: [ 50.632293080054275, 178, 334, 579 ],
  murillocr: [ 53.357142857142854, 7, 2, 9 ],
  downlucks: [ 40.216400911161735, 167, 527, 794 ],
  deadsilence6: [ 44.51111111111111, 6, 35, 39 ],
  ashwhimp: [ 29.70089285714286, 41, 126, 173 ],
  '18athoreso': [ 34.65466101694915, 77, 229, 336 ],
  mazthebows: [ 43.15, 38, 69, 91 ],
  lesbiandraste: [ 60.84504132231405, 35, 22, 49 ],
  ellengarfinkle: [ 41.02320185614849, 52, 245, 321 ],
  dancer152636: [ 41.36163982430454, 104, 541, 711 ],
  demi_1019: [ 37.28813559322034, 13, 7, 16 ],
  leopold7777: [ NaN, 0, 0, 0 ],
  oliviafaas: [ 47.62536023054755, 95, 125, 210 ],
  zseven1: [ 45.66699801192843, 176, 327, 638 ],
  fridavictoria: [ 76.87793427230046, 41, 112, 171 ],
  itsjustaphase: [ 60.92809488510007, 129, 188, 325 ],
  freyerf: [ NaN, 0, 0, 0 ],
  adrianntorress: [ 31.489999999999995, 23, 63, 116 ],
  julenekluth: [ 46.29333333333334, 13, 15, 26 ],
  dale_family: [ 95.71621621621621, 5, 6, 8 ],
  jtom69: [ 27, 6, 0, 2 ],
  atmbomber: [ 52.360189573459714, 185, 789, 1189 ],
  o8iio: [ 54.618705035971225, 44, 57, 90 ],
  aenikirk: [ 50.248387096774195, 52, 82, 129 ],
  q_bair: [ 42.43601895734597, 114, 257, 425 ],
  jonathangaddis: [ 35.46875, 27, 34, 58 ],
  d0llfface: [ 40.10087719298246, 24, 64, 88 ],
  paytoncarver: [ 45.101010101010104, 41, 30, 76 ],
  bkeirden: [ 44.73714285714286, 60, 102, 174 ],
  tony9401: [ 53.758436944937834, 92, 315, 445 ] }'''

m = re.findall(r"\[.*\]",string1)

#for match in m:
    #print match+","






import numpy as np
import matplotlib.pyplot as plt


vals = [[ 73.15625, 160, 678, 939 ],
[ 52.76923076923077, 1, 4, 5 ],
[ 82.65973254086181, 25, 56, 76 ],
[ 46.88, 49, 24, 61 ],
[ 44.81818181818182, 7, 16, 21 ],
[ 68.38317757009347, 75, 84, 168 ],
[ 40.98, 33, 30, 69 ],
[ 76.5, 0, 2, 2 ],
[ 50.5, 31, 39, 68 ],
[ 65.82127659574468, 127, 203, 345 ],
[ 46.857142857142854, 25, 29, 46 ],
[ 49.6, 5, 1, 5 ],
[ 57.49700598802395, 47, 130, 173 ],
[ 63.29943502824859, 159, 399, 631 ],
[ 41.173018292682926, 160, 528, 795 ],
[ 32.23809523809524, 3, 11, 14 ],
[ 53.314199395770395, 63, 155, 244 ],
[ 91, 0, 2, 2 ],
[ 62.704918032786885, 68, 70, 121 ],
[ 54.35395189003437, 122, 110, 254 ],
[ 56.17159199237369, 153, 173, 401 ],
[ 64.06666666666666, 13, 10, 17 ],
[ 74.83, 25, 36, 53 ],
[ 38.14878892733564, 53, 98, 162 ],
[ 63.10679611650485, 46, 35, 81 ],
[ 58.53270348837209, 177, 339, 634 ],
[ 35.25, 58, 72, 138 ],
[ 73.84, 43, 68, 131 ],
[ 56.826603325415675, 67, 203, 299 ],
[ 79.94007989347537, 38, 126, 161 ],
[ 48.12422360248447, 37, 96, 141 ],
[ 47.6963249516441, 114, 147, 321 ],
[ 35.95601851851852, 103, 208, 343 ],
[ 67.5, 6, 10, 23 ],
[ 90.94117647058823, 1, 16, 20 ],
[ 48.0675, 85, 145, 246 ],
[ 50.632293080054275, 178, 334, 579 ],
[ 53.357142857142854, 7, 2, 9 ],
[ 40.216400911161735, 167, 527, 794 ],
[ 44.51111111111111, 6, 35, 39 ],
[ 29.70089285714286, 41, 126, 173 ],
[ 34.65466101694915, 77, 229, 336 ],
[ 43.15, 38, 69, 91 ],
[ 60.84504132231405, 35, 22, 49 ],
[ 41.02320185614849, 52, 245, 321 ],
[ 41.36163982430454, 104, 541, 711 ],
[ 37.28813559322034, 13, 7, 16 ],
[ 47.62536023054755, 95, 125, 210 ],
[ 45.66699801192843, 176, 327, 638 ],
[ 76.87793427230046, 41, 112, 171 ],
[ 60.92809488510007, 129, 188, 325 ],
[ 31.489999999999995, 23, 63, 116 ],
[ 46.29333333333334, 13, 15, 26 ],
[ 95.71621621621621, 5, 6, 8 ],
[ 27, 2, 0, 2 ], #6
[ 52.360189573459714, 185, 789, 1189 ],
[ 54.618705035971225, 44, 57, 90 ],
[ 50.248387096774195, 52, 82, 129 ],
[ 42.43601895734597, 114, 257, 425 ],
[ 35.46875, 27, 34, 58 ],
[ 40.10087719298246, 24, 64, 88 ],
[ 45.101010101010104, 41, 30, 76 ],
[ 44.73714285714286, 60, 102, 174 ],
[ 53.758436944937834, 92, 315, 445 ]]

hipster_scores = zip(*vals)[0]
genres = zip(*vals)[1]
ungenres = zip(*vals)[2]
artist_counts = zip(*vals)[3]

x = []

y = []

colors = []

hipmax = max(hipster_scores)
hipmin = min(hipster_scores)

for i in range(len(hipster_scores)):
    xi = hipster_scores[i]
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
plt.plot(x, fit, '-')
plt.show()
    