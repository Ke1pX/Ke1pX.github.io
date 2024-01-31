(() => {
  // ns-hugo:/home/AspeX/blog/assets/js/post/copyCode.ts
  function addButtons() {
    const selector = ".highlight td:last-child > pre > code";
    document.querySelectorAll(selector).forEach((codeblock) => {
      const textCopy = "\u590D\u5236";
      const textCopied = "\u2713\u5DF2\u590D\u5236";
      const container2 = codeblock.parentNode.parentNode;
      const copyButton = document.createElement("button");
      copyButton.classList.add("copy-code");
      copyButton.innerHTML = textCopy;
      container2.appendChild(copyButton);
      copyButton.addEventListener("click", () => {
        if ("clipboard" in navigator && codeblock.textContent !== null) {
          navigator.clipboard.writeText(codeblock.textContent);
        } else {
          const range = document.createRange();
          range.selectNodeContents(codeblock);
          const selection = window.getSelection();
          if (selection === null) {
            return;
          }
          selection.removeAllRanges();
          selection.addRange(range);
          try {
            document.execCommand("copy");
          } catch (e) {
            console.error(e);
          }
          selection.removeRange(range);
        }
        copyButton.innerHTML = textCopied;
        setTimeout(() => {
          copyButton.innerHTML = textCopy;
        }, 2e3);
        return;
      });
    });
  }

  // ns-hugo:/home/AspeX/blog/assets/js/post/remark.ts
  function themeAutoChange() {
    if (themeManager.checkCurrentThemeIsDark()) {
      remark_config.theme = "dark";
    }
    themeManager.addThemeChangingCallback((_, isDark) => {
      const theme = isDark ? "dark" : "light";
      remark_config.theme = theme;
      REMARK42.changeTheme(theme);
    });
  }

  // ns-hugo:/home/AspeX/blog/assets/js/post/sidebar.ts
  var container = document.getElementById("article-and-sidebar");
  var sidebarTOC = document.getElementById("TableOfContents");
  var discussionArea = document.getElementById("discussion-area");
  var SidebarManager = class {
    constructor(articleReadState) {
      this.articleReadState = articleReadState;
      this.rewriteTOC();
    }
    tocIsRewritten = false;
    discussionAreaLink = null;
    rewriteTOC() {
      if (this.tocIsRewritten) {
        return;
      }
      const ol = sidebarTOC?.querySelector("ol");
      if (ol === null || ol === void 0) {
        return;
      }
      this.iterOrderList(ol, [], (level, item) => {
        const link = item.querySelector("a");
        if (link === null) {
          return;
        }
        const span = document.createElement("span");
        span.textContent = level.join(".");
        span.classList.add("counter");
        const textNode = link.firstChild;
        link.insertBefore(span, textNode);
      });
      this.addTitleLink(ol);
      if (discussionArea) {
        this.addDiscussionLink(ol);
      }
      sidebarTOC?.classList.add("rewritten");
      this.tocIsRewritten = true;
    }
    addTitleLink(ol) {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.textContent = "\u9876\u90E8\u6807\u9898";
      link.href = "#";
      link.onclick = function(event) {
        event.preventDefault();
        window.scrollManager.gotoTop();
      };
      listItem.appendChild(link);
      ol.insertBefore(listItem, ol.firstChild);
    }
    addDiscussionLink(ol) {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#discussion-area";
      listItem.appendChild(link);
      ol.appendChild(listItem);
      this.discussionAreaLink = listItem;
    }
    toggle() {
      const isEnabled = container?.classList.toggle("enabled");
      if (isEnabled) {
        this.autoSetSidebarActiveTitle();
      } else {
        window.removeEventListener("scroll", this.setSidebarActiveTitle);
      }
    }
    autoSetSidebarActiveTitle() {
      this.setSidebarActiveTitle();
      window.addEventListener("scroll", this.setSidebarActiveTitle, {
        passive: true
      });
    }
    isTitleVisible(element) {
      const containerTop = sidebarTOC.scrollTop + 16;
      const containerBottom = containerTop + sidebarTOC.clientHeight;
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.clientHeight;
      return elementTop >= containerTop && elementBottom <= containerBottom;
    }
    setSidebarActiveTitle = () => {
      if (sidebarTOC === null) {
        return;
      }
      if (discussionArea && discussionArea.offsetTop - window.scrollY < 120) {
        this.clearSidebarActiveState("active");
        this.discussionAreaLink?.classList.add("active");
        sidebarTOC.scrollTo({ top: this.discussionAreaLink?.offsetTop });
        return;
      }
      const id = this.articleReadState.findActiveTitleId(40);
      if (id === null) {
        this.clearSidebarActiveState("active");
        sidebarTOC.scrollTo({ top: 0 });
        return;
      }
      const title = this.setSidebarActiveTitleClass(id, "active");
      if (title && !this.isTitleVisible(title)) {
        sidebarTOC.scrollTo({ top: title.offsetTop - 16 - 12 });
      }
    };
    clearSidebarActiveState(className) {
      if (sidebarTOC === null) {
        return null;
      }
      Array.from(sidebarTOC.querySelectorAll("li")).forEach((li) => {
        li.classList.remove(className);
      });
    }
    setSidebarActiveTitleClass(id, className) {
      if (sidebarTOC === null) {
        return null;
      }
      let activeTitle = null;
      Array.from(sidebarTOC.querySelectorAll("li")).forEach((li) => {
        const href = li.querySelector("a")?.getAttribute("href");
        if (href === "#" + id) {
          activeTitle = li;
          if (!li.classList.contains(className)) {
            li.classList.add(className);
          }
        } else {
          li.classList.remove(className);
        }
      });
      return activeTitle;
    }
    iterOrderList(ol, level, cb) {
      const items = ol.querySelectorAll(":scope > li");
      level.push(0);
      items.forEach((item) => {
        level[level.length - 1] += 1;
        cb(level, item);
        const nestedOl = item.querySelector("ol");
        if (nestedOl) {
          this.iterOrderList(nestedOl, level, cb);
        }
      });
      level.pop();
    }
  };

  // ns-hugo:/home/AspeX/blog/assets/js/post/article.ts
  var ArticleReadState = class {
    titleElements;
    constructor(articleQuery, titleQuery) {
      const article = document.querySelector(articleQuery);
      if (article === null) {
        return;
      }
      this.titleElements = article.querySelectorAll(titleQuery);
    }
    /**
     * @param distance - 允许提前发现的标题距屏幕顶部的最大距离
     */
    findActiveTitleId(distance) {
      if (this.titleElements === void 0) {
        return null;
      }
      const foundElement = Array.from(this.titleElements).reverse().find((e) => {
        return e.offsetTop - window.scrollY < distance;
      });
      return foundElement ? foundElement.id : null;
    }
  };

  // ns-hugo:/home/AspeX/blog/assets/js/post/scroll.ts
  var ScrollManager = class {
    discussion;
    constructor() {
      this.discussion = document.querySelector(".article.discussion");
    }
    gotoTop() {
      history.pushState(
        null,
        document.title,
        window.location.pathname + window.location.search
      );
      window.scrollTo({ top: 0 });
    }
    gotoDiscussion() {
      this.discussion?.scrollIntoView();
    }
  };

  // <stdin>
  addButtons();
  themeAutoChange();
  sidebarManager = new SidebarManager(
    new ArticleReadState("article.article", "h1, h2, h3, h4")
  );
  scrollManager = new ScrollManager();
  sidebarManager.autoSetSidebarActiveTitle();
})();
