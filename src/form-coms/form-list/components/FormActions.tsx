import React, { useCallback, useMemo } from 'react';
import { Form, Button, Row, Col, Space, FormListOperation, FormListFieldData } from 'antd';
import { Action, Data } from '../types';
import { unitConversion } from '../../../utils';
import { changeValue } from '../utils';
import { InputIds } from '../../../form-coms/types';

export interface FormListActionsProps {
  operation?: FormListOperation;
  field: FormListFieldData;
  fieldIndex?: number;
  hiddenRemoveButton?: boolean;
  childrenStore?: any;
}

export const addField = ({ data }: { data: Data }) => {
  const { fields } = data;
  data.MaxKey = data.MaxKey + 1;
  fields.push({
    name: fields.length,
    key: data.MaxKey
  });
  data.currentAction = 'add';
};

const removeField = (props: RuntimeParams<Data> & FormListActionsProps) => {
  const { data, id, outputs, parentSlot, field, childrenStore } = props;
  const { fields } = data;
  data.currentAction = InputIds.SetInitialValue;
  data.startIndex = field.name;
  fields.splice(field.name, 1);
  data.value = data.value?.filter((_, index) => {
    return index !== field.name;
  });
  // 更新name
  fields.forEach((field, index) => {
    field && (field.name = index);
  });
  childrenStore[field.key] = undefined;

  changeValue({ data, id, outputs, parentSlot });
};

const Actions = (props: RuntimeParams<Data> & FormListActionsProps) => {
  const { data, env, field, fieldIndex, hiddenRemoveButton } = props;

  const onClick = (item: Action) => {
    if (env.edit) return;
    if (item.key === 'add') {
      addField({ data });
    }
    if (item.key === 'remove' && field) {
      removeField(props);
    }
  };

  const notLastField = typeof fieldIndex === 'number' && !(fieldIndex === data.fields.length - 1);

  return (
    <Space wrap>
      {data.actions.items.map((item) => {
        if (item.visible === false) {
          return null;
        }
        if (item.key === 'add' && notLastField) {
          return null;
        }
        if (item.key === 'remove' && hiddenRemoveButton) {
          return null;
        }
        return (
          <Button
            data-form-actions-item={item.key}
            type={item.type}
            loading={item.loading}
            key={item.key}
            onClick={() => onClick(item)}
            disabled={data.disabled}
          >
            {item.title}
          </Button>
        );
      })}
    </Space>
  );
};

const ActionsWrapper = (props: RuntimeParams<Data> & FormListActionsProps) => {
  const { data, fieldIndex } = props;
  const { align, widthOption, width, span, inlinePadding } = data.actions;
  const actionStyle: React.CSSProperties = {
    textAlign: align,
    padding: inlinePadding?.map(String).map(unitConversion).join(' ')
  };
  const getFlexValue = useCallback(() => {
    if (widthOption === 'px') {
      return `0 0 ${width || 0}px`;
    } else if (widthOption === 'flexFull') {
      return 1;
    }

    return `0 0 ${(span * 100) / 24}%`;
  }, [widthOption, width, span]);

  const formItemProps = {
    label: '',
    colon: false
  };

  const isLastField = fieldIndex === data.fields.length - 1;

  if (data.actions.visible) {
    return (
      <Col data-form-actions flex={getFlexValue()} style={actionStyle}>
        <Form.Item {...formItemProps} style={isLastField ? { margin: 0 } : {}}>
          <Actions {...props} />
        </Form.Item>
      </Col>
    );
  }
  return null;
};
export { Actions, ActionsWrapper };
