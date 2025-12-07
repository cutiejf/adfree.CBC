// Completely disable all script execution except our own
(function() {
    const block = ["script", "iframe", "noscript"];
    const origAppend = Element.prototype.appendChild;
    const origInsert = Element.prototype.insertBefore;

    function nukeScripts(node) {
        if (!node) return node;
        // Blanket removal may break layout; consider allowlist refinement
        if (block.includes(node.tagName?.toLowerCase())) return document.createComment("");
        return node;
    }

    Element.prototype.appendChild = function(n) {
        return origAppend.call(this, nukeScripts(n));
    };
    Element.prototype.insertBefore = function(n, r) {
        return origInsert.call(this, nukeScripts(n), r);
    };
})();

// Remove all existing scripts immediately
// Broad removal noted; potential for controlled allowlist
document.querySelectorAll("script, iframe, noscript").forEach(e => e.remove());

// Auto-remove reinjected garbage
const killList = [
    "#downloader",
    "#initialize",
    "[id^='google_ads']",
    "[src*='doubleclick']",
    "[src*='amazon-adsystem']",
    "[src*='rubicon']",
    "[src*='jwplayer']",
    "[src*='loginradius']",
    "[src*='sophi']",
    "[src*='piano']",
    "[data-ab-test]",
    "div[class*='ad']",
    "div[id*='ad']",
    ".piano-offer",
    ".piano",
    "gnm-ad",
    ".adblock",
    "amp-ad",
    ".meteredContent",
    ".subscription",
    ".paywall",
    ".LoggedOut",
    ".identity",
    ".loginradius-container",
    ".np-account-bar"
];

function purge() {
    killList.forEach(sel => {
        document.querySelectorAll(sel).forEach(e => e.remove());
    });
}
purge();

// MutationObserver to prevent ANY resurrected junk
new MutationObserver(mutations => {
    mutations.forEach(m => {
        [...m.addedNodes].forEach(n => {
            if (n.nodeType !== 1) return;

            if (n.matches?.("script, iframe, noscript")) n.remove();

            killList.forEach(sel => {
                if (n.matches?.(sel)) n.remove();
                n.querySelectorAll?.(sel).forEach(e => e.remove());
            });
        });
    });
}).observe(document.documentElement, { childList: true, subtree: true });

// Strip the header except main logo + nav
(function cleanHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    header.querySelectorAll(
        ".np-account-bar, .account, .identity, .subscription, .paywall, .metered"
    ).forEach(e => e.remove());
})();

// Strip footer clutter, keep only the core footer container
(function cleanFooter() {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const allowed = ["copyright", "site_map", "contact_us"];
    footer.querySelectorAll("a").forEach(a => {
        const txt = a.textContent.trim().toLowerCase();
        if (!allowed.some(k => txt.includes(k.replace("_", " ")))) {
            a.closest("li, div")?.remove();
        }
    });
})();

// Remove top navigation items like Subscribe / Newsletters
(function cleanTopNav() {
    document.querySelectorAll("nav a").forEach(a => {
        const bad = ["subscribe", "newsletter", "sign", "account", "login"];
        if (bad.some(b => a.textContent.toLowerCase().includes(b))) {
            a.remove();
        }
    });

(function keepHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    header.querySelectorAll(
        ".subscribe, .subscription, .account, .identity, .login, [data-testid='Account'], .np-account-bar"
    ).forEach(e => e.remove());

    header.style.display = "block";
    header.style.visibility = "visible";
})();

// Remove all videos
(function removeVideos() {
    document.querySelectorAll(".embedded-video, .jwplayer-wrapper, [data-provider='jwplayer']").forEach(e => {
        e.remove();
    });
})();

new MutationObserver(m => {
    m.forEach(record => {
        [...record.addedNodes].forEach(n => {
            if (n.nodeType !== 1) return;
            if (
                n.matches?.(".embedded-video, .jwplayer-wrapper, [data-provider='jwplayer']") ||
                n.querySelector?.(".embedded-video, .jwplayer-wrapper, [data-provider='jwplayer']")
            ) {
                n.remove();
            }
        });
    });
}).observe(document.documentElement, { childList: true, subtree: true });

// Fix lazy-loaded images
(function fixImages() {
    document.querySelectorAll("img").forEach(img => {
        const ds = img.getAttribute("data-src");
        const dss = img.getAttribute("data-srcset");

        if (ds && (!img.src || img.src.includes("spinner") || img.src === "")) img.src = ds;
        if (dss && (!img.srcset || img.srcset === "")) img.srcset = dss;

        img.loading = "eager";
        img.decoding = "async";
    });
})();

new MutationObserver(m => {
    m.forEach(record => {
        [...record.addedNodes].forEach(n => {
            if (n.nodeType !== 1) return;

            n.querySelectorAll?.("img").forEach(img => {
                const ds = img.getAttribute("data-src");
                const dss = img.getAttribute("data-srcset");

                if (ds && !img.src) img.src = ds;
                if (dss && !img.srcset) img.srcset = dss;
            });
        });
    });
}).observe(document.documentElement, { childL
