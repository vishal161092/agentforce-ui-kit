import { LightningElement, api } from 'lwc';

/** Static demo content from product-comparison mockup (replace with @api value when wiring the agent). */
const STATIC = {
    aiRecommendationTitle: 'AI Recommendation',
    aiRecommendationBody:
        'Higher conversion observed in 14T segment – recommend increasing focus.',
    leftProductName: '14T',
    leftConversionPercent: 32,
    leftDealCycleDays: 12,
    rightProductName: 'Tipper',
    rightConversionPercent: 18,
    rightDealCycleDays: 21,
    insightLeftTitle: 'Faster Closure',
    insightLeftBody: '14T closes 9 days sooner',
    insightRightTitle: 'Higher ROI',
    insightRightBody: '89% more incentive for Tippers',
    footerTitle: 'Add 2 More 14T Visits This Week',
    footerBody:
        'Based on your 32% conversion rate in 14T (vs 18% in Tipper), prioritize high-intent 14T leads to maximize your time and impact.',
    footerButtonLabel: 'Add to my Beat Plan'
};

export default class DeHtmlEmployeeAgent extends LightningElement {
    @api value;

    get aiTitle() {
        return STATIC.aiRecommendationTitle;
    }

    get aiBody() {
        return STATIC.aiRecommendationBody;
    }

    get leftName() {
        return STATIC.leftProductName;
    }

    get rightName() {
        return STATIC.rightProductName;
    }

    get leftConversion() {
        return STATIC.leftConversionPercent;
    }

    get rightConversion() {
        return STATIC.rightConversionPercent;
    }

    get leftConversionLabel() {
        return `${STATIC.leftConversionPercent}%`;
    }

    get rightConversionLabel() {
        return `${STATIC.rightConversionPercent}%`;
    }

    get leftBarStyle() {
        return `width: ${Math.min(100, Math.max(0, STATIC.leftConversionPercent))}%;`;
    }

    get rightBarStyle() {
        return `width: ${Math.min(100, Math.max(0, STATIC.rightConversionPercent))}%;`;
    }

    get leftCycleLabel() {
        return `${STATIC.leftDealCycleDays} days`;
    }

    get rightCycleLabel() {
        return `${STATIC.rightDealCycleDays} days`;
    }

    get insightLeftTitle() {
        return STATIC.insightLeftTitle;
    }

    get insightLeftBody() {
        return STATIC.insightLeftBody;
    }

    get insightRightTitle() {
        return STATIC.insightRightTitle;
    }

    get insightRightBody() {
        return STATIC.insightRightBody;
    }

    get footerTitle() {
        return STATIC.footerTitle;
    }

    get footerBody() {
        return STATIC.footerBody;
    }

    get footerButtonLabel() {
        return STATIC.footerButtonLabel;
    }

    handleBeatPlanClick() {
        const message = `Beat plan action: ${STATIC.footerTitle}`;
        this.dispatchEvent(
            new CustomEvent('deemployeeagentaction', {
                detail: { message },
                bubbles: true,
                composed: true
            })
        );

        try {
            const esc = globalThis.embeddedservice_configuration;
            if (esc?.util?.sendTextMessage) {
                esc.util.sendTextMessage(message);
            }
        } catch {
            // Preview / builder — no embedded service
        }
    }
}
