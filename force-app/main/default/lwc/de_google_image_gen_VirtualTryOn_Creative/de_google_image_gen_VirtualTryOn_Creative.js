import { LightningElement } from 'lwc';
import virtualTryOn from '@salesforce/apex/de_GoogleImagenService.virtualTryOn';
import enhanceWithCreative from '@salesforce/apex/de_GoogleImagenService.enhanceWithCreative';

const MAX_DIMENSION = 1024;

export default class De_google_image_gen_VirtualTryOn_Creative extends LightningElement {
    prompt = '';
    personFileName = '';
    personBase64 = '';
    personPreviewUrl = '';
    productFileName = '';
    productBase64 = '';
    productPreviewUrl = '';
    tryOnImageUrl = '';
    tryOnBase64 = '';
    finalImageUrl = '';
    isLoading = false;
    errorMessage = '';
    statusMessage = '';

    get isGenerateDisabled() {
        return !this.prompt || !this.personBase64 || !this.productBase64 || this.isLoading;
    }

    get generateButtonLabel() {
        return this.isLoading ? 'Generating...' : 'Generate';
    }

    get showResults() {
        return this.tryOnImageUrl || this.finalImageUrl;
    }

    handlePromptChange(event) {
        this.prompt = event.target.value;
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

    handleProductFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.productFileName = file.name;
        this.resizeImage(file).then(({ preview, base64 }) => {
            this.productPreviewUrl = preview;
            this.productBase64 = base64;
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

    handleRemoveProductFile() {
        this.productFileName = '';
        this.productBase64 = '';
        this.productPreviewUrl = '';
    }

    async handleGenerate() {
        this.isLoading = true;
        this.errorMessage = '';
        this.tryOnImageUrl = '';
        this.tryOnBase64 = '';
        this.finalImageUrl = '';

        try {
            // Step 1: Virtual Try-On
            this.statusMessage = 'Step 1 of 2 — Mapping jewelry onto person...';
            const tryOnResult = await virtualTryOn({
                personImageBase64: this.personBase64,
                productImageBase64: this.productBase64
            });
            this.tryOnBase64 = tryOnResult.base64Image;
            this.tryOnImageUrl = 'data:' + tryOnResult.mimeType + ';base64,' + tryOnResult.base64Image;

            // Step 2: Creative enhancement using the try-on output
            this.statusMessage = 'Step 2 of 2 — Adding environment and styling...';
            const finalResult = await enhanceWithCreative({
                prompt: this.prompt,
                tryOnImageBase64: this.tryOnBase64
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
            console.error('Generation error:', JSON.stringify(error));
        } finally {
            this.isLoading = false;
            this.statusMessage = '';
        }
    }

    handleDownload() {
        const link = document.createElement('a');
        link.href = this.finalImageUrl;
        link.download = 'tryon-creative-output.png';
        link.click();
    }
}