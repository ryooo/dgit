import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'

type Props = {
  setTheme: (theme: string) => any;
  currentTheme: () => any;
  showSidebar: (e: any) => any;
  hideSidebar: (e: any) => any;
}

const Header: React.FC<Props> = ({setTheme, currentTheme, showSidebar, hideSidebar}) => {
  const [html, setHtml] = useState(null)
  const menuEl = useRef(null)
  const themePopupEl = useRef(null)
  const themeToggleButtonEl = useRef(null)
  const [themePopupAddedEventLisstener, setThemePopupAddedEventLisstener] = useState(false)
  const [bordered, setBordered] = useState(false)

  useEffect(() => {
    setHtml(document.querySelector("html"));
    document.addEventListener('scroll', toggleBordered, { passive: true });
  }, [])

  const toggleBordered = () => {
    setBordered(menuEl.current.offsetTop !== 0);
  }

  const scrollTop = (e: any) => {
    (document.scrollingElement as any).scrollTo({ top: 0, behavior: 'smooth' });
  }

  const toggleSidebar = (e: any) => {
    if (html.classList.contains("sidebar-hidden")) {
      showSidebar(e);
      var currentWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'), 10);
      if (currentWidth < 250) {
        document.documentElement.style.setProperty('--sidebar-width', '250px');
      }
    } else if (html.classList.contains("sidebar-visible")) {
      hideSidebar(e);
    } else {
      const sidebar: any = document.getElementById("sidebar")
      if (getComputedStyle(sidebar)['transform'] === 'none') {
        hideSidebar(e);
      } else {
        showSidebar(e);
      }
    }
  }

  const toggleThemesPopup = (e: any) => {
    if (themePopupEl.current.style.display === 'block') {
      hideThemesPopup(e);
    } else {
      showThemesPopup(e);
    }
  }

  const showThemesPopup = (e: any) => {
    themePopupEl.current.style.display = 'block';
    themePopupEl.current.querySelector("button#" + currentTheme()).focus();
    if (themePopupAddedEventLisstener)
      return
    themePopupEl.current.addEventListener('click', function (evt: any) {
      let theme = (evt.target as any).id || (evt.target as any).parentElement.id;
      setTheme(theme);
      hideThemesPopup(evt);
    });
    themePopupEl.current.addEventListener('focusout', function(evt: any) {
      // e.relatedTarget is null in Safari and Firefox on macOS (see workaround below)

      if (!!evt.relatedTarget && !themeToggleButtonEl.current.contains(evt.relatedTarget) && !themePopupEl.current.contains(evt.relatedTarget)) {
        hideThemesPopup(evt);
      }
    });
    // 代替策
    document.addEventListener('click', function(evt: any) {
      if (themePopupEl.current.style.display === 'block' && !themeToggleButtonEl.current.contains(evt.target) && !themePopupEl.current.contains(evt.target)) {
        hideThemesPopup(evt);
      }
    });
    setThemePopupAddedEventLisstener(true);
  }

  const hideThemesPopup = (e: any) => {
    themePopupEl.current.style.display = 'none';
    themeToggleButtonEl.current.focus();
  }

  let menuBarClass = classNames("menu-bar", {
    "bordered": bordered,
  })

  return (
    <>
      <div id="menu-bar-hover-placeholder"></div>
      <div id="menu-bar" className={menuBarClass} ref={menuEl}>
        <div className="left-buttons">
          <button id="sidebar-toggle" className="icon-button" type="button" title="サイドバーの表示切り替え" onClick={toggleSidebar}>
            <FontAwesomeIcon icon="bars" />
          </button>
          <button id="theme-toggle" className="icon-button" type="button" title="テーマ変更" onClick={toggleThemesPopup} ref={themeToggleButtonEl}>
            <FontAwesomeIcon icon="paint-brush" />
          </button>
          <ul id="theme-list" className="theme-popup" aria-label="Themes" role="menu" ref={themePopupEl}>
            <li role="none"><button role="menuitem" className="theme" id="light">Light (default)</button></li>
            <li role="none"><button role="menuitem" className="theme" id="rust">Rust</button></li>
            <li role="none"><button role="menuitem" className="theme" id="coal">Coal</button></li>
            <li role="none"><button role="menuitem" className="theme" id="navy">Navy</button></li>
            <li role="none"><button role="menuitem" className="theme" id="ayu">Ayu</button></li>
          </ul>
          
          <button id="search-toggle" className="icon-button" type="button" title="検索 (Shortkey: s)" aria-label="Toggle Searchbar" aria-expanded="false" aria-keyshortcuts="S" aria-controls="searchbar">
            <FontAwesomeIcon icon="search" />
          </button>
        </div>

        <h1 className="menu-title" onClick={scrollTop}>mdBook Documentation</h1>
        <div className="right-buttons">
          <button id="print-button" className="icon-button" type="button" title="印刷">
            <FontAwesomeIcon icon="print" />
          </button>
        </div>
      </div>
      <div id="search-wrapper" className="hidden">
        <form id="searchbar-outer" className="searchbar-outer">
          <input type="search" name="search" id="searchbar" placeholder="このプロジェクトから検索します" />
        </form>
        <div id="searchresults-outer" className="searchresults-outer hidden">
          <div id="searchresults-header" className="searchresults-header"></div>
          <ul id="searchresults"></ul>
        </div>
      </div>
    </>
  );
}

export default Header;
