README for Data Science Final Project Report
Analyzing users’ music listening habits and the effect of track number on song popularity

How to get code running for the different components of our project:

To Run our Application:
from app directory (./app), run: node app.js
Then go to: http://localhost:8888 to try the app. You'll need a spotify username and password.




For Visualizations of Track Number (Music Centric) data:
from top directory, run: python visualization_code/vistracknumber.py
(filepaths are semi-hard coded, so be sure to run from top dir or change filepath)
To get various visualizations, it is required to manually edit the data displayed.

For Visualizations of Hipster Score (User Centric) data:
from top directory, run: python visualization_code/vishipsterscore.py
(filepaths are semi-hard coded, so be sure to run from top dir or change filepath)
To get various visualizations, it is required to manually edit the data displayed.


How we got, cleaned, and processed data for our music-centric hypothesis:
I used code from the gettingmusicdata.js file to get data for the music-centric hypothesis. First, I got random artists, then I got one album from those artists, then I got the tracks from all those albums, then I got the track popularities and track numbers for those tracks. It won't run because I had many issues being rate-limited and using promises, but I wanted to provide the code I used to prove that we scraped data using Spotify's API. The txt files are provided in the final_data folder. Once we got them into text files, we had to use regexes to convert the txt files into JSON.


