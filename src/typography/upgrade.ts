import { Data } from "./constants";
import { isEmptyObject } from '../utils'

export default function ({
  data,
  input,
  output,
  setDeclaredStyle
}: UpgradeParams<Data>): boolean {
  data.items.forEach(item => {

    //1.0.0 -> 1.0.1
    const { style = {} } = item;
    const fontWeightMap = {
      normal: 400,
      bold: 700
    };
    if (typeof style.lineHeight === 'number') {
      style.lineHeight = parseInt(style.fontSize) * style.lineHeight + 'px';
    }
    if (typeof style.fontWeight === 'string') {
      style.fontWeight = fontWeightMap[style.fontWeight]
    }

  });

  //1.0.3 -> 1.0.4 style升级，文本排版的边框和内容文字的颜色
  if(data.style?.fontSize){
    setDeclaredStyle('.container', {...data.style});
    data.style = {textAlign: data.style?.textAlign}
  }
  data.items.forEach((item) => {
    if(isEmptyObject(item.style)){
      setDeclaredStyle(`.${item.key}`, {...item.style});
      item.style = {}
    }
  })

  //1.0.4 -> 1.0.5 动态输入数据，单击获取子项内容,
  //1）统一处理样式
  if(typeof data.isUnity === 'undefined'){
    data.isUnity = false
  }

  //2）间距
  if(typeof data.padding === 'undefined'){
    data.padding = [0, 16]
  }

  //3）唯一标识
  if(typeof data.rowKey === 'undefined'){
    data.rowKey = ""
  }

  const dataSchema = {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "content": {
          "title": "内容",
          "type": "string"
        },
        "type": {
          "title": "类型",
          "type": "string"
        },
        "link": {
          "title": "链接",
          "type": "string"
        },
        "style":{
          "type": "object",
          "properties": {
            "color": {
              "type": "string"
            },
            "fontSize": {
              "type": "string"
            },
            "fontWeight":{
              "type": "number"
            },
            "stylePadding":{
              "type":"array",
              "items": {
                "type": "number"
              }
            }
          }
        }
      }
    }
  }
  if (!input.get('setData')) {
    input.add('setData', '设置数据', dataSchema);
  }

  const clickSchema = {
    "type": "object",
    "properties": {
      "values":{
        "type": "object",
        "properties": {
          "content": {
            "title": "内容",
            "type": "string"
          },
          "key": {
            "title": "唯一标识",
            "type": "string"
          },
          "type": {
            "title": "类型",
            "type": "string"
          },
          "link": {
            "title": "链接",
            "type": "string"
          }
        }
      },
      "index":{
        "type": "number"
      }
    }
  }
  if (!output.get('click')) {
    output.add('click', '单击', clickSchema);
  }

  return true;
}