import { LightningElement, api } from 'lwc';
import virtualTryOn from '@salesforce/apex/de_VirtualTryOnDressImagenService.virtualTryOn';
import fetchImageAsBase64 from '@salesforce/apex/de_VirtualTryOnDressImagenService.fetchImageAsBase64';
import deSherwanis from '@salesforce/resourceUrl/deSherwanis';

const MAX_DIMENSION = 1024;
const SHERWANI_BASE_URL = 'https://YOUR-SITE-DOMAIN.my.site.com/resource/deSherwanis';
const SAREE_BASE_URL = 'https://YOUR-SITE-DOMAIN.my.site.com/resource/deSarees';
const DRESS_URL_BY_KEY = {
    ivorybrocadesherwani: `${SHERWANI_BASE_URL}/Sherwani1.png`,
    regalembroideredsherwani: `${SHERWANI_BASE_URL}/Sherwani2.png`,
    creamfestivesherwani: `${SHERWANI_BASE_URL}/Sherwani3.png`,
    midnightbluesherwani: `${SHERWANI_BASE_URL}/Sherwani4.png`,
    royalbanarasisilksaree: `${SAREE_BASE_URL}/Saree1.jpg`,
    kanjeevaramtemplebordersaree: `${SAREE_BASE_URL}/Saree2.jpg`,
    pastelorganzasaree: `${SAREE_BASE_URL}/Saree3.jpg`,
    deepmaroonvelvetsaree: `${SAREE_BASE_URL}/Saree4.jpg`
};

export default class De_virtual_try_on_dress_agent extends LightningElement {
    _value;

    @api
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
        this.applyIncomingValue();
    }

    personFileName = '';
    personBase64 = '';
    personPreviewUrl = '';
    productBase64 = '';
    productImageUrl = '';
    productFromUrl = false;
    tryOnImageUrl = '';
    expandedImageUrl = '';
    expandedImageTitle = '';
    isLoading = false;
    errorMessage = '';
    statusMessage = '';

    connectedCallback() {
        this.applyIncomingValue();
    }

    get isGenerateDisabled() {
        const hasProduct = this.productBase64 || this.productFromUrl;
        return !this.personBase64 || !hasProduct || this.isLoading;
    }

    get generateButtonLabel() {
        return this.isLoading ? 'Generating...' : 'Try On Dress';
    }

    get showResults() {
        return !!this.tryOnImageUrl;
    }

    get showImagePreviewModal() {
        return !!this.expandedImageUrl;
    }

    handlePersonFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.personFileName = file.name;
        this.resizeImage(file).then(({ preview, base64 }) => {
            this.personPreviewUrl = preview;
            this.personBase64 = base64;
        });
    }

    resizeImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    resolve({
                        preview: dataUrl,
                        base64: dataUrl.split(',')[1]
                    });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    handleRemovePersonFile() {
        this.personFileName = '';
        this.personBase64 = '';
        this.personPreviewUrl = '';
    }

    async handleGenerate() {
        this.isLoading = true;
        this.errorMessage = '';
        this.tryOnImageUrl = '';

        try {
            let productBase64 = this.productBase64;
            if (!productBase64 && this.productFromUrl) {
                this.statusMessage = 'Fetching dress image...';
                productBase64 = await fetchImageAsBase64({ imageUrl: this.productImageUrl });
                this.productBase64 = productBase64;
            }

            this.statusMessage = 'Applying selected dress to your image...';
            const tryOnResult = await virtualTryOn({
                personImageBase64: this.personBase64,
                productImageBase64: productBase64
            });
            this.tryOnImageUrl = 'data:' + tryOnResult.mimeType + ';base64,' + tryOnResult.base64Image;
        } catch (error) {
            let msg = 'An error occurred while generating the try-on image.';
            if (error.body && error.body.message) {
                msg = error.body.message;
            } else if (error.message) {
                msg = error.message;
            }
            this.errorMessage = msg;
        } finally {
            this.isLoading = false;
            this.statusMessage = '';
        }
    }

    handleDownload() {
        const link = document.createElement('a');
        link.href = this.tryOnImageUrl;
        link.download = 'virtual-tryon-dress.png';
        link.click();
    }

    handleReset() {
        this.tryOnImageUrl = '';
        this.errorMessage = '';
        this.personFileName = '';
        this.personBase64 = '';
        this.personPreviewUrl = '';
        this.closeImagePreview();
    }

    handleOpenImagePreview(event) {
        this.expandedImageUrl = event.currentTarget.dataset.image || '';
        this.expandedImageTitle = event.currentTarget.dataset.title || 'Image Preview';
    }

    closeImagePreview() {
        this.expandedImageUrl = '';
        this.expandedImageTitle = '';
    }

    handleModalBackdropClick(event) {
        if (event.target.classList.contains('image-modal')) {
            this.closeImagePreview();
        }
    }

    applyIncomingValue() {
        const candidate =
            this._value?.productImageUrl ||
            this._value?.selectedProduct ||
            this._value?.productName ||
            '';

        if (candidate) {
            this.productImageUrl = this.resolveProductUrl(candidate);
            this.productFromUrl = true;
        }
    }

    resolveProductUrl(rawValue) {
        const input = (rawValue || '').trim();
        if (!input) {
            return '';
        }
        if (/^(https?:)?\/\//i.test(input) && !input.includes('salesforce.rel')) {
            return input;
        }
        if (input.includes('salesforce.rel')) {
            const slug = input.substring(input.lastIndexOf('/') + 1).split('?')[0];
            const normalized = slug.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (DRESS_URL_BY_KEY[normalized]) {
                return DRESS_URL_BY_KEY[normalized];
            }
        }

        // Convert runtime-relative org asset URLs to public site resource URLs.
        if (input.includes('/resource/')) {
            const fileName = input.substring(input.lastIndexOf('/') + 1).split('?')[0];
            if (fileName) {
                if (/^Sherwani\d/i.test(fileName)) {
                    return `${SHERWANI_BASE_URL}/${fileName}`;
                }
                if (/^Saree\d/i.test(fileName)) {
                    return `${SAREE_BASE_URL}/${fileName}`;
                }
                const normalized = fileName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                if (DRESS_URL_BY_KEY[normalized]) {
                    return DRESS_URL_BY_KEY[normalized];
                }
            }
        }

        // Accept friendly names or underscored tokens from chat/orchestration.
        const normalized = input
            .replace(/^virtual\s*try\s*on\s*:\s*/i, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();

        return DRESS_URL_BY_KEY[normalized] || `${deSherwanis}/${input}`;
    }
}
