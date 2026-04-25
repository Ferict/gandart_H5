# Request Ledger

> 文档类型：后端契约请求字段台账
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件记录旧前端请求字段来源和证据置信度，用于接驳时确认请求 DTO 候选。

| operationId | fieldPath | location | sourceKind | evidenceKind | confidence | evidence |
| --- | --- | --- | --- | --- | --- | --- |
| collection.isCollect | types | body | state | call-arg | Level B | components/w-navbar/w-navbar.vue:140 isCollect<br>pages/market/marketGoodsList.vue:274 isCollect<br>pages/myCollection/components/collectionItem.vue:89 isCollect |
| collection.isCollect | id | body | state | call-arg | Level B | components/w-navbar/w-navbar.vue:140 isCollect<br>pages/market/marketGoodsList.vue:274 isCollect<br>pages/myCollection/components/collectionItem.vue:89 isCollect |
| banner.getBannerList | type | body | state | call-arg | Level B | components/w-swiper/w-swiper.vue:29 getBannerList |
| market.changeMarketGoods | id | body | state | call-arg | Level B | pages/blindBox/components/blindBox-detail-button.vue:36 changeMarketGoods<br>pages/consignments/componens/my-consignments-item.vue:53 changeMarketGoods<br>pages/myCollection/components/collection-detail-button.vue:54 changeMarketGoods |
| compound.selectCollection | collection_ids | body | state | call-arg | Level B | pages/compound/components/changeMaterials.vue:105 selectCollection |
| compound.material | play_id | body | state | call-arg | Level B | pages/compound/components/methods.vue:110 material |
| compound.material | classify | body | state | call-arg | Level B | pages/compound/components/methods.vue:110 material |
| compound.themeinfo | thm | body | state | call-arg | Level B | pages/compound/compound.vue:46 themeinfo |
| compound.recordList | page | body | state | call-arg | Level B | pages/compound/record.vue:73 recordList |
| compound.recordInfo | record_id | body | state | call-arg | Level B | pages/compound/result.vue:124 recordInfo |
| collection.sellProduct | user_collection_id | body | state | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | price | body | state | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | pay_password | body | state | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | income_type | body | computed | call-arg | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.myConsignment | status | body | state | call-arg | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | goods_type | body | state | call-arg | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | page | body | state | call-arg | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | keyword | body | state | call-arg | Level B | pages/consignments/search.vue:118 myConsignment |
| integral.get_my_share_details | type | body | state | call-arg | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:249 get_my_share_details |
| integral.shareSub | images | body | computed | call-arg | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:270 shareSub |
| market.ranking | types | body | state | call-arg | Level B | pages/leaderboard/leaderboard.vue:55 ranking |
| user.sendSms | mobile | body | state | call-arg | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:206 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:194 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:129 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:141 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| user.sendSms | event | body | literal | call-arg | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:206 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:194 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:129 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:141 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| user.sendSms | verify_token | body | state | call-arg | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| lottery.lotteryStartApi | lotteryId | body | state | call-arg | Level B | pages/lottery/components/lotteryBox.vue:181 lotteryStartApi<br>pages/lottery/lottery.vue:205 lotteryStartApi |
| lottery.lotteryStartApi | number | body | state | call-arg | Level B | pages/lottery/components/lotteryBox.vue:181 lotteryStartApi<br>pages/lottery/lottery.vue:205 lotteryStartApi |
| lottery.lotteryInfoApi | id | body | state | call-arg | Level B | pages/lottery/lottery - 副本.vue:74 lotteryInfoApi<br>pages/lottery/lottery.vue:145 lotteryInfoApi |
| lottery.lotteryStatistics | lottery_id | body | state | call-arg | Level B | pages/lottery/lottery.vue:134 lotteryStatistics<br>pages/lottery/record.vue:82 lotteryStatistics |
| lottery.lotteryRecord | type | body | literal | call-arg | Level B | pages/lottery/record.vue:92 lotteryRecord |
| lottery.lotteryRecord | lottery_id | body | state | call-arg | Level B | pages/lottery/record.vue:92 lotteryRecord |
| lottery.lotteryRecord | page | body | state | call-arg | Level B | pages/lottery/record.vue:92 lotteryRecord |
| collection.getSelfSeries | type | body | state | call-arg | Level B | pages/market/categoryManager.vue:83 getSelfSeries |
| collection.addSelfSeries | series_id | body | state | call-arg | Level B | pages/market/categoryManager.vue:93 addSelfSeries |
| collection.removeSelfSeries | series_id | body | state | call-arg | Level B | pages/market/categoryManager.vue:102 removeSelfSeries |
| order.bacthCreateOrder | goods_id | body | state | call-arg | Level B | pages/market/components/batchConfirm.vue:112 bacthCreateOrder |
| order.bacthCreateOrder | key | body | state | call-arg | Level B | pages/market/components/batchConfirm.vue:112 bacthCreateOrder |
| market.getMarketGoodsInfo | id | body | state | call-arg | Level B | pages/market/marketGoodsList.vue:371 getMarketGoodsInfo<br>pages/market/sellInfo.vue:102 getMarketGoodsInfo |
| market.getMarketGoodsInfo | type | body | state | call-arg | Level B | pages/market/marketGoodsList.vue:371 getMarketGoodsInfo<br>pages/market/sellInfo.vue:102 getMarketGoodsInfo |
| order.fastCreateOrder | goods_id | body | state | call-arg | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| order.fastCreateOrder | key | body | state | call-arg | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| order.fastCreateOrder | pay_way | body | unknown | call-arg | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| trad.sell | pay_way | body | route | call-arg | Level B | pages/market/sellBegBuy.vue:225 sell |
| trad.sell | sell_data | body | state | call-arg | Level B | pages/market/sellBegBuy.vue:225 sell |
| trad.sell | pay_password | body | state | call-arg | Level B | pages/market/sellBegBuy.vue:225 sell |
| user.cehckPayPassword | pay_password | body | state | call-arg | Level B | pages/my/actionPwd/getCode.vue:212 cehckPayPassword |
| address.address_detail | id | body | state | call-arg | Level B | pages/my/address/edit.vue:131 address_detail |
| address.add_edit_address | id | body | state | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | s_name | body | state | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | s_phone | body | state | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | isdef | body | state | call-arg | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.address_delete | id | body | state | call-arg | Level B | pages/my/address/list.vue:132 address_delete |
| user.flowDoc | uc_id | body | state | call-arg | Level B | pages/my/flowDoc.vue:46 flowDoc |
| user.flowDoc | page | body | state | call-arg | Level B | pages/my/flowDoc.vue:46 flowDoc |
| user.updateUserInfo | avatar | body | state | call-arg | Level B | pages/my/info.vue:227 updateUserInfo |
| collection.likeCollection | keyword | body | state | call-arg | Level B | pages/myCollection/components/collectionSearch.vue:111 likeCollection |
| collection.user_collection_Detail | collection_id | body | state | call-arg | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| collection.user_collection_Detail | types | body | state | call-arg | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| collection.user_collection_Detail | page | body | state | call-arg | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| shop.shop.getECardPass | pay_password | body | state | call-arg | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| shop.shop.getECardPass | sn | body | state | call-arg | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| shop.shop.getECardPass | order_id | body | state | call-arg | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| order.changeOrderStatus | order_type | body | state | call-arg | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.changeOrderStatus | status | body | literal | call-arg | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.changeOrderStatus | order_sn | body | state | call-arg | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.createBatchPayOrder | order_ids | body | computed | call-arg | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.createBatchPayOrder | batch_order_id | body | state | call-arg | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.createBatchPayOrder | pay_way | body | state | call-arg | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.cancelBatchOrder | batch_order_id | body | state | call-arg | Level B | pages/order/list.vue:183 cancelBatchOrder |
| order.createOrder | goods_type | body | state | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | goods_id | body | state | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | num | body | state | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | pay_type | body | state | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | pay_way | body | state | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | batch_id | body | computed | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | price | body | literal | call-arg | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createMarketOrder | market_goods_id | body | state | call-arg | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| order.createMarketOrder | pay_type | body | state | call-arg | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| order.createMarketOrder | pay_way | body | state | call-arg | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| common.getMasterRank | page | body | state | call-arg | Level B | pages/rank/masterRank.vue:63 getMasterRank |
| user.commison_rank | type | body | state | call-arg | Level B | pages/rebate/leaderboard.vue:58 commison_rank |
| shop.shop.getGoodsInfo | goods_id | body | state | call-arg | Level B | pages/shop/detail/goods.vue:57 getGoodsInfo |
| shop.shop.exchange | goods_id | body | state | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | number | body | state | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | address_id | body | state | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | pay_password | body | state | call-arg | Level B | pages/shop/exchange.vue:189 exchange |
| collection.getSeriesList | type | query | literal | call-arg | Level B | store/modules/goods.js:32 getSeriesList<br>store/modules/goods.js:35 getSeriesList |
| order.doPay | pay_type | body | state | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | order_number | body | state | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | order_type | body | state | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | pay_way | body | state | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | pay_scene | body | unknown | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | returnurl | body | state | call-arg | Level B | utils/payUtil.js:49 doPay |
| order.doPay | pay_password | body | state | call-arg | Level B | utils/payUtil.js:49 doPay |
| address.add_edit_address | * | body | unknown | pass-through | Level C | api/address/index.js:19 add_edit_address |
| address.address_detail | * | body | unknown | pass-through | Level C | api/address/index.js:28 address_detail |
| address.address_delete | * | body | unknown | pass-through | Level C | api/address/index.js:37 address_delete |
| banner.getBannerList | * | body | unknown | pass-through | Level C | api/banner/index.js:11 getBannerList |
| box.getBoxDetails | id | path | unknown | wrapper-param | Level A | api/box/index.js:10 getBoxDetails |
| box.getBoxDetails | origin | query | unknown | wrapper-param | Level A | api/box/index.js:10 getBoxDetails |
| box.getBoxDetails | crystal_goods_id | query | unknown | wrapper-param | Level A | api/box/index.js:10 getBoxDetails |
| box.openBox | openid | body | unknown | wrapper-param | Level A | api/box/index.js:22 openBox |
| box.openBoxs | openid | body | unknown | wrapper-param | Level A | api/box/index.js:32 openBoxs |
| box.getOpenRecord | * | body | unknown | pass-through | Level C | api/box/index.js:49 getOpenRecord |
| collection.getCollectionList | * | body | unknown | pass-through | Level C | api/collection/index.js:9 getCollectionList |
| collection.getCalenderList | * | body | unknown | pass-through | Level C | api/collection/index.js:19 getCalenderList |
| collection.getCollectionDetails | id | path | unknown | wrapper-param | Level A | api/collection/index.js:29 getCollectionDetails |
| collection.getCollectionDetails | batch_id | query | unknown | wrapper-param | Level A | api/collection/index.js:29 getCollectionDetails |
| collection.getUserSeriesList | * | body | unknown | pass-through | Level C | api/collection/index.js:41 getUserSeriesList |
| collection.getListDetail | * | body | unknown | pass-through | Level C | api/collection/index.js:50 getListDetail |
| collection.getUserCollectionDetailsList | * | body | unknown | pass-through | Level C | api/collection/index.js:60 getUserCollectionDetailsList |
| collection.getUserCollectionDetails | id | path | unknown | wrapper-param | Level A | api/collection/index.js:70 getUserCollectionDetails |
| collection.getSellConfig | price | body | unknown | wrapper-param | Level A | api/collection/index.js:79 getSellConfig |
| collection.getSellConfig | user_collection_id | body | unknown | wrapper-param | Level A | api/collection/index.js:79 getSellConfig |
| collection.sellProduct | * | body | unknown | pass-through | Level C | api/collection/index.js:92 sellProduct |
| collection.givingProduct | * | body | unknown | pass-through | Level C | api/collection/index.js:108 givingProduct |
| collection.givingProductOrder | * | body | unknown | pass-through | Level C | api/collection/index.js:117 givingProductOrder |
| collection.getCompoundList | * | body | unknown | pass-through | Level C | api/collection/index.js:127 getCompoundList |
| collection.getCompoundDetails | box_id | body | unknown | wrapper-param | Level A | api/collection/index.js:137 getCompoundDetails |
| collection.buildCollection | * | body | unknown | pass-through | Level C | api/collection/index.js:149 buildCollection |
| collection.getCompoundRecord | * | body | unknown | pass-through | Level C | api/collection/index.js:158 getCompoundRecord |
| collection.getGiveRecord | * | body | unknown | pass-through | Level C | api/collection/index.js:168 getGiveRecord |
| collection.getMoveRecord | user_collection_id | body | unknown | wrapper-param | Level A | api/collection/index.js:178 getMoveRecord |
| collection.getSeriesList | * | query | unknown | pass-through | Level C | api/collection/index.js:193 getSeriesList |
| collection.getSelfSeries | * | body | unknown | pass-through | Level C | api/collection/index.js:207 getSelfSeries |
| collection.addSelfSeries | * | body | unknown | pass-through | Level C | api/collection/index.js:221 addSelfSeries |
| collection.removeSelfSeries | * | body | unknown | pass-through | Level C | api/collection/index.js:237 removeSelfSeries |
| collection.getSeriesGoodsList | series_id | body | unknown | wrapper-param | Level A | api/collection/index.js:251 getSeriesGoodsList |
| collection.searchUserCollection | * | body | unknown | pass-through | Level C | api/collection/index.js:266 searchUserCollection |
| collection.getDiscountBuy | * | body | unknown | pass-through | Level C | api/collection/index.js:279 getDiscountBuy |
| collection.antMycollection | * | body | unknown | pass-through | Level C | api/collection/index.js:288 antMycollection |
| collection.isCollect | * | body | unknown | pass-through | Level C | api/collection/index.js:297 isCollect |
| collection.likeCollection | * | body | unknown | pass-through | Level C | api/collection/index.js:307 likeCollection |
| collection.user_collection_Detail | * | body | unknown | pass-through | Level C | api/collection/index.js:316 user_collection_Detail |
| collection.myConsignment | * | body | unknown | pass-through | Level C | api/collection/index.js:325 myConsignment |
| common.getUserRank | user_id | body | unknown | wrapper-param | Level A | api/common/index.js:16 getUserRank |
| common.getMasterRank | * | body | unknown | pass-through | Level C | api/common/index.js:27 getMasterRank |
| common.setClickNum | id | body | unknown | wrapper-param | Level A | api/common/index.js:36 setClickNum |
| common.getConfig | key | body | unknown | wrapper-param | Level A | api/common/index.js:50 getConfig |
| common.getFileInfo | url | body | unknown | wrapper-param | Level A | api/common/index.js:66 getFileInfo |
| common.getVersion | * | body | unknown | pass-through | Level C | api/common/index.js:80 getVersion |
| common.getRankingList | * | body | unknown | pass-through | Level C | api/common/index.js:99 getRankingList |
| common.getCapt | * | body | unknown | pass-through | Level C | api/common/index.js:147 getCapt |
| common.getTest | * | body | unknown | pass-through | Level C | api/common/index.js:157 getTest |
| compound.themeinfo | * | body | unknown | pass-through | Level C | api/compound/index.js:4 themeinfo |
| compound.material | * | body | unknown | pass-through | Level C | api/compound/index.js:13 material |
| compound.playInfo | * | body | unknown | pass-through | Level C | api/compound/index.js:22 playInfo |
| compound.selectCollection | * | body | unknown | pass-through | Level C | api/compound/index.js:31 selectCollection |
| compound.synthesizeNow | * | body | unknown | pass-through | Level C | api/compound/index.js:40 synthesizeNow |
| compound.recordInfo | * | body | unknown | pass-through | Level C | api/compound/index.js:49 recordInfo |
| compound.recordList | * | body | unknown | pass-through | Level C | api/compound/index.js:58 recordList |
| draw.getDraw | id | body | unknown | wrapper-param | Level A | api/draw/index.js:5 getDraw |
| draw.draw | id | body | unknown | wrapper-param | Level A | api/draw/index.js:15 draw |
| draw.drawLog | id | body | unknown | wrapper-param | Level A | api/draw/index.js:26 drawLog |
| draw.drawRecord | id | body | unknown | wrapper-param | Level A | api/draw/index.js:37 drawRecord |
| ext.invitercompound | * | body | unknown | pass-through | Level C | api/ext/index.js:4 invitercompound |
| integral.get_score_list | * | body | unknown | pass-through | Level C | api/integral/index.js:4 get_score_list |
| integral.get_my_share_details | * | body | unknown | pass-through | Level C | api/integral/index.js:15 get_my_share_details |
| integral.shareSub | * | body | unknown | pass-through | Level C | api/integral/index.js:25 shareSub |
| integral.getGoodsList | * | body | unknown | pass-through | Level C | api/integral/index.js:34 getGoodsList |
| integral.goodsDetailsApi | * | body | unknown | pass-through | Level C | api/integral/index.js:51 goodsDetailsApi |
| integral.huodouOrder | * | body | unknown | pass-through | Level C | api/integral/index.js:60 huodouOrder |
| integral.huodouList | * | body | unknown | pass-through | Level C | api/integral/index.js:69 huodouList |
| integral.huodouDetail | * | body | unknown | pass-through | Level C | api/integral/index.js:78 huodouDetail |
| integral.getScoreGuessList | * | body | unknown | pass-through | Level C | api/integral/index.js:90 getScoreGuessList |
| integral.guess_detail | * | body | unknown | pass-through | Level C | api/integral/index.js:99 guess_detail |
| integral.get_my_score_guess_list | * | body | unknown | pass-through | Level C | api/integral/index.js:108 get_my_score_guess_list |
| integral.join_guess | * | body | unknown | pass-through | Level C | api/integral/index.js:117 join_guess |
| integral.guess_success | * | body | unknown | pass-through | Level C | api/integral/index.js:126 guess_success |
| integral.get_my_guess | * | body | unknown | pass-through | Level C | api/integral/index.js:135 get_my_guess |
| lottery.lotteryInfoApi | * | body | unknown | pass-through | Level C | api/lottery/index.js:4 lotteryInfoApi |
| lottery.lotteryStartApi | * | body | unknown | pass-through | Level C | api/lottery/index.js:13 lotteryStartApi |
| lottery.lotteryStatistics | * | body | unknown | pass-through | Level C | api/lottery/index.js:22 lotteryStatistics |
| lottery.lotteryRecord | * | body | unknown | pass-through | Level C | api/lottery/index.js:31 lotteryRecord |
| market.getMarketBoxList | * | body | unknown | pass-through | Level C | api/market/index.js:9 getMarketBoxList |
| market.ranking | * | body | unknown | pass-through | Level C | api/market/index.js:22 ranking |
| market.getMarketList | * | body | unknown | pass-through | Level C | api/market/index.js:34 getMarketList |
| market.getMarketGoodsList | * | body | unknown | pass-through | Level C | api/market/index.js:44 getMarketGoodsList |
| market.changeMarketGoods | * | body | unknown | pass-through | Level C | api/market/index.js:53 changeMarketGoods |
| market.getMarketGoodsInfo | * | body | unknown | pass-through | Level C | api/market/index.js:63 getMarketGoodsInfo |
| market.getMarketDetails | id | path | unknown | wrapper-param | Level A | api/market/index.js:72 getMarketDetails |
| news.getNoticeList | type | body | unknown | wrapper-param | Level A | api/news/index.js:21 getNoticeList |
| news.getDetails | id | body | unknown | wrapper-param | Level A | api/news/index.js:33 getDetails |
| notice.getNoticeList | * | body | unknown | pass-through | Level C | api/notice/index.js:21 getNoticeList |
| notice.getNoticeDetails | id | path | unknown | wrapper-param | Level A | api/notice/index.js:33 getNoticeDetails |
| notice.getMessageList | * | body | unknown | pass-through | Level C | api/notice/index.js:44 getMessageList |
| notice.readMessage | id | body | unknown | wrapper-param | Level A | api/notice/index.js:57 readMessage |
| notice.getNewsList | * | body | unknown | pass-through | Level C | api/notice/index.js:94 getNewsList |
| notice.getNewsDetails | news_id | body | unknown | wrapper-param | Level A | api/notice/index.js:103 getNewsDetails |
| notice.getWallList | * | body | unknown | pass-through | Level C | api/notice/index.js:116 getWallList |
| notice.sendRumor | * | body | unknown | pass-through | Level C | api/notice/index.js:126 sendRumor |
| notice.sendComment | * | body | unknown | pass-through | Level C | api/notice/index.js:137 sendComment |
| notice.getRumorDetails | id | body | unknown | wrapper-param | Level A | api/notice/index.js:151 getRumorDetails |
| notice.getRumorComment | * | body | unknown | pass-through | Level C | api/notice/index.js:165 getRumorComment |
| notice.getRumorReply | * | body | unknown | pass-through | Level C | api/notice/index.js:180 getRumorReply |
| order.getOderList | * | body | unknown | pass-through | Level C | api/order/index.js:10 getOderList |
| order.createOrder | * | body | unknown | pass-through | Level C | api/order/index.js:20 createOrder |
| order.createMarketOrder | * | body | unknown | pass-through | Level C | api/order/index.js:30 createMarketOrder<br>pages/order/orderSubmit.vue:207 |
| order.createMarketOrderPush | * | body | unknown | pass-through | Level C | api/order/index.js:38 createMarketOrderPush |
| order.getOrderDetails | id | path | unknown | wrapper-param | Level A | api/order/index.js:48 getOrderDetails |
| order.getRegiftOrderDetails | id | path | unknown | wrapper-param | Level A | api/order/index.js:62 getRegiftOrderDetails |
| order.getMarketOrderDetails | order_id | body | unknown | wrapper-param | Level A | api/order/index.js:72 getMarketOrderDetails |
| order.changeOrderStatus | * | body | unknown | pass-through | Level C | api/order/index.js:86 changeOrderStatus |
| order.doPay | * | body | unknown | pass-through | Level C | api/order/index.js:112 doPay |
| order.signUpDraw | * | body | unknown | pass-through | Level C | api/order/index.js:125 signUpDraw |
| order.queryDrawStatus | * | body | unknown | pass-through | Level C | api/order/index.js:138 queryDrawStatus |
| order.queryDramOrSignUpList | * | body | unknown | pass-through | Level C | api/order/index.js:150 queryDramOrSignUpList |
| order.fastCreateOrder | * | body | unknown | pass-through | Level C | api/order/index.js:161 fastCreateOrder<br>pages/market/marketGoodsList.vue:304 |
| order.bacthCreateOrder | * | body | unknown | pass-through | Level C | api/order/index.js:175 bacthCreateOrder |
| order.cancelBatchOrder | * | body | unknown | pass-through | Level C | api/order/index.js:185 cancelBatchOrder |
| order.createBatchPayOrder | * | body | unknown | pass-through | Level C | api/order/index.js:204 createBatchPayOrder |
| order.order.getOderList | * | body | unknown | pass-through | Level C | api/order/order.js:9 getOderList |
| order.order.createOrder | * | body | unknown | pass-through | Level C | api/order/order.js:19 createOrder |
| order.order.createMarketOrder | * | body | unknown | pass-through | Level C | api/order/order.js:29 createMarketOrder |
| order.order.getOrderDetails | id | path | unknown | wrapper-param | Level A | api/order/order.js:41 getOrderDetails |
| order.order.changeOrderStatus | * | body | unknown | pass-through | Level C | api/order/order.js:56 changeOrderStatus |
| order.order.doPay | * | body | unknown | pass-through | Level C | api/order/order.js:77 doPay |
| order.order.signUpDraw | * | body | unknown | pass-through | Level C | api/order/order.js:90 signUpDraw |
| order.order.queryDrawStatus | * | body | unknown | pass-through | Level C | api/order/order.js:103 queryDrawStatus |
| order.order.queryDramOrSignUpList | * | body | unknown | pass-through | Level C | api/order/order.js:115 queryDramOrSignUpList |
| order.order.openHfWallet | * | body | unknown | pass-through | Level C | api/order/order.js:124 openHfWallet |
| order.order.getWalletAddr | * | body | unknown | pass-through | Level C | api/order/order.js:131 getWalletAddr |
| order.order.CreateHuifuAccountOrder | * | body | unknown | pass-through | Level C | api/order/order.js:141 CreateHuifuAccountOrder |
| shop.shop.goodsList | * | body | unknown | pass-through | Level C | api/shop/shop.js:5 goodsList |
| shop.shop.crystalDetail | * | body | unknown | pass-through | Level C | api/shop/shop.js:14 crystalDetail |
| shop.shop.exchangeRecord | * | body | unknown | pass-through | Level C | api/shop/shop.js:22 exchangeRecord |
| shop.shop.getGoodsInfo | * | body | unknown | pass-through | Level C | api/shop/shop.js:33 getGoodsInfo |
| shop.shop.exchange | * | body | unknown | pass-through | Level C | api/shop/shop.js:44 exchange |
| shop.shop.getECardPass | * | body | unknown | pass-through | Level C | api/shop/shop.js:53 getECardPass |
| subscribe.subscribe | * | body | unknown | pass-through | Level C | api/subscribe/index.js:7 subscribe |
| trad.getTradInfo | collection_id | body | unknown | wrapper-param | Level A | api/trad/index.js:5 getTradInfo |
| trad.createTradOrder | * | body | unknown | pass-through | Level C | api/trad/index.js:17 createTradOrder |
| trad.getMyBegInfo | order_id | body | unknown | wrapper-param | Level A | api/trad/index.js:26 getMyBegInfo |
| trad.getMyTradeList | * | body | unknown | pass-through | Level C | api/trad/index.js:36 getMyTradeList |
| trad.getBegBuyList | * | body | unknown | pass-through | Level C | api/trad/index.js:45 getBegBuyList |
| trad.cancelBegBuy | order_id | body | unknown | wrapper-param | Level A | api/trad/index.js:54 cancelBegBuy |
| trad.getSellBegInfo | * | body | unknown | pass-through | Level C | api/trad/index.js:64 getSellBegInfo |
| trad.sell | * | body | unknown | pass-through | Level C | api/trad/index.js:73 sell |
| trad.getSellInfo | * | body | unknown | pass-through | Level C | api/trad/index.js:82 getSellInfo |
| user.oneLogin | * | body | unknown | pass-through | Level C | api/user/index.js:9 oneLogin |
| user.login | * | body | unknown | pass-through | Level C | api/user/index.js:23 login |
| user.sendSms | * | body | unknown | pass-through | Level C | api/user/index.js:49 sendSms |
| user.register | * | body | unknown | pass-through | Level C | api/user/index.js:63 register |
| user.updateUserInfo | * | body | unknown | pass-through | Level C | api/user/index.js:75 updateUserInfo |
| user.applyCertAuth | * | body | unknown | pass-through | Level C | api/user/index.js:87 applyCertAuth |
| user.bindBank | * | body | unknown | pass-through | Level C | api/user/index.js:111 bindBank |
| user.setActionPwd | * | body | unknown | pass-through | Level C | api/user/index.js:123 setActionPwd |
| user.resetLoginPwd | * | body | unknown | pass-through | Level C | api/user/index.js:135 resetLoginPwd |
| user.searchUser | * | body | unknown | pass-through | Level C | api/user/index.js:147 searchUser |
| user.applyIssuer | * | body | unknown | pass-through | Level C | api/user/index.js:159 applyIssuer |
| user.cehckPayPassword | * | body | unknown | pass-through | Level C | api/user/index.js:182 cehckPayPassword |
| user.flowDoc | * | body | unknown | pass-through | Level C | api/user/index.js:191 flowDoc |
| user.delAccount | payPassword | body | unknown | wrapper-param | Level A | api/user/index.js:204 delAccount |
| user.bei_yao_list | * | body | unknown | pass-through | Level C | api/user/index.js:224 bei_yao_list |
| user.commison_rank | * | body | unknown | pass-through | Level C | api/user/index.js:232 commison_rank |
| wallet.getWalletInfo | * | body | unknown | pass-through | Level C | api/wallet/index.js:10 getWalletInfo |
| wallet.verifyMobileCodeForLL | * | body | unknown | pass-through | Level C | api/wallet/index.js:38 verifyMobileCodeForLL |
| wallet.supplementInfo | * | body | unknown | pass-through | Level C | api/wallet/index.js:53 supplementInfo |
| wallet.orderSmsCheck | * | body | unknown | pass-through | Level C | api/wallet/index.js:80 orderSmsCheck |
| wallet.recharge | * | body | unknown | pass-through | Level C | api/wallet/index.js:92 recharge |
| wallet.withdrawal | * | body | unknown | pass-through | Level C | api/wallet/index.js:105 withdrawal |
| wallet.getWithdrawal | * | body | unknown | pass-through | Level C | api/wallet/index.js:118 getWithdrawal |
| wallet.getWalletDetailList | * | body | unknown | pass-through | Level C | api/wallet/index.js:130 getWalletDetailList |
| wallet.getLLBankList | * | body | unknown | pass-through | Level C | api/wallet/index.js:143 getLLBankList |
| wallet.setLlDeaultBank | * | body | unknown | pass-through | Level C | api/wallet/index.js:156 setLlDeaultBank |
| user.login | account | body | state | manual | Level B | pages/login/login.vue:126 |
| user.login | password | body | state | manual | Level B | pages/login/login.vue:127 |
| user.login | mobile | body | state | manual | Level B | pages/login/login.vue:130 |
| user.login | captcha | body | state | manual | Level B | pages/login/login.vue:132 |
| user.login | inviter_code | body | storage | manual | Level B | pages/login/login.vue:274 |
| user.register | mobile | body | state | manual | Level B | pages/login/register.vue:106 |
| user.register | password | body | state | manual | Level B | pages/login/register.vue:107 |
| user.register | code | body | state | manual | Level B | pages/login/register.vue:108 |
| user.register | inviter_code | body | storage | manual | Level B | pages/login/register.vue:138 |
| user.applyCertAuth | real_name | body | state | manual | Level B | pages/certification/components/certificationForm.vue:49 |
| user.applyCertAuth | id_card | body | state | manual | Level B | pages/certification/components/certificationForm.vue:50 |
| market.getMarketBoxList | goods_type | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | page | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | list_rows | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | series_id | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | new | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | price | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | keywords | body | state | manual | Level B | pages/market/search.vue:50 |
| market.getMarketList | goods_type | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketList | page | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketList | list_rows | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketList | series_id | body | state | manual | Level B | pages/market/market.vue:48 |
| market.getMarketList | keywords | body | state | manual | Level B | pages/market/search.vue:50 |
| market.getMarketGoodsList | page | body | state | manual | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | sort | body | state | manual | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | type | body | state | manual | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | id | body | route | manual | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | order | body | computed | manual | Level B | pages/market/marketGoodsList.vue:401 |
| order.order.signUpDraw | goods_id | body | state | manual | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:184 |
| order.order.signUpDraw | goods_type | body | state | manual | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:184 |
| order.order.signUpDraw | helpucode | body | storage | manual | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:188 |
| order.order.signUpDraw | newuser | body | storage | manual | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:188 |
