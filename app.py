
import whisper
from database import init_db, insert_transcriptions


def transcribe_and_summarize(audio_path):
    
    model = whisper.load_model('base')
    result  = model.transcribe(audio_path)
    transcript = result['text']
    summary = transcript[:100] + '...'
    insert_transcriptions(audio_path, transcript, summary)
   
    return transcript, summary

if __name__ == '__main__':

    init_db()
    transcript, summary = transcribe_and_summarize('One Way.mp3')
    print('Transcript:', transcript[:200], '...')
    print('Summary:', summary)
    print('\nAll saved transcriptions in the database:')
    

