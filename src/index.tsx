import * as React from "react";
import * as ReactDOM from "react-dom";
import { hot } from "react-hot-loader/root";

import '@fortawesome/fontawesome-svg-core/styles.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
library.add(fas)

const App: React.FC = () => {
    return (
        <div>
            <FontAwesomeIcon icon="bars" />
        </div>
    )
}
export default hot(App);
//export default App;  // react-hot-loaderを無効にする場合はこちらを使う

ReactDOM.render(<App />, document.getElementById("app"));