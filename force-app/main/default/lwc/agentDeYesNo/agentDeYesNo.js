import { LightningElement, api } from 'lwc';

export default class AgentDeYesNo extends LightningElement {
    @api value;

    selectedOption = null;
    messageSent = false;

    get questionLabel() {
        return this.value?.questionLabel || 'Please select an option';
    }

    get yesMessage() {
        return this.value?.yesMessage || 'Yes';
    }

    get noMessage() {
        return this.value?.noMessage || 'No';
    }

    get yesBtnClass() {
        return this.selectedOption === 'Yes'
            ? 'de-yn-btn de-yn-btn-yes de-yn-btn-selected'
            : 'de-yn-btn de-yn-btn-yes';
    }

    get noBtnClass() {
        return this.selectedOption === 'No'
            ? 'de-yn-btn de-yn-btn-no de-yn-btn-no-selected'
            : 'de-yn-btn de-yn-btn-no';
    }

    handleYesClick() {
        if (this.messageSent) return;
        this.selectedOption = 'Yes';
        this.messageSent = true;
        this.sendMessageToChat(this.yesMessage);
    }

    handleNoClick() {
        if (this.messageSent) return;
        this.selectedOption = 'No';
        this.messageSent = true;
        this.sendMessageToChat(this.noMessage);
    }

    sendMessageToChat(message) {
        if (!message) return;
        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                embeddedservice_configuration.util.sendTextMessage(message).catch(() => {});
            }
        } catch (error) {
            // silent
        }
    }
}
