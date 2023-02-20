import "./style.css"
import { SettingOutlined } from "@ant-design/icons"
import { Button, Checkbox, Switch, Table, message } from "antd"
import { useStorage } from "@plasmohq/storage/hook"

const IndexPopup = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [dataSource, setDataSource] = useStorage("url-proxy-list", [])
  // 进行代理
  const onEnableChange = (record, e) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => item.key === record.key)
    if (index >= 0) {
      newData[index] = { ...record, proxy: e.target.checked }
    }
    setDataSource(newData)
    chrome.runtime.sendMessage("proxy")
  }
  const onAllChange = (checked) => {
    const newData = [...dataSource]
    if (checked) {
      newData.forEach((item) => (item.proxy = true))
      setDataSource(newData)
      messageApi.open({
        type: "success",
        content: "代理已全部开启"
      })
      chrome.runtime.sendMessage("proxy")
    } else {
      newData.forEach((item) => (item.proxy = false))
      setDataSource(newData)
      messageApi.open({
        type: "success",
        content: "代理已全部关闭"
      })
      chrome.runtime.sendMessage("proxy")
    }
  }
  const columns = [
    {
      title: "启用",
      dataIndex: "enable",
      width: 70,
      align: "center" as const,
      render: (_, record) => (
        <Checkbox
          defaultChecked={record.proxy}
          checked={record.proxy}
          onChange={(e) => onEnableChange(record, e)}
        />
      )
    },
    {
      title: "媒体名称",
      dataIndex: "origin",
      width: 200
    }
  ]
  return (
    <>
      {contextHolder}
      <div className="container">
        <div className="subtitle">本地文件代理：</div>
        <div className="action">
          <Button
            type="link"
            href="options.html"
            style={{ padding: 0, marginRight: 12 }}
            target="_blank">
            <SettingOutlined />
            添加规则
          </Button>
          <Switch
            checkedChildren="开启全部代理"
            unCheckedChildren="关闭全部代理"
            onClick={onAllChange}
          />
        </div>
        <Table dataSource={dataSource} columns={columns} />
      </div>
    </>
  )
}

export default IndexPopup
