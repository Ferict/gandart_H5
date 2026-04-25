# Confidence

> 文档类型：后端契约字段置信度索引
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件记录字段证据置信度，用于 P11.12 接驳判断候选字段是否可靠，不表示字段已进入稳定 UI 依赖。

| operationId | direction | fieldPath | confidence | evidence |
| --- | --- | --- | --- | --- |
| collection.isCollect | request | body.types | Level B | components/w-navbar/w-navbar.vue:140 isCollect<br>pages/market/marketGoodsList.vue:274 isCollect<br>pages/myCollection/components/collectionItem.vue:89 isCollect |
| collection.isCollect | request | body.id | Level B | components/w-navbar/w-navbar.vue:140 isCollect<br>pages/market/marketGoodsList.vue:274 isCollect<br>pages/myCollection/components/collectionItem.vue:89 isCollect |
| banner.getBannerList | request | body.type | Level B | components/w-swiper/w-swiper.vue:29 getBannerList |
| market.changeMarketGoods | request | body.id | Level B | pages/blindBox/components/blindBox-detail-button.vue:36 changeMarketGoods<br>pages/consignments/componens/my-consignments-item.vue:53 changeMarketGoods<br>pages/myCollection/components/collection-detail-button.vue:54 changeMarketGoods |
| compound.selectCollection | request | body.collection_ids | Level B | pages/compound/components/changeMaterials.vue:105 selectCollection |
| compound.material | request | body.play_id | Level B | pages/compound/components/methods.vue:110 material |
| compound.material | request | body.classify | Level B | pages/compound/components/methods.vue:110 material |
| compound.themeinfo | request | body.thm | Level B | pages/compound/compound.vue:46 themeinfo |
| compound.recordList | request | body.page | Level B | pages/compound/record.vue:73 recordList |
| compound.recordInfo | request | body.record_id | Level B | pages/compound/result.vue:124 recordInfo |
| collection.sellProduct | request | body.user_collection_id | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | request | body.price | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | request | body.pay_password | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.sellProduct | request | body.income_type | Level B | pages/consignments/consignments.vue:253 sellProduct |
| collection.myConsignment | request | body.status | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | request | body.goods_type | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | request | body.page | Level B | pages/consignments/myConsignment.vue:93 myConsignment<br>pages/consignments/search.vue:118 myConsignment |
| collection.myConsignment | request | body.keyword | Level B | pages/consignments/search.vue:118 myConsignment |
| integral.get_my_share_details | request | body.type | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:249 get_my_share_details |
| integral.shareSub | request | body.images | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:270 shareSub |
| market.ranking | request | body.types | Level B | pages/leaderboard/leaderboard.vue:55 ranking |
| user.sendSms | request | body.mobile | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:206 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:194 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:129 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:141 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| user.sendSms | request | body.event | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:206 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:194 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:129 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:141 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| user.sendSms | request | body.verify_token | Level B | pages/login/login.vue:179 sendSms<br>pages/login/login.vue:230 sendSms<br>pages/login/register.vue:167 sendSms<br>pages/login/register.vue:219 sendSms<br>pages/login/verification.vue:105 sendSms<br>pages/login/verification.vue:153 sendSms<br>pages/my/actionPwd/getCode.vue:117 sendSms<br>pages/my/actionPwd/getCode.vue:168 sendSms |
| lottery.lotteryStartApi | request | body.lotteryId | Level B | pages/lottery/components/lotteryBox.vue:181 lotteryStartApi<br>pages/lottery/lottery.vue:205 lotteryStartApi |
| lottery.lotteryStartApi | request | body.number | Level B | pages/lottery/components/lotteryBox.vue:181 lotteryStartApi<br>pages/lottery/lottery.vue:205 lotteryStartApi |
| lottery.lotteryInfoApi | request | body.id | Level B | pages/lottery/lottery - 副本.vue:74 lotteryInfoApi<br>pages/lottery/lottery.vue:145 lotteryInfoApi |
| lottery.lotteryStatistics | request | body.lottery_id | Level B | pages/lottery/lottery.vue:134 lotteryStatistics<br>pages/lottery/record.vue:82 lotteryStatistics |
| lottery.lotteryRecord | request | body.type | Level B | pages/lottery/record.vue:92 lotteryRecord |
| lottery.lotteryRecord | request | body.lottery_id | Level B | pages/lottery/record.vue:92 lotteryRecord |
| lottery.lotteryRecord | request | body.page | Level B | pages/lottery/record.vue:92 lotteryRecord |
| collection.getSelfSeries | request | body.type | Level B | pages/market/categoryManager.vue:83 getSelfSeries |
| collection.addSelfSeries | request | body.series_id | Level B | pages/market/categoryManager.vue:93 addSelfSeries |
| collection.removeSelfSeries | request | body.series_id | Level B | pages/market/categoryManager.vue:102 removeSelfSeries |
| order.bacthCreateOrder | request | body.goods_id | Level B | pages/market/components/batchConfirm.vue:112 bacthCreateOrder |
| order.bacthCreateOrder | request | body.key | Level B | pages/market/components/batchConfirm.vue:112 bacthCreateOrder |
| market.getMarketGoodsInfo | request | body.id | Level B | pages/market/marketGoodsList.vue:371 getMarketGoodsInfo<br>pages/market/sellInfo.vue:102 getMarketGoodsInfo |
| market.getMarketGoodsInfo | request | body.type | Level B | pages/market/marketGoodsList.vue:371 getMarketGoodsInfo<br>pages/market/sellInfo.vue:102 getMarketGoodsInfo |
| order.fastCreateOrder | request | body.goods_id | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| order.fastCreateOrder | request | body.key | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| order.fastCreateOrder | request | body.pay_way | Level B | pages/market/marketGoodsList.vue:304 fastCreateOrder |
| trad.sell | request | body.pay_way | Level B | pages/market/sellBegBuy.vue:225 sell |
| trad.sell | request | body.sell_data | Level B | pages/market/sellBegBuy.vue:225 sell |
| trad.sell | request | body.pay_password | Level B | pages/market/sellBegBuy.vue:225 sell |
| user.cehckPayPassword | request | body.pay_password | Level B | pages/my/actionPwd/getCode.vue:212 cehckPayPassword |
| address.address_detail | request | body.id | Level B | pages/my/address/edit.vue:131 address_detail |
| address.add_edit_address | request | body.id | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | request | body.s_name | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | request | body.s_phone | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.add_edit_address | request | body.isdef | Level B | pages/my/address/list.vue:115 add_edit_address |
| address.address_delete | request | body.id | Level B | pages/my/address/list.vue:132 address_delete |
| user.flowDoc | request | body.uc_id | Level B | pages/my/flowDoc.vue:46 flowDoc |
| user.flowDoc | request | body.page | Level B | pages/my/flowDoc.vue:46 flowDoc |
| user.updateUserInfo | request | body.avatar | Level B | pages/my/info.vue:227 updateUserInfo |
| collection.likeCollection | request | body.keyword | Level B | pages/myCollection/components/collectionSearch.vue:111 likeCollection |
| collection.user_collection_Detail | request | body.collection_id | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| collection.user_collection_Detail | request | body.types | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| collection.user_collection_Detail | request | body.page | Level B | pages/myCollection/components/popDetails.vue:122 user_collection_Detail |
| shop.shop.getECardPass | request | body.pay_password | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| shop.shop.getECardPass | request | body.sn | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| shop.shop.getECardPass | request | body.order_id | Level B | pages/order/components/BegGoodsInfo.vue:218 getECardPass<br>pages/order/components/goodsInfo.vue:185 getECardPass |
| order.changeOrderStatus | request | body.order_type | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.changeOrderStatus | request | body.status | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.changeOrderStatus | request | body.order_sn | Level B | pages/order/components/orderAction.vue:67 changeOrderStatus |
| order.createBatchPayOrder | request | body.order_ids | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.createBatchPayOrder | request | body.batch_order_id | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.createBatchPayOrder | request | body.pay_way | Level B | pages/order/list.vue:221 createBatchPayOrder |
| order.cancelBatchOrder | request | body.batch_order_id | Level B | pages/order/list.vue:183 cancelBatchOrder |
| order.createOrder | request | body.goods_type | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | request | body.goods_id | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | request | body.num | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | request | body.pay_type | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | request | body.pay_way | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | request | body.batch_id | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createOrder | request | body.price | Level B | pages/order/orderSubmit.vue:188 createOrder |
| order.createMarketOrder | request | body.market_goods_id | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| order.createMarketOrder | request | body.pay_type | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| order.createMarketOrder | request | body.pay_way | Level B | pages/order/orderSubmit.vue:207 createMarketOrder |
| common.getMasterRank | request | body.page | Level B | pages/rank/masterRank.vue:63 getMasterRank |
| user.commison_rank | request | body.type | Level B | pages/rebate/leaderboard.vue:58 commison_rank |
| shop.shop.getGoodsInfo | request | body.goods_id | Level B | pages/shop/detail/goods.vue:57 getGoodsInfo |
| shop.shop.exchange | request | body.goods_id | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | request | body.number | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | request | body.address_id | Level B | pages/shop/exchange.vue:189 exchange |
| shop.shop.exchange | request | body.pay_password | Level B | pages/shop/exchange.vue:189 exchange |
| collection.getSeriesList | request | query.type | Level B | store/modules/goods.js:32 getSeriesList<br>store/modules/goods.js:35 getSeriesList |
| order.doPay | request | body.pay_type | Level B | utils/payUtil.js:49 doPay |
| order.doPay | request | body.order_number | Level B | utils/payUtil.js:49 doPay |
| order.doPay | request | body.order_type | Level B | utils/payUtil.js:49 doPay |
| order.doPay | request | body.pay_way | Level B | utils/payUtil.js:49 doPay |
| order.doPay | request | body.pay_scene | Level B | utils/payUtil.js:49 doPay |
| order.doPay | request | body.returnurl | Level B | utils/payUtil.js:49 doPay |
| order.doPay | request | body.pay_password | Level B | utils/payUtil.js:49 doPay |
| address.add_edit_address | request | body.* | Level C | api/address/index.js:19 add_edit_address |
| address.address_detail | request | body.* | Level C | api/address/index.js:28 address_detail |
| address.address_delete | request | body.* | Level C | api/address/index.js:37 address_delete |
| banner.getBannerList | request | body.* | Level C | api/banner/index.js:11 getBannerList |
| box.getBoxDetails | request | path.id | Level A | api/box/index.js:10 getBoxDetails |
| box.getBoxDetails | request | query.origin | Level A | api/box/index.js:10 getBoxDetails |
| box.getBoxDetails | request | query.crystal_goods_id | Level A | api/box/index.js:10 getBoxDetails |
| box.openBox | request | body.openid | Level A | api/box/index.js:22 openBox |
| box.openBoxs | request | body.openid | Level A | api/box/index.js:32 openBoxs |
| box.getOpenRecord | request | body.* | Level C | api/box/index.js:49 getOpenRecord |
| collection.getCollectionList | request | body.* | Level C | api/collection/index.js:9 getCollectionList |
| collection.getCalenderList | request | body.* | Level C | api/collection/index.js:19 getCalenderList |
| collection.getCollectionDetails | request | path.id | Level A | api/collection/index.js:29 getCollectionDetails |
| collection.getCollectionDetails | request | query.batch_id | Level A | api/collection/index.js:29 getCollectionDetails |
| collection.getUserSeriesList | request | body.* | Level C | api/collection/index.js:41 getUserSeriesList |
| collection.getListDetail | request | body.* | Level C | api/collection/index.js:50 getListDetail |
| collection.getUserCollectionDetailsList | request | body.* | Level C | api/collection/index.js:60 getUserCollectionDetailsList |
| collection.getUserCollectionDetails | request | path.id | Level A | api/collection/index.js:70 getUserCollectionDetails |
| collection.getSellConfig | request | body.price | Level A | api/collection/index.js:79 getSellConfig |
| collection.getSellConfig | request | body.user_collection_id | Level A | api/collection/index.js:79 getSellConfig |
| collection.sellProduct | request | body.* | Level C | api/collection/index.js:92 sellProduct |
| collection.givingProduct | request | body.* | Level C | api/collection/index.js:108 givingProduct |
| collection.givingProductOrder | request | body.* | Level C | api/collection/index.js:117 givingProductOrder |
| collection.getCompoundList | request | body.* | Level C | api/collection/index.js:127 getCompoundList |
| collection.getCompoundDetails | request | body.box_id | Level A | api/collection/index.js:137 getCompoundDetails |
| collection.buildCollection | request | body.* | Level C | api/collection/index.js:149 buildCollection |
| collection.getCompoundRecord | request | body.* | Level C | api/collection/index.js:158 getCompoundRecord |
| collection.getGiveRecord | request | body.* | Level C | api/collection/index.js:168 getGiveRecord |
| collection.getMoveRecord | request | body.user_collection_id | Level A | api/collection/index.js:178 getMoveRecord |
| collection.getSeriesList | request | query.* | Level C | api/collection/index.js:193 getSeriesList |
| collection.getSelfSeries | request | body.* | Level C | api/collection/index.js:207 getSelfSeries |
| collection.addSelfSeries | request | body.* | Level C | api/collection/index.js:221 addSelfSeries |
| collection.removeSelfSeries | request | body.* | Level C | api/collection/index.js:237 removeSelfSeries |
| collection.getSeriesGoodsList | request | body.series_id | Level A | api/collection/index.js:251 getSeriesGoodsList |
| collection.searchUserCollection | request | body.* | Level C | api/collection/index.js:266 searchUserCollection |
| collection.getDiscountBuy | request | body.* | Level C | api/collection/index.js:279 getDiscountBuy |
| collection.antMycollection | request | body.* | Level C | api/collection/index.js:288 antMycollection |
| collection.isCollect | request | body.* | Level C | api/collection/index.js:297 isCollect |
| collection.likeCollection | request | body.* | Level C | api/collection/index.js:307 likeCollection |
| collection.user_collection_Detail | request | body.* | Level C | api/collection/index.js:316 user_collection_Detail |
| collection.myConsignment | request | body.* | Level C | api/collection/index.js:325 myConsignment |
| common.getUserRank | request | body.user_id | Level A | api/common/index.js:16 getUserRank |
| common.getMasterRank | request | body.* | Level C | api/common/index.js:27 getMasterRank |
| common.setClickNum | request | body.id | Level A | api/common/index.js:36 setClickNum |
| common.getConfig | request | body.key | Level A | api/common/index.js:50 getConfig |
| common.getFileInfo | request | body.url | Level A | api/common/index.js:66 getFileInfo |
| common.getVersion | request | body.* | Level C | api/common/index.js:80 getVersion |
| common.getRankingList | request | body.* | Level C | api/common/index.js:99 getRankingList |
| common.getCapt | request | body.* | Level C | api/common/index.js:147 getCapt |
| common.getTest | request | body.* | Level C | api/common/index.js:157 getTest |
| compound.themeinfo | request | body.* | Level C | api/compound/index.js:4 themeinfo |
| compound.material | request | body.* | Level C | api/compound/index.js:13 material |
| compound.playInfo | request | body.* | Level C | api/compound/index.js:22 playInfo |
| compound.selectCollection | request | body.* | Level C | api/compound/index.js:31 selectCollection |
| compound.synthesizeNow | request | body.* | Level C | api/compound/index.js:40 synthesizeNow |
| compound.recordInfo | request | body.* | Level C | api/compound/index.js:49 recordInfo |
| compound.recordList | request | body.* | Level C | api/compound/index.js:58 recordList |
| draw.getDraw | request | body.id | Level A | api/draw/index.js:5 getDraw |
| draw.draw | request | body.id | Level A | api/draw/index.js:15 draw |
| draw.drawLog | request | body.id | Level A | api/draw/index.js:26 drawLog |
| draw.drawRecord | request | body.id | Level A | api/draw/index.js:37 drawRecord |
| ext.invitercompound | request | body.* | Level C | api/ext/index.js:4 invitercompound |
| integral.get_score_list | request | body.* | Level C | api/integral/index.js:4 get_score_list |
| integral.get_my_share_details | request | body.* | Level C | api/integral/index.js:15 get_my_share_details |
| integral.shareSub | request | body.* | Level C | api/integral/index.js:25 shareSub |
| integral.getGoodsList | request | body.* | Level C | api/integral/index.js:34 getGoodsList |
| integral.goodsDetailsApi | request | body.* | Level C | api/integral/index.js:51 goodsDetailsApi |
| integral.huodouOrder | request | body.* | Level C | api/integral/index.js:60 huodouOrder |
| integral.huodouList | request | body.* | Level C | api/integral/index.js:69 huodouList |
| integral.huodouDetail | request | body.* | Level C | api/integral/index.js:78 huodouDetail |
| integral.getScoreGuessList | request | body.* | Level C | api/integral/index.js:90 getScoreGuessList |
| integral.guess_detail | request | body.* | Level C | api/integral/index.js:99 guess_detail |
| integral.get_my_score_guess_list | request | body.* | Level C | api/integral/index.js:108 get_my_score_guess_list |
| integral.join_guess | request | body.* | Level C | api/integral/index.js:117 join_guess |
| integral.guess_success | request | body.* | Level C | api/integral/index.js:126 guess_success |
| integral.get_my_guess | request | body.* | Level C | api/integral/index.js:135 get_my_guess |
| lottery.lotteryInfoApi | request | body.* | Level C | api/lottery/index.js:4 lotteryInfoApi |
| lottery.lotteryStartApi | request | body.* | Level C | api/lottery/index.js:13 lotteryStartApi |
| lottery.lotteryStatistics | request | body.* | Level C | api/lottery/index.js:22 lotteryStatistics |
| lottery.lotteryRecord | request | body.* | Level C | api/lottery/index.js:31 lotteryRecord |
| market.getMarketBoxList | request | body.* | Level C | api/market/index.js:9 getMarketBoxList |
| market.ranking | request | body.* | Level C | api/market/index.js:22 ranking |
| market.getMarketList | request | body.* | Level C | api/market/index.js:34 getMarketList |
| market.getMarketGoodsList | request | body.* | Level C | api/market/index.js:44 getMarketGoodsList |
| market.changeMarketGoods | request | body.* | Level C | api/market/index.js:53 changeMarketGoods |
| market.getMarketGoodsInfo | request | body.* | Level C | api/market/index.js:63 getMarketGoodsInfo |
| market.getMarketDetails | request | path.id | Level A | api/market/index.js:72 getMarketDetails |
| news.getNoticeList | request | body.type | Level A | api/news/index.js:21 getNoticeList |
| news.getDetails | request | body.id | Level A | api/news/index.js:33 getDetails |
| notice.getNoticeList | request | body.* | Level C | api/notice/index.js:21 getNoticeList |
| notice.getNoticeDetails | request | path.id | Level A | api/notice/index.js:33 getNoticeDetails |
| notice.getMessageList | request | body.* | Level C | api/notice/index.js:44 getMessageList |
| notice.readMessage | request | body.id | Level A | api/notice/index.js:57 readMessage |
| notice.getNewsList | request | body.* | Level C | api/notice/index.js:94 getNewsList |
| notice.getNewsDetails | request | body.news_id | Level A | api/notice/index.js:103 getNewsDetails |
| notice.getWallList | request | body.* | Level C | api/notice/index.js:116 getWallList |
| notice.sendRumor | request | body.* | Level C | api/notice/index.js:126 sendRumor |
| notice.sendComment | request | body.* | Level C | api/notice/index.js:137 sendComment |
| notice.getRumorDetails | request | body.id | Level A | api/notice/index.js:151 getRumorDetails |
| notice.getRumorComment | request | body.* | Level C | api/notice/index.js:165 getRumorComment |
| notice.getRumorReply | request | body.* | Level C | api/notice/index.js:180 getRumorReply |
| order.getOderList | request | body.* | Level C | api/order/index.js:10 getOderList |
| order.createOrder | request | body.* | Level C | api/order/index.js:20 createOrder |
| order.createMarketOrder | request | body.* | Level C | api/order/index.js:30 createMarketOrder<br>pages/order/orderSubmit.vue:207 |
| order.createMarketOrderPush | request | body.* | Level C | api/order/index.js:38 createMarketOrderPush |
| order.getOrderDetails | request | path.id | Level A | api/order/index.js:48 getOrderDetails |
| order.getRegiftOrderDetails | request | path.id | Level A | api/order/index.js:62 getRegiftOrderDetails |
| order.getMarketOrderDetails | request | body.order_id | Level A | api/order/index.js:72 getMarketOrderDetails |
| order.changeOrderStatus | request | body.* | Level C | api/order/index.js:86 changeOrderStatus |
| order.doPay | request | body.* | Level C | api/order/index.js:112 doPay |
| order.signUpDraw | request | body.* | Level C | api/order/index.js:125 signUpDraw |
| order.queryDrawStatus | request | body.* | Level C | api/order/index.js:138 queryDrawStatus |
| order.queryDramOrSignUpList | request | body.* | Level C | api/order/index.js:150 queryDramOrSignUpList |
| order.fastCreateOrder | request | body.* | Level C | api/order/index.js:161 fastCreateOrder<br>pages/market/marketGoodsList.vue:304 |
| order.bacthCreateOrder | request | body.* | Level C | api/order/index.js:175 bacthCreateOrder |
| order.cancelBatchOrder | request | body.* | Level C | api/order/index.js:185 cancelBatchOrder |
| order.createBatchPayOrder | request | body.* | Level C | api/order/index.js:204 createBatchPayOrder |
| order.order.getOderList | request | body.* | Level C | api/order/order.js:9 getOderList |
| order.order.createOrder | request | body.* | Level C | api/order/order.js:19 createOrder |
| order.order.createMarketOrder | request | body.* | Level C | api/order/order.js:29 createMarketOrder |
| order.order.getOrderDetails | request | path.id | Level A | api/order/order.js:41 getOrderDetails |
| order.order.changeOrderStatus | request | body.* | Level C | api/order/order.js:56 changeOrderStatus |
| order.order.doPay | request | body.* | Level C | api/order/order.js:77 doPay |
| order.order.signUpDraw | request | body.* | Level C | api/order/order.js:90 signUpDraw |
| order.order.queryDrawStatus | request | body.* | Level C | api/order/order.js:103 queryDrawStatus |
| order.order.queryDramOrSignUpList | request | body.* | Level C | api/order/order.js:115 queryDramOrSignUpList |
| order.order.openHfWallet | request | body.* | Level C | api/order/order.js:124 openHfWallet |
| order.order.getWalletAddr | request | body.* | Level C | api/order/order.js:131 getWalletAddr |
| order.order.CreateHuifuAccountOrder | request | body.* | Level C | api/order/order.js:141 CreateHuifuAccountOrder |
| shop.shop.goodsList | request | body.* | Level C | api/shop/shop.js:5 goodsList |
| shop.shop.crystalDetail | request | body.* | Level C | api/shop/shop.js:14 crystalDetail |
| shop.shop.exchangeRecord | request | body.* | Level C | api/shop/shop.js:22 exchangeRecord |
| shop.shop.getGoodsInfo | request | body.* | Level C | api/shop/shop.js:33 getGoodsInfo |
| shop.shop.exchange | request | body.* | Level C | api/shop/shop.js:44 exchange |
| shop.shop.getECardPass | request | body.* | Level C | api/shop/shop.js:53 getECardPass |
| subscribe.subscribe | request | body.* | Level C | api/subscribe/index.js:7 subscribe |
| trad.getTradInfo | request | body.collection_id | Level A | api/trad/index.js:5 getTradInfo |
| trad.createTradOrder | request | body.* | Level C | api/trad/index.js:17 createTradOrder |
| trad.getMyBegInfo | request | body.order_id | Level A | api/trad/index.js:26 getMyBegInfo |
| trad.getMyTradeList | request | body.* | Level C | api/trad/index.js:36 getMyTradeList |
| trad.getBegBuyList | request | body.* | Level C | api/trad/index.js:45 getBegBuyList |
| trad.cancelBegBuy | request | body.order_id | Level A | api/trad/index.js:54 cancelBegBuy |
| trad.getSellBegInfo | request | body.* | Level C | api/trad/index.js:64 getSellBegInfo |
| trad.sell | request | body.* | Level C | api/trad/index.js:73 sell |
| trad.getSellInfo | request | body.* | Level C | api/trad/index.js:82 getSellInfo |
| user.oneLogin | request | body.* | Level C | api/user/index.js:9 oneLogin |
| user.login | request | body.* | Level C | api/user/index.js:23 login |
| user.sendSms | request | body.* | Level C | api/user/index.js:49 sendSms |
| user.register | request | body.* | Level C | api/user/index.js:63 register |
| user.updateUserInfo | request | body.* | Level C | api/user/index.js:75 updateUserInfo |
| user.applyCertAuth | request | body.* | Level C | api/user/index.js:87 applyCertAuth |
| user.bindBank | request | body.* | Level C | api/user/index.js:111 bindBank |
| user.setActionPwd | request | body.* | Level C | api/user/index.js:123 setActionPwd |
| user.resetLoginPwd | request | body.* | Level C | api/user/index.js:135 resetLoginPwd |
| user.searchUser | request | body.* | Level C | api/user/index.js:147 searchUser |
| user.applyIssuer | request | body.* | Level C | api/user/index.js:159 applyIssuer |
| user.cehckPayPassword | request | body.* | Level C | api/user/index.js:182 cehckPayPassword |
| user.flowDoc | request | body.* | Level C | api/user/index.js:191 flowDoc |
| user.delAccount | request | body.payPassword | Level A | api/user/index.js:204 delAccount |
| user.bei_yao_list | request | body.* | Level C | api/user/index.js:224 bei_yao_list |
| user.commison_rank | request | body.* | Level C | api/user/index.js:232 commison_rank |
| wallet.getWalletInfo | request | body.* | Level C | api/wallet/index.js:10 getWalletInfo |
| wallet.verifyMobileCodeForLL | request | body.* | Level C | api/wallet/index.js:38 verifyMobileCodeForLL |
| wallet.supplementInfo | request | body.* | Level C | api/wallet/index.js:53 supplementInfo |
| wallet.orderSmsCheck | request | body.* | Level C | api/wallet/index.js:80 orderSmsCheck |
| wallet.recharge | request | body.* | Level C | api/wallet/index.js:92 recharge |
| wallet.withdrawal | request | body.* | Level C | api/wallet/index.js:105 withdrawal |
| wallet.getWithdrawal | request | body.* | Level C | api/wallet/index.js:118 getWithdrawal |
| wallet.getWalletDetailList | request | body.* | Level C | api/wallet/index.js:130 getWalletDetailList |
| wallet.getLLBankList | request | body.* | Level C | api/wallet/index.js:143 getLLBankList |
| wallet.setLlDeaultBank | request | body.* | Level C | api/wallet/index.js:156 setLlDeaultBank |
| user.login | request | body.account | Level B | pages/login/login.vue:126 |
| user.login | request | body.password | Level B | pages/login/login.vue:127 |
| user.login | request | body.mobile | Level B | pages/login/login.vue:130 |
| user.login | request | body.captcha | Level B | pages/login/login.vue:132 |
| user.login | request | body.inviter_code | Level B | pages/login/login.vue:274 |
| user.register | request | body.mobile | Level B | pages/login/register.vue:106 |
| user.register | request | body.password | Level B | pages/login/register.vue:107 |
| user.register | request | body.code | Level B | pages/login/register.vue:108 |
| user.register | request | body.inviter_code | Level B | pages/login/register.vue:138 |
| user.applyCertAuth | request | body.real_name | Level B | pages/certification/components/certificationForm.vue:49 |
| user.applyCertAuth | request | body.id_card | Level B | pages/certification/components/certificationForm.vue:50 |
| market.getMarketBoxList | request | body.goods_type | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | request | body.page | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | request | body.list_rows | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | request | body.series_id | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | request | body.new | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | request | body.price | Level B | pages/market/market.vue:48 |
| market.getMarketBoxList | request | body.keywords | Level B | pages/market/search.vue:50 |
| market.getMarketList | request | body.goods_type | Level B | pages/market/market.vue:48 |
| market.getMarketList | request | body.page | Level B | pages/market/market.vue:48 |
| market.getMarketList | request | body.list_rows | Level B | pages/market/market.vue:48 |
| market.getMarketList | request | body.series_id | Level B | pages/market/market.vue:48 |
| market.getMarketList | request | body.keywords | Level B | pages/market/search.vue:50 |
| market.getMarketGoodsList | request | body.page | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | request | body.sort | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | request | body.type | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | request | body.id | Level B | pages/market/marketGoodsList.vue:184 |
| market.getMarketGoodsList | request | body.order | Level B | pages/market/marketGoodsList.vue:401 |
| order.order.signUpDraw | request | body.goods_id | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:184 |
| order.order.signUpDraw | request | body.goods_type | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:184 |
| order.order.signUpDraw | request | body.helpucode | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:188 |
| order.order.signUpDraw | request | body.newuser | Level B | components/z-draw-actionV2/z-draw-actionV2.vue:188 |
| notice.getNoticeList | response | data | Level B | components/w-notice/w-notice.vue:45 getNoticeList<br>pages/notice/components/notice-list.vue:144 getNoticeList |
| order.createOrder | response | order_sn | Level B | components/w-product-action/order-submit-pop.vue:149 createOrder<br>pages/order/orderSubmit.vue:201 createOrder |
| order.createOrder | response | order_id | Level B | components/w-product-action/order-submit-pop.vue:150 createOrder<br>pages/order/orderSubmit.vue:202 createOrder |
| order.createMarketOrder | response | order_id | Level B | components/w-product-action/order-submit-pop.vue:163 createMarketOrder<br>pages/order/orderSubmit.vue:214 createMarketOrder |
| order.createMarketOrder | response | order_sn | Level B | components/w-product-action/order-submit-pop.vue:167 createMarketOrder<br>pages/order/orderSubmit.vue:218 createMarketOrder |
| banner.getBannerList | response | data | Level B | components/w-swiper/w-swiper.vue:32 getBannerList |
| news.getActivityList | response | total | Level B | pages/activeSelected/activeSelected.vue:55 getActivityList<br>pages/index/index.vue:324 getActivityList |
| ext.invitercompound | response | stutus | Level B | pages/activity/exchange.vue:110 invitercompound<br>pages/activity/invitercompound.vue:87 invitercompound |
| ext.invitercompound | response | inviter_count | Level B | pages/activity/exchange.vue:111 invitercompound<br>pages/activity/invitercompound.vue:88 invitercompound |
| ext.invitercompound | response | compound_param | Level B | pages/activity/exchange.vue:112 invitercompound<br>pages/activity/invitercompound.vue:89 invitercompound |
| ext.invitercompound | response | collection_count | Level B | pages/activity/exchange.vue:113 invitercompound<br>pages/activity/invitercompound.vue:90 invitercompound |
| compound.synthesizeNow | response | recordId | Level B | pages/activity/exchange.vue:161 synthesizeNow<br>pages/activity/invitercompound.vue:144 synthesizeNow<br>pages/compound/schemeDetails.vue:154 synthesizeNow |
| box.getOpenRecord | response | total | Level B | pages/blindBox/openRecord.vue:51 getOpenRecord |
| box.getOpenRecord | response | data | Level B | pages/blindBox/openRecord.vue:54 getOpenRecord |
| compound.themeinfo | response | rule_text | Level B | pages/compound/compound.vue:51 themeinfo |
| collection.sellProduct | response | password_error | Level B | pages/consignments/consignments.vue:261 sellProduct |
| collection.sellProduct | response | id | Level B | pages/consignments/consignments.vue:266 sellProduct |
| integral.get_my_share_details | response | score | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:250 get_my_share_details |
| common.getRankingList | response | data.my_list | Level B | pages/invitation/components/recordList.vue:82 getRankingList |
| common.getConfig | response | copyright | Level B | pages/invitation/invitation.vue:189 getConfig |
| user.login | response | userinfo.token | Level B | pages/login/login.vue:286 login |
| user.login | response | userinfo.is_exist | Level B | pages/login/login.vue:287 login |
| user.register | response | userinfo.is_exist | Level B | pages/login/register.vue:253 register |
| user.register | response | userinfo.token | Level B | pages/login/register.vue:256 register |
| lottery.lotteryInfoApi | response | content | Level B | pages/lottery/lottery - 副本.vue:79 lotteryInfoApi<br>pages/lottery/lottery.vue:150 lotteryInfoApi<br>pages/lottery/lottery.vue:150 |
| trad.getBegBuyList | response | data | Level B | pages/market/components/BegBuyList.vue:106 getBegBuyList |
| trad.getBegBuyList | response | per_page | Level B | pages/market/components/BegBuyList.vue:110 getBegBuyList |
| trad.getBegBuyList | response | total | Level B | pages/market/components/BegBuyList.vue:113 getBegBuyList |
| market.getMarketDetails | response | goods_type | Level B | pages/market/detail.vue:100 getMarketDetails |
| market.getMarketDetails | response | price | Level B | pages/market/detail.vue:101 getMarketDetails |
| market.getMarketBoxList | response | total | Level B | pages/market/market.vue:142 getMarketBoxList<br>pages/market/search.vue:105 getMarketBoxList |
| market.getMarketBoxList | response | data | Level B | pages/market/market.vue:145 getMarketBoxList<br>pages/market/search.vue:99 getMarketBoxList |
| market.getMarketGoodsList | response | list | Level B | pages/market/marketGoodsList.vue:404 getMarketGoodsList |
| order.fastCreateOrder | response | order_sn | Level B | pages/market/marketGoodsList.vue:312 fastCreateOrder |
| order.fastCreateOrder | response | order_id | Level B | pages/market/marketGoodsList.vue:315 fastCreateOrder |
| trad.sell | response | password_error | Level B | pages/market/sellBegBuy.vue:230 sell |
| user.cehckPayPassword | response | code | Level B | pages/my/actionPwd/getCode.vue:215 cehckPayPassword |
| collection.user_collection_Detail | response | list | Level B | pages/myCollection/components/popDetails.vue:134 user_collection_Detail |
| notice.getNewsList | response | data | Level B | pages/notice/components/new-list.vue:131 getNewsList |
| notice.getWallList | response | data | Level B | pages/notice/components/wall-list.vue:121 getWallList |
| trad.getMyTradeList | response | data | Level B | pages/order/beg/list.vue:139 getMyTradeList |
| trad.getMyTradeList | response | per_page | Level B | pages/order/beg/list.vue:143 getMyTradeList |
| trad.getMyTradeList | response | total | Level B | pages/order/beg/list.vue:146 getMyTradeList |
| wallet.openYiBao | response | info | Level B | pages/order/components/payType.vue:149 openYiBao<br>pages/wallet/wallet.vue:117 openYiBao<br>pages/wallet/wallet.vue:133 openYiBao |
| order.getOderList | response | total | Level B | pages/order/list.vue:270 getOderList |
| order.getOderList | response | data | Level B | pages/order/list.vue:273 getOderList |
| order.getBatchOrderList | response | data | Level B | pages/order/list.vue:289 getBatchOrderList |
| order.createBatchPayOrder | response | order_type | Level B | pages/order/list.vue:226 createBatchPayOrder |
| collection.getGiveRecord | response | data | Level B | pages/regift/record.vue:99 getGiveRecord |
| collection.getGiveRecord | response | total | Level B | pages/regift/record.vue:103 getGiveRecord |
| common.getRankingList | response | activityRule | Level B | pages/rules/rules.vue:45 getRankingList |
| shop.shop.exchange | response | password_error | Level B | pages/shop/exchange.vue:197 exchange |
| shop.shop.exchange | response | id | Level B | pages/shop/exchange.vue:206 exchange |
| wallet.getHuiFuInfo | response | info | Level B | pages/wallet/wallet.vue:133 getHuiFuInfo |
| common.getVersion | response | download_url | Level B | utils/autoUpdate.js:43 getVersion |
| common.getVersion | response | updateType | Level B | utils/autoUpdate.js:45 getVersion |
| common.getVersion | response | version | Level B | utils/autoUpdate.js:50 getVersion |
| order.doPay | response | balancePay | Level B | utils/payUtil.js:58 doPay |
| user.getUserInfo | response | id | Level B | store/modules/user.js:10 |
| user.getUserInfo | response | mobile | Level B | mixins/globalMixin.js:17 |
| wallet.getHuiFuInfo | response | info.redirect_url | Level B | pages/wallet/wallet.vue:133 |
| wallet.openHuiFu | response | redirect_url | Level B | components/w-radio-account/w-radio-account.vue:70 |
| wallet.openHuiFu | response | price | Level B | components/w-radio-account/w-radio-account.vue:71 |
| wallet.openHuiFu | response | mer_cust_id | Level B | pages/wallet/wallet.vue:144 |
| wallet.openHuiFu | response | info.redirect_url | Level B | pages/wallet/wallet.vue:147 |
| wallet.openHuiFu | response | resp_code | Level B | pages/wallet/wallet.vue:149 |
| wallet.openHuiFu | response | resp_desc | Level B | pages/wallet/wallet.vue:150 |
| wallet.openYiBao | response | info.redirect_url | Level B | components/w-radio-account/w-radio-account.vue:84 |
| draw.getDraw | response | codeList | Level B | pages/activity/draw.vue:81 |
| draw.getDraw | response | winning_time | Level B | pages/activity/draw.vue:20 |
| draw.getDraw | response | remaining_invited | Level B | pages/activity/draw.vue:28 |
| draw.getDraw | response | remaining | Level B | pages/activity/draw.vue:26 |
| draw.getDraw | response | reg_start_time | Level B | pages/activity/draw.vue:201 |
| draw.getDraw | response | reg_end_time | Level B | pages/activity/draw.vue:212 |
| draw.getDraw | response | content | Level B | pages/activity/draw.vue:279 |
| draw.draw | response | $primitive:string | Level B | pages/activity/draw.vue:258 |
| draw.drawRecord | response | $array | Level B | pages/activity/draw.vue:247 |
| draw.drawLog | response | $array | Level B | pages/activity/record.vue:45 |
| collection.getCalenderList | response | id | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | batch_id | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | goods_type | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | listimg | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | name | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | publisher.company_logo | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | publisher.name | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | total_num | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | response | price | Level B | components/w-index-collection/w-index-collection.vue:20 |
| market.getMarketList | response | id | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.id | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | goods_type | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.goods_type | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | flux | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.flux | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | is_out | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.is_out | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | total_num | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.total_num | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | min_price | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.min_price | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | price | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.price | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | product.id | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.product.id | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | product.listimg | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.product.listimg | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | response | product.name | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | response | data.product.name | Level B | pages/market/components/marketCard.vue:2 |
| order.getOrderDetails | response | order_status | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | order_type | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | surplus_time_text | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | updatetime | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | goods_type | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | price | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | total_price | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | goods_cover_image | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | goods_name | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | collection_code | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | num | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | order_sn | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | pay_way | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | response | card | Level B | pages/order/defaultDetail.vue:39 |
| lottery.lotteryInfoApi | response | id | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryInfoApi | response | remaining | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryInfoApi | response | type | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryInfoApi | response | display_lottery_log | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryStatistics | response | $array | Level B | pages/lottery/lottery.vue:138 |
| lottery.lotteryStatistics | response | lottery_image | Level B | pages/lottery/lottery.vue:14 |
| lottery.lotteryRecord | response | data | Level B | pages/lottery/record.vue:96 |
| lottery.lotteryRecord | response | last_page | Level B | pages/lottery/record.vue:99 |
| common.getConfig | response | appLogo | Level B | store/modules/config.js:41 |
| common.getConfig | response | appName | Level B | store/modules/config.js:41 |
| common.getConfig | response | default_pay_type | Level B | store/modules/config.js:41 |
| common.getConfig | response | h5_domain | Level B | store/modules/config.js:41 |
| common.getConfig | response | qq_team_num | Level B | store/modules/config.js:41 |
| common.getConfig | response | purchase_sale_details | Level B | store/modules/config.js:41 |
| common.getConfig | response | service_image | Level B | store/modules/config.js:41 |
| common.getConfig | response | comm_desc | Level B | store/modules/config.js:41 |
| common.getConfig | response | draw_lots_notice | Level B | store/modules/config.js:41 |
| common.getConfig | response | olduser_dayhelp_num | Level B | store/modules/config.js:41 |
| common.getConfig | response | fastOrder_check | Level B | store/modules/config.js:41 |
| common.getConfig | response | batchBuy_check | Level B | store/modules/config.js:41 |
| common.getConfig | response | normal_check | Level B | store/modules/config.js:41 |
| common.getConfig | response | synthetic_check | Level B | store/modules/config.js:41 |
| common.getPageConfig | response | $array | Level B | store/modules/config.js:93 |
| common.getPageConfig | response | content | Level B | store/modules/config.js:96 |
| collection.getUserCollectionDetails | response | product | Level B | pages/myCollection/collectionDetails.vue:62 |
| collection.getUserCollectionDetails | response | types | Level B | pages/myCollection/collectionDetails.vue:62 |
| collection.getUserCollectionDetails | response | user_hash | Level B | pages/myCollection/collectionDetails.vue:62 |
| collection.getUserCollectionDetails | response | rz_code | Level B | pages/myCollection/collectionDetails.vue:62 |
