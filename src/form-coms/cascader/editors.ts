import { RuleKeys, defaultValidatorExample, defaultRules } from '../utils/validator';
import { Data } from './runtime'

export default {
  '@resize': {
    options: ['width']
  },
  '@init': ({ style }) => {
    style.width = '100%'
  },
  ':root':{
    style: [
      {
        title: '边框-默认',
        options: ['border'],
        target: 'div.ant-select:not(.ant-select-customize-input) > div.ant-select-selector'
      },
      {
        title: '边框-hover',
        options: ['border'],
        target: 'div.ant-select:not(.ant-select-customize-input) > div.ant-select-selector:hover',
        domTarget: 'div.ant-select-selector'
      },
      {
        title: '边框-focus',
        options: ['border','BoxShadow'],
        target: 'div.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) > div.ant-select-selector',
        domTarget: 'div.ant-select-selector'
      },
      {
        title: '标签',
        ifVisible({ data }) {
          return data.isMultiple;
        },
        options: [
          'border', 
          { type: 'font', config: { disableTextAlign: true } }, 
          { type: 'background', config: { disableBackgroundImage: true } }
        ],
        target: ['.ant-select-multiple .ant-select-selection-item', '.ant-select-multiple .ant-select-selection-item-remove']
      },
      {
        title: '选项-默认',
        options: [
          { type: 'font', config: { disableTextAlign: true } },
          { type: 'background', config: { disableBackgroundImage: true } }
        ],
        global: true,
        target({ id }: EditorResult<Data>){
          return `.${id} .ant-cascader-menu-item`
        }
      },
      {
        title: '选项-hover',
        options: [
          { type: 'font', config: { disableTextAlign: true } }, 
          { type: 'background', config: { disableBackgroundImage: true } }
        ],
        global: true,
        target({ id }: EditorResult<Data>){
          return `.${id} .ant-cascader-menu-item:hover`
        }
      },
      {
        title: '选项-focus',
        options: [
          { type: 'font', config: { disableTextAlign: true } }, 
          { type: 'background', config: { disableBackgroundImage: true } }
        ],
        global: true,
        target({ id }: EditorResult<Data>){
          return [`.${id} .ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled), .ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled):hover`]
        }
      },
      {
        title: '多选节点-默认',
        ifVisible({ data }) {
          return data.isMultiple;
        },
        options: ['border', { type: 'background', config: { disableBackgroundImage: true } }],
        global: true,
        target({ id }: EditorResult<Data>){
          return `.${id} .ant-cascader-checkbox-inner`
        }
      },
      {
        title: '多选节点-hover',
        ifVisible({ data }) {
          return data.isMultiple;
        },
        options: ['border', { type: 'background', config: { disableBackgroundImage: true } }],
        global: true,
        target({ id }: EditorResult<Data>){
          return `.${id} .ant-cascader-checkbox-wrapper:hover .ant-cascader-checkbox-inner, .ant-cascader-checkbox:not(.ant-cascader-checkbox-checked):hover .ant-cascader-checkbox-inner`;
        },
      },
      {
        title: '多选节点-focus',
        ifVisible({ data }) {
          return data.isMultiple;
        },
        options: ['border', { type: 'background', config: { disableBackgroundImage: true } }],
        global: true,
        target({ id }: EditorResult<Data>){
          return `.${id} .ant-cascader-checkbox-checked .ant-cascader-checkbox-inner`;
        },
      },
    ],
    items: ({data}: EditorResult<{ type }>, ...catalog) => {
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
          title: '多选节点',
          type: 'Switch',
          description: '是否要多选',
          value: {
            get({ data }) {
              return data.isMultiple;
            },
            set({ data }, value: boolean) {
              data.isMultiple = value;
            }
          }
        },
        //选择自适应还是自选择点数
        {
          title: '节点数配置',
          type: "Select",
          description: '多选结点是自适应还是自定义',
          ifVisible({ data }) {
            return data.isMultiple;
          },
          options: [
            {
              label: "自适应",
              value: "isResponsive"
            },
            {
              label: "自定义",
              value: "isCustom"
            }
          ],
          value: {
            get({ data }){
              if(!data.maxTagCountType){
                data.maxTagCountType = "isResponsive"
              }
              return data.maxTagCountType
            },
            set({ data }, value: string ) {
              data.maxTagCountType = value
              if(data.maxTagCountType == "isResponsive"){
                data.config.maxTagCount = 'responsive'
              }
            }
          }
        },
        //输入框显示的最多节点数
        {
          title: '多选节点数',
          type: 'Slider',
          description: "输入框中显示的节点数",
          ifVisible({ data }) {
            return data.isMultiple && data.maxTagCountType === "isCustom";
          },
          options: {
            max: 10,
            min: 1,
            steps: 1,
            formatter: "/10"
          },
          value: {
            get({ data }) {
              if(!data.config.maxTagCount){
                data.config.maxTagCount = 1
              }
              return data.config.maxTagCount;
            },
            set({ data }, value: number ) {
              data.config.maxTagCount = value;
            }
          }
        },
        {
          title: '允许选择任意一级',
          type: 'Switch',
          value: {
            get({ data }) {
              return data.config.changeOnSelect;
            },
            set({ data }, value: boolean) {
              data.config.changeOnSelect = value;
            }
          }
        },
        {
          title: '支持搜索',
          type: 'Switch',
          description: '开启后可输入内容搜索',
          value: {
            get({ data }) {
              return data.config.showSearch;
            },
            set({ data }, value: boolean) {
              data.config.showSearch = value;
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
            getTitle,
            items: [
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
              return data.rules.length > 0 ? data.rules : defaultRules;
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
              title: '值初始化',
              type: '_event',
              options: {
                outputId: 'onInitial'
              }
            },
            {
              title: '值更新',
              type: '_event',
              options: {
                outputId: 'onChange'
              }
            }
          ]
        },
      ]
    }
  } 
  
}

const getTitle = (item: any, index: number) => {
  const { key, title, numericalLimit, regExr } = item;
  return title;
};