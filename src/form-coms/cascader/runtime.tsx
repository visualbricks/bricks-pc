import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Cascader } from 'antd';
import { RuleKeys, defaultRules, validateFormItem } from '../utils/validator';
import css from './runtime.less';
import useFormItemInputs from '../form-container/models/FormItem';
import { validateTrigger } from '../form-container/models/validate';
import { onChange as onChangeForFc } from '../form-container/models/onChange';
import { mockData } from './mockData';
import { InputIds, OutputIds } from '../types';

export interface Data {
  options: any[];
  placeholder: string;
  isMultiple: boolean;
  maxTagCountType?: string;
  value: number[] | string[];
  rules: any[];
  config: {
    placeholder: string;
    allowClear: boolean;
    disabled: boolean;
    maxTagCount?: 'responsive' | number;
    changeOnSelect: boolean;
    showSearch: boolean;
  };
}

export default function Runtime(props: RuntimeParams<Data>) {
  const { data, inputs, outputs, env, parentSlot, id } = props;
  const [options, setOptions] = useState(env.design ? mockData : []);
  const validateRelOuputRef = useRef<any>(null);
  const { edit, runtime } = env;
  const debug = !!(runtime && runtime.debug);

  useFormItemInputs({
    id: props.id,
    name: props.name,
    inputs,
    outputs,
    configs: {
      setValue(val) {
        data.value = val;
      },
      setInitialValue(val) {
        data.value = val;
      },
      returnValue(output) {
        output(data.value);
      },
      resetValue() {
        data.value = [];
      },
      setDisabled() {
        data.config.disabled = true;
      },
      setEnabled() {
        data.config.disabled = false;
      },
      setIsEnabled(val) {
        if (val === true) {
          data.config.disabled = false;
        } else if (val === false) {
          data.config.disabled = true;
        }
      },
      validate(model, outputRels) {
        validateFormItem({
          value: data.value,
          env,
          model,
          rules: data.rules
        })
          .then((r) => {
            const cutomRule = (data.rules || defaultRules).find(
              (i) => i.key === RuleKeys.CUSTOM_EVENT
            );
            if (cutomRule?.status) {
              validateRelOuputRef.current = outputRels;
              outputs[OutputIds.OnValidate](data.value);
            } else {
              outputRels(r);
            }
          })
          .catch((e) => {
            outputRels(e);
          });
      }
    }
  });
  useEffect(() => {
    //输入数据源
    inputs['setOptions']((value) => {
      setOptions(value);
    });
    // 设置校验状态
    inputs[InputIds.SetValidateInfo]((info: object) => {
      if (validateRelOuputRef.current) {
        validateRelOuputRef.current(info);
      }
    });
  }, []);

  const onValidateTrigger = () => {
    validateTrigger(parentSlot, { id: props.id, name: props.name });
  };

  const onChange = (value) => {
    data.value = value;
    onChangeForFc(parentSlot, { id: props.id, name: props.name, value });
    outputs['onChange'](value);
    onValidateTrigger();
  };

  return (
    <div className={css.cascader}>
      <Cascader
        value={data.value}
        options={options}
        {...data.config}
        placeholder={env.i18n(data.config.placeholder)}
        multiple={data.isMultiple}
        onChange={onChange}
        open={env.design ? true : void 0}
        dropdownClassName={id}
        getPopupContainer={(triggerNode: HTMLElement) =>
          edit || debug ? env?.canvasElement : env.container || document.body
        }
      />
    </div>
  );
}
