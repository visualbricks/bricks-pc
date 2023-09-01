import { Data } from '../../types';
import { OutputIds } from '../../constants';
import { Schemas, setDataSchema } from '../../schema';
export default {
  title: '行操作',
  items: [
    {
      title: '行点击',
      type: 'switch',
      ifVisible({ data }: EditorResult<Data>) {
        return !data.useRowSelection;
      },
      value: {
        get({ data }: EditorResult<Data>) {
          return data.enableRowClick;
        },
        set({ data, output, ...res }: EditorResult<Data>, value: boolean) {
          data.enableRowClick = value;
          if (value) {
            output.add(OutputIds.ROW_CLICK, '行点击事件', Schemas.ROW_CLICK);
            setDataSchema({ data, output, ...res });
          } else {
            output.remove(OutputIds.ROW_CLICK);
          }
        }
      }
    },
    {
      title: '行点击事件',
      type: '_Event',
      ifVisible({ data }: EditorResult<Data>) {
        return data.enableRowClick;
      },
      options: () => {
        return {
          outputId: OutputIds.ROW_CLICK
        };
      }
    },
    {
      title: '行双击',
      type: 'switch',
      value: {
        get({ data }: EditorResult<Data>) {
          return data.enableRowDoubleClick;
        },
        set({ data, output, ...res }: EditorResult<Data>, value: boolean) {
          data.enableRowDoubleClick = value;
          if (value) {
            output.add(OutputIds.ROW_DOUBLE_CLICK, '行双击事件', Schemas.ROW_CLICK);
            setDataSchema({ data, output, ...res });
          } else {
            output.remove(OutputIds.ROW_DOUBLE_CLICK);
          }
        }
      }
    },
    {
      title: '行双击事件',
      type: '_Event',
      ifVisible({ data }: EditorResult<Data>) {
        return data.enableRowDoubleClick;
      },
      options: () => {
        return {
          outputId: OutputIds.ROW_DOUBLE_CLICK
        };
      }
    },
    {
      title: '选中行高亮',
      type: 'switch',
      value: {
        get({ data }: EditorResult<Data>) {
          return data.enableRowFocus;
        },
        set({ data, output }: EditorResult<Data>, value: boolean) {
          if (value && !data.focusRowStyle) {
            data.focusRowStyle = {
              background: '#dedede'
            };
          }
          data.enableRowFocus = value;
        }
      }
    },
    {
      title: '高亮颜色',
      type: 'style',
      options: {
        plugins: ['bgcolor']
      },
      ifVisible({ data }: EditorResult<Data>) {
        return data.enableRowFocus;
      },
      value: {
        get({ data }: EditorResult<Data>) {
          return data.focusRowStyle || {};
        },
        set({ data, output }: EditorResult<Data>, value) {
          data.focusRowStyle = value;
        }
      }
    }
  ]
};
