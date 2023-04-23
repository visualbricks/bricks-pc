import React, { useState, useCallback } from 'react';
import { Input } from 'antd';
import { Data } from './constants';
import CodeEditor from './CodeEditor';
import { validateFormItem } from '../utils/validator';
import useFormItemInputs from '../form-container/models/FormItem';
import { onChange as onChangeForFc } from '../form-container/models/onChange';

export default function ({ data, inputs, outputs, env, id, parentSlot }: RuntimeParams<Data>) {
  const [value, setValue] = useState<string>();
  const validate = useCallback(
    (output) => {
      validateFormItem({
        value,
        env,
        rules: data.rules
      })
        .then((r) => {
          output(r);
        })
        .catch((e) => {
          output(e);
        });
    },
    [value]
  );

  useFormItemInputs(
    {
      inputs,
      outputs,
      configs: {
        setValue: setValue,
        setInitialValue: setValue,
        returnValue(output) {
          output(value);
        },
        resetValue() {
          setValue(void 0);
        },
        setDisabled() {
          data.readOnly = true;
        },
        setEnabled() {
          data.readOnly = false;
        },
        validate
      }
    },
    [value]
  );

  const onChange = (value: string) => {
    setValue(value);
    onChangeForFc(parentSlot, { id, value });
    outputs.onChange(value);
  };

  return env.runtime ? (
    <CodeEditor
      value={value}
      onChange={onChange}
      config={data.aceConfig}
      readOnly={data.readOnly}
    />
  ) : (
    <Input.TextArea
      value={value}
      rows={data.aceConfig.minLines}
      placeholder={data.aceConfig.placeholder}
      readOnly={true}
    />
  );
}
