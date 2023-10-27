import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Tree, message } from 'antd';
import type { TreeProps } from 'antd/es/tree';
import { typeCheck, uuid } from '../utils';
import {
  pretreatTreeData,
  setCheckboxStatus,
  generateList,
  updateNodeData,
  getParentKey,
  filterCheckedKeysByCheckedValues,
  excludeParentKeys,
  outputNodeValues,
  filterTreeDataByKeys,
  traverseTree
} from './utils';
import { Data, TreeData } from './types';
import { OutputIds } from './constants';
import TreeNode from './Components/TreeNode';
import css from './style.less';

export default function (props: RuntimeParams<Data>) {
  const { env, data, inputs, outputs, onError } = props;

  const [checkedKeys, setCheckedKeys] = useState(data.checkedKeys);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    data.defaultExpandAll ? data.expandedKeys : []
  );
  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const treeKeys = useRef<any>(null);

  const keyFieldName = env.edit ? 'key' : data.keyFieldName || 'key';
  const titleFieldName = env.edit ? 'title' : data.titleFieldName || 'title';

  const rootKey = useMemo(() => {
    return uuid();
  }, []);

  useEffect(() => {
    treeKeys.current = [];
    generateList(data.treeData, treeKeys.current, { keyFieldName, titleFieldName });
  }, [data.treeData]);

  /** 按标签搜索，高亮展示树节点
   * @param searchValue 搜索值
   */
  const search = useCallback((searchValue: string) => {
    data.searchValue = searchValue;
    const searchedKeys = treeKeys.current.map((item) => {
      if (filterMethods.byTitle(item)) {
        return getParentKey(item.key, data.treeData, keyFieldName);
      }
      return null;
    });
    setExpandedKeys(
      [...searchedKeys, ...data.expandedKeys].filter(
        (item, i, self) => item && self.indexOf(item) === i
      )
    );
    setAutoExpandParent(true);
  }, []);

  /** 过滤
   * @returns 符合符合过滤方法的树节点及父节点
   */
  const filter = useCallback(() => {
    const filterKeys: React.Key[] = [];
    treeKeys.current.forEach((item) => {
      if (data.filterNames.some((filterName) => filterMethods[filterName](item))) {
        let childKey = item.key;
        filterKeys.push(childKey);
        while (getParentKey(childKey, data.treeData, keyFieldName)) {
          const parentKey = getParentKey(childKey, data.treeData, keyFieldName);
          childKey = parentKey;
          filterKeys.push(parentKey);
        }
      }
    });
    const filteredTreeData = filterTreeDataByKeys(data.treeData, filterKeys, keyFieldName);
    return filteredTreeData;
  }, []);

  /**
   * 过滤方法合集
   */
  const filterMethods = useMemo(() => {
    return {
      byTitle: (node: TreeData) => {
        return node.title?.indexOf(data.filterValue) > -1;
      },
      byKey: (node: TreeData) => {
        return node.key?.indexOf(data.filterValue) > -1;
      }
    };
  }, []);

  useEffect(() => {
    if (env.runtime) {
      inputs['outParentKeys'] &&
        inputs['outParentKeys']((value) => {
          if (typeof value === 'boolean') data.outParentKeys = value;
        });
      inputs['treeData'] &&
        inputs['treeData']((value: TreeData[]) => {
          if (value && Array.isArray(value)) {
            data.expandedKeys = [];
            data.treeData = pretreatTreeData({
              treeData: [...value],
              data,
              defaultExpandAll: data.defaultExpandAll
            });
            setExpandedKeys([...data.expandedKeys]);
          } else {
            data.treeData = [];
          }
        });
      // 更新节点数据
      inputs['nodeData'] &&
        inputs['nodeData']((nodeData: TreeData) => {
          if (typeCheck(nodeData, 'OBJECT')) {
            data.treeData = [
              ...updateNodeData(
                data.treeData,
                pretreatTreeData({
                  treeData: [nodeData],
                  data,
                  defaultExpandAll: data.defaultExpandAll
                })[0],
                keyFieldName
              )
            ];
            setExpandedKeys(
              [...data.expandedKeys].filter((item, i, self) => item && self.indexOf(item) === i)
            );
          }
        });
      // 搜索
      inputs['searchValue'] &&
        inputs['searchValue']((searchValue: string) => {
          search(searchValue);
        });
      // 自定义添加提示文案
      inputs['addTips'] &&
        inputs['addTips']((ds: string[]) => {
          Array.isArray(ds)
            ? (data.addTips = ds)
            : (data.addTips = new Array(data.maxDepth || 1000).fill(ds));
        });
      // 设置勾选项
      inputs['checkedValues'] &&
        inputs['checkedValues']((value: []) => {
          if (value && Array.isArray(value)) {
            const inputCheckedKeys = filterCheckedKeysByCheckedValues(
              data.treeData,
              value,
              keyFieldName
            );
            data.checkedKeys = inputCheckedKeys;
            setCheckedKeys(inputCheckedKeys);
          }
        });
      inputs['disableCheckbox'] &&
        inputs['disableCheckbox']((value: any) => {
          data.treeData = [...setCheckboxStatus({ treeData: data.treeData, value: true })];
        });
      inputs['enableCheckbox'] &&
        inputs['enableCheckbox']((value: any) => {
          data.treeData = [...setCheckboxStatus({ treeData: data.treeData, value: false })];
        });

      // 设置选中项
      inputs.setSelectedKeys &&
        inputs.setSelectedKeys((keys: Array<string>) => {
          if (!Array.isArray(keys)) {
            return onError('设置选中项参数是数组');
          }
          setSelectedKeys(keys);
          const selectedValues = outputNodeValues(
            data.treeData,
            keys,
            keyFieldName,
            data.valueType
          );
          outputs[OutputIds.NODE_CLICK](selectedValues);
        });

      // 过滤
      inputs['filter'] &&
        inputs['filter']((filterValue: string) => {
          data.filterValue = filterValue;
        });
    }
  }, []);

  useEffect(() => {
    const resultKeys =
      data.outParentKeys || data.checkStrictly ? checkedKeys : excludeParentKeys(data, checkedKeys);
    inputs['submit']((val, relOutputs) => {
      relOutputs['submit'](
        outputNodeValues(data.treeData, resultKeys, keyFieldName, data.valueType)
      );
    });
  }, [checkedKeys]);

  /**
   * 勾选事件处理
   * @param checkedKeys
   */
  const onCheck: TreeProps['onCheck'] = useCallback((checkedKeys: React.Key[], info) => {
    if (env.edit) return;
    const checked = data.checkStrictly ? checkedKeys.checked : checkedKeys;
    data.checkedKeys = [...checked];
    setCheckedKeys([...checked]);
    if (data.useCheckEvent) {
      const resultKeys =
        data.outParentKeys || data.checkStrictly ? checked : excludeParentKeys(data, checked);
      outputs[OutputIds.ON_CHECK](
        outputNodeValues(data.treeData, resultKeys, keyFieldName, data.valueType)
      );
    }
  }, []);

  /**
   * 展开事件处理
   * @param expandedKeys
   */
  const onExpand = useCallback((expandedKeys: React.Key[]) => {
    data.expandedKeys = [...expandedKeys];
    setExpandedKeys([...expandedKeys]);
    setAutoExpandParent(false);
  }, []);

  /**
   * 选择事件处理
   * @param selectedKeys
   * @param node TreeNode 的 props
   */
  const onSelect = (selectedKeys: React.Key[], { node, selected }) => {
    const selectedValues = outputNodeValues(
      data.treeData,
      selectedKeys,
      keyFieldName,
      data.valueType
    );
    if (data.clickExpandable) {
      const keyIndex = expandedKeys.indexOf(node[keyFieldName]);
      if (keyIndex < 0) {
        setExpandedKeys([...expandedKeys, node[keyFieldName]]);
      } else {
        setExpandedKeys(expandedKeys.filter((key) => key !== node[keyFieldName]));
      }
    }
    setSelectedKeys([...selectedKeys]);
    outputs[OutputIds.NODE_CLICK](selectedValues);
  };

  /**
   * onDrop事件处理
   * 注: node TreeNode 的props
   */
  const onDrop: TreeProps['onDrop'] = (info) => {
    /**
     * info.node: 落下的节点信息
     * info.dragNode: 拖拽的节点信息
     * info.dropPosition: 落下的位置信息
     */
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropFlag = info.dropPosition - Number(dropPos[dropPos.length - 1]); // dropPos[dropPos.length - 1]: 落下节点的index

    const dragNodeInfo = traverseTree({ data, targetKey: dragKey as string });
    const dropNodeInfo = traverseTree({ data, targetKey: dropKey as string });
    if (!dragNodeInfo || !dropNodeInfo) return;
    const { parent: dragNodeParent, node: dragNode, index: dragNodeIndex } = dragNodeInfo;
    const { parent: dropNodeParent, node: dropNode, index: dropNodeIndex } = dropNodeInfo;

    /** 判断是否满足拖拽范围限制 */
    switch (data.useDropScope) {
      case 'parent':
        if (dropFlag === 0 && dropNode[keyFieldName] !== dragNodeParent?.[keyFieldName]) {
          // 拖拽到dropNode的第一个子节点
          message.error(data.dropScopeMessage);
          return;
        }
        if (dropFlag !== 0 && dragNodeParent?.[keyFieldName] !== dropNodeParent?.[keyFieldName]) {
          message.error(data.dropScopeMessage);
          return;
        }
        break;
    }

    // 删除原来的节点
    if (!dragNodeParent) {
      data.treeData.splice(dragNodeIndex, 1);
    } else {
      dragNodeParent.children?.splice(dragNodeIndex, 1);
    }

    switch (dropFlag) {
      // 移动到dropNode下面的第一个子级
      case 0:
        if (Array.isArray(dropNode?.children)) {
          dropNode.children.unshift(dragNode);
        } else {
          dropNode.children = [dragNode];
        }
        break;

      // 移动到和dropNode平级，在其后面
      case 1:
        dropNodeParent?.children?.splice(dropNodeIndex + 1, 0, dragNode);
        break;

      // 移动到和dropNode平级，在其前面
      case -1:
        dropNodeParent?.children?.splice(dropNodeIndex, 0, dragNode);
        break;
    }

    outputs[OutputIds.ON_DROP_DONE]({
      dragNodeInfo,
      dropNodeInfo,
      flag: dropFlag
    });
  };

  /**
   * allowDrop事件处理
   * @param dragNode 拖拽的节点信息
   * @param dropNode 落下的节点信息
   * @param dropPosition 落下的位置
   * 注: node TreeNode 的props
   */
  const allowDrop: TreeProps['allowDrop'] = (info) => {
    if (!data.draggable && data.allowDrop) return false;
    const dropPosition = info.dropPosition;
    // 放置在子级
    if (dropPosition === 0) {
      return true;
    } else {
      return info.dropNode['data-allow-drop'];
    }
  };

  const treeData = useMemo(() => {
    return data.filterValue ? filter() : data.treeData;
  }, [data.filterValue, data.treeData]);
  const isEmpty = useMemo(() => {
    return treeData?.length === 0;
  }, [treeData.length]);

  return (
    <div
      className={`${isEmpty ? css.emptyWrapper : ''}`}
      style={{
        maxHeight: isEmpty ? void 0 : data.scrollHeight,
        height: isEmpty ? data.scrollHeight : void 0,
        overflowY: 'scroll'
      }}
    >
      {isEmpty ? (
        <Empty
          description={<span>{env.i18n(data.description)}</span>}
          image={data.isImage ? data.image : void 0}
        />
      ) : (
        <Tree
          checkable={!!data.checkable}
          draggable={
            data.draggable
              ? (node) => {
                  return node['data-draggable'];
                }
              : false
          }
          allowDrop={allowDrop}
          showLine={data.showLine}
          checkStrictly={data.checkStrictly}
          onExpand={onExpand}
          expandedKeys={env.edit ? data.expandedKeys : expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          defaultExpandAll={data.defaultExpandAll}
          defaultCheckedKeys={data.checkedKeys}
          selectedKeys={selectedKeys}
          onSelect={onSelect}
          onDrop={onDrop}
          blockNode
        >
          {TreeNode(props, setExpandedKeys, treeData || [], 0, { key: rootKey })}
        </Tree>
      )}
    </div>
  );
}
