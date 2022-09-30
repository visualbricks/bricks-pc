import {
  Data,
  findMenuItem,
  MenuItem,
  MenuTypeEnum,
  MenuModeEnum,
  OutputIds,
  uuid
} from './constants';

const getMenuItem = ({ data, focusArea }: EditorResult<Data>, path?: keyof MenuItem) => {
  if (!focusArea) return;
  const key = focusArea.dataset['menuItem'];
  const item = findMenuItem(data.dataSource, key, true);
  if (!path) {
    return item;
  }
  return item?.[path];
};
const setMenuItem = <T extends keyof MenuItem, P extends MenuItem[T]>(
  { data, focusArea }: EditorResult<Data>,
  path: T,
  value: P
) => {
  if (!focusArea) return;
  const key = focusArea.dataset['menuItem'];
  const item = findMenuItem(data.dataSource, key, true);
  if (item && path) {
    item[path] = value;
  }
  data.dataSource = [...data.dataSource];
};

//配置分组菜单和父菜单点击事件
const menuItemEditors = (props) => {
  let items: any = [];
  if (getMenuItem(props, 'children') !== undefined) {
    for (let i = 0; i < getMenuItem(props, 'children').length; i++) {
      items.push({
        title: `点击${getMenuItem(props, 'children')[i].title}`,
        type: '_Event',
        ifVisible(props: EditorResult<Data>) {
          //父菜单和分组菜单的点击事件
          return getMenuItem(props, 'children') !== undefined;
        },
        options: {
          outputId: getMenuItem(props, 'children')[i].key
        }
      });
    }
  }
  return items;
};

