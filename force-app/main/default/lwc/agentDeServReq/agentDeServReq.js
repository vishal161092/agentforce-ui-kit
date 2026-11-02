import { LightningElement, api } from 'lwc';

const DEFAULT_OPTIONS = [
    'Create User',
    'Delete User',
    'Update User',
    'Initiate Incident Creation',
    'Perform User Activities',
    'Handle Data BackUp'
];

export default class AgentDeServReq extends LightningElement {
    @api value;

    selectedOption = null;
    messageSent = false;

    get promptLabel() {
        return this.value?.promptLabel || 'Select an Action';
    }

    get chips() {
        const options = this.value?.options?.length ? this.value.options : DEFAULT_OPTIONS;
        return options.map((label, index) => {
            const selected = this.selectedOption === label;
            return {
                id: label + '-' + index,
                label,
                selected,
                chipClass: 'chip' + (selected ? ' sel' : '')
            };
        });
    }

    get chipRows() {
        const all = this.chips;
        const rows = [];
        for (let i = 0; i < all.length; i += 2) {
            rows.push({ id: 'row-' + i, items: all.slice(i, i + 2) });
        }
        return rows;
    }

    get showPicker() {
        return !this.messageSent;
    }

    handleChipClick(event) {
        if (this.messageSent) return;
        this.selectedOption = event.currentTarget.dataset.value;
        this.sendMessageToChat(this.selectedOption);
    }

    sendMessageToChat(message) {
        if (this.messageSent || !message) return;

        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                this.messageSent = true;
                embeddedservice_configuration.util.sendTextMessage(message).catch(() => {
                    this.messageSent = false;
                });
            }
        } catch (error) {
            this.messageSent = false;
        }
    }
}
