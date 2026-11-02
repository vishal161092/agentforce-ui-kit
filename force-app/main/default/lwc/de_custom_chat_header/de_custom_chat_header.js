import { LightningElement, api } from "lwc";
import deGiftCardsIcon from "@salesforce/resourceUrl/deGiftCardsIcon";
import {
    dispatchMessagingEvent,
    assignMessagingEventHandler,
    MESSAGING_EVENT
} from "lightningsnapin/eventStore";

const SLDS_MENU_SELECTOR = "slds-dropdown-trigger slds-dropdown-trigger_click";

// Fixed branded title — every session shows the same branded label.
const HEADER_TITLE = "Bowie Agent";

// Hardcoded topic options so the 3-dot menu always has choices to click.
// These mirror the 3 topic options shown in the de_chatPromoPopup.
// Clicking one dispatches MENU_ITEM_SELECTED, passing the value into the chat.
const TEST_MENU_OPTIONS = [
    {
        optionIdentifier: "I'm looking to buy a gift card",
        title: "I'm looking to buy a gift card",
        iconName: "utility:card_details"
    },
    {
        optionIdentifier: "I placed an order and need assistance",
        title: "I placed an order and need assistance",
        iconName: "utility:fulfillment_order"
    },
    {
        optionIdentifier: "I received a gift card and I need help",
        title: "I received a gift card and I need help",
        iconName: "utility:workforce_engagement"
    }
];

// Map an option to an SLDS utility icon based on its text.
function iconForOption(text) {
    const key = (text || "").toLowerCase();
    if (key.includes("explore") || key.includes("product")) {
        return "utility:applied_amount";
    }
    if (key.includes("apply")) {
        return "utility:new";
    }
    if (key.includes("case") || key.includes("status") || key.includes("check")) {
        return "utility:record";
    }
    if (key.includes("agent") || key.includes("live") || key.includes("transfer")) {
        return "utility:agent_session";
    }
    if (key.includes("typing") || key.includes("type") || key.includes("chat")) {
        return "utility:chat";
    }
    return "utility:choice";
}

export default class DeCustomChatHeader extends LightningElement {
    /**
     * Deployment configuration data. Populated by the MIAW runtime.
     * Declared for future use (e.g. authenticated mode endSession()); not
     * currently read for the guest-user path.
     * @type {Object}
     */
    @api configuration = {};

    /**
     * The status of the conversation. Valid values:
     * - NOT_STARTED
     * - OPEN
     * - CLOSED
     * @type {ConversationStatus}
     */
    @api conversationStatus;

    /**
     * Class name for header menu.
     * @type {String}
     */
    menuClass = SLDS_MENU_SELECTOR;

    /**
     * Array to store bot options menu. Seeded with test options so the 3-dot
     * menu always has clickable choices.
     * @type {Array}
     */
    chatbotOptionsMenu = [...TEST_MENU_OPTIONS];

    /**
     * Fixed branded header text.
     * @type {String}
     */
    headerTitle = HEADER_TITLE;

    /**
     * Branded icon shown before the header title.
     * @type {String}
     */
    headerIcon = deGiftCardsIcon;

    /**
     * Whether the close-confirmation modal is open.
     * @type {Boolean}
     */
    showCloseModal = false;

    /**
     * Whether the post-chat survey modal is open.
     * @type {Boolean}
     */
    showSurvey = false;

    /**
     * Collected survey feedback.
     */
    surveyRating = 0;
    surveyThumb = "";

    /**
     * Identifier of the currently selected option (for highlight state).
     * @type {String}
     */
    selectedOption;

