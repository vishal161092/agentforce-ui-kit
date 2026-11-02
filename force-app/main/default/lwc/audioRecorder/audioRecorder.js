import { LightningElement, api } from 'lwc';

export default class AudioRecorder extends LightningElement {
    @api openaiKey;

    recognition;
    isListening = false;
    finalTranscript = '';
    speechSupported = false;

    connectedCallback() {
        if (typeof window === 'undefined') {
            return;
        }
        this.speechSupported =
            'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        if (!this.speechSupported) {
            return;
        }
        const SpeechCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechCtor();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = navigator.language || 'en-US';

        this.recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const piece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    this.finalTranscript += piece;
                } else {
                    interim += piece;
                }
            }
            const value = this.finalTranscript + interim;
            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: { value },
                    bubbles: true,
                    composed: true
                })
            );
        };

        this.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
        };
    }

    disconnectedCallback() {
        this.stopListening();
        this.recognition = undefined;
    }

    get listenLabel() {
        return this.isListening ? 'Stop listening' : 'Start listening';
    }

    toggleListen() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition || this.isListening) {
            return;
        }
        this.finalTranscript = '';
        try {
            this.recognition.start();
            this.isListening = true;
        } catch {
            // recognition may already be running
        }
    }

    stopListening() {
        if (!this.recognition || !this.isListening) {
            return;
        }
        try {
            this.recognition.stop();
        } catch {
            // ignore
        }
        this.isListening = false;
    }
}
