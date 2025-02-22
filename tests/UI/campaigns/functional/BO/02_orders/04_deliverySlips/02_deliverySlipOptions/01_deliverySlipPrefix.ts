// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
import deliverySlipsPage from '@pages/BO/orders/deliverySlips';

import {
  boDashboardPage,
  boOrdersPage,
  boOrdersViewBlockTabListPage,
  dataOrderStatuses,
  FakerOrderDeliverySlipOptions,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

const baseContext: string = 'functional_BO_orders_deliverySlips_deliverySlipOptions_deliverySlipPrefix';

/*
Edit delivery slip prefix
Change the Order status to Shipped
Check the delivery slip file name
Back to the default delivery slip prefix value
 */
describe('BO - Orders - Delivery slips : Update delivery slip prefix and check the generated file name', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let fileName: string;

  const deliverySlipData: FakerOrderDeliverySlipOptions = new FakerOrderDeliverySlipOptions();
  const defaultPrefix: string = '#DE';

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  describe('Update the delivery slip prefix', async () => {
    it('should go to \'Orders > Delivery slip\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToDeliverySlipsPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.ordersParentLink,
        boDashboardPage.deliverySlipslink,
      );
      await deliverySlipsPage.closeSfToolBar(page);

      const pageTitle = await deliverySlipsPage.getPageTitle(page);
      expect(pageTitle).to.contains(deliverySlipsPage.pageTitle);
    });

    it(`should update the delivery slip prefix to ${deliverySlipData.prefix}`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'updateDeliverySlipsPrefix', baseContext);

      await deliverySlipsPage.changePrefix(page, deliverySlipData.prefix);

      const textMessage = await deliverySlipsPage.saveDeliverySlipOptions(page);
      expect(textMessage).to.contains(deliverySlipsPage.successfulUpdateMessage);
    });
  });

  describe(`Update the order status to '${dataOrderStatuses.shipped.name}' and check the file name`, async () => {
    it('should go to \'Orders > Orders\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOrdersPage', baseContext);

      await deliverySlipsPage.goToSubMenu(
        page,
        deliverySlipsPage.ordersParentLink,
        deliverySlipsPage.ordersLink,
      );

      const pageTitle = await boOrdersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boOrdersPage.pageTitle);
    });

    it('should go to the first order page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToFirstOrderPage', baseContext);

      await boOrdersPage.goToOrder(page, 1);

      const pageTitle = await boOrdersViewBlockTabListPage.getPageTitle(page);
      expect(pageTitle).to.contains(boOrdersViewBlockTabListPage.pageTitle);
    });

    it(`should change the order status to '${dataOrderStatuses.shipped.name}' and check it`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'updateOrderStatus', baseContext);

      const result = await boOrdersViewBlockTabListPage.modifyOrderStatus(page, dataOrderStatuses.shipped.name);
      expect(result).to.equal(dataOrderStatuses.shipped.name);
    });

    it(`should check that the delivery slip file name contain '${deliverySlipData.prefix}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkDocumentNamePrefix', baseContext);

      // Get delivery slips filename
      fileName = await boOrdersViewBlockTabListPage.getFileName(page, 3);
      expect(fileName).to.contains(deliverySlipData.prefix.replace('#', '').trim());
    });
  });

  describe(`Back to the default delivery slip prefix value '${defaultPrefix}'`, async () => {
    it('should go to \'Orders > Delivery slips\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToDeliverySlipsPageBackToDefaultValue', baseContext);

      await boOrdersViewBlockTabListPage.goToSubMenu(
        page,
        boOrdersViewBlockTabListPage.ordersParentLink,
        boOrdersViewBlockTabListPage.deliverySlipslink,
      );
      await deliverySlipsPage.closeSfToolBar(page);

      const pageTitle = await deliverySlipsPage.getPageTitle(page);
      expect(pageTitle).to.contains(deliverySlipsPage.pageTitle);
    });

    it(`should update the delivery slip prefix to '${defaultPrefix}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'backToDefaultPrefixValue', baseContext);

      await deliverySlipsPage.changePrefix(page, defaultPrefix);

      const textMessage = await deliverySlipsPage.saveDeliverySlipOptions(page);
      expect(textMessage).to.contains(deliverySlipsPage.successfulUpdateMessage);
    });
  });
});
