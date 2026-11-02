/**
 * @description Lightning Type backing class for ASA Item Selector
 * Holds item selector data as JSON string
 * Used with Agentforce and Enhanced Chat
 * 
 * JSON Format Expected:
 * {
 *   "title": "Select your age range",
 *   "mode": "single",
 *   "items": ["19-29", "30-39", "40-49", "50+"]
 * }
 * 
 * Test Modes:
 * - {"mode": "test-single"} - auto-populates single selection test data
 * - {"mode": "test-multiple"} - auto-populates multiple selection test data
 */
@JsonAccess(serializable='always' deserializable='always')
global class AsaItemSelectorData {
    
    @AuraEnabled
    global String itemSelectorJSON;
    
    /**
     * Constructor with JSON string
     */
    global AsaItemSelectorData(String itemSelectorJSON) {
        this.itemSelectorJSON = itemSelectorJSON;
    }
    
    /**
     * Default constructor
     */
    global AsaItemSelectorData() {
        this.itemSelectorJSON = '';
    }
}