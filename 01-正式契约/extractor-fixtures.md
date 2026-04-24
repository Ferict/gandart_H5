# Extractor Fixtures

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
