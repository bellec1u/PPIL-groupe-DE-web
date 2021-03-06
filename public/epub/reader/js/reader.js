

EPUBJS.reader = {}, EPUBJS.reader.plugins = {},
    function(a) {
        var b = (a.ePubReader || {}, a.ePubReader = function(a, b) {
            return new EPUBJS.Reader(a, b)
        });
        "function" == typeof define && define.amd ? define(function() {
            return Reader
        }) : "undefined" != typeof module && module.exports && (module.exports = b)
    }(window, jQuery), EPUBJS.Reader = function(a, b) {
    var c, d, e, f = this,
        g = $("#viewer"),
        h = window.location.search;
    this.settings = EPUBJS.core.defaults(b || {}, {
        bookPath: a,
        restore: !1,
        reload: !1,
        bookmarks: void 0,
        annotations: void 0,
        contained: void 0,
        bookKey: void 0,
        styles: void 0,
        sidebarReflow: !1,
        generatePagination: !1,
        history: !0
    }), h && (e = h.slice(1).split("&"), e.forEach(function(a) {
        var b = a.split("="),
            c = b[0],
            d = b[1] || "";
        f.settings[c] = decodeURIComponent(d)
    })), this.setBookKey(this.settings.bookPath), this.settings.restore && this.isSaved() && this.applySavedSettings(), this.settings.styles = this.settings.styles || {
            fontSize: "100%"
        }, this.book = c = new EPUBJS.Book(this.settings), this.settings.previousLocationCfi && c.gotoCfi(this.settings.previousLocationCfi), this.offline = !1, this.sidebarOpen = !1, this.settings.bookmarks || (this.settings.bookmarks = []), this.settings.annotations || (this.settings.annotations = []), this.settings.generatePagination && c.generatePagination(g.width(), g.height()), c.renderTo("viewer"), f.ReaderController = EPUBJS.reader.ReaderController.call(f, c), f.SettingsController = EPUBJS.reader.SettingsController.call(f, c), f.ControlsController = EPUBJS.reader.ControlsController.call(f, c), f.SidebarController = EPUBJS.reader.SidebarController.call(f, c), f.BookmarksController = EPUBJS.reader.BookmarksController.call(f, c), f.NotesController = EPUBJS.reader.NotesController.call(f, c);
    for (d in EPUBJS.reader.plugins) EPUBJS.reader.plugins.hasOwnProperty(d) && (f[d] = EPUBJS.reader.plugins[d].call(f, c));
    return c.ready.all.then(function() {
        f.ReaderController.hideLoader()
    }), c.getMetadata().then(function(a) {
        f.MetaController = EPUBJS.reader.MetaController.call(f, a)
    }), c.getToc().then(function(a) {
        f.TocController = EPUBJS.reader.TocController.call(f, a)
    }), window.addEventListener("beforeunload", this.unload.bind(this), !1), window.addEventListener("hashchange", this.hashChanged.bind(this), !1), document.addEventListener("keydown", this.adjustFontSize.bind(this), !1), c.on("renderer:keydown", this.adjustFontSize.bind(this)), c.on("renderer:keydown", f.ReaderController.arrowKeys.bind(this)), c.on("renderer:selected", this.selectedRange.bind(this)), this
}, EPUBJS.Reader.prototype.adjustFontSize = function(a) {
    var b, c = 2,
        d = 187,
        e = 189,
        f = 48,
        g = a.ctrlKey || a.metaKey;
    this.settings.styles && (this.settings.styles.fontSize || (this.settings.styles.fontSize = "100%"), b = parseInt(this.settings.styles.fontSize.slice(0, -1)), g && a.keyCode == d && (a.preventDefault(), this.book.setStyle("fontSize", b + c + "%")), g && a.keyCode == e && (a.preventDefault(), this.book.setStyle("fontSize", b - c + "%")), g && a.keyCode == f && (a.preventDefault(), this.book.setStyle("fontSize", "100%")))
}, EPUBJS.Reader.prototype.addBookmark = function(a) {
    var b = this.isBookmarked(a);
    b > -1 || (this.settings.bookmarks.push(a), this.trigger("reader:bookmarked", a))
}, EPUBJS.Reader.prototype.removeBookmark = function(a) {
    var b = this.isBookmarked(a); - 1 !== b && (this.settings.bookmarks.splice(b, 1), this.trigger("reader:unbookmarked", b))
}, EPUBJS.Reader.prototype.isBookmarked = function(a) {
    var b = this.settings.bookmarks;
    return b.indexOf(a)
}, EPUBJS.Reader.prototype.clearBookmarks = function() {
    this.settings.bookmarks = []
}, EPUBJS.Reader.prototype.addNote = function(a) {
    this.settings.annotations.push(a)
}, EPUBJS.Reader.prototype.removeNote = function(a) {
    var b = this.settings.annotations.indexOf(a); - 1 !== b && delete this.settings.annotations[b]
}, EPUBJS.Reader.prototype.clearNotes = function() {
    this.settings.annotations = []
}, EPUBJS.Reader.prototype.setBookKey = function(a) {
    return this.settings.bookKey || (this.settings.bookKey = "epubjsreader:" + EPUBJS.VERSION + ":" + window.location.host + ":" + a), this.settings.bookKey
}, EPUBJS.Reader.prototype.isSaved = function() {
    var a;
    return localStorage ? (a = localStorage.getItem(this.settings.bookKey), null === a ? !1 : !0) : !1
}, EPUBJS.Reader.prototype.removeSavedSettings = function() {
    return localStorage ? void localStorage.removeItem(this.settings.bookKey) : !1
}, EPUBJS.Reader.prototype.applySavedSettings = function() {
    var a;
    if (!localStorage) return !1;
    try {
        a = JSON.parse(localStorage.getItem(this.settings.bookKey))
    } catch (b) {
        return !1
    }
    return a ? (a.styles && (this.settings.styles = EPUBJS.core.defaults(this.settings.styles || {}, a.styles)), this.settings = EPUBJS.core.defaults(this.settings, a), !0) : !1
}, EPUBJS.Reader.prototype.saveSettings = function() {
    return this.book && (this.settings.previousLocationCfi = this.book.getCurrentLocationCfi()), localStorage ? void localStorage.setItem(this.settings.bookKey, JSON.stringify(this.settings)) : !1
}, EPUBJS.Reader.prototype.unload = function() {
    this.settings.restore && localStorage && this.saveSettings()
}, EPUBJS.Reader.prototype.hashChanged = function() {
    var a = window.location.hash.slice(1);
    this.book.goto(a)
}, EPUBJS.Reader.prototype.selectedRange = function(a) {
    var b = new EPUBJS.EpubCFI,
        c = b.generateCfiFromRangeAnchor(a, this.book.renderer.currentChapter.cfiBase),
        d = "#" + c;
    this.settings.history && window.location.hash != d && (history.pushState({}, "", d), this.currentLocationCfi = c)
}, RSVP.EventTarget.mixin(EPUBJS.Reader.prototype), EPUBJS.reader.BookmarksController = function() {
    var a = this.book,
        b = $("#bookmarksView"),
        c = b.find("#bookmarks"),
        d = document.createDocumentFragment(),
        e = function() {
            b.show()
        },
        f = function() {
            b.hide()
        },
        g = 0,
        h = function(b) {
            var c = document.createElement("li"),
                d = document.createElement("a");
            return c.id = "bookmark-" + g, c.classList.add("list_item"), d.textContent = b, d.href = b, d.classList.add("bookmark_link"), d.addEventListener("click", function(b) {
                var c = this.getAttribute("href");
                a.gotoCfi(c), b.preventDefault()
            }, !1), c.appendChild(d), g++, c
        };
    return this.settings.bookmarks.forEach(function(a) {
        var b = h(a);
        d.appendChild(b)
    }), c.append(d), this.on("reader:bookmarked", function(a) {
        var b = h(a);
        c.append(b)
    }), this.on("reader:unbookmarked", function(a) {
        var b = $("#bookmark-" + a);
        b.remove()
    }), {
        show: e,
        hide: f
    }
}, EPUBJS.reader.ControlsController = function(a) {



    var b = this,
        c = ($("#store"), $("#fullscreen")),
        d = ($("#fullscreenicon"), $("#cancelfullscreenicon"), $("#slider")),
        e = ($("#main"), $("#sidebar"), $("#setting")),
        f = $("#bookmark"),
        g = function() {
            b.offline = !1
        },
        h = function() {
            b.offline = !0
        },
        i = !1;
    return a.on("Book:online", g), a.on("Book:offline", h), d.on("click", function() {
        b.sidebarOpen ? (b.SidebarController.hide(), d.addClass("icon-menu"), d.removeClass("icon-right")) : (b.SidebarController.show(), d.addClass("icon-right"), d.removeClass("icon-menu"))
    }), "undefined" != typeof screenfull && (c.on("click", function() {
        screenfull.toggle($("#container")[0])
    }), screenfull.raw && document.addEventListener(screenfull.raw.fullscreenchange, function() {
        i = screenfull.isFullscreen, i ? c.addClass("icon-resize-small").removeClass("icon-resize-full") : c.addClass("icon-resize-full").removeClass("icon-resize-small")
    })), e.on("click", function() {
        b.SettingsController.show()
    }), f.on("click", function() {
        var a = b.book.getCurrentLocationCfi(),
            c = b.isBookmarked(a); - 1 === c ? (b.addBookmark(a), f.addClass("icon-bookmark").removeClass("icon-bookmark-empty")) : (b.removeBookmark(a), f.removeClass("icon-bookmark").addClass("icon-bookmark-empty"))
        
    }), a.on("renderer:locationChanged", function(a) {
        var c = "#" + a,
            d = b.isBookmarked(a); - 1 === d ? f.removeClass("icon-bookmark").addClass("icon-bookmark-empty") : f.addClass("icon-bookmark").removeClass("icon-bookmark-empty"), b.currentLocationCfi = a, b.settings.history && window.location.hash != c && history.pushState({}, "", c)
    }), a.on("Book:pageChanged", function() {}), {}
}, EPUBJS.reader.MetaController = function(a) {
    var b = a.bookTitle,
        c = a.creator,
        d = $("#Book-title"),
        e = $("#chapter-title"),
        f = $("#title-seperator");
    document.title = b + " – " + c, d.html(b), e.html(c), f.show()
}, EPUBJS.reader.NotesController = function() {
    var a = this.book,
        b = this,
        c = $("#notesView"),
        d = $("#notes"),
        e = $("#note-text"),
        f = $("#note-anchor"),
        g = b.settings.annotations,
        h = a.renderer,
        i = [],
        j = new EPUBJS.EpubCFI,
        k = function() {
            c.show()
        },
        l = function() {
            c.hide()
        },
        m = function(c) {
            var d, g, h, i, k, l = a.renderer.doc;
            if (l.caretPositionFromPoint ? (d = l.caretPositionFromPoint(c.clientX, c.clientY), g = d.offsetNode, h = d.offset) : l.caretRangeFromPoint && (d = l.caretRangeFromPoint(c.clientX, c.clientY), g = d.startContainer, h = d.startOffset), 3 !== g.nodeType)
                for (var p = 0; p < g.childNodes.length; p++)
                    if (3 == g.childNodes[p].nodeType) {
                        g = g.childNodes[p];
                        break
                    }
            h = g.textContent.indexOf(".", h), -1 === h ? h = g.length : h += 1, i = j.generateCfiFromTextNode(g, h, a.renderer.currentChapter.cfiBase), k = {
                annotatedAt: new Date,
                anchor: i,
                body: e.val()
            }, b.addNote(k), n(k), o(k), e.val(""), f.text("Attach"), e.prop("disabled", !1), a.off("renderer:click", m)
        },
        n = function(b) {
            var c = document.createElement("li"),
                e = document.createElement("a");
            c.innerHTML = b.body, e.innerHTML = " context &#187;", e.href = "#" + b.anchor, e.onclick = function() {
                return a.gotoCfi(b.anchor), !1
            }, c.appendChild(e), d.append(c)
        },
        o = function(b) {
            var c = a.renderer.doc,
                d = document.createElement("span"),
                e = document.createElement("a");
            d.classList.add("footnotesuperscript", "reader_generated"), d.style.verticalAlign = "super", d.style.fontSize = ".75em", d.style.lineHeight = "1em", e.style.padding = "2px", e.style.backgroundColor = "#fffa96", e.style.borderRadius = "5px", e.style.cursor = "pointer", d.id = "note-" + EPUBJS.core.uuid(), e.innerHTML = g.indexOf(b) + 1 + "[Reader]", d.appendChild(e), j.addMarker(b.anchor, c, d), p(d, b.body)
        },
        p = function(a, c) {
            var d = a.id,
                e = function() {
                    var b, e, k, l, m = h.height,
                        n = h.width,
                        o = 225;
                    i[d] || (i[d] = document.createElement("div"), i[d].setAttribute("class", "popup"), pop_content = document.createElement("div"), i[d].appendChild(pop_content), pop_content.innerHTML = c, pop_content.setAttribute("class", "pop_content"), h.render.document.body.appendChild(i[d]), i[d].addEventListener("mouseover", f, !1), i[d].addEventListener("mouseout", g, !1), h.on("renderer:locationChanged", j, this), h.on("renderer:locationChanged", g, this)), b = i[d], e = a.getBoundingClientRect(), k = e.left, l = e.top, b.classList.add("show"), popRect = b.getBoundingClientRect(), b.style.left = k - popRect.width / 2 + "px", b.style.top = l + "px", o > m / 2.5 && (o = m / 2.5, pop_content.style.maxHeight = o + "px"), popRect.height + l >= m - 25 ? (b.style.top = l - popRect.height + "px", b.classList.add("above")) : b.classList.remove("above"), k - popRect.width <= 0 ? (b.style.left = k + "px", b.classList.add("left")) : b.classList.remove("left"), k + popRect.width / 2 >= n ? (b.style.left = k - 300 + "px", popRect = b.getBoundingClientRect(), b.style.left = k - popRect.width + "px", popRect.height + l >= m - 25 ? (b.style.top = l - popRect.height + "px", b.classList.add("above")) : b.classList.remove("above"), b.classList.add("right")) : b.classList.remove("right")
                },
                f = function() {
                    i[d].classList.add("on")
                },
                g = function() {
                    i[d].classList.remove("on")
                },
                j = function() {
                    setTimeout(function() {
                        i[d].classList.remove("show")
                    }, 100)
                },
                l = function() {
                    b.ReaderController.slideOut(), k()
                };
            a.addEventListener("mouseover", e, !1), a.addEventListener("mouseout", j, !1), a.addEventListener("click", l, !1)
        };
    return f.on("click", function() {
        f.text("Cancel"), e.prop("disabled", "true"), a.on("renderer:click", m)
    }), g.forEach(function(a) {
        n(a)
    }), h.registerHook("beforeChapterDisplay", function(a, b) {
        var c = b.currentChapter;
        g.forEach(function(a) {
            var b = j.parse(a.anchor);
            if (b.spinePos === c.spinePos) try {
                o(a)
            } catch (d) {
                console.log("anchoring failed", a.anchor)
            }
        }), a()
    }, !0), {
        show: k,
        hide: l
    }
}, EPUBJS.reader.ReaderController = function(a) {
    var b = $("#main"),
        c = $("#divider"),
        d = $("#loader"),
        e = $("#next"),
        f = $("#prev"),
        g = this,
        a = this.book,
        h = function() {
            var c = a.getCurrentLocationCfi();
            g.settings.sidebarReflow ? (b.removeClass("single"), b.one("transitionend", function() {
                a.gotoCfi(c)
            })) : b.removeClass("closed")
        },
        i = function() {
            var c = a.getCurrentLocationCfi();
            g.settings.sidebarReflow ? (b.addClass("single"), b.one("transitionend", function() {
                a.gotoCfi(c)
            })) : b.addClass("closed")
        },
        j = function() {
            d.show(), m()
        },
        k = function() {
            d.hide()
        },
        l = function() {
            c.addClass("show")
        },
        m = function() {
            c.removeClass("show")
        },
        n = !1,
        o = function(b) {
            37 == b.keyCode && ("rtl" === a.metadata.direction ? a.nextPage() : a.prevPage(), f.addClass("active"), n = !0, setTimeout(function() {
                n = !1, f.removeClass("active")
            }, 100), b.preventDefault()), 39 == b.keyCode && ("rtl" === a.metadata.direction ? a.prevPage() : a.nextPage(), e.addClass("active"), n = !0, setTimeout(function() {
                n = !1, e.removeClass("active")
            }, 100), b.preventDefault())
        };
    return document.addEventListener("keydown", o, !1), e.on("click", function(b) {
        "rtl" === a.metadata.direction ? a.prevPage() : a.nextPage(), b.preventDefault()
    }), f.on("click", function(b) {
        "rtl" === a.metadata.direction ? a.nextPage() : a.prevPage(), b.preventDefault()
    }), a.on("renderer:spreads", function(a) {
        a ? l() : m()
    }), {
        slideOut: i,
        slideIn: h,
        showLoader: j,
        hideLoader: k,
        showDivider: l,
        hideDivider: m,
        arrowKeys: o
    }
}, EPUBJS.reader.SettingsController = function() {
    var a = (this.book, this),
        b = $("#settings-modal"),
        c = $(".overlay"),
        d = function() {
            b.addClass("md-show")
        },
        e = function() {
            b.removeClass("md-show")
        },
        f = $("#sidebarReflow");
    return f.on("click", function() {
        a.settings.sidebarReflow = !a.settings.sidebarReflow
    }), b.find(".closer").on("click", function() {
        e()
    }), c.on("click", function() {
        e()
    }), {
        show: d,
        hide: e
    }
}, EPUBJS.reader.SidebarController = function() {
    var a = this,
        b = $("#sidebar"),
        c = $("#panels"),
        d = "Toc",
        e = function(b) {
            var e = b + "Controller";
            d != b && "undefined" != typeof a[e] && (a[d + "Controller"].hide(), a[e].show(), d = b, c.find(".active").removeClass("active"), c.find("#show-" + b).addClass("active"))
        },
        f = function() {
            return d
        },
        g = function() {
            a.sidebarOpen = !0, a.ReaderController.slideOut(), b.addClass("open")
        },
        h = function() {
            a.sidebarOpen = !1, a.ReaderController.slideIn(), b.removeClass("open")
        };
    return c.find(".show_view").on("click", function(a) {
        var b = $(this).data("view");
        e(b), a.preventDefault()
    }), {
        show: g,
        hide: h,
        getActivePanel: f,
        changePanelTo: e
    }
}, EPUBJS.reader.TocController = function(a) {
    var b = this.book,
        c = $("#tocView"),
        d = document.createDocumentFragment(),
        e = !1,
        f = function(a, b) {
            var c = document.createElement("ul");
            return b || (b = 1), a.forEach(function(a) {
                var d = document.createElement("li"),
                    e = document.createElement("a");
                toggle = document.createElement("a");
                var g;
                d.id = "toc-" + a.id, d.classList.add("list_item"), e.textContent = a.label, e.href = a.href, e.classList.add("toc_link"), d.appendChild(e), a.subitems.length > 0 && (b++, g = f(a.subitems, b), toggle.classList.add("toc_toggle"), d.insertBefore(toggle, e), d.appendChild(g)), c.appendChild(d)
            }), c
        },
        g = function() {
            c.show()
        },
        h = function() {
            c.hide()
        },
        i = function(a) {
            {
                var b = a.id,
                    d = c.find("#toc-" + b),
                    f = c.find(".currentChapter");
                c.find(".openChapter")
            }
            d.length && (d != f && d.has(e).length > 0 && f.removeClass("currentChapter"), d.addClass("currentChapter"), d.parents("li").addClass("openChapter"))
        };
    b.on("renderer:chapterDisplayed", i);
    var j = f(a);
    return d.appendChild(j), c.append(d), c.find(".toc_link").on("click", function(a) {
        var d = this.getAttribute("href");
        a.preventDefault(), b.goto(d), c.find(".currentChapter").addClass("openChapter").removeClass("currentChapter"), $(this).parent("li").addClass("currentChapter")
    }), c.find(".toc_toggle").on("click", function(a) {
        var b = $(this).parent("li"),
            c = b.hasClass("openChapter");
        a.preventDefault(), c ? b.removeClass("openChapter") : b.addClass("openChapter")
    }), {
        show: g,
        hide: h
    }
};