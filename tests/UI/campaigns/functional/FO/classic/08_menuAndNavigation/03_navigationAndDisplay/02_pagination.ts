// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  boDashboardPage,
  boProductSettingsPage,
  foClassicCategoryPage,
  foClassicHomePage,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_FO_classic_menuAndNavigation_navigationAndDisplay_pagination';

/*
Scenario:
- Go to FO>All products page
- Check the pagination in the bottom of the page
- Click on next then on previous
- Edit products per page number to 6 in BO
- Check the new pagination in FO
- Edit products per page number to 20
- Check the new pagination
Post-condition:
- Reset 'Number of products per page'
 */
describe('FO - Navigation and display : Pagination', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  describe('FO - Pagination next and previous', async () => {
    it('should open the shop page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'openShopPage', baseContext);

      await foClassicHomePage.goTo(page, global.FO.URL);

      const result = await foClassicHomePage.isHomePage(page);
      expect(result).to.eq(true);
    });

    it('should go to all products page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAllProducts', baseContext);

      await foClassicHomePage.changeLanguage(page, 'en');
      await foClassicHomePage.goToAllProductsPage(page);

      const isCategoryPageVisible = await foClassicCategoryPage.isCategoryPage(page);
      expect(isCategoryPageVisible, 'Home category page was not opened').to.eq(true);
    });

    it('should check the number of products on the page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'numberOfProducts', baseContext);

      const numberOfProducts = await foClassicCategoryPage.getNumberOfProducts(page);
      expect(numberOfProducts).to.eql(19);
    });

    it('should check the pagination in the bottom of the page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPaginationLabel', baseContext);

      const pagesList = await foClassicCategoryPage.getPagesList(page);
      expect(pagesList).to.contain('1 2 Next');
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext', baseContext);

      await foClassicCategoryPage.goToNextPage(page);

      const numberOfItems = await foClassicCategoryPage.getShowingItems(page);
      expect(numberOfItems).to.eq('Showing 13-19 of 19 item(s)');
    });

    it('should check the pagination in the bottom of the page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPaginationLabel1', baseContext);

      const pagesList = await foClassicCategoryPage.getPagesList(page);
      expect(pagesList).to.contain('Previous 1 2');
    });

    it('should click on previous', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnPrevious', baseContext);

      await foClassicCategoryPage.goToPreviousPage(page);

      const numberOfItems = await foClassicCategoryPage.getShowingItems(page);
      expect(numberOfItems).to.eq('Showing 1-12 of 19 item(s)');
    });
  });

  describe('BO - Edit products per page number to 6', async () => {
    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Shop parameters > Product Settings\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToProductSettingsPage1', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.shopParametersParentLink,
        boDashboardPage.productSettingsLink,
      );

      const pageTitle = await boProductSettingsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boProductSettingsPage.pageTitle);
    });

    it('should change the number of products per page to 6', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeNumberOfDays0', baseContext);

      const result = await boProductSettingsPage.setProductsDisplayedPerPage(page, 6);
      expect(result).to.contains(boProductSettingsPage.successfulUpdateMessage);
    });
  });

  describe('FO - Check the new pagination', async () => {
    it('should view my shop page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToShopFO1', baseContext);

      page = await boProductSettingsPage.viewMyShop(page);
      await foClassicHomePage.changeLanguage(page, 'en');

      const result = await foClassicHomePage.isHomePage(page);
      expect(result).to.eq(true);
    });

    it('should go to all products page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAllProducts1', baseContext);

      await foClassicHomePage.changeLanguage(page, 'en');
      await foClassicHomePage.goToAllProductsPage(page);

      const isCategoryPageVisible = await foClassicCategoryPage.isCategoryPage(page);
      expect(isCategoryPageVisible, 'Home category page was not opened').to.eq(true);
    });

    it('should check the number of products on the page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'numberOfProducts2', baseContext);

      const numberOfProducts = await foClassicCategoryPage.getNumberOfProducts(page);
      expect(numberOfProducts).to.eql(19);
    });

    it('should check the pagination in the bottom of the page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPaginationLabel2', baseContext);

      const pagesList = await foClassicCategoryPage.getPagesList(page);
      expect(pagesList).to.contain('1 2 3 4 Next');
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext1', baseContext);

      await foClassicCategoryPage.goToNextPage(page);

      const numberOfItems = await foClassicCategoryPage.getShowingItems(page);
      expect(numberOfItems).to.eq('Showing 7-12 of 19 item(s)');
    });

    it('should check the pagination in the bottom of the page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPaginationLabel3', baseContext);

      const pagesList = await foClassicCategoryPage.getPagesList(page);
      expect(pagesList).to.contain('Previous 1 2 3 4 Next');
    });

    it('should click on previous', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnPrevious1', baseContext);

      await foClassicCategoryPage.goToPreviousPage(page);

      const numberOfItems = await foClassicCategoryPage.getShowingItems(page);
      expect(numberOfItems).to.eq('Showing 1-6 of 19 item(s)');
    });
  });

  describe('BO - Edit products per page number to 20', async () => {
    it('should close the FO page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'closeFOPage', baseContext);

      page = await foClassicHomePage.closePage(browserContext, page, 0);

      const pageTitle = await boProductSettingsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boProductSettingsPage.pageTitle);
    });

    it('should change the number of products per page to 20', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeNumberOfDays1', baseContext);

      const result = await boProductSettingsPage.setProductsDisplayedPerPage(page, 20);
      expect(result).to.contains(boProductSettingsPage.successfulUpdateMessage);
    });
  });

  describe('FO - Check the new pagination', async () => {
    it('should view my shop page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToShopFO2', baseContext);

      page = await boProductSettingsPage.viewMyShop(page);
      await foClassicHomePage.changeLanguage(page, 'en');

      const result = await foClassicHomePage.isHomePage(page);
      expect(result).to.eq(true);
    });

    it('should go to all products page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAllProducts2', baseContext);

      await foClassicHomePage.changeLanguage(page, 'en');
      await foClassicHomePage.goToAllProductsPage(page);

      const isCategoryPageVisible = await foClassicCategoryPage.isCategoryPage(page);
      expect(isCategoryPageVisible, 'Home category page was not opened').to.eq(true);
    });

    it('should check the number of products on the page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'numberOfProducts3', baseContext);

      const numberOfProducts = await foClassicCategoryPage.getNumberOfProducts(page);
      expect(numberOfProducts).to.eql(19);
    });

    it('should check that the pagination label is not visible', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkPaginationLabel4', baseContext);

      const isVisible = await foClassicCategoryPage.isPagesListVisible(page);
      expect(isVisible).to.eq(false);
    });
  });

  // Post-condition: Reset number of products per page
  describe('POST-TEST : Reset \'Number of products per page\'', async () => {
    it('should go back BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goBackToBO4', baseContext);

      page = await foClassicHomePage.closePage(browserContext, page, 0);

      const pageTitle = await boProductSettingsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boProductSettingsPage.pageTitle);
    });

    it('should change the number of products per page to 12', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeNumberOfDays2', baseContext);

      const result = await boProductSettingsPage.setProductsDisplayedPerPage(page, 12);
      expect(result).to.contains(boProductSettingsPage.successfulUpdateMessage);
    });
  });
});