    /**
     * Options normalized with icon + selected-state classes for the card UI.
     * @returns {Array}
     */
    get menuOptions() {
        return this.chatbotOptionsMenu.map((option) => {
            const selected = option.optionIdentifier === this.selectedOption;
            return {
                optionIdentifier: option.optionIdentifier,
                title: option.title || option.optionIdentifier,
                iconName: option.iconName || iconForOption(option.title || option.optionIdentifier),
                cardClass: selected ? "de-opt-card de-opt-card-selected" : "de-opt-card",
                iconWrapClass: selected
                    ? "de-opt-icon-wrap de-opt-icon-wrap-selected"
                    : "de-opt-icon-wrap"
            };
        });
    }

    /**
     * Whether the user is authenticated.
     * AuthMode can have the following values:
     * - Auth: user is in verified, which corresponds to the authenticated user mode.
     * - UnAuth: user is in unverified, which corresponds to the guest user mode.
     */
    get isAuthenticatedContext() {
        return (
            this.configuration &&
            this.configuration.embeddedServiceMessagingChannel &&
            this.configuration.embeddedServiceMessagingChannel.authMode === "Auth"
        );
    }

    /**
     * Whether to show the header menu button.
     * @returns {Boolean}
     */
    get showMenuButton() {
        return this.conversationStatus === "OPEN";
    }

    /**
     * Whether to show the transcript button in the header bar.
     * @returns {Boolean}
     */
    get showTranscriptButton() {
        return this.conversationStatus === "OPEN";
    }

    _showMenu = false;
    get showMenu() {
        return this._showMenu;
    }
    set showMenu(shouldShow) {
        this.menuClass = SLDS_MENU_SELECTOR + (shouldShow ? " slds-is-open" : "");
        this._showMenu = shouldShow;
    }

    /**
     * Handle menu button click.
     */
    handleMenuButtonClick() {
        this.showMenu = !this.showMenu;
    }

