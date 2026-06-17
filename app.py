from flask import Flask, request, jsonify, render_template
from backend.ytmusic import search_songs
from backend.stream import extract_stream, executor, cache

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search')
def search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'results': []})
    return jsonify({'results': search_songs(q)})

@app.route('/api/stream')
def stream():
    video_id = request.args.get('videoId', '')
    if not video_id:
        return jsonify({'error': 'missing videoId'}), 400
    try:
        return jsonify(extract_stream(video_id))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/prefetch')
def prefetch():
    ids = request.args.get('ids', '').split(',')
    for vid in ids:
        if vid and vid not in cache:
            executor.submit(extract_stream, vid)
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