export default {
  '@init': ({ data, output }: EditorResult<Data>) => {
    data.dataSource = [
      {
        title: '菜单1',
        defaultActive: true,
        key: uuid(),
        menuType: MenuTypeEnum.Menu
      }
    ];
    const schema = {
      type: 'any'
    };
    output.add(data.dataSource[0].key, `点击${data.dataSource[0].title}`, schema);
  },
  '@resize': {
    options: ['width', 'height']
  },
  ':root': [
    {
      title: '静态数据',
      type: 'Array',
      options: {
        getTitle: (item, index) => {
          if (!item.title) {
            item.title = `菜单${index + 1}`;
          }
          if (!item.key) {
            item.key = uuid();
          }
          return item.title;
        },
        onAdd: () => {
          return {
            key: uuid(),
            menuType: MenuTypeEnum.Menu
          };
        },
        items: [
          {
            title: '标题',
            type: 'TextArea',
            value: 'title',
            options: {
              autoSize: { maxRows: 1 }
            }
          },
          {
            title: '唯一标识',
            type: 'TextArea',
            value: 'key',
            options: {
              autoSize: { maxRows: 1 }
            }
          },
          {
            title: '默认激活',
            type: 'Switch',
            value: 'defaultActive'
          },
          {
            title: '类型',
            type: 'Select',
            options: [
              { label: '子菜单', value: MenuTypeEnum.Menu },
              { label: '父菜单', value: MenuTypeEnum.SubMenu },
              { label: '分组', value: MenuTypeEnum.Group }
            ],
            value: 'menuType'
          }
          // {
          //   title: '其他数据(Json)',
          //   type: 'Code',
          //   options: {
          //     title: '其他数据(Json)',
          //     language: 'json',
          //     width: 600,
          //     height: 100,
          //     minimap: {
          //       enabled: false
          //     }
          //   },
          //   value: 'value'
          // }
        ]
      },
      value: {
        get({ data }: EditorResult<Data>) {
          return data.dataSource;
        },
        set({ data, output }: EditorResult<Data>, val: any[]) {
          //减少子菜单、父菜单和分组菜单事件，diff
          //1）减少子菜单事件
          let befArr = data.dataSource.map((item) => {
            return item.key;
          });
          let aftArr = [...val].map((item) => {
            return item.key;
          });
          let list = befArr.filter((items) => {
            if (!aftArr.includes(items)) return items;
          });
          output.remove(list[0]);

          //2）减少父菜单和分组菜单事件
          // 1. 找出被删除的那一项
          const index = befArr.indexOf(list[0]);
          if (list.length !== 0) {
            //2.确认删除的那一项是父菜单和分组菜单
            if (data.dataSource[index].menuType !== 'menu') {
              //3.确认子项有值
              if (data.dataSource[index].children?.length !== 0) {
                //3.得出删除子项的所有key
                const deletArr: string[] | any = data.dataSource[index].children?.map((item) => {
                  return item.key;
                });
                for (let i = 0; i < deletArr?.length; i++) {
                  //4.删除对应的output
                  output.remove(deletArr[i]);
                }
              }
            }
          }

          data.dataSource = [...val];
          const schema = {
            type: 'any'
          };
          //增加子菜单点击事件
          for (let i = 0; i < [...val].length; i++) {
            output.add([...val][i].key, `点击${[...val][i].title}`, schema);
          }
        }
      }
    },
    {
      title: '样式',
      type: 'Select',
      options: [
        { label: '水平', value: MenuModeEnum.Horizontal },
        { label: '垂直', value: MenuModeEnum.Vertical },
        { label: '内联', value: MenuModeEnum.Inline }
      ],
      value: {
        get({ data }: EditorResult<Data>) {
          return data.mode;
        },
        set({ data }: EditorResult<Data>, val: MenuModeEnum) {
          data.mode = val;
        }
      }
    },
    {
      title: '点击',
      type: '_Event',
      options: {
        outputId: OutputIds.ClickMenu
      }
    }
  ],
  '[data-menu-item]': (props: EditorResult<Data>, data, output: EditorResult<Data>, ...cateAry) => {
    (cateAry[0].title = '菜单项'),
      (cateAry[0].items = [
        {
          title: '标题',
          type: 'Text',
          value: {
            get(props: EditorResult<Data>) {
              return getMenuItem(props, 'title');
            },
            set(props: EditorResult<Data>, value: string) {
              setMenuItem(props, 'title', value);
            }
          }
        },
        {
          title: '唯一标识',
          type: 'Text',
          value: {
            get(props: EditorResult<Data>) {
              return getMenuItem(props, 'key');
            },
            set(props: EditorResult<Data>, value: string) {
              setMenuItem(props, 'key', value);
            }
          }
        },
        {
          title: '默认激活',
          type: 'Switch',
          value: {
            get(props: EditorResult<Data>) {
              return getMenuItem(props, 'defaultActive');
            },
            set(props: EditorResult<Data>, value: boolean) {
              setMenuItem(props, 'defaultActive', value);
            }
          }
        },
        {
          title: '类型',
          type: 'Select',
          options: [
            { label: '子菜单', value: MenuTypeEnum.Menu },
            { label: '父菜单', value: MenuTypeEnum.SubMenu },
            { label: '分组', value: MenuTypeEnum.Group }
          ],
          value: {
            get(props: EditorResult<Data>) {
              return getMenuItem(props, 'menuType');
            },
            set(props: EditorResult<Data>, value: MenuTypeEnum) {
              setMenuItem(props, 'menuType', value);
            }
          }
        },
        {
          title: '子菜单配置',
          type: 'Array',
          ifVisible(props: EditorResult<Data>) {
            return (
              getMenuItem(props, 'menuType') === MenuTypeEnum.SubMenu ||
              getMenuItem(props, 'menuType') === MenuTypeEnum.Group
            );
          },
          options: {
            getTitle: (item, index) => {
              if (!item.title) {
                item.title = `子菜单${index + 1}`;
              }
              if (!item.key) {
                item.key = uuid();
              }
              return item.title;
            },
            onAdd: () => {
              return {};
            },
            items: [
              {
                title: '标题',
                type: 'TextArea',
                value: 'title',
                options: {
                  autoSize: { maxRows: 1 }
                }
              },
              {
                title: '唯一标识',
                type: 'TextArea',
                value: 'key',
                options: {
                  autoSize: { maxRows: 1 }
                }
              },
              {
                title: '默认激活',
                type: 'Switch',
                value: 'defaultActive'
              }
            ]
          },
          value: {
            get(props: EditorResult<Data>) {
              return getMenuItem(props, 'children');
            },
            set(props: EditorResult<Data>, value: any[]) {
              let afArr = [...value].map((item) => {
                return item.key;
              });
              let beArr = [];
              if (getMenuItem(props, 'children') === undefined) {
                beArr = [];
              } else {
                beArr = getMenuItem(props, 'children').map((item) => {
                  return item.key;
                });
              }
              //获取减少的子菜单项内容
              let list = beArr.filter((items) => {
                if (!afArr.includes(items)) return items;
              });
              setMenuItem(props, 'children', [...value]);
              //减少父菜单和分组菜单的点击事件
              const schema = {
                type: 'any'
              };
              props.output.remove(list[0]);
              //增加父菜单和分组菜单的点击事件
              for (let i = 0; i < [...value].length; i++) {
                props.output.add([...value][i].key, `点击${[...value][i].title}`, schema);
              }
            }
          }
        },
        ...menuItemEditors(props),
        {
          //title: '子菜单点击',
          title: `点击${getMenuItem(props).title}`,
          type: '_Event',
          ifVisible(props: EditorResult<Data>) {
            return getMenuItem(props, 'menuType') === MenuTypeEnum.Menu;
          },
          options: (props: EditorResult<Data>) => {
            const menuItem = getMenuItem(props);
            return {
              outputId: menuItem.key
            };
          }
        },
        {
          title: '位置',
          items: [
            {
              title: '前移',
              type: 'Button',
              ifVisible(props: EditorResult<Data>) {
                return props.data.dataSource.indexOf(getMenuItem(props)) !== 0;
              },
              value: {
                set(props: EditorResult<Data>) {
                  let i = props.data.dataSource.indexOf(getMenuItem(props));
                  let newval: any[] = [];
                  for (let i = 0; i < props.data.dataSource.length; i++) {
                    newval[i] = props.data.dataSource[i];
                  }
                  const item = getMenuItem(props);
                  newval.splice(i, 1);
                  newval.splice(i - 1, 0, item);
                  props.data.dataSource = newval;
                }
              }
            },
            {
              title: '后移',
              type: 'Button',
              ifVisible(props: EditorResult<Data>) {
                return (
                  props.data.dataSource.indexOf(getMenuItem(props)) !==
                  props.data.dataSource.length - 1
                );
              },
              value: {
                set(props: EditorResult<Data>) {
                  let i = props.data.dataSource.indexOf(getMenuItem(props));
                  let newval: any[] = [];
                  for (let i = 0; i < props.data.dataSource.length; i++) {
                    newval[i] = props.data.dataSource[i];
                  }
                  const item = getMenuItem(props);
                  newval.splice(i, 1);
                  newval.splice(i + 1, 0, item);
                  props.data.dataSource = newval;
                }
              }
            },
            {
              title: '删除',
              type: 'Button',
              value: {
                set(props: EditorResult<Data>) {
                  //1.删除项为子菜单项的key
                  props.output.remove(getMenuItem(props).key);
                  //2.删除项为父菜单和分组菜单的key
                  if (getMenuItem(props).menuType !== 'menu') {
                    if (getMenuItem(props).children?.length !== 0) {
                      //1).得出删除子项的所有key
                      const deletArr: string[] | any = getMenuItem(props).children?.map((item) => {
                        return item.key;
                      });
                      for (let i = 0; i < deletArr?.length; i++) {
                        //2).删除对应的output
                        props.output.remove(deletArr[i]);
                      }
                    }
                  }
                  let newval = props.data.dataSource.filter((item) => {
                    return item !== getMenuItem(props);
                  });
                  props.data.dataSource = newval;
                }
              }
            }
          ]
        }
      ]);
  }
};
