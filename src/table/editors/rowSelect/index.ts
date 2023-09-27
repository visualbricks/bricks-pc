import { Data } from '../../types';

const rowSelectEditor = {
  '.ant-table-cell.ant-table-selection-column': {
    title: '勾选栏',
    style: [
      {
        title: '勾选框',
        catelog: '默认',
        ifVisible({ data }: EditorResult<Data>) {
          return data.useRowSelection;
        },
        options: ['border', { type: 'background', config: { disableBackgroundImage: true } }],
        target: `.ant-checkbox-wrapper .ant-checkbox-inner`
      },
      {
        title: '勾选框',
        catelog: 'Hover',
        ifVisible({ data }: EditorResult<Data>) {
          return data.useRowSelection;
        },
        options: ['border', { type: 'background', config: { disableBackgroundImage: true } }],
        target: `.ant-checkbox:hover .ant-checkbox-inner`,
        domTarget: `.ant-checkbox .ant-checkbox-inner`
      },
      {
        title: '勾选框',
        catelog: '选中',
        ifVisible({ data }: EditorResult<Data>) {
          return data.useRowSelection;
        },
        options: ['border', { type: 'background', config: { disableBackgroundImage: true } }],
        target: `.ant-checkbox-checked .ant-checkbox-inner`
      },
      {
        title: '普通勾选符号',
        catelog: '选中',
        ifVisible({ data }: EditorResult<Data>) {
          return data.useRowSelection;
        },
        options: [
          {
            type: 'border',
            config: {
              disableBorderWidth: true,
              disableBorderStyle: true,
              disableBorderRadius: true
            }
          }
        ],
        target: `.ant-checkbox-checked .ant-checkbox-inner:after`
      },
      {
        title: '全选勾选符号',
        catelog: '选中',
        ifVisible({ data }: EditorResult<Data>) {
          return data.useRowSelection;
        },
        options: [{ type: 'background', config: { disableBackgroundImage: true } }],
        target: `.ant-checkbox-indeterminate .ant-checkbox-inner:after`
      }
    ]
  }
};

export default rowSelectEditor;
