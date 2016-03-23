import json
import requests
import csv
from collections import defaultdict

class GraphAPI(object):
	#prefix_url = 'https://graph.facebook.com/v2.5/'
	
	def __init__(self, access_token):
		self.access_token = access_token

	def get_request(self, path, params={}):
		params['access_token'] = self.access_token
		url = path
		r = requests.get(url, params=params)
		return r.json()
	def get_all_likes(self, board):
		popularity = defaultdict(int)
		r = self.get_request(board)
		likes=[]
		for info in r['music']['data']:
			name = self.get_request('https://graph.facebook.com/v2.5/'+info['id'])['name']
			num_likes = info['likes']
			likes.append(name)
			popularity[name] = num_likes
		if 'next' in r['music']['paging']:
			if r['music']['paging']['next']:
				r = requests.get(r['music']['paging']['next'])
				r = r.json()
				for song in r['data']:
					name = self.get_request('https://graph.facebook.com/v2.5/'+song['id'])['name']
					num_likes = song['likes']
					likes.append(name)
					popularity[name] = num_likes
				while r['paging']['next']:
					r = requests.get(r['paging']['next'])
					r = r.json()
					for song in r['data']:
						name = self.get_request('https://graph.facebook.com/v2.5/'+song['id'])['name']
						num_likes = song['likes']
						likes.append(name)
						popularity[name] = num_likes
					if 'next' in r['paging']:
						nextpage = r['paging']['next']
					else:
						break

		return popularity

def main():

	obj = GraphAPI('CAACEdEose0cBAFnyrCP1UoFcaGw4tIsdTPGC957SzmoJrLZBZAZAZCScZBiGv7e1wYV9r0hCEMQ3OesmNN4l2gcP5kyZBIA3g7ajl3ZAwQQM6TX6ZCVPjPpAcxAQzWrZCZAZAVgOCTNlvJQGFSpivVFZCbqcN1jpmOKjOLco2my1QGG5IZAC6ZBZBilfyKZBKF3kbZA6MwMvbosSerZAsKOx9h8QQwX8GV')	
	popularity = obj.get_all_likes('https://graph.facebook.com/v2.5/me?fields=music{likes}')
	with open('mattlikes.csv', 'wb') as f:

		writer = csv.writer(f)
		writer.writerow(["artists", "num_likes"])
		for key, value in popularity.iteritems():
			like = key.encode("utf-8")
			pop = value
			to_write = []
			to_write.append(like)
			to_write.append(pop)
			writer.writerow(to_write)


if __name__ == '__main__':
    main()





