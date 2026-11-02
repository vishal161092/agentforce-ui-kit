/* global embeddedservice_configuration */
import { LightningElement, api, track } from 'lwc';

const SAREE_BASE_URL = 'https://YOUR-SITE-DOMAIN.my.site.com/resource/deSarees';

export default class De_ASACarousel_Saree extends LightningElement {
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

            // Fallback showcase with four saree options for easy preview/use.
            this.products = [
                {
                    title: 'Royal Banarasi Silk Saree',
                    description: 'Traditional golden zari weave perfect for wedding ceremonies.',
                    imageUrl: `${SAREE_BASE_URL}/Saree1.jpg`,
                    time: '☼',
                    stage: 'AM'
                },
                {
                    title: 'Kanjeevaram Temple Border Saree',
                    description: 'Rich silk with classic temple border in vibrant hues.',
                    imageUrl: `${SAREE_BASE_URL}/Saree2.jpg`,
                    time: '☼☽',
                    stage: 'AM/PM'
                },
                {
                    title: 'Pastel Organza Saree',
                    description: 'Lightweight and elegant for daytime celebrations.',
                    imageUrl: `${SAREE_BASE_URL}/Saree3.jpg`,
                    time: '☽',
                    stage: 'PM'
                },
                {
                    title: 'Deep Maroon Velvet Saree',
                    description: 'Luxurious evening drape with embroidered motifs.',
                    imageUrl: `${SAREE_BASE_URL}/Saree4.jpg`,
                    time: '☽',
                    stage: 'PM'
                }
            ];
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('DE ASA Carousel Saree error parsing data:', error.message);
            this.products = this.getDefaultSareeProducts();
        }
    }

    hasValidProductJsonPayload(rawPayload) {
        if (!rawPayload || typeof rawPayload !== 'string') {
            return false;
        }
        const trimmed = rawPayload.trim();
        return trimmed.startsWith('{') || trimmed.startsWith('[');
    }

    getDefaultSareeProducts() {
        return [
            {
                title: 'Royal Banarasi Silk Saree',
                description: 'Traditional golden zari weave perfect for wedding ceremonies.',
                imageUrl: `${SAREE_BASE_URL}/Saree1.jpg`,
                time: '☼',
                stage: 'AM'
            },
            {
                title: 'Kanjeevaram Temple Border Saree',
                description: 'Rich silk with classic temple border in vibrant hues.',
                imageUrl: `${SAREE_BASE_URL}/Saree2.jpg`,
                time: '☼☽',
                stage: 'AM/PM'
            },
            {
                title: 'Pastel Organza Saree',
                description: 'Lightweight and elegant for daytime celebrations.',
                imageUrl: `${SAREE_BASE_URL}/Saree3.jpg`,
                time: '☽',
                stage: 'PM'
            },
            {
                title: 'Deep Maroon Velvet Saree',
                description: 'Luxurious evening drape with embroidered motifs.',
                imageUrl: `${SAREE_BASE_URL}/Saree4.jpg`,
                time: '☽',
                stage: 'PM'
            }
        ];
    }

    get currentProduct() {
        return this.products[this.currentIndex] || {};
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

        const message = `Virtual Try On: ${this.selectedProduct.title}`;
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
