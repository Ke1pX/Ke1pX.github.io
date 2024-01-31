(() => {
  // ns-hugo:/home/AspeX/blog/assets/js/core/themeManager.ts
  var BrowserTheme = class {
    mediaQueryList;
    constructor() {
      this.mediaQueryList = matchMedia("(prefers-color-scheme: dark)");
    }
    trigger(cb) {
      this.mediaQueryList.addEventListener("change", () => {
        cb(this.isDark());
      });
    }
    isDark() {
      return this.mediaQueryList.matches;
    }
    hasDarkReader() {
      return document.documentElement.hasAttribute("data-darkreader-mode");
    }
  };
  var ThemeManager = class {
    constructor(lightThemes, darkThemes, domMarkBase, domMarkVariant, storage, storageBase, storageVariant) {
      this.lightThemes = lightThemes;
      this.darkThemes = darkThemes;
      this.domMarkBase = domMarkBase;
      this.domMarkVariant = domMarkVariant;
      this.storage = storage;
      this.storageBase = storageBase;
      this.storageVariant = storageVariant;
      const themeOpts = this.getForceThemeOpts();
      if (themeOpts !== null) {
        const { isDark, index } = themeOpts;
        this.setDomMarkBase(isDark);
        const theme = this.getThemeNameByIndex(index);
        this.setDomMarkVariant(theme);
      }
      this.browserTheme.trigger((browserIsDark) => {
        let forceTheme = this.getForceThemeOpts();
        if (forceTheme && browserIsDark !== forceTheme.isDark) {
          this.undoForceTheme();
        }
        forceTheme = this.getForceThemeOpts();
        if (forceTheme === null) {
          this.dispatch(browserIsDark ? "dark" : "light", browserIsDark);
        }
      });
    }
    themeChangingCallbacks = [];
    browserTheme = new BrowserTheme();
    setNextTheme() {
      if (this.browserTheme.hasDarkReader()) {
        console.info("\u68C0\u6D4B\u5230Dark Reader\uFF0C\u7981\u7528\u4E3B\u9898\u5207\u6362");
        return;
      }
      const themeOpts = this.getForceThemeOpts();
      let fromIndex;
      if (themeOpts === null) {
        fromIndex = this.browserTheme.isDark() ? this.lightThemes.length : 0;
      } else {
        fromIndex = themeOpts.index;
      }
      const { changeToDark, index: nextIndex } = this.getNextThemeOpts(fromIndex);
      const browserIsDark = this.browserTheme.isDark();
      if (changeToDark && browserIsDark && nextIndex === this.lightThemes.length || !changeToDark && !browserIsDark && nextIndex === 0) {
        this.undoForceTheme();
      } else {
        this.forceTheme(changeToDark, nextIndex);
      }
      this.dispatch(this.getCurrentTheme(), this.checkCurrentThemeIsDark());
    }
    // 检查用户设置的值和浏览器偏好
    getCurrentTheme() {
      const themeOpts = this.getForceThemeOpts();
      if (themeOpts === null) {
        return this.browserTheme.isDark() ? this.darkThemes[0] : this.lightThemes[0];
      }
      return this.getThemeNameByIndex(themeOpts.index);
    }
    checkCurrentThemeIsDark() {
      const themeOpts = this.getForceThemeOpts();
      if (themeOpts === null) {
        return this.browserTheme.isDark();
      } else {
        return themeOpts.isDark;
      }
    }
    addThemeChangingCallback(cb) {
      this.themeChangingCallbacks.push(cb);
    }
    getThemeNameByIndex(index) {
      if (index >= this.lightThemes.length) {
        return this.darkThemes[index - this.lightThemes.length];
      } else {
        return this.lightThemes[index];
      }
    }
    dispatch(theme, isDark) {
      this.themeChangingCallbacks.forEach((cb) => {
        cb(theme, isDark);
      });
    }
    getNextThemeOpts(index) {
      const maxIndex = this.lightThemes.length + this.darkThemes.length - 1;
      index += 1;
      let changeToDark;
      if (index > maxIndex) {
        index = 0;
        changeToDark = false;
      } else if (index >= this.lightThemes.length) {
        changeToDark = true;
      } else {
        changeToDark = false;
      }
      return { changeToDark, index };
    }
    getForceThemeOpts() {
      const base = this.storage.getItem(this.storageBase);
      if (base === null) {
        return null;
      }
      const isDark = base === "dark";
      const index = this.storage.getItem(this.storageVariant);
      if (index === null) {
        return null;
      }
      return { isDark, index: parseInt(index) };
    }
    forceTheme(isDark, themeIndex) {
      this.storage.setItem(this.storageBase, isDark ? "dark" : "light");
      this.storage.setItem(this.storageVariant, themeIndex.toString());
      this.setDomMarkBase(isDark);
      this.setDomMarkVariant(this.getCurrentTheme());
    }
    undoForceTheme() {
      this.storage.removeItem(this.storageBase);
      this.storage.removeItem(this.storageVariant);
      this.unsetDomMark();
    }
    setDomMarkBase(isDark) {
      const val = isDark ? "dark" : "light";
      document.documentElement.setAttribute(this.domMarkBase, val);
    }
    setDomMarkVariant(theme) {
      document.documentElement.setAttribute(this.domMarkVariant, theme);
    }
    unsetDomMark() {
      document.documentElement.removeAttribute(this.domMarkBase);
      document.documentElement.removeAttribute(this.domMarkVariant);
    }
  };

  // ns-params:@params
  var remarkStyle = { integrity: "sha384-QkggC+LWhGCah3wqwvUD074Ey7bUbPWbBr01PxOIHOGH6sIqL8Oz/bhOQbo7ysCF", url: "/css/custom-remark.4248200be2d684609a877c2ac2f503d3be04cbb6d46cf59b06bd353f13881ce187eac22a2fc3b3fdb84e41ba3bcac085.css" };

  // ns-hugo:/home/AspeX/blog/assets/js/core/remarkStyle.ts
  function addRemarkStyle() {
    const container = document.getElementById("remark42");
    if (!container) {
      return;
    }
    if (container.firstChild) {
      const remark42Iframe = container.firstChild;
      remark42Iframe.addEventListener("load", () => {
        addStyleFile(remark42Iframe.contentDocument);
      });
    } else {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type !== "childList" || mutation.addedNodes.length === 0) {
            return;
          }
          const addedNode = mutation.addedNodes[0];
          if (!addedNode.tagName || addedNode.tagName.toLowerCase() !== "iframe") {
            return;
          }
          const remark42Iframe = addedNode;
          remark42Iframe.addEventListener("load", () => {
            addStyleFile(remark42Iframe.contentDocument);
          });
          observer.disconnect();
        });
      });
      observer.observe(container, { childList: true });
    }
    const bodyObserver = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0) {
          return;
        }
        mutation.addedNodes.forEach((addedNode) => {
          if (!(addedNode instanceof Element) || !addedNode.tagName || addedNode.tagName.toLowerCase() !== "div" || !(addedNode.firstChild instanceof Element) || !addedNode.firstChild.tagName || addedNode.firstChild.tagName.toLowerCase() !== "iframe") {
            return;
          }
          const remark42Iframe = addedNode.firstChild;
          remark42Iframe.addEventListener("load", () => {
            addStyleFile(remark42Iframe.contentDocument);
            bodyObserver.disconnect();
            observeUserCommentsContainer(addedNode);
          });
        });
      });
    });
    bodyObserver.observe(document.body, { childList: true });
  }
  function observeUserCommentsContainer(container) {
    new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0) {
          return;
        }
        mutation.addedNodes.forEach((addedNode) => {
          if (!(addedNode instanceof Element) || !addedNode.tagName || addedNode.tagName.toLowerCase() !== "iframe") {
            return;
          }
          const remark42Iframe = addedNode;
          remark42Iframe.addEventListener("load", () => {
            addStyleFile(remark42Iframe.contentDocument);
          });
        });
      });
    }).observe(container, { childList: true });
  }
  function addStyleFile(iframeDoc) {
    const linkElement = iframeDoc.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = remarkStyle.url;
    linkElement.integrity = remarkStyle.integrity;
    iframeDoc.head.appendChild(linkElement);
  }

  // ns-hugo:/home/AspeX/blog/assets/js/vendor/iconfont.js
  window._iconfont_svg_string_4393813 = '<svg><symbol id="icon-music" viewBox="0 0 512 512"><path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" ></path></symbol><symbol id="icon-box-archive" viewBox="0 0 512 512"><path d="M32 32H480c17.7 0 32 14.3 32 32V96c0 17.7-14.3 32-32 32H32C14.3 128 0 113.7 0 96V64C0 46.3 14.3 32 32 32zm0 128H480V416c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V160zm128 80c0 8.8 7.2 16 16 16H336c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z" ></path></symbol><symbol id="icon-user"  viewBox="0 0 512 512"><path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"></path></symbol><symbol id="icon-pixivbtn" viewBox="0 0 1024 1024"><path d="M749.568 491.52c-14.336 90.112-79.872 155.648-169.984 169.984-63.488 10.24-122.88 0-184.32-20.48-16.384-6.144-22.528-14.336-20.48-32.768 2.048-47.104 0-94.208 0-143.36 0-49.152 0-98.304 0-147.456 0-10.24 2.048-20.48 12.288-26.624 81.92-40.96 165.888-57.344 251.904-18.432C716.8 311.296 761.856 405.504 749.568 491.52zM1024 512c0 282.624-229.376 512-512 512S0 794.624 0 512 229.376 0 512 0 1024 229.376 1024 512zM776.192 301.056c-53.248-59.392-124.928-83.968-202.752-88.064-133.12-8.192-247.808 40.96-348.16 122.88-55.296 45.056-55.296 45.056-16.384 100.352 4.096 6.144 6.144 16.384 16.384 12.288 8.192-4.096 8.192-12.288 8.192-20.48 0-10.24-2.048-20.48 6.144-30.72 16.384-22.528 34.816-40.96 61.44-61.44 0 145.408 0 284.672 0 423.936 0 12.288-4.096 18.432-14.336 22.528-8.192 2.048-16.384 8.192-14.336 18.432 2.048 10.24 12.288 8.192 20.48 8.192 30.72 0 61.44 0 94.208 0 8.192 0 16.384 2.048 18.432-8.192 2.048-10.24-6.144-12.288-14.336-16.384-6.144-4.096-16.384-4.096-16.384-16.384 0-30.72 0-59.392 0-88.064 4.096 0 6.144 0 6.144 0 8.192 2.048 18.432 6.144 26.624 8.192 98.304 28.672 198.656 32.768 292.864-12.288C851.968 604.16 888.832 423.936 776.192 301.056z"  ></path></symbol><symbol id="icon-rss-square" viewBox="0 0 1024 1024"><path d="M365.714286 731.428571q0-30.285714-21.428572-51.714285T292.571429 658.285714t-51.714286 21.428572T219.428571 731.428571t21.428572 51.714286T292.571429 804.571429t51.714285-21.428572T365.714286 731.428571z m200.571428 53.714286q-7.428571-133.142857-100.857143-226.571428T238.857143 457.714286q-8-0.571429-13.714286 5.142857t-5.714286 13.142857v73.142857q0 7.428571 4.857143 12.571429t12.285715 5.714285q88 6.285714 150.857142 69.142858t69.142858 150.857142q0.571429 7.428571 5.714285 12.285715t12.571429 4.857143h73.142857q7.428571 0 13.142857-5.714286t5.142857-13.714286z m219.428572 0.571429q-2.857143-88-32-170t-79.714286-148.571429-117.142857-117.142857-148.571429-79.714286T238.285714 238.285714q-8-0.571429-13.142857 5.142857-5.714286 5.714286-5.714286 13.142858v73.142857q0 7.428571 5.142858 12.571428t12.571428 5.714286q116.571429 4 216 63.714286T612.285714 570.857143t63.714286 216q0.571429 7.428571 5.714286 12.571428t12.571428 5.142858h73.142857q7.428571 0 13.142858-5.714286 6.285714-5.142857 5.142857-13.142857z m165.142857-548v548.571428q0 68-48.285714 116.285715T786.285714 950.857143H237.714286q-68 0-116.285715-48.285714T73.142857 786.285714V237.714286q0-68 48.285714-116.285715T237.714286 73.142857h548.571428q68 0 116.285715 48.285714T950.857143 237.714286z"  ></path></symbol><symbol id="icon-github" viewBox="0 0 1024 1024"><path d="M511.957333 21.333333C241.024 21.333333 21.333333 240.981333 21.333333 512c0 216.832 140.544 400.725333 335.573334 465.664 24.490667 4.394667 32.256-10.069333 32.256-23.082667 0-11.690667 0.256-44.245333 0-85.205333-136.448 29.610667-164.736-64.64-164.736-64.64-22.314667-56.704-54.4-71.765333-54.4-71.765333-44.586667-30.464 3.285333-29.824 3.285333-29.824 49.194667 3.413333 75.178667 50.517333 75.178667 50.517333 43.776 75.008 114.816 53.333333 142.762666 40.789333 4.522667-31.658667 17.152-53.376 31.189334-65.536-108.970667-12.458667-223.488-54.485333-223.488-242.602666 0-53.546667 19.114667-97.322667 50.517333-131.669334-5.034667-12.330667-21.930667-62.293333 4.778667-129.834666 0 0 41.258667-13.184 134.912 50.346666a469.802667 469.802667 0 0 1 122.88-16.554666c41.642667 0.213333 83.626667 5.632 122.88 16.554666 93.653333-63.488 134.784-50.346667 134.784-50.346666 26.752 67.541333 9.898667 117.504 4.864 129.834666 31.402667 34.346667 50.474667 78.122667 50.474666 131.669334 0 188.586667-114.730667 230.016-224.042666 242.090666 17.578667 15.232 33.578667 44.672 33.578666 90.453334v135.850666c0 13.141333 7.936 27.605333 32.853334 22.869334C862.250667 912.597333 1002.666667 728.746667 1002.666667 512 1002.666667 240.981333 783.018667 21.333333 511.957333 21.333333z"  ></path></symbol><symbol id="icon-box-heart" viewBox="0 0 1024 1024"><path d="M959.2 317.6L846.6 107.8C837.8 81.6 813.4 64 785.8 64H544v256h413.4c0.8-1 1-1.4 1.8-2.4zM64 384v512c0 35.4 28.6 64 64 64h768c35.4 0 64-28.6 64-64V384H64z m610.2 298.4l-145.2 142.8c-9.4 9.2-24.6 9.2-34 0l-145.2-142.8c-42.2-41.4-39.6-110.2 7.4-148.4 41-33.4 102.2-27.4 140 9.6l14.8 14.6 14.8-14.6c37.6-37 98.8-43 140-9.6 47 38.2 49.4 106.8 7.4 148.4zM480 320V64H238.2c-27.6 0-52 17.6-60.8 43.8L64.8 317.6c0.8 1 1 1.4 1.8 2.4H480z"  ></path></symbol><symbol id="icon-lightbulb" viewBox="0 0 1024 1024"><path d="M352.115929 908.682444c0.02 12.579733 3.739921 24.899472 10.719773 35.37925l34.179275 51.378911a63.978644 63.978644 0 0 0 53.278871 28.559395h123.417385a63.978644 63.978644 0 0 0 53.278871-28.559395l34.179276-51.378911a63.976644 63.976644 0 0 0 10.719772-35.37925l0.079999-76.698375H352.015931l0.099998 76.698375zM160 351.994241c0 88.73812 32.899303 169.696404 87.118154 231.555093 33.0393 37.699201 84.718205 116.457532 104.417787 182.896124 0.079998 0.519989 0.139997 1.039978 0.219995 1.559967h320.473209c0.079998-0.519989 0.139997-1.019978 0.219995-1.559967 19.699583-66.438592 71.378487-145.196923 104.417788-182.896124C831.085779 521.690645 863.985082 440.73236 863.985082 351.994241 863.985082 157.218368 705.808434-0.598287 510.892564 0.0017 306.876887 0.621687 160 165.938184 160 351.994241z m351.992541-159.99661c-88.218131 0-159.996609 71.778479-159.99661 159.99661 0 17.679625-14.319697 31.999322-31.999322 31.999322s-31.999322-14.319697-31.999321-31.999322c0-123.517382 100.477871-223.995253 223.995253-223.995253 17.679625 0 31.999322 14.319697 31.999322 31.999321s-14.319697 31.999322-31.999322 31.999322z"  ></path></symbol></svg>', function(n) {
    var t = (t = document.getElementsByTagName("script"))[t.length - 1], e = t.getAttribute("data-injectcss"), t = t.getAttribute("data-disable-injectsvg");
    if (!t) {
      var o, i, c, s, a, d = function(t2, e2) {
        e2.parentNode.insertBefore(t2, e2);
      };
      if (e && !n.__iconfont__svg__cssinject__) {
        n.__iconfont__svg__cssinject__ = true;
        try {
          document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>");
        } catch (t2) {
          console && console.log(t2);
        }
      }
      o = function() {
        var t2, e2 = document.createElement("div");
        e2.innerHTML = n._iconfont_svg_string_4393813, (e2 = e2.getElementsByTagName("svg")[0]) && (e2.setAttribute("aria-hidden", "true"), e2.style.position = "absolute", e2.style.width = 0, e2.style.height = 0, e2.style.overflow = "hidden", e2 = e2, (t2 = document.body).firstChild ? d(e2, t2.firstChild) : t2.appendChild(e2));
      }, document.addEventListener ? ~["complete", "loaded", "interactive"].indexOf(document.readyState) ? setTimeout(o, 0) : (i = function() {
        document.removeEventListener("DOMContentLoaded", i, false), o();
      }, document.addEventListener("DOMContentLoaded", i, false)) : document.attachEvent && (c = o, s = n.document, a = false, r(), s.onreadystatechange = function() {
        "complete" == s.readyState && (s.onreadystatechange = null, l());
      });
    }
    function l() {
      a || (a = true, c());
    }
    function r() {
      try {
        s.documentElement.doScroll("left");
      } catch (t2) {
        return void setTimeout(r, 50);
      }
      l();
    }
  }(window);

  // <stdin>
  themeManager = new ThemeManager(
    ["light"],
    ["dark", "night"],
    "data-user-color-scheme",
    "data-user-color-scheme-variant",
    localStorage,
    "theme",
    "themeVariant"
  );
  document.addEventListener("DOMContentLoaded", addRemarkStyle);
})();
