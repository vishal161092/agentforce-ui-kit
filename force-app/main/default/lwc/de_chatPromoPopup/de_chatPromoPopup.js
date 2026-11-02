import { LightningElement, api } from 'lwc';

export default class De_chatPromoPopup extends LightningElement {
    // ─── @api properties ───────────────────────────────────────────────
    @api headline = 'The right tyre. Recommended by AI.';
    @api description = "Tell us your vehicle and conditions — we'll do the matching.";
    @api buttonText = 'Start Matching';
    @api imageUrl = '';
    @api delaySeconds = 3;
    @api brandColor = '#2e7d32';
    @api position = 'bottom-right';
    @api startMessage = 'Hi';
    @api badgeText = 'AI Tyre Assistant';

    // ─── Options mode ──────────────────────────────────────────────────
    // When true, the single CTA is replaced by selectable topic cards.
    // Clicking a card sends that card's own text (no "Hi") and opens chat,
    // routing the customer straight into the matching journey.
    @api showOptions = false;
    @api option1Label = "I'm looking to buy a gift card";
    @api option2Label = 'I placed an order and need assistance';
    @api option3Label = 'I received a gift card and I need help';
    @api brandLabel = 'Brightwave';
    @api theme = 'dark';
    @api popupWidth = 320;
    @api popupHeight = 380;
    @api variant = 'popup'; // popup | exit-intent | split-screen | bubble | bell | tyre-ring | ribbon | landscape

    // ─── Internal state ────────────────────────────────────────────────
    isVisible = false;
    isDismissed = false;
    bgRendered = false;

    // Variant-specific open states
    panelOpen = false;     // split-screen
    bubbleOpen = false;    // bubble
    bellOpen = false;      // bell
    tyreCardOpen = false;  // tyre-ring
    ribbonCardOpen = false; // ribbon

    // ─── Variant booleans (for template) ───────────────────────────────
    get isPopup() { return this.variant === 'popup'; }
    get isExitIntent() { return this.variant === 'exit-intent'; }
    get isSplitScreen() { return this.variant === 'split-screen'; }
    get isBubble() { return this.variant === 'bubble'; }
    get isBell() { return this.variant === 'bell'; }
    get isTyreRing() { return this.variant === 'tyre-ring'; }
    get isRibbon() { return this.variant === 'ribbon'; }
    get isLandscape() { return this.variant === 'landscape'; }

    // ─── Theme ─────────────────────────────────────────────────────────
    get isDark() {
        return this.theme === 'dark';
    }

