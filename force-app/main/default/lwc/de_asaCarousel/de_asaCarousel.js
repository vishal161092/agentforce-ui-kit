/* global embeddedservice_configuration */
import { LightningElement, api, track } from 'lwc';
import deGiftCardAurora from '@salesforce/resourceUrl/deGiftCardAurora';
import deGiftCardEmber from '@salesforce/resourceUrl/deGiftCardEmber';
import deGiftCardCoral from '@salesforce/resourceUrl/deGiftCardCoral';
import deGiftCardNova from '@salesforce/resourceUrl/deGiftCardNova';

const SHERWANI_BASE_URL = 'https://YOUR-SITE-DOMAIN.my.site.com/resource/deSherwanis';

export default class De_asaCarousel extends LightningElement {
    _value;

    @api
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
        this.parseProductsFromValue();
    }

    @track currentIndex = 0;
    @track errorMessage = '';
    @track products = [];
    @track selectedProduct = null;

    connectedCallback() {
        this.parseProductsFromValue();
    }

    parseProductsFromValue() {
        this.currentIndex = 0;
        this.selectedProduct = null;
        this.errorMessage = '';
        this.products = [];

        try {
            const rawPayload = this._value?.productCarouselJSON;

            // Keyword preset: passing "Brightwave" renders the branded gift-card set.
            if (this.isBrightwaveKeyword(rawPayload)) {
                this.products = this.getBrightwaveGiftCards();
                return;
            }

            if (this.hasValidProductJsonPayload(rawPayload)) {
                const data = JSON.parse(rawPayload);
                if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
                    this.products = data.products.map((product) => ({
                        title: this.getProductDisplayTitle(product),
                        imageUrl: product.imageUrl || '',
                        description: product.description || '',
                        time: this.mapTimeToSymbol(product.time),
                        stage: product.stage || ''
                    }));
                    return;
                }
            }

            // Fallback showcase with four sherwani options for easy preview/use.
            this.products = [
                {
                    title: 'Ivory Brocade Sherwani',
                    description: 'Classic celebration look with detailed brocade jacket.',
                    imageUrl: `${SHERWANI_BASE_URL}/Sherwani1.png`,
                    time: '☼',
                    stage: 'AM'
                },
                {
                    title: 'Regal Embroidered Sherwani',
                    description: 'Statement ceremonial profile with intricate embroidery.',
                    imageUrl: `${SHERWANI_BASE_URL}/Sherwani2.png`,
                    time: '☼☽',
                    stage: 'AM/PM'
                },
                {
                    title: 'Cream Festive Sherwani',
                    description: 'Minimal elegant palette for daytime and indoor functions.',
                    imageUrl: `${SHERWANI_BASE_URL}/Sherwani3.png`,
                    time: '☽',
                    stage: 'PM'
                },
                {
                    title: 'Midnight Blue Sherwani',
                    description: 'Evening-forward silhouette with rich navy tones.',
                    imageUrl: `${SHERWANI_BASE_URL}/Sherwani4.png`,
                    time: '☽',
                    stage: 'PM'
                }
            ];
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('DE ASA Carousel error parsing data:', error.message);
            // Never block UI if payload is malformed; keep carousel usable.
            this.products = this.getDefaultSherwaniProducts();
        }
    }

    isBrightwaveKeyword(rawPayload) {
        if (!rawPayload || typeof rawPayload !== 'string') {
            return false;
        }
        return rawPayload.trim().toLowerCase().replace(/\s+/g, '') === 'brightwave';
    }

    getBrightwaveGiftCards() {
        return [
            {
                title: 'Aurora Gift Card',
                tagline: 'The gift that goes everywhere.',
                description: 'Use it anywhere Aurora debit cards are accepted, in-store or online.',
                imageUrl: deGiftCardAurora,
                badge: 'Most Popular',
                accent: '#1a1f71',
                accent2: '#2f6fed',
                perks: ['Accepted worldwide', 'No expiry date', 'Chip-secured'],
                time: '',
                stage: ''
            },
            {
                title: 'Ember Gift Card',
                tagline: 'Priceless choices, one card.',
                description: 'Spend anywhere Ember is accepted, online or in person.',
                imageUrl: deGiftCardEmber,
                badge: 'Flexible',
                accent: '#550f27',
                accent2: '#98244a',
                perks: ['Global acceptance', 'Zero liability', 'Instant to use'],
                time: '',
                stage: ''
            },
            {
                title: 'Coral Gift Card',
                tagline: 'Everything they love, in one place.',
                description: 'Redeemable in-store and online at Coral — no fees, ever.',
                imageUrl: deGiftCardCoral,
                badge: 'Trending',
                accent: '#cc0000',
                accent2: '#ff4d4d',
                perks: ['In-store & online', 'Never expires', 'No fees'],
                time: '',
                stage: ''
            },
            {
                title: 'Nova Gift Card',
                tagline: 'Level up their playtime.',
                description: 'Add funds to a Nova wallet for games, add-ons and subscriptions.',
                imageUrl: deGiftCardNova,
                badge: 'Gamer Favorite',
                accent: '#003791',
                accent2: '#0070d1',
                perks: ['Games & add-ons', 'PS Plus ready', 'Instant delivery'],
                time: '',
                stage: ''
            }
        ];
    }

    hasValidProductJsonPayload(rawPayload) {
        if (!rawPayload || typeof rawPayload !== 'string') {
            return false;
        }
        const trimmed = rawPayload.trim();
        // Guard against sentinel values like "default" or other plain-text tokens.
        return trimmed.startsWith('{') || trimmed.startsWith('[');
    }

    getDefaultSherwaniProducts() {
        return [
            {
                title: 'Ivory Brocade Sherwani',
                description: 'Classic celebration look with detailed brocade jacket.',
                imageUrl: `${SHERWANI_BASE_URL}/Sherwani1.png`,
                time: '☼',
                stage: 'AM'
            },
            {
                title: 'Regal Embroidered Sherwani',
                description: 'Statement ceremonial profile with intricate embroidery.',
                imageUrl: `${SHERWANI_BASE_URL}/Sherwani2.png`,
                time: '☼☽',
                stage: 'AM/PM'
            },
            {
                title: 'Cream Festive Sherwani',
                description: 'Minimal elegant palette for daytime and indoor functions.',
                imageUrl: `${SHERWANI_BASE_URL}/Sherwani3.png`,
                time: '☽',
                stage: 'PM'
            },
            {
                title: 'Midnight Blue Sherwani',
                description: 'Evening-forward silhouette with rich navy tones.',
                imageUrl: `${SHERWANI_BASE_URL}/Sherwani4.png`,
                time: '☽',
                stage: 'PM'
            }
        ];
    }

    get currentProduct() {
        return this.products[this.currentIndex] || {};
    }

    get currentPerks() {
        const perks = this.currentProduct.perks;
        if (!Array.isArray(perks)) {
            return [];
        }
        return perks.map((label, index) => ({ key: `perk-${index}`, label }));
    }

    get cardAccentStyle() {
        const accent = this.currentProduct.accent || '#1b5297';
        const accent2 = this.currentProduct.accent2 || '#3f8ff0';
        return `--card-accent: ${accent}; --card-accent-2: ${accent2};`;
    }

    get hasProducts() {
        return this.products.length > 0;
    }

    get showNavigation() {
        return this.products.length > 1;
    }

    get isFirstCard() {
        return this.currentIndex === 0;
    }

    get isLastCard() {
        return this.currentIndex === this.products.length - 1;
    }

    mapTimeToSymbol(timeText) {
        if (!timeText) return '';
        const normalized = timeText.toUpperCase().trim();
        if (normalized === 'AM') return '☼';
        if (normalized === 'PM') return '☽';
        if (normalized === 'AM/PM' || normalized === 'AM PM') return '☼☽';
        return timeText;
    }

    get productsWithIndex() {
        return this.products.map((product, index) => ({
            key: `dot-${index}`,
            index,
            dotClass: index === this.currentIndex ? 'dot active' : 'dot'
        }));
    }

    handlePrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }

    handleNext() {
        if (this.currentIndex < this.products.length - 1) {
            this.currentIndex++;
        }
    }

    handleDotClick(event) {
        const index = parseInt(event.target.dataset.index, 10);
        if (!isNaN(index) && index >= 0 && index < this.products.length) {
            this.currentIndex = index;
        }
    }

    handleProductSelect() {
        this.selectedProduct = this.products[this.currentIndex];
        this.sendSelectionToChat();
    }

    sendSelectionToChat() {
        if (!this.selectedProduct) return;

        // Send user-friendly selection text; avoid posting raw URL into chat.
        const message = `Card Selected: ${this.selectedProduct.title}`;
        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                embeddedservice_configuration.util.sendTextMessage(message).catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error('Error sending carousel selection to chat', error);
                });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error in sendSelectionToChat:', error);
        }
    }

    handleProductKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleProductSelect();
        }
    }

    get hasSelection() {
        return this.selectedProduct !== null;
    }

    getProductDisplayTitle(product) {
        const rawTitle = product?.title || '';
        if (rawTitle && !this.looksLikeUrl(rawTitle)) {
            return rawTitle;
        }

        const url = product?.imageUrl || rawTitle;
        if (!url || !this.looksLikeUrl(url)) {
            return 'Untitled Product';
        }

        try {
            const cleanPath = url.split('?')[0];
            const fileName = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
            const base = fileName.replace(/\.[^.]+$/, '');
            const words = base
                .replace(/[-_]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            return words ? words.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Untitled Product';
        } catch {
            return 'Untitled Product';
        }
    }

    looksLikeUrl(value) {
        return typeof value === 'string' && /^(https?:)?\/\//i.test(value.trim());
    }
}
