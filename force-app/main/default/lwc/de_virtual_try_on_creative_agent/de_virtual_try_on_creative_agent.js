import { LightningElement, api } from 'lwc';
import virtualTryOn from '@salesforce/apex/de_VirtualTryOnGoogleImagenService.virtualTryOn';
import inpaintImage from '@salesforce/apex/de_VirtualTryOnGoogleImagenService.inpaintImage';
import fetchImageAsBase64 from '@salesforce/apex/de_VirtualTryOnGoogleImagenService.fetchImageAsBase64';

const MAX_DIMENSION = 1024;

export default class De_virtual_try_on_creative_agent extends LightningElement {
    @api value;

    prompt = '';
    personFileName = '';
    personBase64 = '';
    personPreviewUrl = '';
    productBase64 = '';
    productImageUrl = '';
    productFromUrl = false;
    tryOnImageUrl = '';
    tryOnBase64 = '';
    finalImageUrl = '';
    expandedImageUrl = '';
    expandedImageTitle = '';
    isLoading = false;
    errorMessage = '';
    statusMessage = '';

    connectedCallback() {
        if (!this.value) {
            return;
        }
        this.prompt = this.value.prompt || '';
        if (this.value.productImageUrl) {
            this.productImageUrl = this.value.productImageUrl;
            this.productFromUrl = true;
        }
    }

    get isGenerateDisabled() {
        const hasProduct = this.productBase64 || this.productFromUrl;
        return !this.personBase64 || !hasProduct || this.isLoading;
    }

    get generateButtonLabel() {
        return this.isLoading ? 'Generating...' : 'Generate Look';
    }

    get showResults() {
        return this.tryOnImageUrl || this.finalImageUrl;
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
        this.tryOnBase64 = '';
        this.finalImageUrl = '';

        try {
            let productBase64 = this.productBase64;
            if (!productBase64 && this.productFromUrl) {
                this.statusMessage = 'Fetching product image...';
                productBase64 = await fetchImageAsBase64({ imageUrl: this.productImageUrl });
                this.productBase64 = productBase64;
            }

            this.statusMessage = 'Step 1 of 2 — Mapping jewelry onto you...';
            const tryOnResult = await virtualTryOn({
                personImageBase64: this.personBase64,
                productImageBase64: productBase64
            });
            this.tryOnBase64 = tryOnResult.base64Image;
            this.tryOnImageUrl = 'data:' + tryOnResult.mimeType + ';base64,' + tryOnResult.base64Image;

            this.statusMessage = 'Step 2 of 2 — Creating your styled look...';
            const finalResult = await inpaintImage({
                prompt: this.prompt,
                personImageBase64: this.tryOnBase64
            });
            this.finalImageUrl = 'data:' + finalResult.mimeType + ';base64,' + finalResult.base64Image;
        } catch (error) {
            let msg = 'An error occurred while generating the image.';
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
        link.href = this.finalImageUrl;
        link.download = 'virtual-tryon-final.png';
        link.click();
    }

    handleReset() {
        this.tryOnImageUrl = '';
        this.tryOnBase64 = '';
        this.finalImageUrl = '';
        this.errorMessage = '';
        this.personFileName = '';
        this.personBase64 = '';
        this.personPreviewUrl = '';
        this.closeImagePreview();
    }

    get showImagePreviewModal() {
        return !!this.expandedImageUrl;
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
}
