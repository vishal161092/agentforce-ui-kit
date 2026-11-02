import { LightningElement, api } from 'lwc';

export default class VideoMessage extends LightningElement {
    @api value;

    get displayText() {
        const caption = this.value?.caption;
        return caption && String(caption).trim() ? caption : 'Video message (placeholder)';
    }
}
