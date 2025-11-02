
from app import transcribe_and_summarize

def test_transcription_summary():
    transcript, summary = transcribe_and_summarize("One Way.mp3")
    assert isinstance(transcript, str)
    assert isinstance(summary, str)
    assert len(transcript) > 0
