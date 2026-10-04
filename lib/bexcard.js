// @ts-nocheck
// Interactions that only the BexCard case study has: scroll reveal + count-up numbers, the self-advancing
// journey and the Confirmation of Payee tabs, the light/dark screens switch and the click-to-enlarge
// screen viewer. The shared canvas behaviour (theme + Inspect
// toggles, Layers/Design panels, cursor) comes from lib/canvas.js, which runs first.
export function initBexCard(){
  if (window.__bexInit) return; // guard against React Strict Mode double-run
  window.__bexInit = true;

  var d=document,calm=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  function $(s,r){return (r||d).querySelector(s)}
  function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}

  /* ---------- Scroll reveal + count-up ---------- */
  function count(el){
    var to=+el.dataset.to,t0=null;
    function f(t){t0=t0||t;var p=Math.min((t-t0)/1100,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e);if(p<1)requestAnimationFrame(f)}
    requestAnimationFrame(f);
  }
  function reveal(el){
    el.classList.add("cs-in");
    $$(".cs-num",el).forEach(function(n){if(!calm&&n.dataset.pre)count(n)});
  }
  var targets=$$(".cs-sec>*:not(.fr-label), .cs-close .cs-wrap>*");
  var io="IntersectionObserver" in window?new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){reveal(e.target);io.unobserve(e.target)}});
  },{threshold:.08,rootMargin:"0px 0px -6% 0px"}):null;
  targets.forEach(function(el){
    var below=el.getBoundingClientRect().top>window.innerHeight*.92;
    if(!io||calm||!below)return;          // already on screen (or no motion wanted): leave it as it is
    el.classList.add("cs-pre");
    $$(".cs-num",el).forEach(function(n){n.dataset.pre="1";n.textContent="0"});
    io.observe(el);
  });

  /* ---------- Tabs (journey steps, Confirmation of Payee states) ---------- */
  function tabs(list){
    var btns=$$('[role="tab"]',list);
    function select(i,focus){
      btns.forEach(function(b,k){
        var on=k===i;b.setAttribute("aria-selected",on?"true":"false");b.tabIndex=on?0:-1;
        var p=d.getElementById(b.getAttribute("aria-controls"));if(p)p.hidden=!on;
      });
      if(focus)btns[i].focus();
    }
    btns.forEach(function(b,i){
      b.addEventListener("click",function(){select(i)});
      b.addEventListener("keydown",function(e){
        var n=btns.length,k=i;
        if(e.key==="ArrowRight"||e.key==="ArrowDown")k=(i+1)%n;
        else if(e.key==="ArrowLeft"||e.key==="ArrowUp")k=(i-1+n)%n;
        else if(e.key==="Home")k=0;
        else if(e.key==="End")k=n-1;
        else return;
        e.preventDefault();select(k,true);
      });
    });
  }
  $$("[data-tabs]").forEach(tabs);

  /* ---------- The family journey plays itself: a new step every 5 seconds ----------
     The progress bar under the showing step (CSS, 5s) is the timer: when it finishes, the next step is selected.
     It pauses when the pointer or focus is on the map or it scrolls out of view, and a real click or key press
     on a step hands control to the visitor for good. Reduced-motion visitors get no autoplay. */
  var jl=$('.cs-jline[data-tabs="journey"]');
  if(jl&&!calm){
    var jsteps=$$('[role="tab"]',jl),jmap=jl.closest(".cs-jmap"),inView=false,over=false,focused=false;
    function sync(){jl.classList.toggle("paused",!(inView&&!over&&!focused))}
    function stop(){jl.classList.remove("auto","paused")}
    jl.classList.add("auto","paused");
    if("IntersectionObserver" in window)new IntersectionObserver(function(es){inView=es[0].isIntersecting;sync()},{threshold:.4}).observe(jmap);
    jmap.addEventListener("pointerenter",function(e){if(e.pointerType==="mouse"){over=true;sync()}});
    jmap.addEventListener("pointerleave",function(){over=false;sync()});
    jmap.addEventListener("focusin",function(){focused=true;sync()});
    jmap.addEventListener("focusout",function(){focused=false;sync()});
    jl.addEventListener("animationend",function(e){
      if(e.animationName!=="cs-jfill")return;
      var i=jsteps.findIndex(function(b){return b.getAttribute("aria-selected")==="true"});
      jsteps[(i+1)%jsteps.length].click();   // a script click (isTrusted=false), so it doesn't count as the visitor taking over
    });
    jsteps.forEach(function(b){b.addEventListener("click",function(e){if(e.isTrusted)stop()})});
    jl.addEventListener("keydown",function(e){if(e.isTrusted&&/^(Arrow|Home|End)/.test(e.key))stop()});
  }

  /* ---------- Light / dark screens (a component-set "Mode" property) ---------- */
  var modeBtns=$$("[data-mode]");
  modeBtns.forEach(function(b){
    b.addEventListener("click",function(){
      modeBtns.forEach(function(o){
        var on=o===b;o.setAttribute("aria-pressed",on?"true":"false");
        var p=d.getElementById("cs-mode-"+o.dataset.mode);if(p)p.hidden=!on;
      });
    });
  });

  /* ---------- Click a screen to enlarge it ---------- */
  var vw=$("#cs-viewer");
  if(vw){
    var vimg=$(".lb-img",vw),vname=$(".lb-name",vw),vcount=$(".lb-count",vw),list=[],cur=0,opener=null;
    function show(i){
      cur=(i+list.length)%list.length;
      var im=$("img",list[cur]);
      vimg.src=im.currentSrc||im.src;vimg.alt=im.alt;
      vname.textContent=im.getAttribute("data-layer")||im.alt;
      vcount.textContent=(cur+1)+" / "+list.length;
    }
    function open(btn){
      list=$$('[data-zoom][data-zoom-group="'+btn.getAttribute("data-zoom-group")+'"]');
      opener=btn;show(list.indexOf(btn));
      vw.hidden=false;d.documentElement.classList.add("lb-open");
      requestAnimationFrame(function(){vw.classList.add("open")});
      $(".lb-close",vw).focus();
    }
    function close(){
      vw.classList.remove("open");d.documentElement.classList.remove("lb-open");
      setTimeout(function(){vw.hidden=true},calm?0:220);
      if(opener)opener.focus();
    }
    d.addEventListener("click",function(e){
      var b=e.target.closest&&e.target.closest("[data-zoom]");
      if(b){e.preventDefault();open(b);return}
      if(vw.hidden)return;
      if(e.target===vw||e.target.closest(".lb-close"))close();
      else if(e.target.closest(".lb-prev"))show(cur-1);
      else if(e.target.closest(".lb-next"))show(cur+1);
    });
    d.addEventListener("keydown",function(e){
      if(vw.hidden)return;
      if(e.key==="Escape")close();
      else if(e.key==="ArrowLeft")show(cur-1);
      else if(e.key==="ArrowRight")show(cur+1);
    });
  }

  /* ---------- Layers panel: picking a hidden variant switches to it first ---------- */
  $$('.ly[data-target^="cs-cop-"], .ly[data-target^="cs-mode-"]').forEach(function(row){
    row.addEventListener("click",function(){
      var t=d.getElementById(row.getAttribute("data-target"));
      if(!t||!t.hidden)return;
      var btn=d.querySelector('[aria-controls="'+t.id+'"]')||d.getElementById(t.id.replace("cs-mode-","cs-mt-"));
      if(btn)btn.click();
      requestAnimationFrame(function(){t.scrollIntoView({behavior:calm?"auto":"smooth",block:"center"})});
    });
  });
}
