import * as React from "react";
import * as ReactDOM from "react-dom";
import { hot } from "react-hot-loader/root";

import '@styles/globals.css'
import '@styles/fonts/fonts.css'
import '@styles/doc/variables.css'
import '@styles/doc/general.css'
import '@styles/doc/chrome.css'

import '@fortawesome/fontawesome-svg-core/styles.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Sidebar from './components/sidebar'

library.add(fas)

const App: React.FC = () => {
  const outline = [
    {title: "mdBook"},
    {title: "Command Line Tool", children: [
      {title: "mdBook"},
      {title: "mdBook"},
      {title: "mdBook"},
    ]},
    {title: "Format", children: [
      {title: "mdBook"},
      {title: "mdBook"},
      {title: "mdBook"},
    ]},
    {title: "Continuous Integration", children: [
      {title: "mdBook"},
      {title: "mdBook"},
      {title: "mdBook", children: [
        {title: "mdBook"},
        {title: "mdBook"},
        {title: "mdBook"},
      ]},
    ]},
    {title: "For Developers", children: [
      {title: "mdBook"},
      {title: "mdBook"},
      {title: "mdBook"},
    ]},
    {title: "Contributors", number: false},
  ]
  const publicMethods = {
    showSidebar: (e: React.MouseEvent<HTMLInputElement>) => {
      return 11
    },
    hideSidebar: (e: React.MouseEvent<HTMLInputElement>) => {
      return 11
    },
    setTheme: (theme: string) => {
      return 11
    },
    currentTheme: () => {
      return 11
    },
  }
  return (
    <>
      <Sidebar outline={outline} {...publicMethods} />
    </>
  )
}
export default hot(App);
//export default App;  // react-hot-loaderを無効にする場合はこちらを使う

ReactDOM.render(<App />, document.getElementById("app"));