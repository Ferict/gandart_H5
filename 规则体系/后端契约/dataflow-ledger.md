# Dataflow Ledger

> 文档类型：后端契约数据流台账
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件记录旧前端响应字段数据流证据，用于接驳审查和字段候选判断。

## Response fields

| operationId | fieldPath | consumer | confidence | evidence |
| --- | --- | --- | --- | --- |
| notice.getNoticeList | data | components/w-notice/w-notice.vue | Level B | components/w-notice/w-notice.vue:45 getNoticeList<br>pages/notice/components/notice-list.vue:144 getNoticeList |
| order.createOrder | order_sn | components/w-product-action/order-submit-pop.vue | Level B | components/w-product-action/order-submit-pop.vue:149 createOrder<br>pages/order/orderSubmit.vue:201 createOrder |
| order.createOrder | order_id | components/w-product-action/order-submit-pop.vue | Level B | components/w-product-action/order-submit-pop.vue:150 createOrder<br>pages/order/orderSubmit.vue:202 createOrder |
| order.createMarketOrder | order_id | components/w-product-action/order-submit-pop.vue | Level B | components/w-product-action/order-submit-pop.vue:163 createMarketOrder<br>pages/order/orderSubmit.vue:214 createMarketOrder |
| order.createMarketOrder | order_sn | components/w-product-action/order-submit-pop.vue | Level B | components/w-product-action/order-submit-pop.vue:167 createMarketOrder<br>pages/order/orderSubmit.vue:218 createMarketOrder |
| banner.getBannerList | data | components/w-swiper/w-swiper.vue | Level B | components/w-swiper/w-swiper.vue:32 getBannerList |
| news.getActivityList | total | pages/activeSelected/activeSelected.vue | Level B | pages/activeSelected/activeSelected.vue:55 getActivityList<br>pages/index/index.vue:324 getActivityList |
| ext.invitercompound | stutus | pages/activity/exchange.vue | Level B | pages/activity/exchange.vue:110 invitercompound<br>pages/activity/invitercompound.vue:87 invitercompound |
| ext.invitercompound | inviter_count | pages/activity/exchange.vue | Level B | pages/activity/exchange.vue:111 invitercompound<br>pages/activity/invitercompound.vue:88 invitercompound |
| ext.invitercompound | compound_param | pages/activity/exchange.vue | Level B | pages/activity/exchange.vue:112 invitercompound<br>pages/activity/invitercompound.vue:89 invitercompound |
| ext.invitercompound | collection_count | pages/activity/exchange.vue | Level B | pages/activity/exchange.vue:113 invitercompound<br>pages/activity/invitercompound.vue:90 invitercompound |
| compound.synthesizeNow | recordId | pages/activity/exchange.vue | Level B | pages/activity/exchange.vue:161 synthesizeNow<br>pages/activity/invitercompound.vue:144 synthesizeNow<br>pages/compound/schemeDetails.vue:154 synthesizeNow |
| box.getOpenRecord | total | pages/blindBox/openRecord.vue | Level B | pages/blindBox/openRecord.vue:51 getOpenRecord |
| box.getOpenRecord | data | pages/blindBox/openRecord.vue | Level B | pages/blindBox/openRecord.vue:54 getOpenRecord |
| compound.themeinfo | rule_text | pages/compound/compound.vue | Level B | pages/compound/compound.vue:51 themeinfo |
| collection.sellProduct | password_error | pages/consignments/consignments.vue | Level B | pages/consignments/consignments.vue:261 sellProduct |
| collection.sellProduct | id | pages/consignments/consignments.vue | Level B | pages/consignments/consignments.vue:266 sellProduct |
| integral.get_my_share_details | score | pages/draw/shareCommunityGroup/shareCommunityGroup.vue | Level B | pages/draw/shareCommunityGroup/shareCommunityGroup.vue:250 get_my_share_details |
| common.getRankingList | data.my_list | pages/invitation/components/recordList.vue | Level B | pages/invitation/components/recordList.vue:82 getRankingList |
| common.getConfig | copyright | pages/invitation/invitation.vue | Level B | pages/invitation/invitation.vue:189 getConfig |
| user.login | userinfo.token | pages/login/login.vue | Level B | pages/login/login.vue:286 login |
| user.login | userinfo.is_exist | pages/login/login.vue | Level B | pages/login/login.vue:287 login |
| user.register | userinfo.is_exist | pages/login/register.vue | Level B | pages/login/register.vue:253 register |
| user.register | userinfo.token | pages/login/register.vue | Level B | pages/login/register.vue:256 register |
| lottery.lotteryInfoApi | content | pages/lottery/lottery - 副本.vue | Level B | pages/lottery/lottery - 副本.vue:79 lotteryInfoApi<br>pages/lottery/lottery.vue:150 lotteryInfoApi<br>pages/lottery/lottery.vue:150 |
| trad.getBegBuyList | data | pages/market/components/BegBuyList.vue | Level B | pages/market/components/BegBuyList.vue:106 getBegBuyList |
| trad.getBegBuyList | per_page | pages/market/components/BegBuyList.vue | Level B | pages/market/components/BegBuyList.vue:110 getBegBuyList |
| trad.getBegBuyList | total | pages/market/components/BegBuyList.vue | Level B | pages/market/components/BegBuyList.vue:113 getBegBuyList |
| market.getMarketDetails | goods_type | pages/market/detail.vue | Level B | pages/market/detail.vue:100 getMarketDetails |
| market.getMarketDetails | price | pages/market/detail.vue | Level B | pages/market/detail.vue:101 getMarketDetails |
| market.getMarketBoxList | total | pages/market/market.vue | Level B | pages/market/market.vue:142 getMarketBoxList<br>pages/market/search.vue:105 getMarketBoxList |
| market.getMarketBoxList | data | pages/market/market.vue | Level B | pages/market/market.vue:145 getMarketBoxList<br>pages/market/search.vue:99 getMarketBoxList |
| market.getMarketGoodsList | list | pages/market/marketGoodsList.vue | Level B | pages/market/marketGoodsList.vue:404 getMarketGoodsList |
| order.fastCreateOrder | order_sn | pages/market/marketGoodsList.vue | Level B | pages/market/marketGoodsList.vue:312 fastCreateOrder |
| order.fastCreateOrder | order_id | pages/market/marketGoodsList.vue | Level B | pages/market/marketGoodsList.vue:315 fastCreateOrder |
| trad.sell | password_error | pages/market/sellBegBuy.vue | Level B | pages/market/sellBegBuy.vue:230 sell |
| user.cehckPayPassword | code | pages/my/actionPwd/getCode.vue | Level B | pages/my/actionPwd/getCode.vue:215 cehckPayPassword |
| collection.user_collection_Detail | list | pages/myCollection/components/popDetails.vue | Level B | pages/myCollection/components/popDetails.vue:134 user_collection_Detail |
| notice.getNewsList | data | pages/notice/components/new-list.vue | Level B | pages/notice/components/new-list.vue:131 getNewsList |
| notice.getWallList | data | pages/notice/components/wall-list.vue | Level B | pages/notice/components/wall-list.vue:121 getWallList |
| trad.getMyTradeList | data | pages/order/beg/list.vue | Level B | pages/order/beg/list.vue:139 getMyTradeList |
| trad.getMyTradeList | per_page | pages/order/beg/list.vue | Level B | pages/order/beg/list.vue:143 getMyTradeList |
| trad.getMyTradeList | total | pages/order/beg/list.vue | Level B | pages/order/beg/list.vue:146 getMyTradeList |
| wallet.openYiBao | info | pages/order/components/payType.vue | Level B | pages/order/components/payType.vue:149 openYiBao<br>pages/wallet/wallet.vue:117 openYiBao<br>pages/wallet/wallet.vue:133 openYiBao |
| order.getOderList | total | pages/order/list.vue | Level B | pages/order/list.vue:270 getOderList |
| order.getOderList | data | pages/order/list.vue | Level B | pages/order/list.vue:273 getOderList |
| order.getBatchOrderList | data | pages/order/list.vue | Level B | pages/order/list.vue:289 getBatchOrderList |
| order.createBatchPayOrder | order_type | pages/order/list.vue | Level B | pages/order/list.vue:226 createBatchPayOrder |
| collection.getGiveRecord | data | pages/regift/record.vue | Level B | pages/regift/record.vue:99 getGiveRecord |
| collection.getGiveRecord | total | pages/regift/record.vue | Level B | pages/regift/record.vue:103 getGiveRecord |
| common.getRankingList | activityRule | pages/rules/rules.vue | Level B | pages/rules/rules.vue:45 getRankingList |
| shop.shop.exchange | password_error | pages/shop/exchange.vue | Level B | pages/shop/exchange.vue:197 exchange |
| shop.shop.exchange | id | pages/shop/exchange.vue | Level B | pages/shop/exchange.vue:206 exchange |
| wallet.getHuiFuInfo | info | pages/wallet/wallet.vue | Level B | pages/wallet/wallet.vue:133 getHuiFuInfo |
| common.getVersion | download_url | utils/autoUpdate.js | Level B | utils/autoUpdate.js:43 getVersion |
| common.getVersion | updateType | utils/autoUpdate.js | Level B | utils/autoUpdate.js:45 getVersion |
| common.getVersion | version | utils/autoUpdate.js | Level B | utils/autoUpdate.js:50 getVersion |
| order.doPay | balancePay | utils/payUtil.js | Level B | utils/payUtil.js:58 doPay |
| user.getUserInfo | id | store/modules/user.js | Level B | store/modules/user.js:10 |
| user.getUserInfo | mobile | mixins/globalMixin.js | Level B | mixins/globalMixin.js:17 |
| wallet.getHuiFuInfo | info.redirect_url | pages/wallet/wallet.vue | Level B | pages/wallet/wallet.vue:133 |
| wallet.openHuiFu | redirect_url | components/w-radio-account/w-radio-account.vue | Level B | components/w-radio-account/w-radio-account.vue:70 |
| wallet.openHuiFu | price | components/w-radio-account/w-radio-account.vue | Level B | components/w-radio-account/w-radio-account.vue:71 |
| wallet.openHuiFu | mer_cust_id | pages/wallet/wallet.vue | Level B | pages/wallet/wallet.vue:144 |
| wallet.openHuiFu | info.redirect_url | pages/wallet/wallet.vue | Level B | pages/wallet/wallet.vue:147 |
| wallet.openHuiFu | resp_code | pages/wallet/wallet.vue | Level B | pages/wallet/wallet.vue:149 |
| wallet.openHuiFu | resp_desc | pages/wallet/wallet.vue | Level B | pages/wallet/wallet.vue:150 |
| wallet.openYiBao | info.redirect_url | components/w-radio-account/w-radio-account.vue | Level B | components/w-radio-account/w-radio-account.vue:84 |
| draw.getDraw | codeList | pages/activity/draw.vue | Level B | pages/activity/draw.vue:81 |
| draw.getDraw | winning_time | pages/activity/draw.vue | Level B | pages/activity/draw.vue:20 |
| draw.getDraw | remaining_invited | pages/activity/draw.vue | Level B | pages/activity/draw.vue:28 |
| draw.getDraw | remaining | pages/activity/draw.vue | Level B | pages/activity/draw.vue:26 |
| draw.getDraw | reg_start_time | pages/activity/draw.vue | Level B | pages/activity/draw.vue:201 |
| draw.getDraw | reg_end_time | pages/activity/draw.vue | Level B | pages/activity/draw.vue:212 |
| draw.getDraw | content | pages/activity/draw.vue | Level B | pages/activity/draw.vue:279 |
| draw.draw | $primitive:string | pages/activity/draw.vue | Level B | pages/activity/draw.vue:258 |
| draw.drawRecord | $array | pages/activity/draw.vue | Level B | pages/activity/draw.vue:247 |
| draw.drawLog | $array | pages/activity/record.vue | Level B | pages/activity/record.vue:45 |
| collection.getCalenderList | id | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | batch_id | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | goods_type | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | listimg | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | name | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | publisher.company_logo | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | publisher.name | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | total_num | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| collection.getCalenderList | price | components/w-index-collection/w-index-collection.vue | Level B | components/w-index-collection/w-index-collection.vue:20 |
| market.getMarketList | id | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.id | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | goods_type | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.goods_type | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | flux | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.flux | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | is_out | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.is_out | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | total_num | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.total_num | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | min_price | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.min_price | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | price | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.price | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | product.id | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.product.id | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | product.listimg | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.product.listimg | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketList | product.name | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| market.getMarketBoxList | data.product.name | pages/market/components/marketCard.vue | Level B | pages/market/components/marketCard.vue:2 |
| order.getOrderDetails | order_status | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | order_type | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | surplus_time_text | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | updatetime | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | goods_type | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | price | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | total_price | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | goods_cover_image | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | goods_name | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | collection_code | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | num | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | order_sn | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | pay_way | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| order.getOrderDetails | card | pages/order/defaultDetail.vue | Level B | pages/order/defaultDetail.vue:39 |
| lottery.lotteryInfoApi | id | pages/lottery/lottery.vue | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryInfoApi | remaining | pages/lottery/lottery.vue | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryInfoApi | type | pages/lottery/lottery.vue | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryInfoApi | display_lottery_log | pages/lottery/lottery.vue | Level B | pages/lottery/lottery.vue:32 |
| lottery.lotteryStatistics | $array | pages/lottery/lottery.vue | Level B | pages/lottery/lottery.vue:138 |
| lottery.lotteryStatistics | lottery_image | pages/lottery/lottery.vue | Level B | pages/lottery/lottery.vue:14 |
| lottery.lotteryRecord | data | pages/lottery/record.vue | Level B | pages/lottery/record.vue:96 |
| lottery.lotteryRecord | last_page | pages/lottery/record.vue | Level B | pages/lottery/record.vue:99 |
| common.getConfig | appLogo | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | appName | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | default_pay_type | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | h5_domain | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | qq_team_num | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | purchase_sale_details | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | service_image | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | comm_desc | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | draw_lots_notice | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | olduser_dayhelp_num | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | fastOrder_check | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | batchBuy_check | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | normal_check | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getConfig | synthetic_check | store/modules/config.js | Level B | store/modules/config.js:41 |
| common.getPageConfig | $array | store/modules/config.js | Level B | store/modules/config.js:93 |
| common.getPageConfig | content | store/modules/config.js | Level B | store/modules/config.js:96 |
| collection.getUserCollectionDetails | product | pages/myCollection/collectionDetails.vue | Level B | pages/myCollection/collectionDetails.vue:62 |
| collection.getUserCollectionDetails | types | pages/myCollection/collectionDetails.vue | Level B | pages/myCollection/collectionDetails.vue:62 |
| collection.getUserCollectionDetails | user_hash | pages/myCollection/collectionDetails.vue | Level B | pages/myCollection/collectionDetails.vue:62 |
| collection.getUserCollectionDetails | rz_code | pages/myCollection/collectionDetails.vue | Level B | pages/myCollection/collectionDetails.vue:62 |

