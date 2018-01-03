const handlebars = require('handlebars');

const core = `// Generated with bullhorn-typedefs

// Utility Classes
export class EntityTypes {
{{#types}}
    static {{type}}: string = '{{type}}';
{{/types}}

    static isSearchable(entity: string): boolean {
        return ['Candidate', 'ClientContact', 'ClientCorporation', 'JobOrder', 'Opportunity', 'JobSubmission', 'Placement', 'Note', 'Task', 'Appointment'].indexOf(entity) >= 0
    }

    static isSoftDelete(entity: string): boolean {
        return [{{#deletables}}'{{type}}', {{/deletables}}'PlaceHolder'].indexOf(entity) >= 0
    }
}

// Interfaces
export type Scalar = number | string | string[] | Date;
export type Strings = string | string[];

export interface Address {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    countryID?: number;
    countryName?: string;
    countryCode?: string;
}

{{#types}}
export interface {{type}} {
    id?: number;
    {{#if dynamic}}
    [propName: string]: any;
    {{/if}}
    {{#properties}}
    {{name}}?: {{type}};
    {{/properties}}
}
{{/types}}
`;

const CORE_DEFINITION_TEMPLATE = handlebars.compile(core);

module.exports = {
    CORE_DEFINITION_TEMPLATE
};
