from ytmusicapi import YTMusic

yt = YTMusic()

def search_songs(query, limit=12):
    try:
        results = yt.search(query, filter='songs', limit=limit)
    except KeyError:
        results = [r for r in yt.search(query, limit=20) if r.get('resultType') == 'song'][:limit]
    items = []
    for r in results:
        thumb = r.get('thumbnails', [{}])
        items.append({
            'id': r.get('videoId', ''),
            'title': r.get('title', ''),
            'artist': r.get('artists', [{}])[0].get('name', '') if r.get('artists') else '',
            'album': r.get('album', {}).get('name', '') if r.get('album') else '',
            'duration': r.get('duration', ''),
            'thumb': thumb[-1].get('url', '') if thumb else '',
        })
    return items
