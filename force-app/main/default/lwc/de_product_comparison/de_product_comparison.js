import { LightningElement, api } from 'lwc';

export default class De_product_comparison extends LightningElement {
    _value;
    products = [];
    errorMessage = '';

    @api
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
        this.parseComparison();
    }

    connectedCallback() {
        this.parseComparison();
    }

    parseComparison() {
        this.products = [];
        this.errorMessage = '';

        try {
            const raw =
                this._value?.comparisonResultJSON ||
                this._value?.comparison_result ||
                this._value;

            if (!raw) {
                this.errorMessage = 'No product comparison data found.';
                return;
            }

            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
            const products = data?.comparison_result?.products;

            if (!Array.isArray(products) || products.length === 0) {
                this.errorMessage = 'No products available for comparison.';
                return;
            }

            this.products = products.map((product, index) => ({
                key: `${product.id || product.name || 'product'}-${index}`,
                id: product.id || '',
                name: product.name || '',
                engine: product.engine || '',
                power: product.power || '',
                torque: product.torque || '',
                transmission: product.transmission || '',
                fuelEfficiency: product.fuel_efficiency || '',
                seatingCapacity: product.seating_capacity,
                launchDate: product.launch_date || '',
                safetyFeatures: Array.isArray(product.safety_features)
                    ? product.safety_features.join(', ')
                    : ''
            }));
        } catch (error) {
            this.errorMessage = 'Unable to parse product comparison payload.';
            // eslint-disable-next-line no-console
            console.error('de_product_comparison parse error:', error);
        }
    }

    get hasProducts() {
        return this.products.length > 0;
    }
}
