// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
import orderSettingsPage from '@pages/BO/shopParameters/orderSettings';
import statusesPage from '@pages/BO/shopParameters/orderSettings/statuses';
import addOrderReturnStatusPage from '@pages/BO/shopParameters/orderSettings/statuses/returnStatus/add';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  boDashboardPage,
  dataOrderReturnStatuses,
  FakerOrderReturnStatus,
  utilsCore,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'functional_BO_shopParameters_orderSettings_statuses_returnStatuses_filterSortAndPagination';

/*
Filter order return status by : Id, Name
Sort order return status by : Id, Name
Create 6 order return statuses
Pagination next and previous
Delete by bulk actions
 */
describe('BO - Shop Parameters - Order Settings - Statuses : Filter, sort and '
  + 'pagination order return status', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfOrderReturnStatuses: number = 0;

  const tableName: string = 'order_return';

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

  it('should go to \'Shop Parameters > Order Settings\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToOrderSettingsPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.shopParametersParentLink,
      boDashboardPage.orderSettingsLink,
    );

    const pageTitle = await orderSettingsPage.getPageTitle(page);
    expect(pageTitle).to.contains(orderSettingsPage.pageTitle);
  });

  it('should go to \'Statuses\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToStatusesPage', baseContext);

    await orderSettingsPage.goToStatusesPage(page);

    const pageTitle = await statusesPage.getPageTitle(page);
    expect(pageTitle).to.contains(statusesPage.pageTitle);
  });

  it('should reset all filters and get number of order return statuses', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFilterFirst', baseContext);

    numberOfOrderReturnStatuses = await statusesPage.resetAndGetNumberOfLines(page, tableName);
    expect(numberOfOrderReturnStatuses).to.be.above(0);
  });

  // 1 - Filter order return statuses
  describe('Filter order return statuses table', async () => {
    const tests = [
      {
        testIdentifier: 'filterById',
        filterType: 'input',
        filterBy: 'id_order_return_state',
        filterValue: dataOrderReturnStatuses.packageReceived.id.toString(),
        idColumn: 1,
      },
      {
        testIdentifier: 'filterByName',
        filterType: 'input',
        filterBy: 'name',
        filterValue: dataOrderReturnStatuses.returnCompleted.name,
        idColumn: 2,
      },
    ];

    tests.forEach((test: {
      testIdentifier: string,
      filterType: string,
      filterBy: string,
      filterValue: string,
      idColumn: number
    }) => {
      it(`should filter by ${test.filterBy} '${test.filterValue}'`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.testIdentifier, baseContext);

        await statusesPage.filterTable(
          page,
          tableName,
          test.filterType,
          test.filterBy,
          test.filterValue,
        );

        const numberOfLinesAfterFilter = await statusesPage.getNumberOfElementInGrid(page, tableName);
        expect(numberOfLinesAfterFilter).to.be.at.most(numberOfOrderReturnStatuses);

        for (let row = 1; row <= numberOfLinesAfterFilter; row++) {
          const textColumn = await statusesPage.getTextColumn(
            page,
            tableName,
            row,
            test.filterBy,
          );
          expect(textColumn).to.contains(test.filterValue);
        }
      });

      it('should reset all filters', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${test.testIdentifier}Reset`, baseContext);

        const numberOfLinesAfterReset = await statusesPage.resetAndGetNumberOfLines(page, tableName);
        expect(numberOfLinesAfterReset).to.equal(numberOfOrderReturnStatuses);
      });
    });
  });

  // 2 - Sort order return statuses table
  describe('Sort order return statuses table', async () => {
    [
      {
        testIdentifier: 'sortByIdDesc',
        sortBy: 'id_order_return_state',
        columnID: 2,
        sortDirection: 'desc',
        isFloat: true,
      },
      {
        testIdentifier: 'sortByNameAsc',
        sortBy: 'name',
        columnID: 3,
        sortDirection: 'asc',
      },
      {
        testIdentifier: 'sortByNameDesc',
        sortBy: 'name',
        columnID: 3,
        sortDirection: 'desc',
      },
      {
        testIdentifier: 'sortByIdAsc',
        sortBy: 'id_order_return_state',
        columnID: 2,
        sortDirection: 'asc',
        isFloat: true,
      },
    ].forEach((test: {
      testIdentifier: string,
      sortBy: string
      columnID: number,
      sortDirection: string
      isFloat?: boolean,
    }) => {
      it(`should sort by '${test.sortBy}' '${test.sortDirection}' and check result`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.testIdentifier, baseContext);

        const nonSortedTable = await statusesPage.getAllRowsColumnContent(
          page,
          tableName,
          test.sortBy,
        );

        await statusesPage.sortTable(page, tableName, test.sortBy, test.columnID, test.sortDirection);

        const sortedTable = await statusesPage.getAllRowsColumnContent(
          page,
          tableName,
          test.sortBy,
        );

        if (test.isFloat) {
          const nonSortedTableFloat: number[] = nonSortedTable.map((text: string): number => parseFloat(text));
          const sortedTableFloat: number[] = sortedTable.map((text: string): number => parseFloat(text));

          const expectedResult = await utilsCore.sortArrayNumber(nonSortedTableFloat);

          if (test.sortDirection === 'asc') {
            expect(sortedTableFloat).to.deep.equal(expectedResult);
          } else {
            expect(sortedTableFloat).to.deep.equal(expectedResult.reverse());
          }
        } else {
          const expectedResult = await utilsCore.sortArray(nonSortedTable);

          if (test.sortDirection === 'asc') {
            expect(sortedTable).to.deep.equal(expectedResult);
          } else {
            expect(sortedTable).to.deep.equal(expectedResult.reverse());
          }
        }
      });
    });
  });

  // 3 - Create 6 order return statuses
  const creationTests: number[] = new Array(6).fill(0, 0, 6);

  creationTests.forEach((test: number, index: number) => {
    describe(`Create order return status n°${index + 1} in BO`, async () => {
      const orderReturnStatusData: FakerOrderReturnStatus = new FakerOrderReturnStatus({name: `todelete${index}`});

      it('should go to add new order status group page', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `goToAddOrderReturnStatusPage${index}`, baseContext);

        await statusesPage.goToNewOrderReturnStatusPage(page);

        const pageTitle = await addOrderReturnStatusPage.getPageTitle(page);
        expect(pageTitle).to.contains(addOrderReturnStatusPage.pageTitleCreate);
      });

      it('should create order status and check result', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `createOrderReturnStatus${index}`, baseContext);

        const textResult = await addOrderReturnStatusPage.setOrderReturnStatus(page, orderReturnStatusData);
        expect(textResult).to.contains(statusesPage.successfulCreationMessage);

        const numberOfLinesAfterCreation = await statusesPage.getNumberOfElementInGrid(page, tableName);
        expect(numberOfLinesAfterCreation).to.be.equal(numberOfOrderReturnStatuses + index + 1);
      });
    });
  });

  // 4 - Pagination
  describe('Pagination next and previous', async () => {
    it('should change the items number to 10 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemNumberTo10', baseContext);

      const paginationNumber = await statusesPage.selectPaginationLimit(page, tableName, 10);
      expect(paginationNumber).to.contains('(page 1 / 2)');
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext', baseContext);

      const paginationNumber = await statusesPage.paginationNext(page, tableName);
      expect(paginationNumber).to.contains('(page 2 / 2)');
    });

    it('should click on previous', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnPrevious', baseContext);

      const paginationNumber = await statusesPage.paginationPrevious(page, tableName);
      expect(paginationNumber).to.contains('(page 1 / 2)');
    });

    it('should change the items number to 20 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemNumberTo20', baseContext);

      const paginationNumber = await statusesPage.selectPaginationLimit(page, tableName, 20);
      expect(paginationNumber).to.contains('(page 1 / 1)');
    });
  });

  // 5 : Delete order return statuses created with bulk actions
  describe('Delete order return statuses with Bulk Actions', async () => {
    it('should filter list by name', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterForBulkDelete', baseContext);

      await statusesPage.filterTable(page, tableName, 'input', 'name', 'todelete');
      const numberOfLinesAfterFilter = await statusesPage.getNumberOfElementInGrid(page, tableName);

      for (let i = 1; i <= numberOfLinesAfterFilter; i++) {
        const textColumn = await statusesPage.getTextColumn(page, tableName, i, 'name');
        expect(textColumn).to.contains('todelete');
      }
    });

    it('should delete order return statuses with Bulk Actions and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'bulkDeleteStatus', baseContext);

      const deleteTextResult = await statusesPage.bulkDeleteOrderStatuses(page, tableName);
      expect(deleteTextResult).to.be.contains(statusesPage.successfulDeleteMessage);
    });
    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAfterDelete', baseContext);

      const numberOfLinesAfterReset = await statusesPage.resetAndGetNumberOfLines(page, tableName);
      expect(numberOfLinesAfterReset).to.be.equal(numberOfOrderReturnStatuses);
    });
  });
});
