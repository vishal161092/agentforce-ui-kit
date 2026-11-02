import { LightningElement, api } from 'lwc';

export default class AgentDeStringOutput extends LightningElement {
    @api value; // Receives the DeStringOutputInfo object
    @api openaiKey;
    @api headline = 'Voice Transcription';
    @api iconName = 'utility:mic';
    
    // Internal reactive property to store speech/transcript data
    currentTranscript = '';

    get outputString() {
        // Return transcript if available, otherwise return value from Lightning Type
        return this.currentTranscript || this.value?.outputString || '';
    }

    get isProcessing() {
        // Check if outputString is empty or null
        return !this.outputString;
    }

    handleSpeechChange(e) {
        const speech = e.detail.value;
        console.log('Received speech data:', speech);
        // Update the internal transcript property (reactive property)
        this.currentTranscript = speech || '';
    }

    connectedCallback() {
        // Component initialization - just log, don't send messages automatically
        console.log('DeStringOutput component initialized');
        console.log('Output String:', this.outputString);
    }

    // Optional method: Only call this manually if you need to send the output to chat
    // This is NOT called automatically to prevent loops
    sendOutputToChat() {
        const outputText = this.outputString;
        console.log('Output Text:', outputText);
        if (!outputText) {
            return;
        }

        try {
            if (typeof embeddedservice_configuration !== 'undefined' && 
                embeddedservice_configuration.util && 
                embeddedservice_configuration.util.sendTextMessage) {
                console.log('Sending output string to chat:', outputText);
                embeddedservice_configuration.util.sendTextMessage('Additional Instructions: '+outputText)
                    .then(() => {
                        console.log('Successfully sent output string to chat');
                    })
                    .catch((error) => {
                        console.error('Error sending output string to chat', error);
                    });
            } else {
                console.log('embeddedservice_configuration not available (likely in builder/preview mode)');
            }
        } catch (error) {
            console.error('Error in sendOutputToChat:', error);
        }
    }
}
