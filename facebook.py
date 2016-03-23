import json
import requests
import csv

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
	obj = GraphAPI('CAACEdEose0cBAEm0sWaJeObCFkbYucIto0GeQ8EPXyGdJdXCn0ZB14iDt1t9H7DmHynXJu11JZAgS7Xy3NOomuh92I1OgBVtg9lZBcZATXAti7BcdcZCRm0X5IEv7Mn0q6v9F74SOZBJPco4zPOTTH0iYM7MaeXrKBuC9SBpv9cR23RgZCJZB8ZCFHXZCnwqyXxszHsHx66rpfa2WfypBSuJOJ')
	#r = obj.get_request('me?fields=id,name,music')
	
	likes = obj.get_all_likes('me?fields=id,name,music')
	#print likes
	print len(likes)
	with open('noahlikes.csv', 'wb') as f:
		writer = csv.writer(f)
		writer.writerow(["artists"])
		for i in range(len(likes)):
			like = likes[i].encode("utf-8")
			writer.writerow([like])


if __name__ == '__main__':
    main()





