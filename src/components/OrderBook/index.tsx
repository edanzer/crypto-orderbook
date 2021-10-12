import { useState } from "react"
import { toPercent } from "../../helpers/helpers"
import { useSubscribeOrderWorker }  from "../../hooks/useSubscribeOrderWorker"
import { Pair } from "../../types/orderBookTypes"
import { OrderBookTable } from "../OrderBookTable"
import styles from "./styles.module.css"

export const OrderBook = () => {

    /*
     * The pair should probably belong to global state. 
     * Other aspects of the trading interface (charts,
     * buy/sell, account balance) will depend on pair.
     */
    const [ pair, setPair ] = useState<Pair>("PI_XBTUSD")
    const { asks, bids, subscribeToPair } = useSubscribeOrderWorker(pair)
    
    const haveAsks: boolean = Boolean(asks.length > 0)
    const haveBids: boolean = Boolean(bids.length > 0)
    const totalAsks: number = haveAsks ? asks[asks.length-1].total : 0
    const totalBids: number = haveBids ? bids[bids.length-1].total : 0
    const spread: number = (haveAsks && haveBids) ? asks?.[0].price - bids[0].price : 0
    const spreadPercent: string = spread ? toPercent(spread/asks[0].price) : ''
    
    const togglePair = () => {
        let newPair: Pair = (pair === "PI_XBTUSD") ? "PI_ETHUSD" : "PI_XBTUSD"
        subscribeToPair(newPair)
        setPair(newPair)
    }

    return (
        <div className={styles.orderbook}>
            <div className={styles.header}>
                <div className={styles.title}>Order Book 
                    <span className={styles.pair}> ({pair})</span>
                </div>
                <div className={styles.spread}>Spread: {`${spread.toFixed(2)} (${spreadPercent})`}</div>
            </div>
            <OrderBookTable orderType="bid" orders={bids} total={totalBids}/>
            <OrderBookTable orderType="ask" orders={asks} total={totalAsks}/>
            <div className={styles.footer}>
                <button className={styles.toggle} onClick={togglePair}>Toggle Feed</button>
            </div>
        </div>
    )
}
