import { 
    getUpdatedOrderBook,
    getUpdatedOrders,
    prepareOrderBook,
    removeZeros,
    trimTo25Orders,
    sortOrders,
    getTotals, 
    formatOrderbook } from "../api/workers/orderbook/orderWorkerHelpers"
import { 
    RawOrder,
    RawOrderBook,
    FinishedOrder,
    FinishedOrderBook,
    OrderWithTotal, 
    SocketSnapshot,
    SocketUpdate } from "../types/orderBookTypes"

/*  
 * First, test individual functions discretely
 */
describe('individual functions for preparing ', () => {

    test('removeZeros() removes zero-sized orders', () => {
        // Mock starting data and output
        const orders: RawOrder[] = [
            [50000,100], [49000,0], [48000,100]
        ]
        const nonZeroOrders: RawOrder[] = [
            [50000,100], [48000,100]
        ]

        // Test
        expect(removeZeros(orders)).toEqual(nonZeroOrders)
    });

    test('sortOrders() sorts orders', () => {
        // Mock starting data and output
        const orders: RawOrder[] = [
            [50000,100], [49000,100], [48000,100], [51000.5,100]
        ]
        const sortedBidOrders: RawOrder[] = [
            [51000.5,100], [50000,100], [49000,100], [48000,100],
        ]
        const sortedAskOrders: RawOrder[] = [
            [48000,100], [49000,100], [50000,100], [51000.5,100],
        ]

        // Test
        expect(sortOrders(orders, "ask")).toEqual(sortedAskOrders)
        expect(sortOrders(orders, "bid")).toEqual(sortedBidOrders)
    });

    test('trimTo25Orders() trims to 25 max orders', () => {
        // Mock starting data and output
        const orders: RawOrder[] = [
            [1,100], [2,100], [3,100], [4,100], [5,100],
            [6,100], [7,100], [8,100], [9,100], [10,100],
            [11,100], [12,100], [13,100], [14,100], [15,100],
            [16,100], [17,100], [18,100], [19,100], [20,100],
            [21,100], [22,100], [23,100], [24,100], [25,100],
            [26,100], [27,100]
        ]
        const trimmedORders: RawOrder[] = [
            [1,100], [2,100], [3,100], [4,100], [5,100],
            [6,100], [7,100], [8,100], [9,100], [10,100],
            [11,100], [12,100], [13,100], [14,100], [15,100],
            [16,100], [17,100], [18,100], [19,100], [20,100],
            [21,100], [22,100], [23,100], [24,100], [25,100]
        ]

        // Test
        expect(trimTo25Orders(orders)).toEqual(trimmedORders)
    });

    test('addTotals() adds cumulative order totals', () => {
        // Mock starting data and output
        const orders: RawOrder[] = [
            [50000,100], [51000,100], [52000,100]
        ]
        const ordersWithTotals: OrderWithTotal[] = [
            [50000,100,100], [51000,100,200], [52000,100,300]
        ]

        // Test
        expect(getTotals(orders)).toEqual(ordersWithTotals)
    });

    test('formatOrderbook() formats orderbook data', () => {
        // Mock starting data and output
        const orders: OrderWithTotal[] = [
            [50000,100,100], [51000,100,200], [52000,100,300]
        ]
        const formattedOrders: FinishedOrder[] = [
            { price: 50000, size: 100, total: 100 },
            { price: 51000, size: 100, total: 200 },
            { price: 52000, size: 100, total: 300 },
        ]

        // Test
        expect(formatOrderbook(orders)).toEqual(formattedOrders)
    });

    test('getUpdatedOrderbook() creates inital orderbook from snapshot', () => {
        // Mock starting data and output
        const mockSnapshot: SocketSnapshot = {
            "numLevels": 25,
            "feed": "book_ui_1_snapshot",
            "bids": [ [50000,100], [49000,100], [48000,100] ],
            "asks": [ [51000,100], [52000,100], [53000,100] ],
            "product_id": "PI_XBTUSD"
        }
        const startingOrderbook: RawOrderBook = null
        const outputOrderbook: RawOrderBook = [ mockSnapshot.bids, mockSnapshot.asks ]

        // Test
        expect(getUpdatedOrderBook(startingOrderbook, mockSnapshot.bids, mockSnapshot.asks)).toEqual( outputOrderbook )
    });

    test('getUpdatedOrderbook() updates orderbook from socket update', () => {
        // Mock starting data and output
        const startingOrderbook: RawOrderBook = [ 
            [ [50000,100], [49000,100], [48000,100] ],
            [ [51000,100], [52000,100], [53000,100] ],
        ]
        const newBids: RawOrder[] = [ [50000, 0], [47000,100] ]
        const newAsks: RawOrder[] = [ [51000, 0], [54000,100] ]
        const endingOrderbook: RawOrderBook = [ 
            [ [50000,0], [47000,100], [49000,100], [48000,100] ],
            [ [51000,0], [54000,100], [52000,100], [53000,100] ]
        ]

        // Test
        expect(getUpdatedOrderBook(startingOrderbook, newBids, newAsks)).toEqual( endingOrderbook )
    });

    test('getUpdatedOrders() updates bids/asks when new orders received', () => {
        // Mock starting data and output
        const startinBids: RawOrder[] = [ [50000,100], [49000,100], [48000,100] ]
        const newBids: RawOrder[] = [ [50000, 0], [47000,100] ]
        const endingBids: RawOrder [] = [ [50000,0], [47000,100], [49000,100], [48000,100] ]

        // Test
        expect(getUpdatedOrders(startinBids, newBids)).toEqual( endingBids )
    });
});

