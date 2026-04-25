# Extractor Fixtures

> 文档类型：后端契约抽取验证用例
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件记录契约抽取器的判定用例和预期结果，用于维护抽取质量。

| Fixture | Expected result |
| --- | --- |
| `@click="login"` in template | must not create a LiveCall |
| `createOrder() {}` local method definition | must not create a LiveCall |
| API name in comments | must not create a LiveCall |
| API name in string literals | must not create a LiveCall |
| named import alias | must resolve to exported wrapper |
| namespace import call | must resolve to exported wrapper or MissingExport |
| `changeOrderStatus` branch path | must include normal, market, give-order variants |
| `getOrderDetails` branch path | must include normal and market variants |
