import { OrderBook } from "../components/OrderBook/index"
import { render } from '@testing-library/react'
import { FinishedOrder, Pair } from "../types/orderBookTypes"

/* 
 * Set up mock and mock data for useSubscribeOrderWorker hook.
 * Mock each item returned from the hook. 
 * Then mock the hook itself.
 */
const bids: FinishedOrder[] = [
    { price: 50000, size: 100, total: 100 },
    { price: 49500.5, size: 100, total: 200 },
    { price: 48500.5, size: 100, total: 300 },
    { price: 47500.5, size: 100, total: 400 },
    { price: 47000, size: 100, total: 500 }
]

const asks: FinishedOrder[] = [
    { price: 51000, size: 100, total: 100 },
    { price: 52500.5, size: 100, total: 200 },
    { price: 53500.5, size: 100, total: 300 },
    { price: 54000, size: 100, total: 400 },
    { price: 54500.5, size: 100, total: 500 }
]

const pair: Pair = "PI_XBTUSD"
const mockSubscribe = jest.fn()

jest.mock("../hooks/useSubscribeOrderWorker", () => ({
    useSubscribeOrderWorker: () => ({ asks, bids, pair, mockSubscribe })
}));


/* 
 * Test OrderBook Component
 * Note: There are additional separate tests for OrderBookTable component.
 */
describe('OrderBook component renders correctly', () => {
    it('renders header with title and spread', () => {
        const { getByText } = render(<OrderBook />)
        const title = getByText(/order book/i)
        const spread = getByText(/spread/i)
        expect(title).toBeInTheDocument();
        expect(spread).toBeInTheDocument();
    })

    it('renders footer with toggle feed button', () => {
        const { getByText } = render(<OrderBook />)
        const button = getByText(/toggle feed/i)
        expect(button).toBeInTheDocument();
    })

    it('renders table headers for both OrderBookTable components for bids and asks', () => {
        const { getByText, getAllByText } = render(<OrderBook />)
        const priceTitle = getAllByText(/price/i);
        const sizeTitle = getAllByText(/size/i);
        const totalTitle = getAllByText(/total/i);
        expect(priceTitle.length).toBe(2);
        expect(sizeTitle.length).toBe(2);
        expect(totalTitle.length).toBe(2);
    })

    it('renders bid and asks rows', () => {
        const { getByText } = render(<OrderBook />)
        expect(getByText(/50000/i)).toBeInTheDocument()
        expect(getByText(/47000/i)).toBeInTheDocument()
        expect(getByText(/51000/i)).toBeInTheDocument()
        expect(getByText(/54500.5/i)).toBeInTheDocument()
    })
})