    // ─── Lifecycle ─────────────────────────────────────────────────────
    connectedCallback() {
        this.hideChatButton();

        if (this.isExitIntent) {
            this._exitHandler = this._handleMouseLeave.bind(this);
            document.addEventListener('mouseleave', this._exitHandler);
        } else {
            const delay = (this.delaySeconds || 3) * 1000;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                if (!this.isDismissed) {
                    this.isVisible = true;
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(() => this.renderBg(), 0);
                }
            }, delay);
        }
    }

    disconnectedCallback() {
        if (this._exitHandler) {
            document.removeEventListener('mouseleave', this._exitHandler);
        }
    }

    renderedCallback() {
        if (this.isVisible && !this.bgRendered) {
            this.renderBg();
        }
    }

    // ─── Exit-intent handler ───────────────────────────────────────────
    _handleMouseLeave(e) {
        if (e.clientY <= 0 && !this.isDismissed && !this.isVisible) {
            this.isVisible = true;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => this.renderBg(), 0);
        }
    }

    // ─── Background renderer ───────────────────────────────────────────
    renderBg() {
        const container = this.template.querySelector('.de-promo-bg');
        if (!container || this.bgRendered) return;
        this.bgRendered = true;

        if (this.imageUrl) {
            container.innerHTML = `<img src="${this.imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />`;
        } else {
            const color = this.brandColor || '#2e7d32';
            container.innerHTML = `<svg viewBox="0 0 320 380" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="tyreBody" cx="35%" cy="30%">
                        <stop offset="0%" stop-color="#505050"/>
                        <stop offset="100%" stop-color="#0f0f0f"/>
                    </radialGradient>
                    <radialGradient id="rimBody" cx="38%" cy="32%">
                        <stop offset="0%" stop-color="#cccccc"/>
                        <stop offset="100%" stop-color="#666666"/>
                    </radialGradient>
                    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#141414"/>
                        <stop offset="100%" stop-color="#060606"/>
                    </linearGradient>
                </defs>
                <rect width="320" height="380" fill="#0e0e0e"/>
                <ellipse cx="0" cy="380" rx="200" ry="140" fill="${color}22"/>
                <rect y="285" width="320" height="95" fill="url(#floorGrad)"/>
                <line x1="0" y1="285" x2="320" y2="285" stroke="${color}" stroke-width="2"/>
                <line x1="0" y1="310" x2="320" y2="310" stroke="${color}30" stroke-width="1"/>
                <g transform="translate(160, 200)">
                    <circle r="115" fill="url(#tyreBody)"/>
                    <circle r="115" fill="none" stroke="#2a2a2a" stroke-width="14"/>
                    <circle r="99" fill="none" stroke="#1a1a1a" stroke-width="5"/>
                    <circle r="90" fill="none" stroke="#2e2e2e" stroke-width="2"/>
                    <circle r="115" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="6" stroke-dasharray="18 10"/>
                    <circle r="70" fill="url(#rimBody)"/>
                    <circle r="70" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="3"/>
                    <circle r="53" fill="#111"/>
                    <line x1="-53" y1="0" x2="53" y2="0" stroke="#aaa" stroke-width="11" stroke-linecap="round"/>
                    <line x1="0" y1="-53" x2="0" y2="53" stroke="#aaa" stroke-width="11" stroke-linecap="round"/>
                    <line x1="-37" y1="-37" x2="37" y2="37" stroke="#aaa" stroke-width="11" stroke-linecap="round"/>
                    <line x1="37" y1="-37" x2="-37" y2="37" stroke="#aaa" stroke-width="11" stroke-linecap="round"/>
                    <line x1="-53" y1="0" x2="53" y2="0" stroke="rgba(255,255,255,0.15)" stroke-width="3" stroke-linecap="round"/>
                    <line x1="0" y1="-53" x2="0" y2="53" stroke="rgba(255,255,255,0.15)" stroke-width="3" stroke-linecap="round"/>
                    <circle r="14" fill="#ccc"/>
                    <circle r="10" fill="#888"/>
                    <circle r="5" fill="#444"/>
                    <circle r="2" fill="#222"/>
                </g>
                <g transform="translate(-10, 270)">
                    <circle r="58" fill="#111"/>
                    <circle r="58" fill="none" stroke="#222" stroke-width="6"/>
                    <circle r="44" fill="none" stroke="#1a1a1a" stroke-width="3"/>
                    <circle r="34" fill="#3a3a3a"/>
                    <circle r="25" fill="#111"/>
                    <line x1="-25" y1="0" x2="25" y2="0" stroke="#666" stroke-width="5" stroke-linecap="round"/>
                    <line x1="0" y1="-25" x2="0" y2="25" stroke="#666" stroke-width="5" stroke-linecap="round"/>
                    <line x1="-18" y1="-18" x2="18" y2="18" stroke="#666" stroke-width="5" stroke-linecap="round"/>
                    <line x1="18" y1="-18" x2="-18" y2="18" stroke="#666" stroke-width="5" stroke-linecap="round"/>
                    <circle r="7" fill="#777"/>
                    <circle r="3" fill="#444"/>
                </g>
                <rect width="320" height="60" fill="rgba(0,0,0,0.35)"/>
            </svg>`;
        }
    }

    // ─── MIAW hide / show ──────────────────────────────────────────────
    hideChatButton() {
        const style = document.createElement('style');
        style.id = 'de-hide-miaw-btn';
        style.textContent = `
            .embeddedMessagingFrame,
            .embedded-messaging,
            [class*="embeddedMessaging"],
            .embeddedMessagingConversationButton {
                display: none !important;
                visibility: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }

    showChatButton() {
        const style = document.getElementById('de-hide-miaw-btn');
        if (style) {
            style.remove();
        }
    }

    // ─── Options ───────────────────────────────────────────────────────
    // Card text IS the message sent, so it matches the router's topic
    // routing. Icons mirror DeOptionsSelectionActionV2's card mapping.
    get topicOptions() {
        return [
            { key: 'opt1', label: this.option1Label, icon: 'utility:card_details' },
            { key: 'opt2', label: this.option2Label, icon: 'utility:fulfillment_order' },
            { key: 'opt3', label: this.option3Label, icon: 'utility:workforce_engagement' }
        ].filter((o) => o.label && o.label.trim());
    }

    handleOptionClick(evt) {
        this._launchChat(evt.currentTarget.dataset.message);
    }

    // ─── Core actions ──────────────────────────────────────────────────
    handleChat() {
        this._launchChat(this.startMessage || 'Hi');
    }

    _launchChat(message) {
        this.isVisible = false;
        this.panelOpen = false;
        this.bubbleOpen = false;
        this.bellOpen = false;
        this.tyreCardOpen = false;
        this.ribbonCardOpen = false;
        this.showChatButton();

        window.dispatchEvent(new CustomEvent('messageFromLWC', {
            detail: { message }
        }));
    }

    handleDismiss() {
        this.isVisible = false;
        this.isDismissed = true;
        this.panelOpen = false;
        this.bubbleOpen = false;
        this.bellOpen = false;
        this.tyreCardOpen = false;
        this.ribbonCardOpen = false;
    }

    // ─── Variant-specific toggles ──────────────────────────────────────
    togglePanel() {
        this.panelOpen = !this.panelOpen;
    }

    toggleBubble() {
        this.bubbleOpen = !this.bubbleOpen;
    }

    toggleBell() {
        this.bellOpen = !this.bellOpen;
    }

    toggleTyreCard() {
        this.tyreCardOpen = !this.tyreCardOpen;
    }

    toggleRibbonCard() {
        this.ribbonCardOpen = !this.ribbonCardOpen;
    }

    // ─── Computed: image helper ────────────────────────────────────────
    get hasImage() {
        return !!this.imageUrl;
    }

    get imageStyle() {
        return this.imageUrl ? `background-image: url(${this.imageUrl}); background-size: cover; background-position: center;` : '';
    }

    // ─── Computed: sizing ──────────────────────────────────────────────
    get popupSizeStyle() {
        return `width: ${this.popupWidth}px; height: ${this.popupHeight}px`;
    }

    // ─── Computed: brand-color styles ──────────────────────────────────
    get buttonStyle() {
        return `background-color: ${this.brandColor}`;
    }

    get badgeDotStyle() {
        return `background-color: ${this.brandColor}`;
    }

    get splitTabStyle() {
        return `background-color: ${this.brandColor}`;
    }

    get bubbleIcoStyle() {
        return `background-color: ${this.brandColor}`;
    }

    get bellHeaderStyle() {
        return `background-color: ${this.brandColor}`;
    }

    get tyreTrigStyle() {
        return `box-shadow: 0 0 12px 4px ${this.brandColor}; border-color: ${this.brandColor}`;
    }

    get landBorderStyle() {
        return `border-color: ${this.brandColor}`;
    }

    get ribbonBandStyle() {
        return `background-color: ${this.brandColor}`;
    }

    // ─── Computed: theme-aware classes — shared ────────────────────────
    get popupClass() {
        const pos = `de-promo-${this.position}`;
        const vis = this.isVisible ? 'de-promo-visible' : '';
        const thm = this.isDark ? 'de-promo-popup-dark' : 'de-promo-popup-light';
        return `de-promo-popup ${pos} ${thm} ${vis}`;
    }

    get overlayClass() {
        return this.isDark ? 'de-promo-overlay-dark' : 'de-promo-overlay-light';
    }

    get wordmarkClass() {
        return this.isDark ? 'de-promo-wordmark-dark' : 'de-promo-wordmark-light';
    }

    get closeClass() {
        return this.isDark ? 'de-promo-close-dark' : 'de-promo-close-light';
    }

    get glassClass() {
        return this.isDark ? 'de-promo-glass-dark' : 'de-promo-glass-light';
    }

    get badgeClass() {
        return this.isDark ? 'de-promo-badge-dark' : 'de-promo-badge-light';
    }

    get badgeTextClass() {
        return this.isDark ? 'de-promo-badge-txt-dark' : 'de-promo-badge-txt-light';
    }

    get headlineClass() {
        return this.isDark ? 'de-promo-headline-dark' : 'de-promo-headline-light';
    }

    get descClass() {
        return this.isDark ? 'de-promo-desc-dark' : 'de-promo-desc-light';
    }

    // ─── Computed: theme-aware classes — exit-intent ───────────────────
    get exitOverlayClass() {
        const vis = this.isVisible ? 'de-exit-visible' : '';
        return `de-exit-overlay ${vis}`;
    }

    get exitCardClass() {
        return this.isDark ? 'de-exit-card de-exit-card-dark' : 'de-exit-card de-exit-card-light';
    }

    get exitHeadlineClass() {
        return this.isDark ? 'de-exit-headline-dark' : 'de-exit-headline-light';
    }

    get exitDescClass() {
        return this.isDark ? 'de-exit-desc-dark' : 'de-exit-desc-light';
    }

    get exitCloseClass() {
        return this.isDark ? 'de-exit-close-dark' : 'de-exit-close-light';
    }

    // ─── Computed: theme-aware classes — split-screen ──────────────────
    get splitWrapperClass() {
        const vis = this.isVisible ? 'de-split-visible' : '';
        return `de-split-wrapper ${vis}`;
    }

    get splitPanelClass() {
        const open = this.panelOpen ? 'de-split-panel-open' : '';
        const thm = this.isDark ? 'de-split-panel-dark' : 'de-split-panel-light';
        return `de-split-panel ${thm} ${open}`;
    }

    get splitHeadlineClass() {
        return this.isDark ? 'de-split-headline-dark' : 'de-split-headline-light';
    }

    get splitDescClass() {
        return this.isDark ? 'de-split-desc-dark' : 'de-split-desc-light';
    }

    get splitTabClass() {
        return 'de-split-tab';
    }

    // ─── Computed: theme-aware classes — bubble ────────────────────────
    get bubbleWrapperClass() {
        const vis = this.isVisible ? 'de-bubble-visible' : '';
        return `de-bubble-wrapper ${vis}`;
    }

    get bubbleCardClass() {
        const open = this.bubbleOpen ? 'de-bubble-card-open' : '';
        const thm = this.isDark ? 'de-bubble-card-dark' : 'de-bubble-card-light';
        return `de-bubble-card ${thm} ${open}`;
    }

    get bubbleHeadlineClass() {
        return this.isDark ? 'de-bubble-headline-dark' : 'de-bubble-headline-light';
    }

    get bubbleDescClass() {
        return this.isDark ? 'de-bubble-desc-dark' : 'de-bubble-desc-light';
    }

    get bubbleTriggerClass() {
        return 'de-bubble-trigger';
    }

    // ─── Computed: theme-aware classes — bell ──────────────────────────
    get bellWrapperClass() {
        const vis = this.isVisible ? 'de-bell-visible' : '';
        return `de-bell-wrapper ${vis}`;
    }

    get bellCardClass() {
        const open = this.bellOpen ? 'de-bell-card-open' : '';
        const thm = this.isDark ? 'de-bell-card-dark' : 'de-bell-card-light';
        return `de-bell-card ${thm} ${open}`;
    }

    get bellHeadlineClass() {
        return this.isDark ? 'de-bell-headline-dark' : 'de-bell-headline-light';
    }

    get bellDescClass() {
        return this.isDark ? 'de-bell-desc-dark' : 'de-bell-desc-light';
    }

    get bellTriggerClass() {
        return 'de-bell-trigger';
    }

    // ─── Computed: theme-aware classes — tyre-ring ─────────────────────
    get tyreWrapperClass() {
        const vis = this.isVisible ? 'de-tyre-visible' : '';
        return `de-tyre-wrapper ${vis}`;
    }

    get tyreCardClass() {
        const open = this.tyreCardOpen ? 'de-tyre-card-open' : '';
        const thm = this.isDark ? 'de-tyre-card-dark' : 'de-tyre-card-light';
        return `de-tyre-card ${thm} ${open}`;
    }

    get tyreHeadlineClass() {
        return this.isDark ? 'de-tyre-headline-dark' : 'de-tyre-headline-light';
    }

    get tyreDescClass() {
        return this.isDark ? 'de-tyre-desc-dark' : 'de-tyre-desc-light';
    }

    get tyreTriggerClass() {
        return 'de-tyre-trigger';
    }

    // ─── Computed: theme-aware classes — ribbon ────────────────────────
    get ribbonWrapperClass() {
        const vis = this.isVisible ? 'de-ribbon-visible' : '';
        return `de-ribbon-wrapper ${vis}`;
    }

    get ribbonCardClass() {
        const open = this.ribbonCardOpen ? 'de-ribbon-card-open' : '';
        const thm = this.isDark ? 'de-ribbon-card-dark' : 'de-ribbon-card-light';
        return `de-ribbon-card ${thm} ${open}`;
    }

    get ribbonHeadlineClass() {
        return this.isDark ? 'de-ribbon-headline-dark' : 'de-ribbon-headline-light';
    }

    get ribbonDescClass() {
        return this.isDark ? 'de-ribbon-desc-dark' : 'de-ribbon-desc-light';
    }

    get ribbonBandClass() {
        return 'de-ribbon-band';
    }

    // ─── Computed: theme-aware classes — landscape ─────────────────────
    get landscapeWrapperClass() {
        const vis = this.isVisible ? 'de-land-visible' : '';
        return `de-land-wrapper ${vis}`;
    }

    get landscapeCardClass() {
        const thm = this.isDark ? 'de-land-card-dark' : 'de-land-card-light';
        return `de-land-card ${thm}`;
    }

    get landscapeHeadlineClass() {
        return this.isDark ? 'de-land-headline-dark' : 'de-land-headline-light';
    }

    get landscapeDescClass() {
        return this.isDark ? 'de-land-desc-dark' : 'de-land-desc-light';
    }

    get landscapeCloseClass() {
        return this.isDark ? 'de-land-close-dark' : 'de-land-close-light';
    }
}
