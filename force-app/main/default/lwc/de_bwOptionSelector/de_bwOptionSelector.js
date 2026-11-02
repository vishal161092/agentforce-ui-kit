/* global embeddedservice_configuration */
import { LightningElement, api } from 'lwc';

export default class DeBwOptionSelector extends LightningElement {
    @api value;

    selected = null;
    locked = false;

    get promptMessage() {
        return this.value?.promptMessage || '';
    }

    // Accepts a JSON array, or a pipe / newline / comma separated string.
    get labels() {
        const raw = this.value?.options;
        if (!raw) {
            return [];
        }
        if (Array.isArray(raw)) {
            return raw.map(String);
        }
        const text = String(raw).trim();
        if (text.startsWith('[')) {
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                    return parsed.map(String);
                }
            } catch (e) {
                // fall through to delimiter parsing
            }
        }
        const delimiter = text.includes('|') ? '|' : text.includes('\n') ? '\n' : ',';
        return text
            .split(delimiter)
            .map((s) => s.trim())
            .filter(Boolean);
    }

    get optionList() {
        return this.labels.map((label, i) => ({
            key: `opt-${i}`,
            label,
            cssClass: this.selected === label ? 'os-btn os-btn-selected' : 'os-btn'
        }));
    }

    handleSelect(event) {
        if (this.locked) {
            return;
        }
        this.selected = event.currentTarget.dataset.label;
        this.locked = true;
        this.sendMessageToChat(this.selected);
    }

    sendMessageToChat(message) {
        try {
            if (
                typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage
            ) {
                embeddedservice_configuration.util.sendTextMessage(message).catch(() => {});
            }
        } catch (error) {
            // silent
        }
    }
}
