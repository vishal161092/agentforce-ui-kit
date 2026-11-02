import { LightningElement, api } from 'lwc';

export default class DeBwDealerCard extends LightningElement {
    @api value;

    get dealerName() {
        return this.value?.dealerName || '';
    }
    get dealerType() {
        return this.value?.dealerType || '';
    }
    get address() {
        return this.value?.address || '';
    }
    get phone() {
        return this.value?.phone || '';
    }
    get mapsLink() {
        return this.value?.mapsLink || '';
    }

    handleMapsClick() {
        try {
            window.top.open(this.mapsLink, '_blank');
        } catch (e) {
            window.open(this.mapsLink, '_blank');
        }
    }
}
