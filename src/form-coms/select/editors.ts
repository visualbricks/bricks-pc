import { uuid } from '../../utils';
import { RuleKeys, defaultValidatorExample, defaultRules } from '../utils/validator';
import { InputIds, Option, OutputIds } from '../types';
import { Data } from './types';

let tempOptions: Option[] = [],
  optionsLength,
  addOption,
  delOption;

const initParams = (data: Data) => {
  if (!data.staticOptions) {
    data.staticOptions = [];
  }
  if (optionsLength === undefined) {
    tempOptions = data.staticOptions || [];
  }
  optionsLength = (data.staticOptions || []).length;
  addOption = (option) => {
    data.staticOptions.push(option);
  };
  delOption = (index: number) => {
    data.staticOptions.splice(index, 1);
  };
};
export default {
  '@parentUpdated'({ id, data, parent }, { schema }) {
    if (schema === 'mybricks.normal-pc.form-container/form-item') {
      parent['@_setFormItem']({ id, name: data.name, schema: { type: 'string' } })
    }
    // if (schema === 'mybricks.normal-pc.form-container/form-item') {//in form container
    //   data.type = 'data'
    //
    //   parent['@_setFormItem']({id, name: data.name, schema: {type: 'string'}})//use parents API
    // } else {
    //   data.type = 'normal'
    // }
  },
  ':root'({ data }: EditorResult<{ type }>, ...catalog) {
    catalog[0].title = '常规';


    catalog[0].items = [
      {
        title: '提示内容',
        type: 'Text',
        description: '该提示内容会在值为空时显示',
        value: {
          get({ data }) {
            return data.config.placeholder;
          },
          set({ data }, value: string) {
            data.config.placeholder = value;
          }
        }
      },
      {
        title: '下拉框模式',
        type: 'select',
        description: '可设置下拉框的模式为多选或标签',
        options: [
          { label: '默认', value: 'default' },
          { label: '多选', value: 'multiple' },
          { label: '标签', value: 'tags' },
        ],
        value: {
          get({ data }) {
            return data.config.mode;
          },
          set({ data, input, output }: EditorResult<Data>, value: string) {
            data.config.mode = value as any;
            if (['multiple', 'tags'].includes(value)) {
              const valueSchema = {
                type: 'array'
              }
              input.get(InputIds.SetValue).setSchema(valueSchema);
              output.get(OutputIds.OnChange).setSchema(valueSchema);
              output.get(OutputIds.ReturnValue).setSchema(valueSchema);
            } else {
              const valueSchema = {
                type: 'any'
              }
              input.get(InputIds.SetValue).setSchema(valueSchema);
              output.get(OutputIds.OnChange).setSchema(valueSchema);
              output.get(OutputIds.ReturnValue).setSchema(valueSchema);
            }
          }
        }
      },
      {
        title: '显示清除图标',
        type: 'switch',
        description: '可以点击清除图标删除内容',
        value: {
          get({ data }) {
            return data.config.allowClear;
          },
          set({ data }, value: boolean) {
            data.config.allowClear = value;
          }
        }
      },
      {
        title: '禁用状态',
        type: 'switch',
        description: '是否禁用状态',
        value: {
          get({ data }) {
            return data.config.disabled;
          },
          set({ data }, value: boolean) {
            data.config.disabled = value;
          }
        }
      },
      {
        title: '提交数据为选项的{标签-值}',
        type: 'Switch',
        description: '开启后提交选项的标签（文本）和值',
        value: {
          get({ data }: EditorResult<Data>) {
            return data.config.labelInValue;
          },
          set({ data }: EditorResult<Data>, val: boolean) {
            data.config.labelInValue = val;
            const checkedList = data.staticOptions?.filter(opt => opt?.checked) || [];
            if (checkedList.length > 0) {
              switch (data.config.mode) {
                case 'multiple':
                case 'tags':
                  data.value = checkedList.map(({ label, value }) => val ? { label, value } : value) as any;
                  break;
                default:
                  const { label, value } = checkedList[0];
                  data.value = val ? { label, value } : value as any;
                  break;
              }
            }
          }
        }
      },
      // 选项配置
      {
        title: '静态选项配置',
        type: 'array',
        options: {
          getTitle: ({ label, checked }) => {
            return `${label}${checked ? ': 默认值' : ''}`;
          },
          onRemove: (index: number) => {
            delOption(index);
          },
          onAdd: () => {
            const defaultOption = {
              label: `选项${optionsLength + 1}`,
              value: `选项${optionsLength + 1}`,
              key: uuid()
            };
            addOption(defaultOption);
            return defaultOption;
          },
          items: [
            {
              title: '默认选中',
              type: 'switch',
              value: 'checked'
            },
            {
              title: '禁用',
              type: 'switch',
              value: 'disabled'
            },
            {
              title: '选项标签',
              type: 'textarea',
              value: 'label'
            },
            {
              title: '选项值',
              type: 'valueSelect',
              options: ['text', 'number', 'boolean'],
              description: '选项的唯一标识，可以修改为有意义的值',
              value: 'value'
            }
          ]
        },
        value: {
          get({ data, focusArea }: EditorResult<Data>) {
            initParams(data);
            return data.staticOptions;
          },
          set({ data, focusArea }: EditorResult<Data>, options: Option[]) {
            const initValue: any = [];
            options.forEach(({ checked, value, label }) => {
              if (checked) initValue.push(data.config.labelInValue ? { label, value } : value);
            });
            if (data.config.mode && ['multiple', 'tags'].includes(data.config.mode)) {
              data.value = initValue;
            } else {
              data.value = initValue[0];
              // 临时:使用tempOptions存储配置项的prev
              tempOptions = options;
              const formItemVal: any = data.value;
              // 更新选项
              options = options.map(option => {
                const checked = formItemVal !== undefined && option.value === (data.config.labelInValue ? formItemVal?.value : formItemVal);
                return {
                  ...option,
                  checked
                }
              });
            }
            data.staticOptions = options;
            data.config.options = options;
          }
        }
      },
      {
        title: '校验规则',
        description: '提供快捷校验配置',
        type: 'ArrayCheckbox',
        options: {
          checkField: 'status',
          visibleField: 'visible',
          getTitle: ({ title }: any) => {
            return title;
          },
          items: [
            // {
            //   title: '提示文字',
            //   description: '提示文字的表达式（{}, =, <, >, ||, &&）, 例：${label}不能为空',
            //   type: 'EXPRESSION',
            //   options: {
            //     autoSize: true,
            //     placeholder: '例：${label}不能为空',
            //     // suggestions: getSuggestions(true),
            //   },
            //   value: 'message'
            // },
            {
              title: '提示文字',
              type: 'Text',
              value: 'message',
              ifVisible(item: any, index: number) {
                return item.key === RuleKeys.REQUIRED;
              }
            },
            {
              title: '编辑校验规则',
              type: 'code',
              options: {
                language: 'javascript',
                enableFullscreen: false,
                title: '编辑校验规则',
                width: 600,
                minimap: {
                  enabled: false
                },
                babel: true,
                eslint: {
                  parserOptions: {
                    ecmaVersion: '2020',
                    sourceType: 'module'
                  }
                }
              },
              ifVisible(item: any, index: number) {
                return item.key === RuleKeys.CODE_VALIDATOR;
              },
              value: 'validateCode'
            }
          ]
        },
        value: {
          get({ data }) {
            return data?.rules?.length > 0 ? data.rules : defaultRules;
          },
          set({ data }, value: any) {
            data.rules = value;
          }
        }
      },
      {
        title: '事件',
        items: [
          {
            title: '值发生改变',
            type: '_event',
            options: {
              outputId: 'onChange'
            }
          },
          {
            title: '失去焦点',
            type: '_event',
            options: {
              outputId: 'onBlur'
            }
          }
        ]
      }
    ];
  }
}