// @ts-nocheck
// Interactions that only the Quorum case study has: the competitor filter and the Layers-row -> hidden-variant
// switch. Everything else (scroll reveal + count-up, tabs for the sidebar sections, steps and decisions, the
// screen viewer) comes from lib/bexcard.js; the canvas behaviour comes from lib/canvas.js.
import { initBexCard } from "./bexcard";

export function initQuorum(){
  if (window.__quorumInit) return; // guard against React Strict Mode double-run
  window.__quorumInit = true;
  initBexCard();

  var d=document;
  function $(s,r){return (r||d).querySelector(s)}
  function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}

  /* ---------- Competitors: all / goods / booking tools ---------- */
  var fb=$$(".q-fbtn"),cards=$$(".q-cc");
  fb.forEach(function(b){
    b.addEventListener("click",function(){
      var f=b.dataset.f;
      fb.forEach(function(o){o.setAttribute("aria-pressed",o===b?"true":"false")});
      cards.forEach(function(c){c.hidden=!(f==="all"||c.dataset.grp===f)});
    });
  });

  /* ---------- Procure-to-pay panels: a panel and its step underneath light up together ---------- */
  var stack=$("#q-stack");
  if(stack){
    var scards=$$(".q-card",stack),spts=$$(".q-pt");
    function lit(i){
      stack.classList.toggle("focus",i>=0);
      scards.forEach(function(c){c.classList.toggle("on",+c.dataset.i===i)});
      spts.forEach(function(p){p.classList.toggle("on",+p.dataset.i===i)});
    }
    scards.forEach(function(c){
      var i=+c.dataset.i;
      c.addEventListener("pointerenter",function(){lit(i)});
      c.addEventListener("pointerleave",function(){lit(-1)});
    });
    spts.forEach(function(p){
      var i=+p.dataset.i;
      p.addEventListener("pointerenter",function(){lit(i)});
      p.addEventListener("pointerleave",function(){lit(-1)});
    });
  }

  /* ---------- Layers panel: picking a hidden decision switches to it first ---------- */
  $$('.ly[data-target^="q-dec-"]').forEach(function(row){
    row.addEventListener("click",function(){
      var t=d.getElementById(row.getAttribute("data-target"));
      if(!t||!t.hidden)return;
      var btn=d.querySelector('[aria-controls="'+t.id+'"]');
      if(btn)btn.click();
      requestAnimationFrame(function(){t.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"})});
    });
  });
}
