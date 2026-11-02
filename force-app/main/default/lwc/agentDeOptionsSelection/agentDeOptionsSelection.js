import { LightningElement, api } from 'lwc';

export default class AgentDeOptionsSelection extends LightningElement {
    @api value; // Receives the DeOptionsSelectionInfo object

    selectedOption = null;
    messageSent = false; // Flag to prevent sending message multiple times

    get questionLabel() {
        return this.value?.questionLabel || this.value?.question || 'When is the celebration?';
    }

    get options() {
        // Get options from value or return default options
        if (this.value?.options && this.value.options.length > 0) {
            return this.value.options;
        }
        // Default options based on the updated UI reference
        return [
            'Within 3 Months',
            '6 - 12 Months',
            'Next Year',
            'Dates Pending'
        ];
    }

    get hasOptions() {
        return this.options && this.options.length > 0;
    }

    get hasNoOptions() {
        return !this.hasOptions;
    }

    handleOptionClick(event) {
        // Prevent multiple sends
        if (this.messageSent) {
            console.log('Message already sent, ignoring click');
            return;
        }

        const selectedValue = event.currentTarget.dataset.value;
        this.selectedOption = selectedValue;
        
        console.log('Selected option:', selectedValue);
        
        // Remove previous selection styling
        const allButtons = this.template.querySelectorAll('.de-option-button');
        allButtons.forEach(button => {
            button.classList.remove('selected');
        });
        
        // Add selected styling to clicked button
        event.currentTarget.classList.add('selected');
        
        // Dispatch custom event with selected option (optional - if parent needs to know)
        this.dispatchEvent(new CustomEvent('optionselected', {
            detail: { selectedOption: selectedValue },
            bubbles: true
        }));

        // Send message to chat only once
        this.sendMessageToChat(selectedValue);
    }

    sendMessageToChat(message) {
        if (this.messageSent || !message) {
            return;
        }

        try {
            if (typeof embeddedservice_configuration !== 'undefined' && 
                embeddedservice_configuration.util && 
                embeddedservice_configuration.util.sendTextMessage) {
                console.log('Sending selected option to chat:', message);
                this.messageSent = true; // Set flag before sending to prevent duplicate sends
                embeddedservice_configuration.util.sendTextMessage(message)
                    .then(() => {
                        console.log('Successfully sent option to chat');
                    })
                    .catch((error) => {
                        console.error('Error sending option to chat', error);
                        this.messageSent = false; // Reset flag on error so it can retry
                    });
            } else {
                console.log('embeddedservice_configuration not available (likely in builder/preview mode)');
            }
        } catch (error) {
            console.error('Error in sendMessageToChat:', error);
            this.messageSent = false; // Reset flag on error
        }
    }
}
