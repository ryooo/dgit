import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

function MenuContainer(props) {
  const [left, setLeft] = useState("0px");
  const [top, setTop] = useState("0px");
  const baseEl = useRef(null);

  const hideMenu = function() {
    baseEl.current.style.display = 'none';
    document.body.removeEventListener("click", hideMenu);
    if (props.attr?.onHide) props.attr.onHide();
    return false;
  }

  useEffect(() => {
    if (!props.attr?.menuItems) {
      hideMenu();
      return;
    }
    baseEl.current.style.display = "block";
    const clientRect = props.attr.positionElement.getBoundingClientRect();
    setLeft(window.pageXOffset + clientRect.left + 7 + "px");
    setTop(window.pageYOffset + clientRect.top + 14 + "px");
    document.body.addEventListener("click", hideMenu);
  }, [props.attr?.menuItems])

  return (
    <div ref={baseEl} style={{display: props.attr?.menuItems ? "block" : "none", position: "absolute", top: top, left: left, width: "30px", height: "30px"}}>
      <div className="menu-container" role="presentation">
        <div className="wrapper-south-start" style={{margin: 0}}>
          <div className="popover">
            <div className="card">
              <div className="arrow-south-start"></div>
              <div className="menu">
                <div className="menuItems">
                  {
                    props.attr?.menuItems ? props.attr.menuItems.map((v, i) => {
                      if (v == "divider") {
                        return <div className="menuDivider" key={i}></div>
                      } else {
                        return (
                          <div className="menuItemInline" key={i} onClick={(e) => {v["callback"](e)}}>
                            <div className="menuItemIcon">
                              {v["svg"]}
                            </div>
                            <div className="menuItemContent">
                              <span className="text">{v["text"]}</span>
                            </div>
                          </div>
                        )
                      }
                    }) : ""
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuContainer;
