import { LightningElement, api } from 'lwc';

const DEFAULT_OPTIONS = [
    'Create User',
    'Delete User',
    'Update User',
    'Initiate Incident Creation',
    'Perform User Activities',
    'Handle Data BackUp'
];

export default class DeEmployeeActionSelector extends LightningElement {
    @api value;

    get cards() {
        return DEFAULT_OPTIONS.map((label, index) => ({
            id: label + '-' + index,
            label: label
        }));
    }
}
