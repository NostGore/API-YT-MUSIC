import concurrent.futures
from yt_dlp import YoutubeDL

cache = {}
executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

AUDIO_FORMATS = {
    'm4a': 'audio/mp4',
    'webm': 'audio/webm',
    'mp3': 'audio/mpeg',
    'opus': 'audio/ogg',
}

def extract_stream(video_id):
    if video_id in cache:
        return cache[video_id]
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(f'https://www.youtube.com/watch?v={video_id}', download=False)
        result = {
            'url': info.get('url', ''),
            'mime': AUDIO_FORMATS.get(info.get('ext', 'm4a'), 'audio/mp4'),
            'title': info.get('title', ''),
        }
        cache[video_id] = result
        return result
