import React, { useMemo, useCallback, useLayoutEffect, useEffect } from 'react';
import { ChildrenStore, Data } from './types';
import SlotContent from './SlotContent';
import { updateValue, generateFields, validateForInput } from './utils';
import { typeCheck } from '../../utils';
import { validateFormItem } from '../utils/validator';
import { ActionsWrapper, addField } from './components/FormActions';
import { SlotIds, SlotInputIds } from './constants';
import { InputIds, OutputIds } from '../types';

export default function Runtime(props: RuntimeParams<Data>) {
  const { env, data, inputs, outputs, slots, logger, title, parentSlot, id } = props;

  const childrenStore = useMemo<ChildrenStore>(() => {
    return {};
  }, [env.edit]);

  useLayoutEffect(() => {
    // 设置值
    inputs[InputIds.SetValue]((value) => {
      if (typeCheck(value, ['Array', 'Undefined'])) {
        data.value = value;
        generateFields(data);
        data.currentAction = InputIds.SetValue;
      } else {
        logger.error(title + '的值是列表类型');
      }
    });

    // 设置初始值
    inputs[InputIds.SetInitialValue]((value) => {
      if (typeCheck(value, ['Array', 'Undefined'])) {
        data.value = value;
        outputs[OutputIds.OnInitial](data.value);
        data.currentAction = InputIds.SetInitialValue;
        generateFields(data);
      } else {
        logger.error(title + '的值是列表类型');
      }
    });

    // 获取值
    inputs['getValue']((val, outputRels) => {
      outputRels['returnValue'](data.value);
    });

    // 重置值
    inputs['resetValue'](() => {
      if (Array.isArray(data.value)) {
        data.fields = [
          {
            key: 0,
            name: 0
          }
        ];
        data.value = [{}];
        data.currentAction = InputIds.ResetValue;
      }
    });

    //设置禁用
    inputs['setDisabled'](() => {
      data.disabled = true;
      data.currentAction = InputIds.SetDisabled;
    });

    //设置启用
    inputs['setEnabled'](() => {
      data.disabled = false;
      data.currentAction = InputIds.SetEnabled;
    }, []);

    // 校验
    inputs['validate']((val, outputRels) => {
      // 校验子项
      validate()
        .then(() => {
          // 校验自己
          validateFormItem({
            value: data.value,
            env,
            rules: data.rules
          })
            .then((r) => {
              outputRels['returnValidate'](r);
            })
            .catch((e) => {
              outputRels['returnValidate'](e);
            });
        })
        .catch((e) => {
          console.log('校验失败', e);
        });
    });
  }, []);

  if (env.runtime) {
    // 值更新
    slots[SlotIds.FormItems]._inputs[SlotInputIds.ON_CHANGE](({ id, value }) => {
      updateValue({ ...props, childrenStore, childId: id, value });
    });
  }

  const validate = useCallback(() => {
    return new Promise((resolve, reject) => {
      const allPromise: (
        | Promise<any>
        | {
            validateStatus: string;
          }
      )[] = [];

      data.fields.map((field) => {
        const { name, key } = field;
        const fieldFormItems = childrenStore[key];
        const fieldPromise = data.items.map((item) => {
          const { index, inputs, visible } = fieldFormItems[item.id];
          if (!data.submitHiddenFields && !visible) {
            // 隐藏的表单项，不再校验
            return { validateStatus: 'success' };
          }
          return new Promise((resolve, reject) => {
            validateForInput({ item, index, inputs }, resolve);
          });
        });
        allPromise.push(...fieldPromise);
      });
      Promise.all(allPromise)
        .then((values) => {
          let rtn = false;
          values.forEach((item) => {
            if (item.validateStatus !== 'success') {
              reject(item);
            }
          });

          resolve(rtn);
        })
        .catch((e) => reject(e));
    });
  }, []);

  const field = useMemo(() => {
    return { name: 0, key: 0 };
  }, []);

  if (env.edit) {
    return (
      <>
        <SlotContent
          {...props}
          childrenStore={childrenStore}
          actions={<ActionsWrapper {...props} field={field} />}
          field={field}
        />
      </>
    );
  }

  const defaultActionProps = {
    ...props,
    field,
    hiddenRemoveButton: true
  };

  useEffect(() => {
    // 初始化
    if (env.runtime && data.initLength) {
      new Array(data.initLength).fill(null).forEach((_, index) => {
        addField({ data });
      });
    }
  }, []);

  return (
    <>
      {data.fields.map((field) => {
        // 更新childrenStore的index
        const { key, name } = field;
        data.items.forEach((item) => {
          if (childrenStore[key]?.[item.id]) {
            childrenStore[key][item.id].index = name;
          }
        });

        const actionProps = {
          ...props,
          fieldIndex: name,
          field,
          childrenStore
        };
        const actions = <ActionsWrapper {...actionProps} />;
        return (
          <div key={field.key}>
            <SlotContent {...props} childrenStore={childrenStore} actions={actions} field={field} />
          </div>
        );
      })}
      {data.fields.length === 0 && <ActionsWrapper {...defaultActionProps} />}
    </>
  );
}
