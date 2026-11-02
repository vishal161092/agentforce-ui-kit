import { LightningElement, api } from 'lwc';
import greetingTemplates from '@salesforce/resourceUrl/greetingTemplates';

export default class HolidayTemplateSelector extends LightningElement {
    @api value; // The current value of the input

    templateData = [
        { name: 'template1', url: `${greetingTemplates}/template1.png` },
        { name: 'template2', url: `${greetingTemplates}/template2.png` },
        { name: 'template3', url: `${greetingTemplates}/template3.png` },
        { name: 'template4', url: `${greetingTemplates}/template4.png` },
        { name: 'template5', url: `${greetingTemplates}/template5.png` },
        { name: 'template6', url: `${greetingTemplates}/template6.png` }
    ];

    get templates() {
        return this.templateData.map(template => ({
            ...template,
            isSelected: this.value === template.name,
            selectedClass: this.value === template.name ? 'image-card selected' : 'image-card'
        }));
    }

    handleSelect(event) {
        const selectedName = event.currentTarget.dataset.name;
        this.value = selectedName;
        
        // Notify Agentforce of the selection
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: {
                value: selectedName
            },
            bubbles: true,
            composed: true
        }));
    }
}