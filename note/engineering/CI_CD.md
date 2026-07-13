# CI/CD 基础

> 通过自动化手段，将代码从提交到部署的整个过程串联起来，实现高频、可靠、可重复的软件交付。

## 什么是 CI/CD

**CI/CD** 是一组 DevOps 实践的统称，由 **Continuous Integration**（持续集成）和 **Continuous Delivery / Deployment**（持续交付 / 持续部署）两部分组成。它定义了一条从代码提交到生产环境发布的自动化流水线（Pipeline）。

### Continuous Integration（持续集成，CI）

开发者频繁地将代码合并到主干分支（通常每天多次），每次合并都自动触发**构建**和**测试**。CI 的核心目标是尽早发现集成问题，避免分支长期分叉后合并冲突爆炸。

典型流程：

1. 开发者向 `main` 提交 Pull Request
2. CI 服务器自动拉取代码、安装依赖、执行 lint、构建产物、运行单元测试
3. 任一环节失败则阻断合并，全绿后才允许合入

### Continuous Delivery（持续交付）

在 CI 的基础上，**自动**将通过测试的代码打包并部署到**类生产环境**（Staging），但**部署到生产环境需要人工审批**。它保证代码随时处于"可发布"状态，发布动作本身只是一次按钮点击。

### Continuous Deployment（持续部署）

比持续交付更进一步：**通过测试的代码自动部署到生产环境，无需任何人工干预**。每一次合入主干的提交都会直接面对真实用户。

> **持续交付与持续部署的唯一区别**：部署到生产环境是否需要人工审批。两者都要求 CI 阶段全部自动化。

### 三者关系

| 实践 | 自动化范围 | 生产部署 | 人工介入 |
| ---- | ---------- | -------- | -------- |
| **持续集成（CI）** | 构建 + 测试 | ❌ | 合并代码、发布均需人工 |
| **持续交付（CD）** | 构建 + 测试 + 发布到 Staging | 需人工触发 | 仅生产发布需人工审批 |
| **持续部署（CD）** | 构建 + 测试 + 全环境部署 | 自动 | 全程无人工 |

CI 是 CD 的前提：没有可靠的自动化测试，持续交付 / 部署就无从谈起。

## 为什么要用 CI/CD

### 传统手动流程的问题

- **人工操作易错**：手动构建、传包、重启服务，任何一步遗漏都可能引发线上事故
- **反馈周期长**：问题往往在发布当晚才暴露，定位成本高
- **发布频率低**：每次发布如临大敌，积压变更越多风险越大
- **环境不一致**：开发机能跑、线上跑不起来，典型的"在我机器上是好的"

### CI/CD 的价值

| 价值 | 说明 |
| ---- | ---- |
| **自动化降低人为失误** | 构建、测试、部署全部由脚本完成，消除手工操作的不确定性 |
| **快速反馈** | 提交后几分钟内得到测试结果，问题在"刚写完"时被捕获 |
| **高频小步发布** | 每次发布只包含少量变更，出问题易于回滚，风险可控 |
| **环境一致性** | 同一份流水线配置驱动所有环境，消除"环境差异"导致的诡异问题 |
| **可追溯** | 每次部署对应明确的 commit、构建号、产物，便于审计和回查 |
| **解放精力** | 工程师聚焦业务逻辑，而非重复的发布运维操作 |

## CI/CD Pipeline 的核心阶段

一条完整的流水线通常包含以下阶段，前一个阶段失败则后续阶段不会执行：

```
提交代码 → 构建 → 测试 → 打包 → 部署 Staging → 验收 → 部署 Production
```

| 阶段 | 职责 | 典型工具 / 命令 |
| ---- | ---- | --------------- |
| **Source（源码触发）** | 监听 push / PR / tag 事件，拉取代码 | Git webhook |
| **Build（构建）** | 安装依赖、编译、生成产物 | `npm ci && npm run build` |
| **Test（测试）** | 运行单元测试、集成测试、lint | `npm test`、`eslint` |
| **Package（打包）** | 将产物封装为 Docker 镜像或压缩包 | `docker build` |
| **Deploy Staging** | 部署到预发布环境 | `docker push` + 拉取 |
| **Approval（审批）** | 持续交付场景下的人工把关 | 手动点击 |
| **Deploy Production** | 部署到生产环境 | 滚动发布、蓝绿部署 |

