// CBC Extension JS Patch — CLEAN MODE
// No comments, no Viafoura, no ads, no consent, no popups, no external scripts

(function(){
    console.log('[CBC EXT] CLEAN MODE active');

    /* ------------------------------------------
       0. HARD BLOCK — NO EXTERNAL SCRIPTS EVER
    -------------------------------------------*/
    function blockExternal(url){
        try{
            const u = new URL(url, location.href);
            return u.host !== location.host;
        }catch{
            return true;
        }
    }

    const origCreate = document.createElement;
    document.createElement = function(tag){
        const el = origCreate.call(document, tag);
        if(tag.toLowerCase()==='script'){
            const setter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src').set;
            Object.defineProperty(el,'src',{
                set(v){ if(blockExternal(v)) { this.type='javascript/blocked'; return; } setter.call(this,v); }
            });
        }
        return el;
    };

    const origSet = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(n,v){
        if(this.tagName==='LINK' && n==='href' && blockExternal(v)) return;
        return origSet.call(this,n,v);
    };

    const _fetch = window.fetch;
    window.fetch = function(url,o){ if(blockExternal(url)) return new Promise(()=>{}); return _fetch(url,o); };

    const _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(m,u){ if(blockExternal(u)) return; return _open.call(this,m,u); };

    /* ----------------------------------------------------
       1. NUKE ADS, COMMENTS, POPUPS, CONSENT, MODALS, HEAVY FOOTERS (not BasicFooter)
    -----------------------------------------------------*/
    function nuke(){
        const killers = [
            // Ads
            '.adContainer-F11hw','.ad-risingstar','.ad-risingstar-container','.ad-in-read',
            '.ad-in-read-double','.ad-bigbox-sticky','.bigbox-sticky-yhjAb','[id^="google_ads_iframe_"]',
            'iframe[src*="googlesyndication"], iframe[src*="doubleclick"], iframe[data-is-safeframe]',

            // Comments & Viafoura
            'vf-widget','#vf-conversations','.viafoura','.vf-widget','.vf-container','script[src*="viafoura"]',

            // Consent popups
            '#fc-dialog-root','#fc-consent-banner','[data-testid="consent-manager"]','[data-testid="consent-modal"]',
            '[class^="fc-"]','[class*="fc-"]','iframe[src*="consent"]',

            // Modals / prompts / popups
            'dialog','[role="dialog"]','[aria-modal="true"]','[class*="popup"]','[id*="popup"]',

            // All heavy footer columns, links, text (except BasicFooter only)
            '.footerBody','.footerColumn','.footerList','.footerItem','.footerHeading','.footerColumnBody',
            '.footer-main','.footer-extended','.cbc-footer', '.footerLinks', '.globalFooter', '.footerAccessibility',
            '.footerServices', '.footerContact', '.footerConnect', '.footerAbout', '.footerAccessibility', '.footer',
        ];
        killers.forEach(sel=>{
            document.querySelectorAll(sel).forEach(el=>{
                // Only skip if it's the BasicFooter
                if(el.className && /BasicFooter/.test(el.className)) return;
                el.remove();
            });
        });
    }
    setInterval(nuke, 300);

    /* ----------------------------------------------------
       2. Suppress noisy engine errors (React, ads, IMA)
    -----------------------------------------------------*/
    const origErr = console.error;
    console.error = function(msg){
        const block = ['React','Minified','IMA','ads','Macaw','bounding','googletag'];
        if(block.some(x=>String(msg).includes(x))) return;
        origErr.apply(console,arguments);
    };

    window.onerror = function(msg){
        if(String(msg).match(/React|IMA|ads|Macaw|bound/i)) return true;
        return false;
    };

    /* ----------------------------------------------------
       3. Kill React / Macaw retries creating ad/comment/footer nodes
    -----------------------------------------------------*/
    const observer = new MutationObserver(muts=>{
        muts.forEach(m=>{
            [...m.addedNodes].forEach(n=>{
                if(!(n instanceof HTMLElement)) return;
                if(n.matches && (
                    n.matches('.viafoura, vf-widget, #vf-conversations, .adContainer-F11hw, .ad-risingstar, .ad-in-read, [id^="google_ads_iframe_"], .footerBody, .footerColumn, .footerList, .footerItem, .footerHeading, .footerColumnBody, .footer-main, .footer-extended, .cbc-footer, .footerLinks, .globalFooter, .footerAccessibility, .footerServices, .footerContact, .footerConnect, .footerAbout, .footerAccessibility, .footer')
                )){
                    // Only remove if NOT BasicFooter
                    if(n.className && /BasicFooter/.test(n.className)) return;
                    n.remove();
                }
            });
        });
    });
    observer.observe(document.body,{childList:true,subtree:true});

    /* ----------------------------------------------------
       4. Stop getBoundingClientRect crashes from removed ads/footers
    -----------------------------------------------------*/
    const safeRect = {top:0,left:0,right:0,bottom:0,width:0,height:0};
    const origRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function(){ try{ return origRect.apply(this,arguments); } catch{ return safeRect; } };

})();

/* ----------------------------------------------------
   5. Restore scrolling (CBC forces body lock sometimes)
-----------------------------------------------------*/
(function restoreScroll(){
    const fix = ()=>{
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        document.body.style.height = 'auto';
    };

    fix();
    setInterval(fix, 250);

    const blocked = ['no-scroll','modal-open','overlay-open'];
    blocked.forEach(c=>{
        document.documentElement.classList.remove(c);
        document.body.classList.remove(c);
    });
})();
