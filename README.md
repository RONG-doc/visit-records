# 就诊记录（Visit Records）

《医院信息系统》实验三项目：门诊**就诊记录**列表页与详情页。纯前端、零依赖，
`npm run dev` 用 Node 内置模块起一个静态服务器即可运行。

## 运行

```bash
npm run dev          # 默认 http://127.0.0.1:5173
PORT=8080 npm run dev  # 换端口（Windows PowerShell: $env:PORT=8080; npm run dev）
```

> 不需要 `npm install`：项目没有任何第三方依赖，这也是本实验刻意保留的约束
> ——把注意力放在工作流和 Git 上，而不是环境上。

## 目录

```text
visit-records/
├─ index.html            列表页
├─ visit.html            详情页（?id=V001）
├─ css/style.css         全站样式
├─ js/list.js            列表渲染 + 筛选
├─ js/detail.js          详情渲染
├─ data/visits.json      模拟数据（虚构患者，不含真实隐私）
├─ docs/design.md        计划阶段产出的方案
└─ tools/dev-server.js   零依赖静态服务器
```

## 功能

- 列表：就诊号、患者姓名、科室、诊断、就诊时间、状态
- 点击「查看」进入详情页：患者基本信息、就诊信息、处方摘要
- 按科室筛选（`feature/visit-search` 分支合并进来的功能）

## 数据说明

`data/visits.json` 里的患者、身份证号等全部为虚构数据，仅用于教学演示，
不得替换为真实患者信息。

## 提交规范

采用 Conventional Commits：

```text
<type>: <中文简述>
```

| type | 用途 |
| --- | --- |
| feat | 新功能 |
| fix | 修复缺陷 |
| docs | 文档 |
| chore | 构建、脚手架、杂务 |
| refactor | 重构（不改行为） |
| test | 测试 |

示例：`feat: 就诊记录列表页`、`fix: 详情页时间格式错误`。
