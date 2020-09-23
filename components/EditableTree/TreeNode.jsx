import React, { Component } from 'react';
import { Spin, Tree, Input, Row, Col, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';

import { CheckOutlined } from '@ant-design/icons';

import { fnDebounce } from '../utils';

@inject('lang')
@observer
export default class TreeNode extends Component {
  state = {
    actionVisible: false,
  }
  nodeName=''
  nodeValue=''
  editNameInputRef = React.createRef();

  componentDidMount() {
    const {
      nodeName, nodeValue,
    } = this.props.treeData;
    this.nodeName = nodeName;
    this.nodeValue = nodeValue;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      nodeName, nodeValue,
    } = nextProps.treeData;
    this.nodeName = this.nodeName || nodeName;
    this.nodeValue = this.nodeValue || nodeValue;
    if (nextProps.focusKey === nextProps.treeData.key) {
      // this.editNameInputRef.current.focus();
    }
  }

  setAttr = ({ key, value }) => {
    this.setState({
      [key]: value,
    });
  }

  /* 设置操作按钮显示隐藏 */
  setActionVisibleTrue = (e) => {
    e && e.stopPropagation();
    this.setState({
      actionVisible: true,
    });
  }

  setActionVisibleFalse = (e) => {
    e && e.stopPropagation();
    this.setState({
      actionVisible: false,
    });
  }

  onNodeNameChange = (e) => {
    this.nodeName = e.target.value;
  }

  onNodeValueChange = (e) => {
    this.nodeValue = e.target.value;
  }

  editConfirm = () => {
    const { treeData, modifyNode } = this.props;
    if (!this.nodeName && !this.nodeValue) return openNotification('warning', null, this.props.lang.lang.pleaseInputKeyOrValue);
    const isValid = modifyNode(treeData.key, {
      ...treeData,
      nodeName: this.nodeName,
      nodeValue: this.nodeValue,
      isInEdit: false,
    });
    if (isValid) {
      this.nodeName = '';
      this.nodeValue = '';
      this.setActionVisibleFalse();
    }
  }

  editCancel = () => {
    const { treeData, getInToEditable } = this.props;
    getInToEditable(treeData.key, {
      ...treeData,
      isInEdit: false,
    });
    this.setActionVisibleFalse();
  }

  getInToEditable = () => {
    const { treeData, getInToEditable } = this.props;
    this.props.setParent('focusKey', treeData.key);
    getInToEditable(treeData.key, {
      ...treeData,
      isInEdit: true,
    });
  }

  addSisterNode = () => {
    const { treeData, addSisterNode } = this.props;
    addSisterNode(treeData.key);
  }

  addSubNode = () => {
    const { treeData, addSubNode, addExpandedKey } = this.props;
    addSubNode(treeData.key);
    addExpandedKey(treeData.key);
  }

  removeNode = () => {
    const { treeData, removeNode } = this.props;
    removeNode(treeData.key);
  }


  render() {
    const { treeData, focusKey } = this.props;
    const { lang } = this.props.lang;
    const editValueInputVisible = !(treeData.nodeValue instanceof Array);
    const editNameInputVisible = (!treeData.nodeName && !treeData.nodeValue) || treeData.nodeName || (treeData.nodeValue && typeCheck(treeData.nodeValue, 'array'));
    const actionAddNodeVisible = (treeData.nodeValue || treeData.nodeName) && (!treeData.nodeValue || treeData.nodeValue instanceof Array);

    return (
      <Row
        key={treeData.key}
        onMouseEnter={this.setActionVisibleTrue}
        onMouseLeave={this.setActionVisibleFalse}
      >
        {
          treeData.isInEdit &&
            (
              <React.Fragment>
                <span span={8}>
                  <Input
                    ref={this.editNameInputRef}
                    className="normal-text"
                    disabled={!treeData.nameEditable}
                    size="small"
                    onChange={this.onNodeNameChange}
                    defaultValue={treeData.nodeName}
                  />
                </span>
                ：
                {
                  (editValueInputVisible) &&
                  (<span span={8}>
                    <Input
                      className="normal-text"
                      size="small"
                      disabled={!treeData.valueEditable}
                      onChange={this.onNodeValueChange}
                      defaultValue={treeData.nodeValue}
                    />
                   </span>)
                }
                <span span={2}>
                  <span className="editable-tree-edit-confirm successColor">
                    <Tooltip title={lang.confirm}>
                      <CheckOutlined onClick={this.editConfirm} />
                    </Tooltip>
                  </span>
                  <span className="editable-tree-edit-cancel warningColor">
                    <Tooltip title={lang.cancel}>
                      <CloseOutlined onClick={this.editCancel} />
                    </Tooltip>
                  </span>
                </span>
              </React.Fragment>
            )
        }
        {
          !treeData.isInEdit &&
            (<React.Fragment>
              {
                (editNameInputVisible) &&
                (<span span={8}>
                  {/* <Input
                    size="small"
                    className="normal-text"
                    disabled={!treeData.nameEditable}
                    onFocus={treeData.nameEditable ? this.getInToEditable : undefined}
                    defaultValue={treeData.nodeName}
                  /> */}
                  <span
                    onClick={treeData.nameEditable ? this.getInToEditable : undefined}
                    className="editable-tree-label normal-text"
                    title={(treeData.nodeName || '').length > 50 ? treeData.nodeName : ''}
                  >{longNameFormatterNoTail(treeData.nodeName || '')}
                  </span>
                 </span>)
              }
              {editNameInputVisible && <span>：</span>}
              {
                editValueInputVisible &&
                  <span span={8}>
                    {/* <Input
                      className="normal-text"
                      disabled={!treeData.valueEditable}
                      onFocus={treeData.valueEditable ? this.getInToEditable : undefined}
                      size="small"
                      defaultValue={treeData.nodeValue}
                    /> */}
                    <span
                      onClick={treeData.valueEditable ? this.getInToEditable : undefined}
                      className="editable-tree-label normal-text"
                      title={(treeData.nodeValue || '').length > 50 ? treeData.nodeValue : ''}
                    >{longNameFormatterNoTail(treeData.nodeValue || '')}
                    </span>

                  </span>
              }
             </React.Fragment>)
        }
        <span
          span={5}
        >
          {
          this.state.actionVisible ?
            <span className="editable-tree-node-action">
              {
                actionAddNodeVisible &&
                (<Tooltip title={lang.addSisterNode}> <i className="iconfont icon-sisternode" onClick={this.addSisterNode} /></Tooltip>)
              }
              {
                actionAddNodeVisible &&
                (<Tooltip title={lang.addSubNode}><i className="iconfont icon-subnode" onClick={this.addSubNode} /></Tooltip>)
              }
              { treeData.nodeDeletable && <Tooltip title={lang.deleteNode}> <i className="iconfont icon-delete" onClick={this.removeNode} /> </Tooltip>}
            </span>
          :
            <span className="editable-tree-node-action" />
          }
        </span>
      </Row>);
  }
}