import { Button, Form, Input, Layout, Popconfirm, Space, Table } from "antd"
import React from "react"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "./style.css"

const { Header, Content, Footer } = Layout
interface DataType {
  key: Number
  origin: String
  replace: String
  proxy: Boolean
}
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  inputType: "text"
  record: DataType
  index: number
  children: React.ReactNode
}
const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = <Input />

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入信息!`
            }
          ]}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  )
}
const Options = () => {
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState(null)
  const [dataSource, setDataSource] = useStorage<DataType[]>(
    "url-proxy-list",
    []
  )
  const isEditing = (record: DataType) => record.key === editingKey
  const columns = [
    {
      title: "代理的js路径",
      dataIndex: "origin",
      editable: true
    },
    {
      title: "本地js文件路径",
      dataIndex: "replace",
      editable: true
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 200,
      render: (_, item) =>
        isEditing(item) ? (
          <Space size="middle">
            <Button type="link" onClick={() => save(item)}>
              保存
            </Button>
            <Button type="link" onClick={cancel}>
              取消
            </Button>
          </Space>
        ) : (
          <Space size="middle">
            <Button type="link" onClick={() => edit(item)}>
              编辑
            </Button>
            <Button type="link" onClick={() => deleteItem(item)}>
              删除
            </Button>
          </Space>
        )
    }
  ]
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })
  //   编辑
  const edit = (record: Partial<DataType>) => {
    form.setFieldsValue({ origin: "", replace: "", ...record })
    setEditingKey(record.key)
  }
  //   取消编辑
  const cancel = () => {
    setEditingKey("")
  }
  // 保存改动
  const save = async (data: DataType) => {
    try {
      const row = (await form.validateFields()) as DataType

      const newData = [...dataSource]
      const index = newData.findIndex((item) => data.key === item.key)
      if (index > -1) {
        const item = newData[index]
        newData.splice(index, 1, {
          ...item,
          ...row
        })
        setDataSource(newData)
        setEditingKey("")
      } else {
        newData.push(row)
        setDataSource(newData)
        setEditingKey("")
      }
    } catch (errInfo) {
      console.log("验证失败:", errInfo)
    }
  }
  //   添加规则
  const handleAdd = () => {
    const key = dataSource.length
    const newData = {
      key: key,
      origin: "",
      replace: "",
      proxy: false
    }
    form.setFieldsValue({ origin: "", replace: "" })
    setEditingKey(key)
    setDataSource([newData, ...dataSource])
  }
  // 删除全部规则
  const deleteAll = () => {
    setDataSource([])
  }
  //   删除
  const deleteItem = (data: DataType) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => data.key === item.key)
    newData.splice(index, 1)
    setDataSource(newData)
  }
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ position: "sticky", top: 0, zIndex: 1, width: "100%" }}>
        <div className="options-title">代理url设置</div>
      </Header>
      <Content className="options-layout">
        <div className="options-content">
          <div className="options-content-button">
            <Button
              type="primary"
              style={{ marginRight: "20px" }}
              onClick={handleAdd}>
              添加规则
            </Button>
            <Popconfirm
              title="确定删除全部规则?"
              onConfirm={deleteAll}
              okText="确认删除"
              cancelText="取消">
              <Button>删除全部规则</Button>
            </Popconfirm>
          </div>
          <Form form={form} component={false}>
            <Table
              dataSource={dataSource}
              columns={mergedColumns}
              components={{
                body: {
                  cell: EditableCell
                }
              }}
            />
            ;
          </Form>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©2023 Created by guorui
      </Footer>
    </Layout>
  )
}

export default Options