    /**
     * Handle minimize button click. Runtime collapses the widget.
     */
    handleMinimize() {
        dispatchMessagingEvent(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});
    }

    /**
     * Handle transcript button click in the header bar. Runtime handles the
     * download itself — we just signal intent.
     */
    handleHeaderTranscript() {
        dispatchMessagingEvent(MESSAGING_EVENT.REQUEST_TRANSCRIPT, {});
    }

    /**
     * Handle close (X) button click.
     * When the conversation is NOT open we dismiss the container. When it IS
     * open we show a confirmation modal instead of hiding the button.
     */
    handleCloseClick() {
        if (this.conversationStatus === "OPEN") {
            this.showCloseModal = true;
        } else {
            dispatchMessagingEvent(MESSAGING_EVENT.CLOSE_CONTAINER, {});
        }
    }

    /**
     * "No (Keep Chatting)" — dismiss the modal without ending the chat.
     */
    handleCancelClose() {
        this.showCloseModal = false;
    }

    /**
     * "Download Transcript" from the modal.
     */
    handleDownloadTranscript() {
        dispatchMessagingEvent(MESSAGING_EVENT.REQUEST_TRANSCRIPT, {});
    }

    /**
     * "Yes (End Chat)" — show the post-chat survey before actually ending the
     * conversation, mimicking a Salesforce post-chat survey.
     */
    handleConfirmClose() {
        this.showCloseModal = false;
        this.showSurvey = true;
    }

    /**
     * Actually end the conversation.
     * Ending a messaging session is only supported for verified users.
     * Ending a conversation is only supported for unverified users.
     */
    endChat() {
        if (this.isAuthenticatedContext && this.configuration.util) {
            this.configuration.util.endSession();
        } else {
            dispatchMessagingEvent(MESSAGING_EVENT.CLOSE_CONVERSATION, {});
        }
    }

    /**
     * Star rating options with filled/empty state for the survey.
     * @returns {Array}
     */
    get stars() {
        return [1, 2, 3, 4, 5].map((n) => ({
            value: n,
            class: n <= this.surveyRating ? "de-star de-star-filled" : "de-star"
        }));
    }

    get thumbUpClass() {
        return this.surveyThumb === "up" ? "de-thumb de-thumb-selected" : "de-thumb";
    }

    get thumbDownClass() {
        return this.surveyThumb === "down" ? "de-thumb de-thumb-selected" : "de-thumb";
    }

    /**
     * Handle a star selection.
     */
    handleStarClick(event) {
        this.surveyRating = parseInt(event.currentTarget.dataset.value, 10);
    }

    /**
     * Handle a thumbs up/down selection.
     */
    handleThumbClick(event) {
        this.surveyThumb = event.currentTarget.dataset.value;
    }

    /**
     * Submit the survey, then end the chat.
     */
    handleSurveySubmit() {
        // Demo: log the feedback. In a real deployment this would be sent to a
        // Survey / Feedback record via an Apex or REST call.
        // eslint-disable-next-line no-console
        console.log("[Post-chat survey]", {
            rating: this.surveyRating,
            resolved: this.surveyThumb
        });
        this.showSurvey = false;
        this.endChat();
    }

    /**
     * Skip the survey and end the chat.
     */
    handleSurveySkip() {
        this.showSurvey = false;
        this.endChat();
    }

    /**
     * Handle a click on one of the 3-dot menu options.
     * Sends the option's title into the conversation as a text message so it
     * behaves like the customer typed and sent it.
     */
    handleMenuOptionClick(event) {
        event.preventDefault();

        const selectedIdentifier = event.currentTarget.dataset.value;
        const selectedOption = this.chatbotOptionsMenu.find(
            (option) => option.optionIdentifier === selectedIdentifier
        );
        this.selectedOption = selectedIdentifier;

        // Still notify the runtime that a menu item was selected.
        dispatchMessagingEvent(MESSAGING_EVENT.MENU_ITEM_SELECTED, {
            selectedOption: selectedOption
        });

        // Push the option text into the chat as a customer message.
        if (selectedOption && selectedOption.title) {
            this.sendTextToChat(selectedOption.title);
        }

        this.showMenu = false;
    }

    /**
     * Inject a text message into the Embedded Messaging conversation.
     *
     * The header runs inside the MIAW widget iframe, which is cross-origin to
     * the host page — so we cannot read the host's embeddedservice_bootstrap
     * object directly (that throws). Instead we postMessage the text out to the
     * host page, where a Head Markup listener relays it to
     * embeddedservice_bootstrap.utilAPI.sendTextMessage(). This mirrors the
     * de_chatPromoPopup pattern.
     */
    sendTextToChat(text) {
        const payload = { type: "de_sendText", message: text };

        // 1) Same-origin: call the bootstrap API directly if reachable.
        try {
            let win = window;
            for (let i = 0; i < 10 && win; i++) {
                const boot = win.embeddedservice_bootstrap;
                if (boot && boot.utilAPI && typeof boot.utilAPI.sendTextMessage === "function") {
                    boot.utilAPI.sendTextMessage(text);
                    return;
                }
                if (win === win.parent) {
                    break;
                }
                win = win.parent;
            }
        } catch (e) {
            // Cross-origin — fall through to postMessage relay.
        }

        // 2) Cross-origin: post the text out to the host page (never throws).
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(payload, "*");
            }
            if (window.top && window.top !== window.parent) {
                window.top.postMessage(payload, "*");
            }
        } catch (e) {
            // no-op
        }
    }

    connectedCallback() {
        assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_JOINED, (data) => {
            // Append any bot-provided options on top of the test options.
            if (data.options && Array.isArray(data.options)) {
                data.options.forEach((participantOption) => {
                    this.chatbotOptionsMenu.push(participantOption);
                });
            }
        });

        assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_LEFT, () => {
            // Reset back to the test options.
            this.chatbotOptionsMenu = [...TEST_MENU_OPTIONS];
        });

        assignMessagingEventHandler(MESSAGING_EVENT.UPDATE_HEADER_TEXT, () => {
            // Empty by design — the header always shows the fixed branded title.
        });
    }
}
