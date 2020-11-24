import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

type Props = {
  outline: any;
  showSidebar: (e: React.MouseEvent<HTMLInputElement>) => any;
  hideSidebar: (e: React.MouseEvent<HTMLInputElement>) => any;
}

const Sidebar: React.FC<Props> = ({outline, showSidebar, hideSidebar}) => {
  let html: any, sidebar: any, sidebarLinks: any;
  useLayoutEffect(() => {
    html = document.querySelector("html")
    sidebar = document.getElementById("sidebar")
    sidebarLinks = document.querySelectorAll('#sidebar a')
  })

  const resize = (e: React.MouseEvent<HTMLInputElement>) => {
    var pos = (e.clientX - sidebar.offsetLeft);
    if (pos < 20) {
      hideSidebar(e);
    } else {
      if (html.classList.contains("sidebar-hidden")) {
        showSidebar(e);
      }
      pos = Math.min(pos, window.innerWidth - 100);
      document.documentElement.style.setProperty('--sidebar-width', pos + 'px');
    }
  }

  const stopResize = (e: React.MouseEvent<HTMLInputElement>) => {
    html.classList.remove('sidebar-resizing');
    window.removeEventListener('mousemove', resize as any, false);
    window.removeEventListener('mouseup', stopResize as any, false);
  }

  const initResize = (e: React.MouseEvent<HTMLInputElement>) => {
    window.addEventListener('mousemove', resize as any, false);
    window.addEventListener('mouseup', stopResize as any, false);
    html.classList.add('sidebar-resizing');
    e.preventDefault();
  }

  const toggleExpand = (e: React.MouseEvent<HTMLInputElement>, children: any) => {
    if (!children || children.lengtn <= 0) return;
    let li: any = e.currentTarget.parentElement;
    li.classList.toggle('expanded');
  }

  const renderOl = (rows: any, olClass: string, numbers: number[]) => {
    let tmpNumbers: number[]
    return (
      <ol className={olClass} key={numbers.join("-")}>
        {
          rows.map((obj: any, i: number) => {
            numbers[numbers.length - 1] += 1
            return (
              <React.Fragment key={i}>
                <li className="chapter-item expanded" key={numbers.join("-")}>
                  <a href="#" onClick={ (e: any) => {toggleExpand(e, obj.children)} }>
                    { obj.number !== false && 
                      <strong>{ numbers.join('-') }.</strong>
                    }{ obj.title }
                  </a>
                </li>
                <li key={numbers.join("-") + "-children"}>
                  { obj.children && (
                    tmpNumbers = numbers.concat([0]),
                    renderOl(obj.children, "section", tmpNumbers)
                  )}
                </li>
              </React.Fragment>
            )
          })
        }
      </ol>
    );
  }

  return (
    <>
      <nav id="sidebar" className="sidebar">
        <div className="sidebar-scrollbox">
          {renderOl(outline, "chapter", [0])}
        </div>
        <div className="sidebar-resize-handle" onMouseDown={initResize}></div>
      </nav>
    </>
  )
}

export default Sidebar;