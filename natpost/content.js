// Completely disable all script execution except our own
(function() {
    const block = ["script", "iframe", "noscript"];
    const origAppend = Element.prototype.appendChild;
    const origInsert = Element.prototype.insertBefore;

    function nukeScripts(node) {
        if (!node) return node;
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

            // Strip scripts, ads, identity junk
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
})();
