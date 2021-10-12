import { OrderBookTable } from "../components/OrderBookTable/index"
import { render } from '@testing-library/react'
import { FinishedOrder } from "../types/orderBookTypes";

describe('OrderBookTable component renders correctly', () => {
    const bids: FinishedOrder[] = [
        { price: 50000, size: 1000, total: 1000 },
        { price: 49000.5, size: 1000, total: 2000 },
        { price: 48000, size: 1000, total: 3000 },
    ]
    const totalBids: number = 300
  
    it('renders titles', () => {
        const { getByText } = render(<OrderBookTable orderType="bid" orders={bids} total={totalBids}/>);
        const priceTitle = getByText(/price/i);
        const sizeTitle = getByText(/size/i);
        const totalTitle = getByText(/total/i);
        expect(priceTitle).toBeInTheDocument();
        expect(sizeTitle).toBeInTheDocument();
        expect(totalTitle).toBeInTheDocument();
    });

    it('renders prices', () => {
        const { getByText } = render(<OrderBookTable orderType="bid" orders={bids} total={totalBids}/>);
        const bid1 = getByText(/50000.00/i);
        const bid2 = getByText(/49000.50/i);
        const bid3 = getByText(/48000.00/i);
        expect(bid1).toBeInTheDocument();
        expect(bid2).toBeInTheDocument();
        expect(bid3).toBeInTheDocument();
    });

    it('renders sizes', () => {
        const { getByText, getAllByText } = render(<OrderBookTable orderType="bid" orders={bids} total={totalBids}/>);
        const sizes = getAllByText(/1,000/i)
        expect(sizes.length).toBe(4) // Appears once for each size, and once for total
    });

    it('renders totals', () => {
        const { getByText, getAllByText } = render(<OrderBookTable orderType="bid" orders={bids} total={totalBids}/>);
        const total2 = getByText(/2,000/i)
        const total3 = getByText(/3,000/i)
        expect(total2).toBeInTheDocument()
        expect(total3).toBeInTheDocument()
    });
});

