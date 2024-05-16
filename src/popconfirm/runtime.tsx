import React, { useMemo } from 'react';
import { Popconfirm } from 'antd';
import * as Icons from '@ant-design/icons';
import { Data } from './types';
import { isString } from '../utils';
import ConfigProvider from '../components/ConfigProvider';

export default ({ env, data, slots, inputs, outputs, id }: RuntimeParams<Data>) => {
  const { edit, runtime } = env;
  const debug = !!(runtime && runtime.debug);
  const { title, icon, okText, cancelText, ...rest } = data;
  inputs.title((val: string, relOutputs) => {
    if (isString(val)) {
      data.title = val;
    } else {
      data.title = JSON.stringify(val);
    }
    relOutputs['setTitleComplete']();
  });

  const visible = useMemo(() => {
    return !!edit ? true : void 0;
  }, [edit]);

  const renderTitle = (title: string) => {
    return title ? (
      <div
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: env.i18n(title).replace('\\n', '<br/>') }}
      />
    ) : null;
  };

  const onConfirm = () => {
    outputs.onOk();
  };

  const onCancel = () => {
    outputs.onCancel();
  };

  const slotStyle = useMemo(() => {
    return {...(data.slotStyle ?? {}), cursor: 'pointer' }
  }, [data.slotStyle])
  return (
    <ConfigProvider locale={env.vars?.locale}>
      <Popconfirm
        title={renderTitle(title as string)}
        icon={Icons[icon as string]?.render()}
        // defaultVisible={visible}
        // visible={visible}
        {...env.edit ? { trigger:  data.trigger || ['click']} : {}}
        overlayClassName={id}
        overlayInnerStyle={{
          maxWidth: window.screen.availWidth,
          maxHeight: window.screen.availHeight,
          minWidth: 'max-content',
        }}
        getPopupContainer={(triggerNode: HTMLElement) => env.edit ? triggerNode : (env?.canvasElement || document.body)}
        destroyTooltipOnHide
        okText={env.i18n(okText)}
        cancelText={env.i18n(cancelText)}
        {...rest}
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <div>
          {slots.carrier?.render({
            style: slotStyle
          })}
        </div>
      </Popconfirm>
    </ConfigProvider>
  );
};
