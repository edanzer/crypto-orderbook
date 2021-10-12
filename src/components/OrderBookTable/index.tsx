import { FinishedOrder, OrderType } from "../../types/orderBookTypes"
import { toPercent } from "../../helpers/helpers"
import styles from "./styles.module.css"

interface OrderBookTableProps {
    orders: FinishedOrder[],
    orderType: OrderType
    total: number
}

interface RowBackground {
    background: string
}

const getRowBackgroundStyles = (rowTotal: number, total: number, orderType: OrderType ): RowBackground => {
    const fraction = rowTotal/total
    const direction = (orderType === "ask" || window.innerWidth <= 600) ? "90deg" : "-90deg"
    const color = orderType === "bid" ? "rgba(0, 163, 108, .15)" : "rgba(238, 75, 43, .15)"

    const background = `linear-gradient(${direction}, ${color} ${toPercent(fraction)}, rgba(0,0,0,0) ${toPercent(fraction + .001)})`

    const rowBackground = {
        background,
        transform: "translateZ(0)"
    };

    return rowBackground;
}

export const OrderBookTable = ({orders, orderType, total}: OrderBookTableProps) => {
    
    return (
        <div className={styles[orderType + "Table"]}>
            <div className={`${styles.tableHeader} ${styles[orderType]}`}>
                <div className={styles.item}>Price</div>
                <div className={styles.item}>Size</div>
                <div className={styles.item}>Total</div>
            </div>
                {
                    orders?.map((row: FinishedOrder) => (
                        <div key={row.price.toFixed(2)} className={`${styles.row} ${styles[orderType]}`} style={getRowBackgroundStyles(row.total, total, orderType)}>
                            <div className={`${styles.item} ${styles[orderType + "Price"]}`}>{row.price.toFixed(2)}</div>
                            <div className={styles.item}>{row.size.toLocaleString('en')}</div>
                            <div className={styles.item}>{row.total.toLocaleString('en')}</div>
                        </div>
                    ))
                }
        </div>
    )
}