/*  
 * Second, test everything together.
 * Should take in raw snapshot/update and output finished orderbook.
 * Also use larger, more complete, moire realistic data set. 
 */
describe('test overall orderbook preparation', () => {
    
    // Mock ininital data snapshot from websocket.
    const mockSnapshot: SocketSnapshot = {
        "numLevels": 25,
        "feed": "book_ui_1_snapshot",
        "bids": [
            [50000,100],
            [49000,100],
            [48000,100],
            [47000,100],
            [46000,100],
            [45000,100],
            [44000,100],
            [43000,100],
            [42000,100],
            [41000,100],
            [40000,100],
            [39000,100],
            [38000,100],
            [37000,100],
            [36000,100],
            [35000,100],
            [34000,100],
            [33000,100],
            [32000,100],
            [31000,100],
            [30000,100],
            [29000,100],
            [28000,100],
            [27000,100],
            [26000,100]
        ],
        "asks": [
            [51000,100],
            [52000,100],
            [53000,100],
            [54000,100],
            [55000,100],
            [56000,100],
            [57000,100],
            [58000,100],
            [59000,100],
            [60000,100],
            [61000,100],
            [62000,100],
            [63000,100],
            [64000,100],
            [65000,100],
            [66000,100],
            [67000,100],
            [68000,100],
            [69000,100],
            [70000,100],
            [71000,100],
            [72000,100],
            [73000,100],
            [74000,100],
            [75000,100]
        ],
        "product_id": "PI_XBTUSD"
    }
    
    // Mock update/delta from websocket.
    const mockUpdate: SocketUpdate = {
        "feed": "book_ui_1",
        "product_id": "PI_XBTUSD",
        "bids": [
            [49000,0],
            [48000,0],
            [49500.5,100],
            [48500.5,100],
            [47500.5,100]
        ],
        "asks": [
            [52000,0],
            [53000,0],
            [52500.5,100],
            [53500.5,100],
            [54500.5,100]
        ]
    }
    
    // Mock finished orderbook based on inputs above
    const mockFinalOrderBook: FinishedOrderBook = {
        "bids": [
            { price: 50000, size: 100, total: 100 },
            { price: 49500.5, size: 100, total: 200 },
            { price: 48500.5, size: 100, total: 300 },
            { price: 47500.5, size: 100, total: 400 },
            { price: 47000, size: 100, total: 500 },
            { price: 46000, size: 100, total: 600 },
            { price: 45000, size: 100, total: 700 },
            { price: 44000, size: 100, total: 800 },
            { price: 43000, size: 100, total: 900 },
            { price: 42000, size: 100, total: 1000 },
            { price: 41000, size: 100, total: 1100 },
            { price: 40000, size: 100, total: 1200 },
            { price: 39000, size: 100, total: 1300 },
            { price: 38000, size: 100, total: 1400 },
            { price: 37000, size: 100, total: 1500 },
            { price: 36000, size: 100, total: 1600 },
            { price: 35000, size: 100, total: 1700 },
            { price: 34000, size: 100, total: 1800 },
            { price: 33000, size: 100, total: 1900 },
            { price: 32000, size: 100, total: 2000 },
            { price: 31000, size: 100, total: 2100 },
            { price: 30000, size: 100, total: 2200 },
            { price: 29000, size: 100, total: 2300 },
            { price: 28000, size: 100, total: 2400 },
            { price: 27000, size: 100, total: 2500 }
        ],
        "asks": [
            { price: 51000, size: 100, total: 100 },
            { price: 52500.5, size: 100, total: 200 },
            { price: 53500.5, size: 100, total: 300 },
            { price: 54000, size: 100, total: 400 },
            { price: 54500.5, size: 100, total: 500 },
            { price: 55000, size: 100, total: 600 },
            { price: 56000, size: 100, total: 700 },
            { price: 57000, size: 100, total: 800 },
            { price: 58000, size: 100, total: 900 },
            { price: 59000, size: 100, total: 1000 },
            { price: 60000, size: 100, total: 1100 },
            { price: 61000, size: 100, total: 1200 },
            { price: 62000, size: 100, total: 1300 },
            { price: 63000, size: 100, total: 1400 },
            { price: 64000, size: 100, total: 1500 },
            { price: 65000, size: 100, total: 1600 },
            { price: 66000, size: 100, total: 1700 },
            { price: 67000, size: 100, total: 1800 },
            { price: 68000, size: 100, total: 1900 },
            { price: 69000, size: 100, total: 2000 },
            { price: 70000, size: 100, total: 2100 },
            { price: 71000, size: 100, total: 2200 },
            { price: 72000, size: 100, total: 2300 },
            { price: 73000, size: 100, total: 2400 },
            { price: 74000, size: 100, total: 2500 }
        ]
    }

    test('final orderbook is prepared correctly ', () => {
        // The output of this line was tested in first test above
        let rawOrderBook: RawOrderBook = [ mockSnapshot.asks, mockSnapshot.bids,  ]

        // The output of this line was tested in second test above
        rawOrderBook = getUpdatedOrderBook(rawOrderBook, mockUpdate.asks, mockUpdate.bids )

        // Test prepareOrderBook
        expect(prepareOrderBook(rawOrderBook)).toEqual( mockFinalOrderBook )
    });
    
});