前端项目通常在 Build 阶段额外产出静态资源，并通过 CDN 或对象存储（如 Vercel、AWS S3 + CloudFront）完成"部署"。

## 主流工具对比

| 工具 | 定位 | 配置形式 | 优势 | 适用场景 |
| ---- | ---- | -------- | ---- | -------- |
| **GitHub Actions** | GitHub 原生 CI | `.github/workflows/*.yml` | 与 GitHub 深度集成，Marketplace 插件丰富，免费额度友好 | 托管在 GitHub 的开源 / 私有项目 |
| **GitLab CI/CD** | GitLab 原生 CI | `.gitlab-ci.yml` | 内置于 GitLab，支持自建 Runner，一体化的 DevOps 平台 | 使用 GitLab 的团队 |
| **Jenkins** | 老牌自托管 CI | Groovy 脚本（Jenkinsfile） | 插件生态庞大，高度可定制，完全自主可控 | 对数据安全要求高、需私有化部署的企业 |
| **CircleCI** | SaaS 型 CI | `.circleci/config.yml` | 并行能力强，构建速度快 | 注重构建性能的中小团队 |
| **Drone** | 容器原生 CI | `.drone.yml` | 基于 Docker，轻量、配置简洁 | 容器化程度高的项目 |

> **选型建议**：仓库托管在哪里，优先使用其原生 CI（GitHub 用 Actions，GitLab 用 GitLab CI）。跨平台需求或私有化部署再考虑 Jenkins。

## 极简示例：GitHub Actions 前端流水线

下面为一个 React + TypeScript 项目编写的最小可运行流水线，覆盖了**构建 + 测试 + 部署**三个阶段。

### 工作流文件位置

```
.github/
└── workflows/
    └── ci.yml        # 工作流定义文件
```

### 完整配置

```yaml
# .github/workflows/ci.yml
name: CI

# 触发条件：main 分支的 push 和 PR
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest      # 运行在 Ubuntu 虚拟机上

    steps:
      # 1. 拉取仓库代码（必须，否则后续步骤无文件可用）
      - name: Checkout
        uses: actions/checkout@v4

      # 2. 安装 Node.js 并启用 pnpm 缓存，加速后续构建
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 3. 安装 pnpm（setup-node 不内置，需单独安装）
      - name: Install pnpm
        run: npm install -g pnpm

      # 4. 安装依赖（CI 环境推荐用 pnpm ci 的等价命令，锁定版本）
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # 5. 类型检查 + 代码规范检查
      - name: Lint and type-check
        run: |
          pnpm run lint
          pnpm run type-check

      # 6. 运行单元测试
      - name: Run tests
        run: pnpm run test

      # 7. 构建生产产物
      - name: Build
        run: pnpm run build

      # 8. 上传构建产物为 artifact，供下游 job 或人工下载
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: ./dist
          retention-days: 7
```

### 关键配置解释

- **`on:`** 定义触发器。`push` 表示推送时触发，`pull_request` 表示提交 PR 时触发，二者结合可保证主干代码始终被验证
- **`jobs:`** 一组并行或串行的任务单元。同一 job 内的 `steps` 串行执行，多个 job 默认并行
- **`uses:`** 引用社区或官方封装好的 Action，避免重复造轮子。`@v4` 为大版本号，自动获取该版本的最新补丁
- **`actions/setup-node` 的 `cache` 参数**：自动缓存 pnpm 全局存储，二次构建可跳过大量依赖下载，显著缩短耗时
- **`pnpm install --frozen-lockfile`**：严格按 `pnpm-lock.yaml` 安装，禁止修改锁文件，保证 CI 与本地依赖完全一致

