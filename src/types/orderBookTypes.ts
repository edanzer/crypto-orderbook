/* 
 * Orderbook Types 
 */

// Basic data
export type Price = number
export type Size = number
export type Total = number

// Data format received from websocket
export interface SocketSnapshot {
    "numLevels": number,
    "feed": string,
    "bids": RawOrder[],
    "asks": RawOrder[],
    "product_id": Pair
}
export interface SocketUpdate {
    "feed": string,
    "bids": RawOrder[],
    "asks": RawOrder[],
    "product_id": Pair
}

// Raw orders 
export type RawOrder = [Price, Size]
export type RawOrderBook = [ RawOrder[], RawOrder[] ] | null

// Finished orders, sent from worker to react
export type OrderWithTotal = [Price, Size, Total]
export interface FinishedOrder {price: Price, size: Size, total: Total}
export interface FinishedOrderBook {asks: FinishedOrder[], bids: FinishedOrder[]}

// Orderbook actions and types
export type OrderBookAction = "initial" | "update" | "clear"
export type OrderType = 'ask' | 'bid';
export type Pair = "" | "PI_XBTUSD" | "PI_ETHUSD"