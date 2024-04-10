import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Data, InputIds, OutputIds } from './constants';
import { checkIfMobile, uuid } from '../utils';
import debounce from 'lodash/debounce';
import { addItem, removeItem, changeItem, upMove, downMove } from './utils';
import { ListRender } from './render/ListRender';
import { sortUsePoint, columnHandel } from './utils'

const arrayMove = <T,>(array: Array<T>, form: number, to: number): Array<T> => {
  const _array = array.slice();
  const moveItem = _array.splice(form, 1)[0];
  _array.splice(to, 0, moveItem);
  return _array;
};

const rowKey = '_itemKey';
export default ({ data, inputs, slots, env, outputs, logger }: RuntimeParams<Data>) => {
  let { grid, useLoading, useGetDataSource } = data;
  const [dataSource, setDataSource] = useState<any[]>([...(data.dataSource || [])]);
  const [loading, setLoading] = useState(false);
  const gutter: any = Array.isArray(grid.gutter) ? grid.gutter : [grid.gutter, 16];
  const isMobile = checkIfMobile(env);

  const [columns, setColumns] = useState(1);

  grid = isMobile ? { ...grid, column: grid.mobileColumn } : { ...grid };

  useLayoutEffect(() => {
    if (env.runtime.debug?.prototype) {
      // 原型设计态
      const mockArr = new Array<any>(3).fill({});

      // Todo 这里的数据类型需要优化
      data.dataSource = mockArr.map((item, index) => {
        return {
          [rowKey]: index,
          item: {
            name: `第${index + 1}项`
          },
          index
        };
      });
      setDataSource(data.dataSource);
    }
  }, []);

  //设置数据源输入及loading状态设置
  useEffect(() => {
    if (env.edit) {
      setDataSource([{ id: 1, [rowKey]: uuid() }]);
    }

    if (env.runtime) {
      inputs[InputIds.DATA_SOURCE]((v, relOutputs) => {
        if (Array.isArray(v)) {
          const ds = v.map((item, index) => ({
            item,
            [rowKey]: data.rowKey === '' ? uuid() : item[data.rowKey] || uuid(),
            index: index
          }));
          data.dataSource = ds;
          setDataSource(ds);
          relOutputs['setDataSourceDone'](ds);
        }
        setLoading(false);
      });
      useLoading &&
        inputs[InputIds.LOADING] &&
        inputs[InputIds.LOADING]((v, relOutputs) => {
          setLoading(v !== false);
          relOutputs['setLoadingDone'](v);
        });
    }
  }, []);
  //获取数据源
  useEffect(() => {
    if (env.runtime && useGetDataSource && inputs[InputIds.GetDataSource]) {
      inputs[InputIds.GetDataSource]((val, relOutputs) => {
        const outputFn = relOutputs?.[InputIds.GetDataSource] || outputs[InputIds.GetDataSource];
        outputFn(dataSource.map(({ item }) => item));
      });
    }
  }, [dataSource]);
  //添加一项
  useEffect(() => {
    if (env.runtime) {
      inputs[InputIds.AddItem]((v, relOutputs) => {
        let newDataSource = [...data.dataSource];
        let len = newDataSource.length;
        //判断在指定位置还是末尾
        let judge = v.value !== undefined && v.index >= 0 && v.index < len;
        newDataSource = addItem(newDataSource, len, v, data.rowKey, judge);

        data.dataSource = newDataSource;
        setDataSource(newDataSource);
        relOutputs['addItemDone'](v);
      });
    }
  }, []);

  //删除一项
  useEffect(() => {
    if (env.runtime) {
      inputs[InputIds.RemoveItem]((v, relOutputs) => {
        let newDataSource = [...data.dataSource];
        let len = newDataSource.length;
        let judge = typeof v === 'number' && v >= 0 && v < len;
        newDataSource = removeItem(newDataSource, v, judge, logger);

        data.dataSource = newDataSource;
        setDataSource(newDataSource);
        relOutputs['removeItemDone'](v);
      });
    }
  }, []);

  //改动一项
  useEffect(() => {
    if (env.runtime) {
      inputs[InputIds.ChangeItem]((v, relOutputs) => {
        let newDataSource = [...data.dataSource];
        let len = newDataSource.length;
        let judge = typeof v.index === 'number' && v.index >= 0 && v.index < len;
        //有index, 且index在合理范围内
        if (judge) {
          if (v.value !== undefined) {
            newDataSource = changeItem(newDataSource, v, data.rowKey);
            data.dataSource = newDataSource;
            setDataSource(newDataSource);
            relOutputs['changeItemDone'](v);
          } else {
            logger.error('未指定value（改动值）');
          }
        } else {
          logger.error('未指定index（位置）或index不在合理范围内');
        }
      });
    }
  }, []);

  //指定对应项上移
  useEffect(() => {
    if (env.runtime) {
      inputs[InputIds.MoveUp]((v, relOutputs) => {
        let newDataSource = [...data.dataSource];
        let len = newDataSource.length;
        if (typeof v === 'number' && v > 0 && v < len) {
          newDataSource = upMove(newDataSource, v);
          data.dataSource = newDataSource;
          setDataSource(newDataSource);
          relOutputs['moveUpDone'](v);
        } else {
          logger.error('指定index不在合理范围内');
        }
      });
    }
  }, []);

  //指定对应项下移
  useEffect(() => {
    if (env.runtime) {
      inputs[InputIds.MoveDown]((v, relOutputs) => {
        let newDataSource = [...data.dataSource];
        let len = newDataSource.length;
        if (typeof v === 'number' && v >= 0 && v < len - 1) {
          newDataSource = downMove(newDataSource, v);
          data.dataSource = newDataSource;
          setDataSource(newDataSource);
          relOutputs['moveDownDone'](v);
        } else {
          logger.error('指定index不在合理范围内');
        }
      });
    }
  }, []);

  useEffect(() => {
    let orderedOptions = (data.customOptions || []).sort(sortUsePoint);
    const debounceFn = debounce(() => {
      let newColumns = columns;
      const width = window.innerWidth;
      newColumns = columnHandel(orderedOptions, width);
      //如果没有对应列数默认处理成1
      setColumns(newColumns || 1);
    }, 50);
    window.addEventListener('resize', debounceFn);
    return () => window.removeEventListener('resize', debounceFn);
  }, [data.customOptions]);

  useEffect(() => {
    let orderedOptions = (data.customOptions || []).sort(sortUsePoint);
    const width = window.innerWidth;
    let newColumns = columnHandel(orderedOptions, width);
    //如果没有对应列数默认处理成1
    setColumns(newColumns || 1);
  }, []);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setDataSource(arrayMove(dataSource, oldIndex, newIndex));
    if (data.canSort) {
      outputs[OutputIds.SortComplete](arrayMove(dataSource, oldIndex, newIndex));
    }
  }
  
  return ListRender( env, slots, data, dataSource, loading, gutter, onSortEnd, columns )
};
