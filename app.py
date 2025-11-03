
import whisper
import sqlite3
from database import init_db, save_to_db, get_transcriptions

def transcribe_and_summarize(audio_path):
    
    model = whisper.load_model('base')
    result  = model.transcribe(audio_path)
    transcript = result['text']
    summary = transcript[:100] + '...'
    save_to_db(audio_path, transcript, summary)
    
    return transcript, summary

if __name__ == '__main__':
    init_db()
    transcript, summary = transcribe_and_summarize('One_Way.mp3')
    print('Transcript:', transcript[:200], '...')
    print('Summary:', summary)
    print('\nAll saved transcriptions in the database:')
    for row in get_transcriptions():
        print(row)

