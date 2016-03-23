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
	def get_all_likes(self, query):
		friendslikes = defaultdict(list)
		r = self.get_request(query)
		#print r['friends']['data']
		#print len(r['friends']['data'])
		for friend in r['friends']['data']:
			#print friend['id']
			name = self.get_request('https://graph.facebook.com/v2.5/'+friend['id'])['name']
			#print name['name']
			musiclikes = []
			if 'music' in friend:
				#print friend['music']
				for like in friend['music']['data']:
					artistname = self.get_request('https://graph.facebook.com/v2.5/'+like['id'])['name']
					#print artistname
					musiclikes.append(artistname)
					#likes = [info['name'] for info in r['music']['data']]
				if 'next' in friend['music']['paging']:
					print "getting here"
					next = friend['music']['paging']['next']
					while next:
						next_request = self.get_request(next)
						print next_request
						if 'next' in next_request['paging']:
							print "getting here2"
							next = next_request['paging']
						else:
							break



			friendslikes[name] = musiclikes
		for key, value in friendslikes.iteritems():
			#print key, value
			pass
		#print likes
		'''if r['music']['paging']['next']:
			r = requests.get(r['music']['paging']['next'])
			r = r.json()
			currentlikes =  [song['name'] for song in r['data']]
			likes += currentlikes
			while r['paging']['next']:
				r = requests.get(r['paging']['next'])
				r = r.json()
				currentlikes =  [song['name'] for song in r['data']]
				likes += currentlikes
				if 'next' in r['paging']:
					nextpage = r['paging']['next']
				else:
					break'''

		#return likes

def main():
	obj = GraphAPI('CAACEdEose0cBANzPNwBUiUkflLZAEOMVypW96Ytt0K5uvYdpP4EeI1ftftJY1HwfwuNahqrBVGG1fKdK59LALvwZB63g4VZBEYkSabpWcNwnPcYnoJIcZB5kegcZC8Y5QWpULNdJ9pZA9JF5eJieBKmTcraGm1YJaQCfHDqPpoyoIZB6QQZAwIYalZBn8HZCeD7LDnV2Fhm8uADmsKP5EslD0A')
	#r = obj.get_request('me?fields=id,name,music')
	
	#likes = obj.get_all_likes('me?fields=id,name,friends{music{likes}}')
	#print likes
	obj.get_all_likes('https://graph.facebook.com/v2.5/me?fields=id,name,friends{music{likes}}')
	


if __name__ == '__main__':
    main()