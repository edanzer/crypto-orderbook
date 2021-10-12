import { RawOrderBook, Pair } from "../../../types/orderBookTypes"
import { getUpdatedOrderBook, sendOrderBook } from "./orderWorkerHelpers"

(function OrderWorker() {
    let socket: WebSocket | null
    let isSubscribed: boolean = false

    let currentPair: Pair = ''
    let rawOrderBook: RawOrderBook = null
    let timer: ReturnType<typeof setInterval>

    /* 
    * Handle messages from React 
    */
    onmessage = e => {
        const message = e.data
        switch(message.action) {
            case "open":
                openSocket(message.url)
                break;
            case "subscribe":
                /* 
                 * Managing/switching subscription needs
                 * additional thought or discussion. These events
                 * are asyncronous. Ss is, it would be possible
                 * to have multiple subscriptions at once. 
                 * 
                 * A simple choice here would be to close the socket
                 * entirely when changing subscriptions. That would
                 * ensure any/all existing subscriptions are cleared
                 * before starting a new one.
                 * 
                 * Otherwise extra logic or checks should be added
                 * to ensure only one subscription exists at once,
                 * and new subscriptions are only added when we 
                 * receive confirmation from the websocket that older
                 * subscriptions are officially unsubscribed.
                 */ 
                if (isSubscribed) unSubscribe(currentPair)
                subscribe(message.pair)
                break;
            case "close":
                closeSocket()
                break;
        }
    }

    /* 
     * Open socket and set up socket event listeners
     */
    function openSocket(url: string) {

        // Open Socket
        socket = new WebSocket(url)

        // Listen and respond to socket onopen event
        socket.onopen = () => {
            postMessage({ type: "socketOpened" })
        }

        // Listen  and respond to socket messages
        socket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data)

            if (data?.event) {

                switch(data.event) {
                    case "subscribed": 
                        postMessage({ type: "socketSubscribed", pair: data.product_ids })
                        isSubscribed = true
                        currentPair = data.product_ids[0]

                        /*
                         * This does not account for device
                         * or connection speeds.
                         */
                        timer = setInterval( () => sendOrderBook("update", rawOrderBook), 200)
                        break;
                    case "unsubscribed":
                        postMessage({ type: "socketUnsubscribed", pair: data.product_ids })
                        isSubscribed = false
                        currentPair = ''
                        break;
                    case "subscribed-failed": 
                        postMessage({ type: "socketSubscribedFailed", pair: data.product_ids })
                        break;
                    case "unsubscribed-failed":
                        postMessage({ type: "socketUnsubscribedFailed", pair: data.product_ids })
                        break;
                    case "error":
                        postMessage({ type: "socketError", message: data.message })
                        break;
                    default:
                        postMessage({ type: "socketUnknownEvent", message: data.message })
                }

            } else if (data?.bids)  {

                // This handles both initial snapshot and subsequent updates
                rawOrderBook = getUpdatedOrderBook(rawOrderBook, data.asks, data.bids)

            }
        };

        // Listen and respond to socket close event
        socket.onclose = () => {
            if (timer) clearTimeout(timer)
            postMessage({ type: "socketClosed" })
            currentPair = ''
            isSubscribed = false
        };
    }

    function subscribe(pair: Pair) {
        const subscription = { "event": "subscribe", "feed": "book_ui_1", "product_ids": [pair] }
        if (socket) socket.send(JSON.stringify(subscription))
    }

    function unSubscribe(pair: Pair) {
        if (timer) clearInterval(timer)
        const unsubscribe = { event: "unsubscribe", feed: "book_ui_1", product_ids: [pair] }
        if (socket) socket.send(JSON.stringify(unsubscribe))
    }

    function closeSocket() {
        if (timer) clearInterval(timer)
        if (socket) socket.close()
    }

})()

export default {}
