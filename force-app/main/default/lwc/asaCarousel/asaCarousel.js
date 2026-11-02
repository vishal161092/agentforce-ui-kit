/**
 * @description ASA Product Carousel Component
 * Displays products in a carousel format with navigation
 * Receives data from Flow via Lightning Type
 */
/* global embeddedservice_configuration */
import { LightningElement, api, track } from 'lwc';

export default class AsaCarousel extends LightningElement {
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
            if (this._value && this._value.productCarouselJSON) {
                const data = JSON.parse(this._value.productCarouselJSON);

                if (data.products && Array.isArray(data.products) && data.products.length > 0) {
                    this.products = data.products.map((product) => ({
                        title: product.title || 'Untitled Product',
                        imageUrl: product.imageUrl || '',
                        description: product.description || '',
                        time: this.mapTimeToSymbol(product.time),
                        stage: product.stage || ''
                    }));
                    console.log('ASA Carousel loaded with', this.products.length, 'products from Flow');
                } else {
                    this.errorMessage = 'No products available';
                    console.log('ASA Carousel: No products in data');
                }
            } else {
                this.errorMessage = 'No data provided';
                console.log('ASA Carousel: No value provided');
            }
        } catch (error) {
            console.error('ASA Carousel error parsing data:', error.message);
            this.errorMessage = 'Error loading products';
        }
    }
    
    /**
     * Get current product to display
     */
    get currentProduct() {
        return this.products[this.currentIndex] || {};
    }
    
    /**
     * Check if we have products to display
     */
    get hasProducts() {
        return this.products.length > 0;
    }
    
    /**
     * Check if navigation should be shown
     */
    get showNavigation() {
        return this.products.length > 1;
    }
    
    /**
     * Check if we're on the first card
     */
    get isFirstCard() {
        return this.currentIndex === 0;
    }
    
    /**
     * Check if we're on the last card
     */
    get isLastCard() {
        return this.currentIndex === this.products.length - 1;
    }
    
    /**
     * Get card counter text (e.g., "1 / 3")
     */
    get cardCounter() {
        return `${this.currentIndex + 1} / ${this.products.length}`;
    }
    
    /**
     * Map time text to symbols
     */
    mapTimeToSymbol(timeText) {
        if (!timeText) return '';
        const normalized = timeText.toUpperCase().trim();
        if (normalized === 'AM') return '☼';
        if (normalized === 'PM') return '☽';
        if (normalized === 'AM/PM' || normalized === 'AM PM') return '☼☽';
        return timeText; // Return original if no match
    }
    
    /**
     * Get products with index for dot indicators
     */
    get productsWithIndex() {
        return this.products.map((product, index) => ({
            key: `dot-${index}`,
            index: index,
            isActive: index === this.currentIndex,
            dotClass: index === this.currentIndex ? 'dot active' : 'dot'
        }));
    }
    
    /**
     * Handle previous button click
     */
    handlePrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }
    
    /**
     * Handle next button click
     */
    handleNext() {
        if (this.currentIndex < this.products.length - 1) {
            this.currentIndex++;
        }
    }
    
    /**
     * Handle dot indicator click
     */
    handleDotClick(event) {
        const index = parseInt(event.target.dataset.index, 10);
        if (!isNaN(index) && index >= 0 && index < this.products.length) {
            this.currentIndex = index;
        }
    }
    
    /**
     * Handle product card click - show selected response on screen and send to chat
     */
    handleProductSelect() {
        this.selectedProduct = this.products[this.currentIndex];
        this.sendSelectionToChat();
    }
    
    /**
     * Send selected product to chat via embeddedservice_configuration (same as agentDeStringOutput)
     */
    sendSelectionToChat() {
        if (!this.selectedProduct) return;
        
        const message = this.selectedProduct.description
            ? `${this.selectedProduct.title}`
            : this.selectedProduct.title;
        
        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                embeddedservice_configuration.util.sendTextMessage(message)
                    .then(() => {
                        console.log('Successfully sent carousel selection to chat');
                    })
                    .catch((error) => {
                        console.error('Error sending carousel selection to chat', error);
                    });
            } else {
                console.log('embeddedservice_configuration not available (likely in builder/preview mode)');
            }
        } catch (error) {
            console.error('Error in sendSelectionToChat:', error);
        }
    }
    
    /**
     * Handle keyboard (Enter/Space) for card selection
     */
    handleProductKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleProductSelect();
        }
    }
    
    /**
     * Check if a product has been selected
     */
    get hasSelection() {
        return this.selectedProduct !== null;
    }
}