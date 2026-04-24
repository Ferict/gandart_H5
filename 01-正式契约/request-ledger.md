# Request Ledger

| operationId | fieldPath | location | sourceKind | confidence | evidence |
| --- | --- | --- | --- | --- | --- |
| collection.isCollect | types | body | call-arg | Level B | components/w-navbar/w-navbar.vue:140 isCollect<br>pages/market/marketGoodsList.vue:274 isCollect<br>pages/myCollection/components/collectionItem.vue:89 isCollect |
| collection.isCollect | id | body | call-arg | Level B | components/w-navbar/w-navbar.vue:140 isCollect<br>pages/market/marketGoodsList.vue:274 isCollect<br>pages/myCollection/components/collectionItem.vue:89 isCollect |
| banner.getBannerList | type | body | call-arg | Level B | components/w-swiper/w-swiper.vue:29 getBannerList |
| market.changeMarketGoods | id | body | call-arg | Level B | pages/blindBox/components/blindBox-detail-button.vue:36 changeMarketGoods<br>pages/consignments/componens/my-consignments-item.vue:53 changeMarketGoods<br>pages/myCollection/components/collection-detail-button.vue:54 changeMarketGoods |
| compound.selectCollection | collection_ids | body | call-arg | Level B | pages/compound/components/changeMaterials.vue:105 selectCollection |
| compound.material | play_id | body | call-arg | Level B | pages/compound/components/methods.vue:110 material |
| compound.material | classify | body | call-arg | Level B | pages/compound/components/methods.vue:110 material |
| compound.themeinfo | thm | body | call-arg | Level B | pages/compound/compound.vue:46 themeinfo |
| compound.recordList | page | body | call-arg | Level B | pages/compound/record.vue:73 recordList |
| compound.recordInfo | record_id | body | call-arg | Level B | pages/compound/result.vue:124 recordInfo |
| collection.sellProduct | user_collection_id | body | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | price | body | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | pay_password | body | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | income_type | body | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.myConsignment | status | body | call-arg | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | goods_type | body | call-arg | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | page | body | call-arg | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | keyword | body | call-arg | Level B | pages/consignments/search.vue:118 myConsignment |
| integral.get_my_share_details | type | body | call-arg | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:249 get_my_share_details |
| integral.shareSub | images | body | call-arg | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:270 shareSub |
| market.ranking | types | body | call-arg | Level B | pages/leaderboard/leaderboard.vue:55 ranking |
| user.sendSms | mobile | body | call-arg | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:206 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:194 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:129 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:141 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| user.sendSms | event | body | call-arg | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:206 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:194 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:129 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:141 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| user.sendSms | verify_token | body | call-arg | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| lottery.lotteryStartApi | lotteryId | body | call-arg | Level B | pages/lottery/components/lotteryBox.vue:181 lotteryStartApi<br>pages/lottery/lottery.vue:205 lotteryStartApi |
| lottery.lotteryStartApi | number | body | call-arg | Level B | pages/lottery/components/lotteryBox.vue:181 lotteryStartApi<br>pages/lottery/lottery.vue:205 lotteryStartApi |
| lottery.lotteryInfoApi | id | body | call-arg | Level B | pages/lottery/lottery - 副本.vue:74 lotteryInfoApi<br>pages/lottery/lottery.vue:145 lotteryInfoApi |
| lottery.lotteryStatistics | lottery_id | body | call-arg | Level B | pages/lottery/lottery.vue:134 lotteryStatistics<br>pages/lottery/record.vue:82 lotteryStatistics |
| lottery.lotteryRecord | type | body | call-arg | Level B | pages/lottery/record.vue:92 lotteryRecord |
| lottery.lotteryRecord | lottery_id | body | call-arg | Level B | pages/lottery/record.vue:92 lotteryRecord |
| lottery.lotteryRecord | page | body | call-arg | Level B | pages/lottery/record.vue:92 lotteryRecord |
| collection.getSelfSeries | type | body | call-arg | Level B | pages/market/categoryManager.vue:83 getSelfSeries |
| collection.addSelfSeries | series_id | body | call-arg | Level B | pages/market/categoryManager.vue:93 addSelfSeries |
| collection.removeSelfSeries | series_id | body | call-arg | Level B | pages/market/categoryManager.vue:102 removeSelfSeries |
| order.bacthCreateOrder | key | body | call-arg | Level B | pages/market/components/batchConfirm.vue:112 bacthCreateOrder |
| order.bacthCreateOrder | goods_id | body | call-arg | Level B | pages/market/components/batchConfirm.vue:112 bacthCreateOrder |
| market.getMarketGoodsInfo | id | body | call-arg | Level B | pages/market/marketGoodsList.vue:371 getMarketGoodsInfo<br>pages/market/sellInfo.vue:102 getMarketGoodsInfo |
| market.getMarketGoodsInfo | type | body | call-arg | Level B | pages/market/marketGoodsList.vue:371 getMarketGoodsInfo<br>pages/market/sellInfo.vue:102 getMarketGoodsInfo |
| order.fastCreateOrder | goods_id | body | call-arg | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| order.fastCreateOrder | key | body | call-arg | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| order.fastCreateOrder | pay_way | body | call-arg | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| trad.sell | sell_data | body | call-arg | Level B | pages/market/sellBegBuy.vue:225 sell |
| trad.sell | pay_way | body | call-arg | Level B | pages/market/sellBegBuy.vue:225 sell |
| trad.sell | pay_password | body | call-arg | Level B | pages/market/sellBegBuy.vue:225 sell |
| user.cehckPayPassword | pay_password | body | call-arg | Level B | pages/my/actionPwd/getCode.vue:212 cehckPayPassword |
| address.address_detail | id | body | call-arg | Level B | pages/my/address/edit.vue:131 address_detail |
| address.add_edit_address | id | body | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | s_name | body | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | s_phone | body | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | isdef | body | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.address_delete | id | body | call-arg | Level B | pages/my/address/list.vue:132 address_delete |
| user.flowDoc | uc_id | body | call-arg | Level B | pages/my/flowDoc.vue:46 flowDoc |
| user.flowDoc | page | body | call-arg | Level B | pages/my/flowDoc.vue:46 flowDoc |
| user.updateUserInfo | avatar | body | call-arg | Level B | pages/my/info.vue:227 updateUserInfo |
| collection.likeCollection | keyword | body | call-arg | Level B | pages/myCollection/components/collectionSearch.vue:111 likeCollection |
| collection.user_collection_Detail | collection_id | body | call-arg | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| collection.user_collection_Detail | types | body | call-arg | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| collection.user_collection_Detail | page | body | call-arg | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| shop.shop.getECardPass | pay_password | body | call-arg | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| shop.shop.getECardPass | sn | body | call-arg | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| shop.shop.getECardPass | order_id | body | call-arg | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| order.changeOrderStatus | order_type | body | call-arg | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.changeOrderStatus | status | body | call-arg | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.changeOrderStatus | order_sn | body | call-arg | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.createBatchPayOrder | order_ids | body | call-arg | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.createBatchPayOrder | batch_order_id | body | call-arg | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.createBatchPayOrder | pay_way | body | call-arg | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.cancelBatchOrder | batch_order_id | body | call-arg | Level B | pages/order/list.vue:183 cancelBatchOrder |
| order.createOrder | goods_type | body | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | goods_id | body | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | num | body | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | pay_type | body | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | pay_way | body | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | batch_id | body | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | price | body | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createMarketOrder | market_goods_id | body | call-arg | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| order.createMarketOrder | pay_type | body | call-arg | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| order.createMarketOrder | pay_way | body | call-arg | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| common.getMasterRank | page | body | call-arg | Level B | pages/rank/masterRank.vue:63 getMasterRank |
| user.commison_rank | type | body | call-arg | Level B | pages/rebate/leaderboard.vue:58 commison_rank |
| shop.shop.getGoodsInfo | goods_id | body | call-arg | Level B | pages/shop/detail/goods.vue:57 getGoodsInfo |
| shop.shop.exchange | goods_id | body | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | number | body | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | address_id | body | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | pay_password | body | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| collection.getSeriesList | type | body | call-arg | Level B | store/modules/goods.js:32 getSeriesList<br>store/modules/goods.js:35 getSeriesList |
| order.doPay | pay_type | body | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | order_number | body | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | order_type | body | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | pay_way | body | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | pay_scene | body | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | returnurl | body | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | pay_password | body | call-arg | Level B | utils/payUtil.js:49 doPay |
| box.getBoxDetails | origin | query | wrapper-param | Level A | api/box/index.js:10 getBoxDetails |
| box.getBoxDetails | crystal_goods_id | query | wrapper-param | Level A | api/box/index.js:10 getBoxDetails |
| box.openBox | openid | body | wrapper-param | Level A | api/box/index.js:22 openBox |
| box.openBoxs | openid | body | wrapper-param | Level A | api/box/index.js:32 openBoxs |
| collection.getCollectionDetails | id | path | wrapper-param | Level A | api/collection/index.js:29 getCollectionDetails |
| collection.getCollectionDetails | batch_id | query | wrapper-param | Level A | api/collection/index.js:29 getCollectionDetails |
| collection.getUserCollectionDetails | id | path | wrapper-param | Level A | api/collection/index.js:70 getUserCollectionDetails |
| collection.getSellConfig | price | body | wrapper-param | Level A | api/collection/index.js:79 getSellConfig |
| collection.getSellConfig | user_collection_id | body | wrapper-param | Level A | api/collection/index.js:79 getSellConfig |
| collection.getCompoundDetails | box_id | body | wrapper-param | Level A | api/collection/index.js:137 getCompoundDetails |
| collection.buildCollection | * | body | pass-through | Level C | api/collection/index.js:149 buildCollection |
| collection.getCompoundRecord | * | body | pass-through | Level C | api/collection/index.js:158 getCompoundRecord |
| collection.getMoveRecord | user_collection_id | body | wrapper-param | Level A | api/collection/index.js:178 getMoveRecord |
| collection.getSeriesGoodsList | series_id | body | wrapper-param | Level A | api/collection/index.js:251 getSeriesGoodsList |
| common.getUserRank | user_id | body | wrapper-param | Level A | api/common/index.js:16 getUserRank |
| common.setClickNum | id | body | wrapper-param | Level A | api/common/index.js:36 setClickNum |
| common.getConfig | key | body | wrapper-param | Level A | api/common/index.js:50 getConfig |
| common.getFileInfo | url | body | wrapper-param | Level A | api/common/index.js:66 getFileInfo |
| draw.getDraw | id | body | wrapper-param | Level A | api/draw/index.js:5 getDraw |
| draw.draw | id | body | wrapper-param | Level A | api/draw/index.js:15 draw |
| draw.drawLog | id | body | wrapper-param | Level A | api/draw/index.js:26 drawLog |
| draw.drawRecord | id | body | wrapper-param | Level A | api/draw/index.js:37 drawRecord |
| market.getMarketDetails | id | path | wrapper-param | Level A | api/market/index.js:72 getMarketDetails |
| news.getNoticeList | type | body | wrapper-param | Level A | api/news/index.js:21 getNoticeList |
| news.getDetails | id | body | wrapper-param | Level A | api/news/index.js:33 getDetails |
| notice.readMessage | id | body | wrapper-param | Level A | api/notice/index.js:57 readMessage |
| notice.getNewsDetails | news_id | body | wrapper-param | Level A | api/notice/index.js:103 getNewsDetails |
| notice.getRumorDetails | id | body | wrapper-param | Level A | api/notice/index.js:151 getRumorDetails |
| order.getOrderDetails | id | path | wrapper-param | Level A | api/order/index.js:48 getOrderDetails |
| order.getRegiftOrderDetails | id | path | wrapper-param | Level A | api/order/index.js:62 getRegiftOrderDetails |
| order.getMarketOrderDetails | order_id | body | wrapper-param | Level A | api/order/index.js:72 getMarketOrderDetails |
| order.order.getOrderDetails | id | path | wrapper-param | Level A | api/order/order.js:41 getOrderDetails |
| trad.getTradInfo | collection_id | body | wrapper-param | Level A | api/trad/index.js:5 getTradInfo |
| trad.getMyBegInfo | order_id | body | wrapper-param | Level A | api/trad/index.js:26 getMyBegInfo |
| trad.cancelBegBuy | order_id | body | wrapper-param | Level A | api/trad/index.js:54 cancelBegBuy |
| user.delAccount | payPassword | body | wrapper-param | Level A | api/user/index.js:204 delAccount |
