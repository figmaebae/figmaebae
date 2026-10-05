// @ts-nocheck
// Interactions that only the Chat360 case study has: the before/after hero slider, the section map, the lo-fi
// wireframes (desktop + mobile, with notes that scroll both) and the Layers-row -> hidden-variant switch.
// The shared case-study behaviour (scroll reveal + count-up, tabs, screenshot viewer) comes from lib/bexcard.js,
// and the canvas behaviour (theme + Inspect toggles, Layers/Design panels, cursor) from lib/canvas.js.
import { initBexCard } from "./bexcard";

export function initChat360(){
  if (window.__chatInit) return; // guard against React Strict Mode double-run
  window.__chatInit = true;
  initBexCard();

  var d=document;
  function $(s,r){return (r||d).querySelector(s)}
  function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}

  /* ---------- Before / after hero slider ---------- */
  var cmp=$("#c3-cmp"),range=$("#c3-range");
  if(cmp&&range){
    var top=$(".top",cmp),handle=$(".c3-handle",cmp);
    function slide(){top.style.clipPath="inset(0 0 0 "+range.value+"%)";handle.style.left=range.value+"%"}
    range.addEventListener("input",slide);slide();
  }

  /* ---------- Section map: pick a section, matching ones light up on both sides ---------- */
    var IA={
      hero:['Hero','Kept, rewritten','The slot stayed; everything in it changed. The headline now leads with the result ("Real Results"), and one button replaces two that competed. Channel icons wired into the Chat360 logo replace the stock illustration.'],
      logos:['Logos','Kept, upgraded','Moved up and given industry tabs, so a bank sees banks and a retailer sees retailers. 300+ became 350+.'],
      plat:['Channels → Platform','Restructured','Four channel blurbs became two sections that explain the platform once: AI agents that work across WhatsApp, web, social and voice, then omnichannel support at scale.'],
      ind:['Solutions → Business impact','Restructured','Four function cards (lead gen, support…) became seven industry tabs, each tied to one concrete job like loan recovery or appointment booking.'],
      demo:['"See Chat360 in action"','Removed','A mid-page box with a third CTA label ("Sign up for free"). Its job is now done by the section CTAs and the closing trial band.'],
      blog:['Blog → Case studies','Replaced','Blog posts don\'t prove anything to a buyer. Three case studies with named brands take the slot, and the blog lives under Resources.'],
      voice:['Voice360','New','Chat360\'s new voice-agent product. It gets an announcement bar above the nav and a full section of its own, so returning visitors notice it without it taking over the hero.'],
      prod:['Product overview','New','A product video and platform diagram sit right under the hero CTA. The old page never showed the product; now the first scroll does.'],
      test:['Testimonials','New','Seven quotes from named people at named companies, the strongest trust signal the old page was missing.'],
      close:['Closing CTA','Kept, rewritten','"Contact our team of experts" asked for effort. The new close offers a free 14-day trial with no credit card, which removes the two biggest reasons to wait.'],
      foot:['Footer','Kept, regrouped','Regrouped into Company, Connect and Resources. Home and Partner moved here from the top nav.']
    };
  var map=$("#c3-iamap"),pan=$("#c3-iapanel"),blks=$$(".c3-blk");
  if(map&&pan){
    function showIA(g){
      var s=IA[g];map.classList.add("focus");
      blks.forEach(function(b){b.classList.toggle("on",b.dataset.g===g)});
      pan.innerHTML='<span class="cs-lab">'+s[1]+'</span><h3 class="cs-h3 cs-lg">'+s[0]+'</h3><p>'+s[2]+'</p>';
    }
    blks.forEach(function(b){b.addEventListener("click",function(){showIA(b.dataset.g)})});
    pan.innerHTML='<span class="cs-lab">Tap any section</span><h3 class="cs-h3 cs-lg">See what happened to it</h3><p>Matching sections light up on both sides.</p>';
  }

  /* ---------- Wireframes ---------- */
  if($("#c3-wfd")){
    var W=[
     ['voice','Voice360 top bar','A slim announcement bar above the nav introduces the new voice product without taking over the hero.',
       function(m){return '<div class="r" style="justify-content:center;gap:.6rem"><div class="ln" style="width:'+(m?'60%':'40%')+'"></div><span class="wb" style="min-width:3rem;height:1.2rem"></span></div>'}, 'dark-band'],
     ['nav','Nav · 4 menus, 1 main action','Book a demo is the main action in the nav, matching the hero. Partner moved to the footer.',
       function(m){return '<div class="r sb wfnav"><div class="r"><div class="bx" style="width:1.6rem;min-height:1.6rem;border-radius:99px"></div><div class="ln t" style="width:4rem"></div></div>'+(m?'<div class="r"><span class="wb p"></span><span class="ham"></span></div>':'<div class="r" style="gap:1rem"><div class="ln" style="width:3rem"></div><div class="ln" style="width:3rem"></div><div class="ln" style="width:3rem"></div><div class="ln" style="width:3rem"></div></div><div class="r"><span class="wb" style="min-width:3.5rem"></span><span class="wb" style="min-width:3rem"></span><span class="wb p"></span></div>')+'</div>'}],
     ['hero','Hero · outcome first','Centred headline that leads with the result, one demo button, and channel icons wired into the Chat360 logo instead of stock art.',
       function(m){var ic='<div class="bx" style="width:'+(m?'1.4rem':'2.2rem')+';min-height:'+(m?'1.4rem':'2.2rem')+';border-radius:8px"></div>';return '<div style="display:grid;gap:.55rem;justify-items:center;position:relative;padding-block:'+(m?'.6rem':'1.4rem')+'"><div class="r sb" style="width:100%">'+ic+'<div class="bx" style="width:'+(m?'1.8rem':'2.6rem')+';min-height:'+(m?'1.8rem':'2.6rem')+';border-radius:10px;background:var(--wf2)"></div>'+ic+'</div><div class="ln t2" style="width:'+(m?'95%':'62%')+'"></div><div class="ln t2" style="width:'+(m?'80%':'52%')+'"></div><div class="ln" style="width:'+(m?'90%':'50%')+';margin-top:.4rem"></div><div class="ln" style="width:'+(m?'75%':'42%')+'"></div><span class="wb p" style="min-width:7rem;margin-top:.5rem;border-radius:99px"></span><div class="r sb" style="width:100%;margin-top:-1.5rem">'+ic+ic+'</div></div>'}],
     ['prod','Product overview','A product video right under the CTA, so the first scroll shows the product itself.',
       function(m){return '<div class="bx x" style="min-height:'+(m?'7rem':'13rem')+';width:'+(m?'100%':'70%')+';justify-self:center;border-radius:14px"></div>'}],
     ['logos','Proof, filterable by industry','350+ logos with tabs, so a buyer finds their peers before they scroll on.',
       function(m){return '<div class="ln t" style="width:'+(m?'80%':'40%')+';justify-self:center"></div><div class="r" style="justify-content:center"><span class="chipw on"></span><span class="chipw"></span><span class="chipw"></span><span class="chipw"></span>'+(m?'':'<span class="chipw"></span><span class="chipw"></span><span class="chipw"></span>')+'</div><div class="wg6">'+'<div class="bx" style="min-height:1.8rem"></div>'.repeat(6)+'</div>'}],
     ['plat','Platform, explained once','AI agents and omnichannel in two alternating blocks, replacing four channel blurbs.',
       function(m){var t='<div style="display:grid;gap:.5rem"><div class="ln t" style="width:85%"></div><div class="ln" style="width:95%"></div><div class="ln" style="width:75%"></div></div>',v='<div class="bx x" style="min-height:'+(m?'6rem':'8rem')+'"></div>';return '<div class="wg2">'+t+v+'</div><div class="wg2" style="margin-top:.6rem">'+(m?t+v:v+t)+'</div>'}],
     ['ind','Business impact by industry','Seven industry cards; each names one job and walks through how the agent handles it, step by step.',
       function(m){return '<div class="ln t" style="width:'+(m?'85%':'50%')+'"></div><div class="r" style="overflow:hidden;flex-wrap:nowrap">'+'<span class="chipw"></span>'.repeat(m?4:7).replace('chipw','chipw on')+'</div><div class="wg2"><div style="display:grid;gap:.5rem"><div class="ln t" style="width:60%"></div><div class="ln" style="width:90%"></div><div class="ln" style="width:80%"></div></div><div class="bx" style="min-height:8rem;display:grid;gap:.4rem;padding:.8rem;align-content:end"><div class="bub" style="width:70%"></div><div class="bub me" style="width:55%"></div><div class="bub" style="width:80%"></div><div class="bub me" style="width:40%"></div></div></div>'}],
     ['voice2','Voice360 band','A full-width feature with a person on a call, so voice reads as its own product.',
       function(m){var w='';for(var i=0;i<(m?18:40);i++){w+='<i style="height:'+(20+Math.round(Math.abs(Math.sin(i*1.7))*80))+'%"></i>'}return '<div class="wg2"><div style="display:grid;gap:.5rem"><div class="ln t" style="width:85%"></div><div class="ln" style="width:90%"></div><div class="ln" style="width:65%"></div><div class="r" style="margin-top:.3rem"><span class="wb p" style="min-width:6rem"></span></div></div><div class="wave">'+w+'</div></div>'}, 'dark-band'],
     ['cases','Case studies','Three cards with the brand, the industry and the result, replacing the blog row.',
       function(m){return '<div class="ln t" style="width:'+(m?'75%':'40%')+'"></div><div class="wg3">'+'<div style="display:grid;gap:.4rem;border:1.5px solid var(--wf);border-radius:10px;padding:.5rem"><div class="bx x" style="min-height:4rem"></div><div class="ln" style="width:50%"></div><div class="ln" style="width:85%"></div></div>'.repeat(m?2:3)+'</div>'}],
     ['test','Testimonials','Named people at named brands, in a carousel.',
       function(m){return '<div class="ln t" style="width:'+(m?'80%':'45%')+'"></div><div class="wg3">'+'<div style="display:grid;gap:.4rem;background:var(--wf);border-radius:10px;padding:.7rem;opacity:.85"><div class="ln" style="background:var(--wf2);width:95%"></div><div class="ln" style="background:var(--wf2);width:80%"></div><div class="r" style="margin-top:.4rem"><div class="bx" style="width:1.4rem;min-height:1.4rem;border-radius:99px;background:var(--wf2)"></div><div class="ln" style="width:40%;background:var(--wf2)"></div></div></div>'.repeat(m?1:3)+'</div><div class="r" style="justify-content:center"><span class="chipw on" style="min-width:1rem"></span><span class="chipw" style="min-width:.6rem"></span><span class="chipw" style="min-width:.6rem"></span></div>'}],
     ['close','Close with the trial','Free trial, with "14 days" and "no credit card" right under the button to remove the reasons to wait.',
       function(m){return '<div style="display:grid;gap:.6rem;justify-items:center;padding-block:.8rem"><div class="ln t2" style="width:'+(m?'90%':'55%')+'"></div><div class="ln" style="width:'+(m?'70%':'35%')+'"></div><span class="wb p" style="min-width:8rem;margin-top:.4rem"></span><div class="r"><div class="ln" style="width:4rem"></div><div class="ln" style="width:4.5rem"></div></div></div>'}, 'dark-band'],
     ['foot','Footer','Company, Connect and Resources, plus social links.',
       function(m){return '<div class="'+(m?'wg3':'wg6')+'" style="grid-template-columns:'+(m?'1fr 1fr':'2fr 1fr 1fr 1fr')+'"><div class="ln t" style="width:5rem"></div>'+'<div style="display:grid;gap:.4rem"><div class="ln" style="width:60%;background:var(--wf2)"></div><div class="ln" style="width:80%"></div><div class="ln" style="width:70%"></div></div>'.repeat(3)+'</div>'}]
    ];
    var notesIdx=[0,1,2,3,4,5,6,8,10];
    function build(el,m){el.innerHTML=W.map(function(s,i){var p=notesIdx.indexOf(i);return '<div class="ws '+(s[4]||'')+'" data-i="'+i+'">'+(p>-1?'<span class="pin">'+(p+1)+'</span>':'')+'<span class="lbl">'+s[1]+'</span>'+s[3](m)+'</div>'}).join('')}
    var vD=d.getElementById('c3-wfd'),vM=d.getElementById('c3-wfm');build(vD,false);build(vM,true);
    var notes=d.getElementById('c3-notes');
    notes.innerHTML=notesIdx.map(function(i){return '<button class="note" data-i="'+i+'" aria-pressed="false"><b>'+W[i][1].split(' · ')[0].split(',')[0]+'</b>'+W[i][2]+'</button>'}).join('');
    function go(v,i){var t=v.querySelector('.ws[data-i="'+i+'"]');v.scrollTo({top:t.offsetTop-8});v.querySelectorAll('.ws').forEach(function(x){x.classList.toggle('hl',x===t)})}
    notes.querySelectorAll('.note').forEach(function(b){b.onclick=function(){var i=b.dataset.i;go(vD,i);go(vM,i);notes.querySelectorAll('.note').forEach(function(n){n.setAttribute('aria-pressed',n===b)})}});
  }

  /* ---------- Audit: pins on the old homepage ---------- */
  var au=$("#c3-audit");
  if(au){
    var chips=$$('.c3-chips [role="tab"]',au),slides=$$(".c3-slide",au),pins=$$(".c3-pin",au),boxes=$$(".c3-box",au),count=$(".c3-count",au);
    function sel(){return chips.findIndex(function(c){return c.getAttribute("aria-selected")==="true"})}
    function showFinding(i){
      var s=chips[i].dataset.slide;
      slides.forEach(function(sl){var on=sl.dataset.slide===s;sl.classList.toggle("on",on);sl.setAttribute("aria-hidden",on?"false":"true")});
      pins.forEach(function(p){p.classList.toggle("on",+p.dataset.f===i)});
      boxes.forEach(function(b){b.classList.toggle("on",+b.dataset.f===i)});
      count.textContent=(i+1)+" / "+chips.length;
    }
    chips.forEach(function(c,i){c.addEventListener("click",function(){showFinding(i)})});
    pins.forEach(function(p){p.addEventListener("click",function(){chips[+p.dataset.f].click()})});
    $(".c3-prev",au).addEventListener("click",function(){chips[(sel()-1+chips.length)%chips.length].click()});
    $(".c3-next",au).addEventListener("click",function(){chips[(sel()+1)%chips.length].click()});
    showFinding(0);
  }

  /* ---------- Insights: jump to the decision an insight led to ---------- */
  $$(".c3-lead").forEach(function(b){
    b.addEventListener("click",function(){
      var tab=d.getElementById("c3-dect-"+b.dataset.dec),set=d.getElementById("c3-dec");
      if(tab)tab.click();
      if(set)set.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"start"});
    });
  });

  /* ---------- Layers panel: picking a hidden variant switches to it first ---------- */
  $$('.ly[data-target^="c3-fork-"], .ly[data-target^="c3-dec-"], .ly[data-target^="c3-rf-"]').forEach(function(row){
    row.addEventListener("click",function(){
      var t=d.getElementById(row.getAttribute("data-target"));
      if(!t||!t.hidden)return;
      var btn=d.querySelector('[aria-controls="'+t.id+'"]');
      if(btn)btn.click();
      requestAnimationFrame(function(){t.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"})});
    });
  });
}
