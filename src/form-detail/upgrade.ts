import { Data } from './constants';

export default function ({ data, input, output, setDeclaredStyle }: UpgradeParams<Data>): boolean {
  /**
   * @description v1.0.2 增加“设置数据源”和“设置标题”默认schema
   */

  const titleSchema = {
    type: 'string'
  };

  const dataSourceSchema = {
    type: 'object',
    properties: {
      field1: {
        type: 'string'
      }
    }
  };

  if (!input.get('setTitle')) {
    input.add('setTitle', '设置标题', titleSchema);
  }

  if (!output.get('setDataSource')) {
    output.add('setDataSource', '设置数据源', dataSourceSchema);
  }

  /**
   * @description v1.0.7 标签和内容字体style改造
   */
  data.items.map((item) => {
    setDeclaredStyle(`.${item.id}-item .ant-descriptions-item-label`, { ...item.labelStyle });
    setDeclaredStyle(`.${item.id}-item .ant-descriptions-item-content`, { ...item.contentStyle });
    setDeclaredStyle(`.${item.id}-item`, {
      paddingLeft: item.padding?.[0],
      paddingRight: item.padding?.[1],
      paddingTop: item.padding?.[2],
      paddingBottom: item.padding?.[3]
    });
  });

  return true;
}
