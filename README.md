## Cryptocurrency Orderbook

This is an experimental project to built a cryptocurrency orderbook. An orderbook is a list of all outstanding bids and asks, along with their respective prices and sizes. 

The app connects to a [https://support.cryptofacilities.com/hc/en-us/articles/360000538773-Book](third party websocket) that provides up-to-date orderbook data for a range of cryptocurrencies. 

The speed and volume of data that comes through the websocket is very large and risks overwhelming React's ability to rapidly and correctly re-render the orderbook. So the app leverages a web worker to open and manage the websocket. The web worker receives messages and data from the websocket, and periodically sends a prepared and updated orderbook back to React for rendering.

The app also shows a bar chart for volume of asks and bids, the current spread (difference between highest bid and lowest ask), and toggle button to toggle between crypocurrency trading pairs (there are only two for now, but more pairs could be easily added).

See live demo here: [https://trading-book.netlify.app/](https://trading-book.netlify.app/)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
