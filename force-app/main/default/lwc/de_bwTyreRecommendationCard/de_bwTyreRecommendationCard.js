import { LightningElement, api } from 'lwc';

export default class DeBwTyreRecommendationCard extends LightningElement {
    @api value;

    get tyreName() {
        return this.value?.tyreName || '';
    }
    get tyreSize() {
        return this.value?.tyreSize || '';
    }
    get tyreDescription() {
        return this.value?.tyreDescription || '';
    }
    get imageUrl() {
        return this.value?.imageUrl || '';
    }
    get productUrl() {
        return this.value?.productUrl || '';
    }

    // Accepts a JSON array, or a pipe / newline / comma separated string.
    get featureList() {
        const raw = this.value?.features;
        if (!raw) {
            return [];
        }
        let items;
        const text = String(raw).trim();
        if (text.startsWith('[')) {
            try {
                items = JSON.parse(text).map(String);
            } catch (e) {
                items = null;
            }
        }
        if (!items) {
            const delimiter = text.includes('|') ? '|' : text.includes('\n') ? '\n' : ',';
            items = text.split(delimiter).map((s) => s.trim()).filter(Boolean);
        }
        return items.map((label, i) => ({ key: `f-${i}`, label }));
    }

    get hasFeatures() {
        return this.featureList.length > 0;
    }

    handleOpen() {
        try {
            window.top.open(this.productUrl, '_blank');
        } catch (e) {
            window.open(this.productUrl, '_blank');
        }
    }
}
