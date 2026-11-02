import { LightningElement, api } from 'lwc';
/* global embeddedservice_configuration */

const NORTH_IMAGE_URL = 'https://YOUR-SITE-DOMAIN.my.site.com/resource/North_Indian_Necklace';
const SOUTH_IMAGE_URL = 'https://YOUR-SITE-DOMAIN.my.site.com/resource/South_Indian_Necklace';
const FINAL_IMAGE_URL = 'https://YOUR-SITE-DOMAIN.my.site.com/resource/Final_Necklace_Image';

export default class AgentDeOptionsSelectionV3 extends LightningElement {
    @api value;

    selectedOption = null;
    messageSent = false;
    isGeneratingRecommendation = false;
    recommendationTimer;

    get questionLabel() {
        return this.value?.questionLabel || 'Cultural Heritage Roots';
    }

    get ctaLabel() {
        return this.value?.ctaLabel || 'Shop This Look';
    }

    get selectedForPrefix() {
        return this.value?.selectedForLabel || 'Selected for:';
    }

    get optionCards() {
        if (this.value?.optionCards?.length) {
            return this.value.optionCards;
        }

        return [
            {
                value: 'north',
                title: 'North Indian',
                subtitle: 'Majestic Kundan',
                imageUrl: NORTH_IMAGE_URL
            },
            {
                value: 'south',
                title: 'South Indian',
                subtitle: 'Temple Craft',
                imageUrl: SOUTH_IMAGE_URL
            }
        ];
    }

    get recommendedCard() {
        const card = this.value?.recommendedCard || {
            value: 'recommended',
            title: 'The Mangala Kalasha Set',
            subtitle: '22KT Hallmarked Yellow Gold',
            imageUrl: FINAL_IMAGE_URL
        };
        return {
            ...card,
            imageUrl: this.resolveImageUrl(card)
        };
    }

    get choiceCards() {
        return this.optionCards.map((card, index) => {
            const selected = card.value === this.selectedOption;
            return {
                id: `${card.value}-${index}`,
                value: card.value,
                title: card.title,
                subtitle: card.subtitle,
                imageUrl: this.resolveImageUrl(card),
                cardClass: selected ? 'de-v3-choice-card de-v3-choice-card-selected' : 'de-v3-choice-card',
                tickClass: selected ? 'de-v3-tick de-v3-tick-selected' : 'de-v3-tick'
            };
        });
    }

    resolveImageUrl(card) {
        const payloadUrl = card?.imageUrl || '';
        if (payloadUrl && !payloadUrl.includes('URL_Redacted')) {
            return payloadUrl;
        }

        const value = (card?.value || '').toLowerCase();
        if (value === 'north') {
            return NORTH_IMAGE_URL;
        }
        if (value === 'south') {
            return SOUTH_IMAGE_URL;
        }
        if (value === 'recommended') {
            return FINAL_IMAGE_URL;
        }
        return payloadUrl;
    }

    get showChoiceCards() {
        return this.choiceCards.length > 0;
    }

    get showRecommendation() {
        return !!this.selectedOption && !this.isGeneratingRecommendation;
    }

    get showAiThinking() {
        return !!this.selectedOption && this.isGeneratingRecommendation;
    }

    get selectedForText() {
        if (!this.selectedOption) {
            return '';
        }

        const selected = this.optionCards.find((card) => card.value === this.selectedOption);
        const selectedTitle = selected?.title || this.selectedOption;
        return `${this.selectedForPrefix} ${selectedTitle}`;
    }

    handleChoiceClick(event) {
        this.selectedOption = event.currentTarget.dataset.value;
        this.isGeneratingRecommendation = true;
        this.clearRecommendationTimer();
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.recommendationTimer = setTimeout(() => {
            this.isGeneratingRecommendation = false;
            this.recommendationTimer = null;
        }, 4000);
    }

    handleShopClick() {
        const message = `${this.ctaLabel}: ${this.recommendedCard.title} (${this.selectedForText})`;
        this.sendMessageToChat(message);
        this.dispatchEvent(
            new CustomEvent('optionselected', {
                detail: {
                    selectedOption: this.selectedOption,
                    recommendedTitle: this.recommendedCard.title,
                    action: 'shop'
                },
                bubbles: true
            })
        );
    }

    sendMessageToChat(message) {
        if (this.messageSent || !message) {
            return;
        }

        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                this.messageSent = true;
                embeddedservice_configuration.util.sendTextMessage(message).catch(() => {
                    this.messageSent = false;
                });
            }
        } catch (error) {
            this.messageSent = false;
            console.error('Error in sendMessageToChat:', error);
        }
    }

    disconnectedCallback() {
        this.clearRecommendationTimer();
    }

    clearRecommendationTimer() {
        if (this.recommendationTimer) {
            clearTimeout(this.recommendationTimer);
            this.recommendationTimer = null;
        }
    }
}
