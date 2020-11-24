import React, { useState, useLayoutEffect } from "react";
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

import Sidebar from '~/components/sidebar'
import Header from '~/components/header'
import Markdown from '~/components/markdown'

library.add(fas)

declare global {
  interface Window {
    ace: any
    editors: any
  }
}

const App: React.FC = () => {
  const [codeMirrorTheme, setCodeMirrorTheme] = useState<string>(null)
  let html: any;
  useLayoutEffect(() => {
    html = document.querySelector("html")
  })
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

  const showSidebar = (e: React.MouseEvent<HTMLInputElement>) => {
    html.classList.remove('sidebar-hidden')
    html.classList.add('sidebar-visible');
  }
  const hideSidebar = (e: React.MouseEvent<HTMLInputElement>) => {
    html.classList.remove('sidebar-visible');
    html.classList.add('sidebar-hidden');
  }
  const setTheme = (theme: string, store = true) => {
    if (theme == 'coal' || theme == 'ayu') {
      setCodeMirrorTheme("dark");
    } else if (theme == 'navy') {
      setCodeMirrorTheme("one-dark");
    } else if (theme == 'rust') {
      setCodeMirrorTheme("solarized-light");
    } else {
      setCodeMirrorTheme("light");
    }

    setTimeout(function () {
      const themeColorMetaTag: any = document.querySelector('meta[name="theme-color"]');
      themeColorMetaTag.content = getComputedStyle(document.body).backgroundColor;
    }, 1);

    const html: any = document.querySelector("html");
    html.classList.remove(currentTheme());
    html.classList.add(theme);
    if (store)
      try { localStorage.setItem('dgit-theme', theme); } catch (e) { }
  }
  const currentTheme = () => {
    let theme: any;
    try { theme = localStorage.getItem('dgit-theme'); } catch (e) { }
    if (theme === null || theme === undefined) {
      return "light";
    } else {
      return theme;
    }
  }
  if (codeMirrorTheme === null) setTheme(currentTheme());
  
  const publicMethods = {
    showSidebar: (e: any) => {return showSidebar(e);},
    hideSidebar: (e: any) => {return hideSidebar(e);},
    setTheme: (theme: any, store = true) => {return setTheme(theme, store);},
    currentTheme: () => {return currentTheme();},
  }

  return (
    <>
      <Sidebar outline={outline} {...publicMethods} />
        <div className="page-wrapper">
            <div className="page">
              <Header {...publicMethods} />
              <div id="content" className="content">
                  <main>
                    <Markdown theme={codeMirrorTheme}/>
                  </main>
              </div>
          </div>
        </div>
    </>
  )
}
export default hot(App);
//export default App;  // react-hot-loaderを無効にする場合はこちらを使う

ReactDOM.render(<App />, document.getElementById("app"));