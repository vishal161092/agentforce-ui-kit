/**
 * @description ASA Item Selector Component
 * Displays selectable items in pill button format.
 * Supports single and multiple selection modes.
 *
 * Modeled on the working de_OptionsSelection_v3 renderer:
 * - tolerant value setter (never throws an error screen)
 * - graceful getters that default instead of failing
 *
 * The DTO (AsaItemSelectorData) carries a single `itemSelectorJSON` string that
 * the Format_Options_Output flow copies verbatim from the LLM. That string is
 * parsed defensively here (fences / prose / already-parsed object all tolerated).
 */
import { LightningElement, api, track } from 'lwc';
/* global embeddedservice_configuration */

export default class AsaItemSelector extends LightningElement {
    @track _data = {};

    // Agentforce sets @api value AFTER mount, so parse in the setter.
    @api
    get value() {
        return this._data;
    }
    set value(input) {
        this._data = this.parseValue(input);
    }

    @track selectedItems = new Set();

    /**
     * Normalizes the Lightning Type value into a plain object.
     * Tolerates: DTO object ({itemSelectorJSON}), a raw JSON string, an
     * already-parsed object, and LLM output wrapped in ```json fences / prose.
     * Never throws — returns {} on anything unparseable.
     */
    parseValue(input) {
        if (!input) return {};
        // Value may be the DTO ({itemSelectorJSON}) or the payload directly.
        let raw = input.itemSelectorJSON !== undefined ? input.itemSelectorJSON : input;
        if (raw === null || raw === undefined || raw === '') return {};
        if (typeof raw === 'object') return raw;

        raw = String(raw).trim();
        // Strip a leading/trailing markdown code fence if the LLM added one.
        raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        // If there's prose around the object, keep only the {...} span.
        const first = raw.indexOf('{');
        const last = raw.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
            raw = raw.slice(first, last + 1);
        }
        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error('ASA Item Selector: could not parse value:', error.message);
            console.error('ASA Item Selector raw value was:', JSON.stringify(input));
            return {};
        }
    }

    /**
     * Effective title, honoring the two test modes.
     */
    get title() {
        if (this._data.mode === 'test-single') return 'This is a test-single';
        if (this._data.mode === 'test-multiple') return 'This is a test-multiple';
        return this._data.title || '';
    }

    /**
     * 'single' or 'multiple'; test modes map onto their base mode.
     */
    get mode() {
        if (this._data.mode === 'test-multiple') return 'multiple';
        if (this._data.mode === 'test-single') return 'single';
        return this._data.mode || 'single';
    }

    /**
     * Item labels; test modes provide sample items.
     */
    get items() {
        if (this._data.mode === 'test-single' || this._data.mode === 'test-multiple') {
            return ['Option 1', 'Op 2', 'Here is a much longer option 3'];
        }
        return Array.isArray(this._data.items) ? this._data.items : [];
    }

    /**
     * Get items with selection state for rendering.
     */
    get itemsWithState() {
        return this.items.map((item, index) => ({
            key: `item-${index}`,
            label: item,
            isSelected: this.selectedItems.has(item),
            buttonClass: this.selectedItems.has(item) ? 'pill-button selected' : 'pill-button'
        }));
    }

    get hasItems() {
        return this.items.length > 0;
    }

    get isMultipleMode() {
        return this.mode === 'multiple';
    }

    get showSubmitButton() {
        return this.isMultipleMode && this.selectedItems.size > 0;
    }

    /**
     * Handle item button click.
     */
    handleItemClick(event) {
        const label = event.currentTarget.dataset.label;
        if (this.mode === 'single') {
            // Single mode: send message immediately.
            this.sendMessage(label);
        } else {
            // Multiple mode: toggle selection.
            if (this.selectedItems.has(label)) {
                this.selectedItems.delete(label);
            } else {
                this.selectedItems.add(label);
            }
            // Reassign to force a re-render.
            this.selectedItems = new Set(this.selectedItems);
        }
    }

    /**
     * Handle submit button click (multiple mode).
     */
    handleSubmit() {
        if (this.selectedItems.size > 0) {
            const message = Array.from(this.selectedItems).join(', ');
            this.sendMessage(message);
        }
    }

    /**
     * Send the selection back to Agentforce over the embedded messaging channel.
     */
    sendMessage(message) {
        if (!message) return;
        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                embeddedservice_configuration.util.sendTextMessage(message)
                    .then(() => {
                        console.log('ASA Item Selector: sent message:', message);
                    })
                    .catch((error) => {
                        console.error('ASA Item Selector: error sending message:', error);
                    });
            } else {
                console.log('ASA Item Selector: embeddedservice_configuration unavailable. Message:', message);
            }
        } catch (error) {
            console.error('ASA Item Selector: error in sendMessage:', error);
        }
    }
}
