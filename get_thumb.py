import urllib.request
import re

url = 'https://www.youtube.com/playlist?list=PLYt83m8l2miz9kJS0g82ghh3ffdRYjfZ1'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    m = re.search(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
    if m:
        video_id = m.group(1)
        print(f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg")
    else:
        print("Video ID not found.")
except Exception as e:
    print(f"Error: {e}")
