import { Storage } from "@plasmohq/storage"

const array = []
export {}

interface DataType {
  key: Number
  origin: String
  replace: String
  proxy: Boolean
}
const storage = new Storage()
// 一开始设置默认值
chrome.runtime.onMessage.addListener((request) => {
  if (request === "proxy") {
    changeRule()
  }
})
// 处理数据
async function handleData() {
  const list = await storage.get<Array<DataType>>("url-proxy-list") // 获得最新的代理数组
  return list.reduce((total, item, index) => {
    if (item.proxy) {
      total.push({
        id: index + 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { regexSubstitution: item.replace }
        },
        condition: {
          regexFilter: item.origin,
          resourceTypes: [
            "main_frame",
            "stylesheet",
            "script",
            "image",
            "font",
            "media"
          ]
        }
      })
    }
    return total
  }, [])
}
// 获取代理列表
function getDynamicRules() {
  return new Promise((resolve, reject) => {
    chrome.declarativeNetRequest.getDynamicRules(function (res) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
      resolve(res)
    })
  })
}
// 更新代理列表
function updateDynamicRules(options) {
  return new Promise((resolve, reject) => {
    chrome.declarativeNetRequest.updateDynamicRules(options, function (res) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
      resolve(res)
    })
  })
}
// 先清空所有在更新新的
async function changeRule() {
  const oldRules = await getDynamicRules()
  // @ts-ignore
  const oldRulesId = oldRules.map((item) => item.id)
  if (oldRulesId.length) {
    await updateDynamicRules({ removeRuleIds: oldRulesId })
  }
  const addRules = await handleData()
  if (addRules.length) {
    await updateDynamicRules({ addRules })
  }
}
