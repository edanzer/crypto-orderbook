import { useEffect, useState, useRef, useCallback } from "react"
import { FinishedOrder, Pair } from "../types/orderBookTypes";

/*
 * Loading web workers without ejecting Create React App is
 * a bit tricky. The method below was the simplest.
 * But it also requires an extra line for eslint.
 */
// eslint-disable-next-line
import Worker from "worker-loader!../api/workers/orderbook/orders.worker.ts";

interface UseSubscribeOrderWorkerReturn {
        asks: FinishedOrder[], 
        bids: FinishedOrder[], 
        openSocket: Function, 
        closeSocket: Function, 
        subscribeToPair: Function
}

export const useSubscribeOrderWorker = (pair: Pair): UseSubscribeOrderWorkerReturn => {
    const url = "wss://www.cryptofacilities.com/ws/v1"
    let worker = useRef<Worker | null>(null);
    const [ asks, setAsks ] = useState<FinishedOrder[]>([])
    const [ bids, setBids ] = useState<FinishedOrder[]>([])

    /* 
     * Sends message to worker to open the socket
     */
    const openSocket = useCallback(() => {
        if (!worker.current) {
            worker.current = new Worker()
            
            worker.current.postMessage({ action: "open", url })
            worker.current.addEventListener('message', handleMessagefromWorker)
            document.addEventListener("visibilitychange", handleWindowLoseFocus)
        }
    }, [url]);

    /* 
     * Sends message to worker to close the socket
     */
    const closeSocket = useCallback(() => {
        if (worker.current) {
            worker.current?.postMessage({action: "close" })
            worker.current?.removeEventListener('message', handleMessagefromWorker)
            document.removeEventListener("blur", handleWindowLoseFocus);
            worker.current = null;
        }
    }, []);

    /* 
     * Sends message to worker to subscribe to trading pair
     */
    const subscribeToPair = useCallback((newPair: Pair) => {
        if (worker.current) {
            worker.current.postMessage({
                action: "subscribe",
                pair: newPair
            })
        }
    }, []);

    /* 
     * Handles incoming messages from socket
     *
     * This method should be updated to handle other
     * possible message types received from worker.
     */
    const handleMessagefromWorker = (e: MessageEvent) => {
        switch (e.data.type) {
            case "socketOpened":
                subscribeToPair(pair)
                break;
            case "update":
                setAsks(e.data.finishedOrderBook?.asks)
                setBids(e.data.finishedOrderBook?.bids)
                break;
        }
    }

    /* 
     * Close socket when window loses focus.
     * Open socket when window gains focus.
     */
    const handleWindowLoseFocus = () => {
        if (document.visibilityState==="hidden") {
            closeSocket()
        } else {
            openSocket()
            subscribeToPair(pair)
        }
    } 

    useEffect(() => {
        openSocket()
    
        return () => closeSocket()
    }, [])

    return { asks, bids, openSocket, closeSocket, subscribeToPair } 
}
