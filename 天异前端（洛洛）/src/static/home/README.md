# src/static/home

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承载首页及其联动链路当前正式消费的运行时图片资源。

## 蓝图定位

1. 本目录是 [src/static/README.md](/H:/工作/天异/uniapp+vue新架构/src/static/README.md) 下的首页运行时静态资源子树。
2. 本目录只承接已经正式采用并完成归一化命名的首页运行时图片资源。

## 目录职责

1. 存放首页 `banner / featured / market` 三类正式运行时图片。
2. 作为首页、市场、个人中心等联动消费链路的正式静态资源来源。
3. 通过 [RESOURCE-SOURCE-NOTICE.md](/H:/工作/天异/uniapp+vue新架构/src/static/home/RESOURCE-SOURCE-NOTICE.md) 登记当前来源层，不把来源说明散落到流程目录。

## 当前结构

1. `banner/`
2. `featured/`
3. `market/`
4. `RESOURCE-SOURCE-NOTICE.md`

## 当前使用规则

1. 本目录只承接已经正式采用的运行时图片，不承接候选原图。
2. 候选原图仍保留在 [新藏品/README.md](/H:/工作/天异/uniapp+vue新架构/新藏品/README.md)，不得从该目录直接穿透读取。
3. 结构化 mock 数据可以引用本目录资源，但本目录不承接 mock 数据文件。

## 不应放入的内容

1. 仅供筛选的原始候选素材。
2. 与首页链路无关的静态资源。
3. 审查、计划、台账或历史档案。