> Action 版本会随时间迭代（`actions/checkout`、`actions/setup-node` 等已出现更高的大版本）。使用前应查阅官方仓库的 `Releases` 页面确认当前稳定版本。

### 分阶段部署示例

将测试与部署拆分为两个 job，部署依赖测试通过：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: npm install -g pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test

  deploy:
    needs: test                    # 必须等 test job 通过才执行
    runs-on: ubuntu-latest
    # 仅 main 分支的 push 才部署，PR 不部署
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: npm install -g pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build

      # 部署到 GitHub Pages（静态站点场景）
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

`needs: test` 建立了 job 间的依赖关系；`if` 条件确保只有主干合并才会触发部署，避免 PR 阶段误发布。

## 常见部署策略

CD 阶段如何把新版本"安全地"推到线上，是另一个关键课题：

| 策略 | 原理 | 优点 | 缺点 |
| ---- | ---- | ---- | ---- |
| **滚动发布（Rolling）** | 逐台替换旧实例，直到全部更新 | 资源占用平稳 | 滚动期间新旧版本并存，需保证接口兼容 |
| **蓝绿部署（Blue-Green）** | 维护两套完整环境，流量整体切换 | 切换瞬间完成，回滚只需切回 | 需要双倍服务器资源 |
| **金丝雀发布（Canary）** | 先让小比例流量打到新版本，观察无异常后逐步扩大 | 风险可控，问题影响范围小 | 配置复杂，需要流量路由能力 |
| **功能开关（Feature Flag）** | 代码已部署，通过开关控制功能是否对用户可见 | 解耦"部署"与"发布"，可随时关闭 | 需引入开关管理平台 |

> **部署（Deploy）与发布（Release）的分离**：现代实践中常将二者解耦——代码先静默部署到生产（但功能关闭），再由产品决定何时"点亮"。这是降低发布风险的核心思路。

## 最佳实践

### 1. 流水线要快

CI 反馈超过 10 分钟，开发者就会倾向于减少提交频率，违背 CI 初衷。优化手段：

- **缓存依赖**：利用 `cache` 参数或 `actions/cache`，避免每次全量下载 `node_modules`
- **并行执行**：lint、test、build 拆分为多个 job 并行跑
- **增量构建**：Monorepo 中用 Turborepo / Nx 的 `affected` 只构建变更涉及的包

### 2. 锁文件必须冻结

CI 中**禁止**使用 `npm install`（可能改变 `package-lock.json`），应使用 `npm ci` 或 `pnpm install --frozen-lockfile`，保证依赖版本严格一致。

### 3. 主干分支受保护

- 在代码托管平台上开启 **Branch Protection**，禁止直接 push 到 `main`
- 要求所有变更通过 PR，且 CI 必须全绿
- 至少一人 Code Review 后方可合并

### 4. 密钥通过 Secrets 注入

部署所需的 Token、API Key 等**严禁硬编码**进工作流文件，应通过仓库的 `Settings → Secrets` 注入，使用 `${{ secrets.XXX }}` 引用：

```yaml
- run: npx vercel deploy --token ${{ secrets.VERCEL_TOKEN }} --prod
```

### 5. 持续部署的前提是充分的自动化测试

没有高覆盖率的自动化测试就上持续部署，等同于把未经验证的代码直接推给用户。持续部署的成熟度应与测试覆盖度匹配。

## 适用场景

- **适用**：Web 应用、SaaS 服务、移动端应用、开源库的版本发布——几乎所有需要频繁迭代的项目都受益于 CI/CD
- **谨慎引入持续部署**：金融、医疗等强监管行业，或缺乏自动化测试的团队，应从持续交付（保留人工审批）起步，而非一步到位上持续部署

## 参考

- [What is CI/CD? - Red Hat](https://www.redhat.com/en/topics/devops/what-is-ci-cd)
- [Continuous integration vs. delivery vs. deployment - Atlassian](https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment)
- [What is CI/CD? - GitLab](https://about.gitlab.com/topics/ci-cd/)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Understanding GitHub Actions](https://docs.github.com/actions/learn-github-actions/understanding-github-actions)
