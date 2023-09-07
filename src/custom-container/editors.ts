import { Data, SlotIds, OverflowEnum } from './constants';
import { OverflowEditor } from './editors/overflowEditor';
import { PageScrollEditor } from './editors/pageSrcollEditor';
import { StyleEditor } from './editors/styleEditor';
import { ClickEditor } from './editors/clickEditor';
import { MaxHeightEditor } from './editors/maxHeightEditor';
import { FixedEditor } from './editors/fixedEditor';
import { getFilterSelector } from '../utils/cssSelector';
import { unitConversion } from '../utils';

const setSlotLayout = (slot, val) => {
  if (!slot) return;
  if (val.position === 'absolute') {
    slot.setLayout(val.position);
  } else if (val.display === 'flex') {
    if (val.flexDirection === 'row') {
      slot.setLayout('flex-row');
    } else if (val.flexDirection === 'column') {
      slot.setLayout('flex-column');
    }
  }
};

export default {
  '@init'({ style }: EditorResult<Data>) {
    style.height = 'auto';
  },
  '@resize': {
    options: ['width', 'height']
  },
  ':root': {
    items({ slot }: EditorResult<Data>, cate1, cate2, cate3) {
      cate1.title = '常规';
      cate1.items = [
        {
          title: '布局',
          type: 'layout',
          options: [],
          value: {
            get({ data, slots }: EditorResult<Data>) {
              const { slotStyle = {} } = data;
              const slotInstance = slots.get('content');
              setSlotLayout(slotInstance, slotStyle);
              return slotStyle;
            },
            set({ data, slots }: EditorResult<Data>, val: any) {
              if (!data.slotStyle) {
                data.slotStyle = {};
              }
              data.slotStyle = {
                ...data.slotStyle,
                ...val
              };
              const slotInstance = slots.get('content');
              setSlotLayout(slotInstance, val);
            }
          }
        },
      ];

      cate2.title = '交互';
      cate2.items = [...ClickEditor, ...PageScrollEditor];

      return {
        title: '自定义容器'
      };
    },
    style: [
      MaxHeightEditor,
      // OverflowEditor,
      ...FixedEditor,
      {
        items: [
          {
            title: '默认',
            catelog: "默认",
            options: ['padding', 'border', 'background', 'overflow'],
            target: ({ id }: EditorResult<Data>) => `.root${getFilterSelector(id)}`
          },
          {
            title: 'Hover',
            catelog: "Hover",
            options: ['padding', 'border', 'background'],
            target: ({ id }: EditorResult<Data>) => `.root:hover${getFilterSelector(id)}`,
            domTarget: '.root'
          }
        ]
      }
    ]
  }
};
