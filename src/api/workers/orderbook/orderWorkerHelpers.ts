import { 
    RawOrder,
    RawOrderBook,
    FinishedOrder,
    FinishedOrderBook,
    OrderBookAction, 
    OrderType,
    OrderWithTotal
} from "../../../types/orderBookTypes"

/* 
 * Update the orderbook with new values
 */
export function getUpdatedOrderBook(rawOrderBook: RawOrderBook, newAsks: RawOrder[], newBids: RawOrder[]): RawOrderBook {    
    if (rawOrderBook === null) {
        const updatedOrderbook: RawOrderBook = [ newAsks, newBids ]
        return updatedOrderbook
    }
    
    const updatedOrderbook: RawOrderBook = [
        getUpdatedOrders(rawOrderBook[0], newAsks),
        getUpdatedOrders(rawOrderBook[1], newBids)
    ]
    return updatedOrderbook
}

/*
 * Update list of orders with new orders
 */
export function getUpdatedOrders(currentOrders: RawOrder[], newOrders: RawOrder[]): RawOrder[] {
    // First, all new orders should be included
    let updatedOrders: RawOrder[] = newOrders;

    // Second, for old orders, include them if their prices don't match existing orders
    currentOrders.forEach((value, index, array) => {
        if (!updatedOrders.find(updatedOrder => updatedOrder[0] == currentOrders[index][0])) {
            updatedOrders.push(currentOrders[index])
        }
    })

    return updatedOrders
}

/*
 * Post orderbook from this web worker to React
 */
export function sendOrderBook(action: OrderBookAction, rawOrderBook: RawOrderBook): void { 
    if (rawOrderBook === null) return;   

    const finishedOrderBook: FinishedOrderBook | null = prepareOrderBook(rawOrderBook);
    
    postMessage({
        type: action,
        finishedOrderBook
    });
}

/* 
 * Prepare the orderbook for posting back to React
 */
export function prepareOrderBook(rawOrderBook: RawOrderBook): FinishedOrderBook | null {
    if (rawOrderBook === null) return null;

    const finishedOrderBook: FinishedOrderBook = {
        asks: formatOrderbook(getTotals(sortOrders(trimTo25Orders(removeZeros(rawOrderBook[0])),"ask"))),
        bids: formatOrderbook(getTotals(sortOrders(trimTo25Orders(removeZeros(rawOrderBook[1])),"bid")))
    }

    return finishedOrderBook
}

/* 
 * Remove order levels with size of 0
 */
export function removeZeros(orders: RawOrder[]): RawOrder[] {
    const nonZeroOrders: RawOrder[] = orders.filter(order => order[1] != 0);
    return nonZeroOrders
}

/* 
 * Trim to max of 25 orders
 */
export function trimTo25Orders(orders: RawOrder[]): RawOrder[] {
    if (orders.length <= 25) return orders;

    const trimmedOrders = orders.slice(0, 25); 
    return trimmedOrders
}

/* 
 * Ensure orders are sorted in correct order
 */
export function sortOrders(orders: RawOrder[], orderType: OrderType) {
    const sortedOrders: RawOrder[] = orders.sort((a: RawOrder, b: RawOrder): number => {
        if (orderType === "ask") return a[0] - b[0]
        if (orderType === "bid") return b[0] - a[0]
        return 0
    });

    return sortedOrders
}

/* 
 * Add cumulative order totals
 */
export function getTotals(orders: RawOrder[]): OrderWithTotal[] {
    let total = 0

    const ordersWithTotals: OrderWithTotal[] = orders.map(order => {
        total = total + order[1]
        return [ ...order, total ]
    })

    return ordersWithTotals
}

/* 
 * Add cumulative order totals
 */
export function formatOrderbook(orders: OrderWithTotal[]): FinishedOrder[] {
    const formattedOrderbook: FinishedOrder[] = orders.map(order => {
        return {
            price: order[0],
            size: order[1],
            total: order[2]
        }
    })

    return formattedOrderbook
}
