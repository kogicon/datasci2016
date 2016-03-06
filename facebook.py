import json
import requests

class GraphAPI(object):
	prefix_url = 'https://graph.facebook.com/v2.5/'
	
	def __init__(self, access_token):
		self.access_token = access_token

	def get_request(self, path, params={}):
		params['access_token'] = self.access_token
		url = self.prefix_url + path
		r = requests.get(url, params=params)
		return r.json()
	def get_all_likes(self, board):
		r = self.get_request(board)
		likes = [info['name'] for info in r['music']['data']]
		#print likes
		if r['music']['paging']['next']:
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
					break

		return likes

def main():
	obj = GraphAPI('CAACEdEose0cBAAgY9jnZAUcfN76S00RjqDvJINAs3z1xu1GUKodNisNaZBHjHZAYMmAhUkW1HPOLn6baNuhF6MbjDZBfj14B6ldeL1spZAraUr37r5AsrWvfjQaxZAZBrTb9eKLlzZCmLHOQXL62szOERqEDOlrMC3ex12LgZAYZAzEeE7ZAZAMkdXUxaKvHrOcKklkywuZBlyh3W5k1jSVLIParT')
	#r = obj.get_request('me?fields=id,name,music')
	
	likes = obj.get_all_likes('me?fields=id,name,music')
	print likes

if __name__ == '__main__':
    main()