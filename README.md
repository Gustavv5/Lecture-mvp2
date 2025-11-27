How the project is run (frontend, backend)

Frontend

1. Open this URL in a browser - https://lecture-mvp2-2.onrender.com/?code=YOURCODE
2. Create 'New Lecture' or 'Upload'
3. Choose an audio file from your computer (.mp3, .wav, etc)
4. Click 'Transcribe lecture' button - a summary of the lecture text will pop up with key points and transcription. Audio is given at the top
5. Go back to Dashboard
6. You should now see a lecture card representing the uploaded file
7. You can delete lectures by clicking the red button above lecture topic and simply clicking delete lecture

Inspect the Backend API (shows the system's REST API) Use a tool like Postman

Example showcase with /history

GET /history

METHOD: GET
URL: https://lecture-mvp2-1.onrender.com/history
Headers: X-ACCESS-CODE: GIVENCODE

This should return a JSON list of lectures

* id
* filename
* summary
* transcript

GET /lecture/<id>

METHOD: GET
URL: https://lecture-mvp2-1.onrender.com/lecture/1
Headers: X-ACCESS-CODE: GIVENCODE