## Runtime derived fields

| fieldPath | sourceField | consumer | deriveRule | evidence |
| --- | --- | --- | --- | --- |
| JSON.parse(*) | dynamic JSON string | components/lime-painter/index.vue | return this.board && JSON.parse(JSON.stringify(this.board)) | components/lime-painter/index.vue:78 |
| JSON.parse(*) | dynamic JSON string | components/w-copyright/w-copyright.vue | return JSON.parse(this.appConfig.copyright) | components/w-copyright/w-copyright.vue:26 |
| JSON.parse(*) | dynamic JSON string | components/w-kline/w-kline.vue | this.chartData = JSON.parse(JSON.stringify(res)); | components/w-kline/w-kline.vue:110 |
| hide_mobile | frontend runtime derivation | mixins/globalMixin.js | hide_mobile: state.userInfo.mobile ? state.userInfo.mobile.replace(/^(\d{3})\d{4}(\d{4})$/, | mixins/globalMixin.js:17 |
| JSON.parse(*) | dynamic JSON string | pages/activeSelected/activeSelected.vue | let search = JSON.parse(JSON.stringify(this.activityPage)) | pages/activeSelected/activeSelected.vue:63 |
| statusText | frontend runtime derivation | pages/compound/record.vue | statusText:{ | pages/compound/record.vue:47 |
| statusText | frontend runtime derivation | pages/compound/result.vue | statusText: { | pages/compound/result.vue:79 |
| JSON.parse(*) | dynamic JSON string | pages/consignments/search.vue | this.history = JSON.parse(list); | pages/consignments/search.vue:161 |
| JSON.parse(*) | dynamic JSON string | pages/draw/communityShare/communityShare.vue | this.form = {...JSON.parse(data),...this.form} | pages/draw/communityShare/communityShare.vue:239 |
| JSON.parse(*) | dynamic JSON string | pages/draw/drawResult/drawResult.vue | this.form = JSON.parse(data) | pages/draw/drawResult/drawResult.vue:71 |
| JSON.parse(*) | dynamic JSON string | pages/draw/Leaderboard/Leaderboard.vue | if(data) this.form = JSON.parse(data) | pages/draw/Leaderboard/Leaderboard.vue:42 |
| JSON.parse(*) | dynamic JSON string | pages/index/index.vue | let search = JSON.parse(JSON.stringify(this.tabIndex ? this.boxPageInfo : this.collectionPageInfo)) | pages/index/index.vue:332 |
| JSON.parse(*) | dynamic JSON string | pages/index/index.vue | let search = JSON.parse(JSON.stringify(this.activityPage)) | pages/index/index.vue:336 |
| JSON.parse(*) | dynamic JSON string | pages/invitation/invitation.vue | res.data.copyright && (this.info.copyright = JSON.parse(res.data.copyright)[0].img) | pages/invitation/invitation.vue:189 |
| JSON.parse(*) | dynamic JSON string | pages/notice/components/new-list.vue | let search = JSON.parse(JSON.stringify(this.search)) | pages/notice/components/new-list.vue:69 |
| JSON.parse(*) | dynamic JSON string | pages/notice/components/new-list.vue | let search = JSON.parse(JSON.stringify(this.search)) | pages/notice/components/new-list.vue:75 |
| JSON.parse(*) | dynamic JSON string | pages/notice/components/notice-list.vue | let search = JSON.parse(JSON.stringify(this.search)) | pages/notice/components/notice-list.vue:76 |
| JSON.parse(*) | dynamic JSON string | pages/notice/components/notice-list.vue | let search = JSON.parse(JSON.stringify(this.search)) | pages/notice/components/notice-list.vue:82 |
| JSON.parse(*) | dynamic JSON string | pages/notice/search.vue | this.history = JSON.parse(list); | pages/notice/search.vue:143 |
| JSON.parse(*) | dynamic JSON string | store/modules/config.js | v.content = JSON.parse(v.content) | store/modules/config.js:96 |
| JSON.parse(*) | dynamic JSON string | utils/tools.js | return JSON.parse(JSON.stringify(obj)); | utils/tools.js:84 |
| JSON.parse(*) | dynamic JSON string | utils/upload.js | let successData = JSON.parse(res.data) | utils/upload.js:76 |
