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
		for friend in r['friends']['data']:
			name = self.get_request('https://graph.facebook.com/v2.5/'+friend['id'])['name']
			musiclikes = []
			if 'music' in friend:
				for like in friend['music']['data']:
					artistname = self.get_request('https://graph.facebook.com/v2.5/'+like['id'])['name']
					num_likes = like['likes']
					artist_to_likes = defaultdict(int)
					artist_to_likes[artistname] = num_likes
					musiclikes.append(artist_to_likes)
				if 'next' in friend['music']['paging']:
					next = friend['music']['paging']['next']	
					while next:
						next_request = self.get_request(next)
						for like in next_request['data']:
							artistname = self.get_request('https://graph.facebook.com/v2.5/'+like['id'])['name']
							num_likes = like['likes']
							artist_to_likes = defaultdict(int)
							artist_to_likes[artistname] = num_likes
							musiclikes.append(artist_to_likes)
						if 'next' in next_request['paging']:
							next = next_request['paging']['next']
						else:
							break
			if len(musiclikes) > 0:
				friendslikes[name] = musiclikes
		for key, value in friendslikes.iteritems():
			#print key, value
			pass
		return friendslikes

		

def main():
	obj = GraphAPI('CAACEdEose0cBANZAIjtwvZAZAH9GO6ZCriKxMerT0zRehmAmjXGA46PNC8cHXmO5R1fZAnhnrSvQ1baq6esCKx0CuOCc1fXyGhQrpZAglfxlMiLIAZCgvivMbEy7OKJ6nYrTOgqRie80IGDY7hJLLUJfneHuRBjZA0l1pr1YLrX8qB5bZAZAWxSH5qMsz7QnN4daOpt5YGxb0aUl6lkkpM3ZBro')
	#r = obj.get_request('me?fields=id,name,music')
	
	#likes = obj.get_all_likes('me?fields=id,name,friends{music{likes}}')
	#print likes
	friendslikes = obj.get_all_likes('https://graph.facebook.com/v2.5/me?fields=id,name,friends{music{likes}}')
	with open('noahsfriendslikes.csv', 'wb') as f:
		writer = csv.writer(f)
		writer.writerow(["name", "artists", "num_likes"])
		for key, value in friendslikes.iteritems():
			name = key
			for item in value:
				for key, value in item.iteritems():
					to_write = []
					to_write.append(name)
					like = key.encode("utf-8")
					pop = value
					to_write.append(like)
					to_write.append(pop)
					writer.writerow(to_write)
	


if __name__ == '__main__':
    main()