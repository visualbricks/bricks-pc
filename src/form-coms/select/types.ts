import { Option } from '../types';

export interface Data {
    config: {
        options: any[];
        disabled: boolean;
        allowClear: boolean;
        placeholder: string;
        loading?: boolean;
        mode?: 'tags' | 'multiple' | 'default';
        labelInValue?: boolean;
        showSearch: boolean;
        filterOption: boolean;
        optionFilterProp: string;
    };
    maxHeight: string;
    rules: any[];
    value?: number | string | number[] | string[];
    staticOptions: Option[];
    remoteOptions: any[];
    dropdownSearchOption: boolean;
    outputValueType: 'value' | 'labelInValue' | 'option';
}