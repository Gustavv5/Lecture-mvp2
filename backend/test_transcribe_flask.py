import requests

url = "http://127.0.0.1:5000/transcribe"
files = {"file": open("One Way.mp3", "rb")}

response = requests.post(url, files=files)

print("Status code:", response.status_code)
print("Response text:", response.text)
