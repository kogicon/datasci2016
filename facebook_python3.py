import json
import requests
import csv
from collections import defaultdict

class GraphAPI(object):	
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
		# print(r)
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
	obj = GraphAPI('CAACEdEose0cBANtn2EyLyoemLEh0meuqXLXdGCytk31N375L1LdFZBtZBBea5NNRqHZA9ZBfMDDwUEAZBw4x6mmxZAtKGFPRBHgo84sTp5OrTjWxBEBnoVrBRTS8wOspZBunoHW0kjKqINEVnKuLoRir3DqyznXGATRUNR62QPuVOOQna8coQiZAw5Mv9LqmX2qAZCrVtCSR5dwZDZD')
	
	popularity = obj.get_all_likes('https://graph.facebook.com/v2.5/me?fields=music{likes}')
	with open('emilylikes.csv', 'wt') as f:
		writer = csv.writer(f, lineterminator='\n')
		writer.writerow(["artists", "num_likes"])
		for key, value in popularity.items():
			like = key
			pop = value
			to_write = []
			to_write.append(like)
			to_write.append(pop)
			writer.writerow(to_write)


if __name__ == '__main__':
    main()