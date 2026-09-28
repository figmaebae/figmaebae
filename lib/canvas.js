// @ts-nocheck
// All page interactions: selection dims, copy-email key, layers + design panels,
// link bar, Pixel the helper, Figma cursor and surprise shapes.
// Edit LINKS below to update LinkedIn / Twitter / Medium / Resume.
export function initCanvas(){
  if (window.__canvasInit) return; // guard against React Strict Mode double-run
  window.__canvasInit = true;

  /* ---------- Selection dimensions ---------- */
  var sel=document.getElementById("sel"),dims=document.getElementById("dims");
  function measure(){var r=sel.getBoundingClientRect();dims.textContent=Math.round(r.width)+" × "+Math.round(r.height);var n=document.querySelector(".note-me");if(n)n.style.setProperty("--nw",Math.round(r.width)+"px")}
  measure();window.addEventListener("resize",measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);

  document.querySelectorAll(".fr").forEach(function(fr){
    var body=fr.querySelector(".fr-body"),d=fr.querySelector(".dims");
    function size(){var r=body.getBoundingClientRect();d.textContent=Math.round(r.width)+" × "+Math.round(r.height)}
    size();
    if("ResizeObserver" in window)new ResizeObserver(size).observe(body);else fr.addEventListener("pointerenter",size);
  });


  /* ---------- Layers + Design panels ---------- */
  var calmMotion=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var insp=document.getElementById("insp"),inspName=document.getElementById("insp-name");
  var rowsEls=[].slice.call(document.querySelectorAll(".ly"));
  var icons={};rowsEls.forEach(function(a){var t=document.getElementById(a.dataset.target);if(t)icons[t.dataset.kind]=a.querySelector(".ic").innerHTML});
  function hex(c){var m=c.match(/[\d.]+/g);if(!m)return null;if(m.length>3&&+m[3]<.05)return null;return m.slice(0,3).map(function(v){return(+v).toString(16).padStart(2,"0")}).join("").toUpperCase()}
  var weights={"300":"Light","400":"Regular","500":"Medium","600":"Semi Bold","700":"Bold"};
  var pageHTML='<section class="p-sec"><h3>Page</h3><div class="row"><span class="sw" style="background:#F7F7F5"></span>F7F7F5<span class="r">100%</span></div></section>'+
    '<section class="p-sec"><h3>Color styles</h3>'+[["Ink","1C1C1E"],["Muted","6F6F74"],["Canvas","F7F7F5"],["Selection","0D99FF"],["Component","9747FF"],["Available","14AE5C"]].map(function(c){return '<div class="row"><span class="sw" style="background:#'+c[1]+'"></span>'+c[0]+'<span class="r">'+c[1]+'</span></div>'}).join("")+'</section>'+
    '<section class="p-sec"><h3>Text styles</h3>'+[["Display","88 / Medium"],["Title","18 / Medium"],["Body","17 / Regular"],["Caption","12 / Regular"]].map(function(t){return '<div class="row"><span class="aa">Ag</span>'+t[0]+'<span class="r">'+t[1]+'</span></div>'}).join("")+'</section>'+
    '<p class="hint">Hover anything on the canvas, or a layer, to inspect it.</p>';
  function field(k,v){return '<span class="field"><b>'+k+'</b>'+v+'</span>'}
  function swatch(h,r){return '<div class="row"><span class="sw" style="background:#'+h+'"></span>'+h+(r?'<span class="r">'+r+'</span>':'')+'</div>'}

  /* Hovering anything inspects the most specific thing under the pointer: a layer if it has one,
     otherwise the image, vector, text or filled box inside it. */
  var SHAPE_NAMES={"tm-bar":"Title bar","tm-dot":"Dot","dot":"Status dot","key":"Key","logo":"Logo","wr-list":"Article tray","wr-arrow":"Arrow button","v-card":"Variant card","cset-box":"Component set","tg":"Tag","sv-ico":"Icon"};
  var SKIP_SEL=".sel-box,.handle,.dims,.sr-only";
  function ownText(el){for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&n.nodeValue.trim())return n.nodeValue.trim().replace(/\s+/g," ")}return""}
  function isVector(el){return el instanceof SVGSVGElement||el.tagName==="IMG"}
  function tidy(t){return t.replace(/\.$/,"")}
  function pretty(cls){var w=cls.replace(/[-_]+/g," ").trim();return w.charAt(0).toUpperCase()+w.slice(1)}
  function virtualKind(el){return isVector(el)?"image":ownText(el)?"text":"rect"}
  function virtualName(el){
    var layer=el.closest("[data-layer]"),base=layer?tidy(layer.dataset.layer):"";
    if(el.closest(".pixel"))return "Pixel";
    if(isVector(el)){
      var alt=el.getAttribute("alt")||el.getAttribute("aria-label");if(alt)return alt;
      if(el.closest(".logo"))return (base||"Company")+" logo";
      return (base?base+" ":"")+"icon";
    }
    var t=ownText(el);
    if(t)return t.length>34?t.slice(0,33)+"…":t;
    var c=(el.className&&el.className.baseVal===undefined?el.className:"").split(/\s+/);
    for(var i=0;i<c.length;i++)if(SHAPE_NAMES[c[i]])return SHAPE_NAMES[c[i]];
    return c[0]?pretty(c[0]):"Rectangle";
  }
  function describe(el){
    if(el.dataset&&el.dataset.layer)return{name:el.dataset.layer,kind:el.dataset.kind};
    return{name:virtualName(el),kind:virtualKind(el)};
  }
  function subLayer(t,layer,mode){
    if(t.closest(SKIP_SEL))return null;
    var meas=layer&&layer.dataset.measure?layer.querySelector(layer.dataset.measure):null;
    for(var c=t;c&&c!==layer&&c!==document.body;c=c.parentElement){
      if(c===meas)return null;
      if(isVector(c))return c;
      if(mode==="all"&&ownText(c))return c;
      var cs=getComputedStyle(c);
      if(hex(cs.backgroundColor)||(parseFloat(cs.borderTopWidth)&&cs.borderTopStyle!=="none"&&hex(cs.borderTopColor)))return c;
    }
    return null;
  }
  function solid(c){var m=c.match(/[\d.]+/g);if(m&&m.length>3&&+m[3]<.3)return null;return hex(c)}
  var imgCache={};
  function imgFills(img){
    var k=img.currentSrc||img.src;if(imgCache[k])return imgCache[k];
    if(!img.complete||!img.naturalWidth)return[];
    try{
      var w=Math.min(64,img.naturalWidth),h=Math.max(1,Math.round(w*img.naturalHeight/img.naturalWidth));
      var cv=document.createElement("canvas");cv.width=w;cv.height=h;
      var cx=cv.getContext("2d");cx.drawImage(img,0,0,w,h);
      var d=cx.getImageData(0,0,w,h).data,b={},tot=0;
      for(var i=0;i<d.length;i+=4){
        if(d[i+3]<128)continue;
        var key=(d[i]>>5)+","+(d[i+1]>>5)+","+(d[i+2]>>5),o=b[key]||(b[key]={n:0,r:0,g:0,b:0});
        o.n++;o.r+=d[i];o.g+=d[i+1];o.b+=d[i+2];tot++;
      }
      var groups=[];
      Object.keys(b).map(function(x){return b[x]}).sort(function(x,y){return y.n-x.n}).forEach(function(o){
        var c=[o.r/o.n,o.g/o.n,o.b/o.n],g=groups.filter(function(q){return Math.hypot(q.c[0]-c[0],q.c[1]-c[1],q.c[2]-c[2])<60})[0];
        if(g)g.n+=o.n;else groups.push({c:c,n:o.n});
      });
      var out=groups.filter(function(g){return g.n/tot>=.05}).slice(0,3).map(function(g){
        return{h:g.c.map(function(v){return Math.round(v).toString(16).padStart(2,"0")}).join("").toUpperCase(),r:Math.round(g.n/tot*100)+"%"}});
      imgCache[k]=out;return out;
    }catch(e){return[]}
  }
  function svgFills(svg){
    var out=[],seen={};
    [].slice.call(svg.querySelectorAll("path,circle,rect,ellipse,polygon,polyline,line")).forEach(function(n){
      var cs=getComputedStyle(n),g=/url\(["']?#([^"')]+)/.exec(cs.fill+" "+cs.stroke);
      if(g){
        var grad=document.getElementById(g[1]);
        if(grad)[].slice.call(grad.querySelectorAll("stop")).forEach(function(st){var sh=hex(getComputedStyle(st).stopColor);if(sh&&!seen[sh]&&out.length<5){seen[sh]=1;out.push({h:sh,r:"Gradient"})}});
        return;
      }
      var lineOnly=n.hasAttribute("stroke")&&!n.hasAttribute("fill"),h=(!lineOnly&&cs.fill!=="none"&&solid(cs.fill))||(cs.stroke!=="none"&&solid(cs.stroke))||null;
      if(h&&!seen[h]&&out.length<5){seen[h]=1;out.push({h:h})}
    });
    return out;
  }
  function fillsOf(el,m,kind,cs){
    if(kind==="text"){var t=hex(cs.color);return t?[{h:t}]:[]}
    if(kind==="image"){
      var v=isVector(m)?m:m.querySelector("img,svg");
      if(v){var r=v.tagName==="IMG"?imgFills(v):svgFills(v);if(r.length)return r}
    }
    var f=hex(cs.backgroundColor);if(f)return[{h:f,r:"100%"}];
    if(kind==="button"){var k=m.querySelector(".key");if(k){var kh=hex(getComputedStyle(k).backgroundColor);if(kh)return[{h:kh,r:"100%"}]}}
    return[];
  }
  function inspect(el){
    if(!insp)return;
    if(!el){inspName.textContent="Page 1";insp.innerHTML=pageHTML;return}
    var info=describe(el),kind=info.kind;
    var m=el.dataset.measure?el.querySelector(el.dataset.measure):el,r=m.getBoundingClientRect(),cs=getComputedStyle(m);
    inspName.innerHTML='';inspName.textContent=info.name;
    var h='<section class="p-sec"><h3>Layout</h3><div class="fields">'+field("X",Math.round(r.left+scrollX))+field("Y",Math.round(r.top+scrollY))+'</div><div class="fields">'+field("W",Math.round(r.width))+field("H",Math.round(r.height))+'</div></section>';
    var fills=fillsOf(el,m,kind,cs);
    h+='<section class="p-sec"><h3>Fill</h3>'+(fills.length?fills.map(function(x){return swatch(x.h,x.r)}).join(""):'<div class="row muted">None</div>')+'</section>';
    if(kind!=="text"){
      var bw=parseFloat(cs.borderTopWidth),sh=cs.borderTopStyle!=="none"&&bw?hex(cs.borderTopColor):null;
      if(sh)h+='<section class="p-sec"><h3>Stroke</h3>'+swatch(sh,bw+(cs.borderTopStyle==="solid"?"":" · "+cs.borderTopStyle))+'</section>';
    }
    if(kind==="text"){
      var fs=parseFloat(cs.fontSize),ls=cs.letterSpacing==="normal"?0:Math.round(parseFloat(cs.letterSpacing)/fs*1000)/10,lh=cs.lineHeight==="normal"?"Auto":Math.round(parseFloat(cs.lineHeight));
      var fam=cs.fontFamily.split(",")[0].replace(/["']/g,"").replace(/^__/,"").replace(/_[0-9a-f]{6,}$/,"").replace(/_/g," ");
      h+='<section class="p-sec"><h3>Typography</h3><div class="row">'+fam+'</div><div class="fields">'+field("",(weights[cs.fontWeight]||cs.fontWeight)+(cs.fontStyle==="italic"?" Italic":""))+field("",Math.round(fs))+'</div><div class="fields">'+field("LH",lh)+field("LS",ls+"%")+'</div></section>';
    }
    if(kind==="component"||kind==="variant"){h+='<section class="p-sec"><h3>'+(kind==="component"?"Component set":"Variant")+'</h3><div class="row" style="color:#9747ff">'+(kind==="component"?"2 variants: Site":info.name)+'</div></section>'}
    insp.innerHTML=h;
  }
  inspect(null);
  var current=null;
  function setCurrent(el){if(el===current)return;current=el;var ly=el&&(el.dataset.layer?el:el.closest("[data-layer]"));rowsEls.forEach(function(a){a.classList.toggle("hl",!!ly&&a.dataset.target===ly.id)});inspect(el)}
  document.addEventListener("pointerover",function(e){if(e.target.closest(".ui")){if(current){current=null;rowsEls.forEach(function(r){r.classList.remove("hl")});inspect(null)}return}var layer=e.target.closest("[data-layer]"),kind=layer&&layer.dataset.kind,mode=kind==="image"?null:"all";setCurrent(mode===null?layer:(subLayer(e.target,layer,mode)||layer))});
  document.addEventListener("pointerleave",function(){setCurrent(null)});
  rowsEls.forEach(function(a){
    var t=document.getElementById(a.dataset.target);if(!t)return;
    a.addEventListener("click",function(e){e.preventDefault();t.scrollIntoView({behavior:calmMotion?"auto":"smooth",block:"center"})});
    a.addEventListener("pointerenter",function(){t.classList.add("is-hl");if(t.classList.contains("fr")){var b=t.querySelector(".fr-body").getBoundingClientRect();t.querySelector(".dims").textContent=Math.round(b.width)+" × "+Math.round(b.height)}inspect(t)});
    a.addEventListener("pointerleave",function(){t.classList.remove("is-hl");inspect(current)});
  });

  /* ---------- Links (fill these in) ---------- */
  var LINKS={
    linkedin:"https://www.linkedin.com/in/yashita-sharma-6721bb163/",
    twitter:"https://x.com/Figmaebae",
    medium:"https://medium.com/@figmaebae",
    resume:""
  };
  var tool="move";
  [].slice.call(document.querySelectorAll("[data-link]")).forEach(function(a){
    var url=LINKS[a.dataset.link];
    if(url){a.href=url}else{a.setAttribute("aria-disabled","true");a.setAttribute("role","link");a.tabIndex=0;
      a.addEventListener("click",function(e){e.preventDefault();document.dispatchEvent(new CustomEvent("px",{detail:"soon"}))})}
  });


  /* ---------- Doodles: pen path morph + draw on scroll ---------- */
  (function(){
    var ed=document.querySelector(".exp-dd");
    if(ed){if("IntersectionObserver" in window){var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){ed.classList.add("in");io.disconnect()}})},{threshold:.1});io.observe(ed)}else ed.classList.add("in")}
    var path=document.getElementById("pen-path");if(!path)return;
    var h1=document.getElementById("pen-h1"),h2=document.getElementById("pen-h2"),c1=document.getElementById("pen-c1"),c2=document.getElementById("pen-c2");
    var A=[10,104],B=[156,30];
    function frame(t){
      var k=t/1000;
      var p1=[50+Math.sin(k*.9)*22,22+Math.cos(k*.7)*16],p2=[110+Math.cos(k*.8)*20,118+Math.sin(k*.6)*10];
      path.setAttribute("d","M"+A+" C"+p1+" "+p2+" "+B);
      h1.setAttribute("x1",A[0]);h1.setAttribute("y1",A[1]);h1.setAttribute("x2",p1[0]);h1.setAttribute("y2",p1[1]);
      h2.setAttribute("x1",B[0]);h2.setAttribute("y1",B[1]);h2.setAttribute("x2",p2[0]);h2.setAttribute("y2",p2[1]);
      c1.setAttribute("cx",p1[0]);c1.setAttribute("cy",p1[1]);c2.setAttribute("cx",p2[0]);c2.setAttribute("cy",p2[1]);
    }
    var still=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    frame(0);
    if(!still){(function loop(t){if(path.getClientRects().length)frame(t);requestAnimationFrame(loop)})(0)}
  })();


  /* ---------- Services: sticky heading releases together with the last card ----------
     The heading's sticky dismissal depends on its own rendered height, so an invisible
     spacer stretches it to match the last card's dismissal point. That same height would
     normally push the whole card list down in the page's layout, so the list is pulled
     back up by the same amount with a negative margin, canceling the visual gap while
     keeping the sticky math intact. */
  (function(){
    var wrap=document.querySelector(".sv-head-sticky"),spacer=document.querySelector(".sv-head-spacer");
    var list=document.querySelector(".sv-list");
    var svs=[].slice.call(document.querySelectorAll(".sv"));
    var last=svs[svs.length-1];
    if(!wrap||!spacer||!list||!last)return;
    function sync(){
      spacer.style.height="0px";
      list.style.marginTop="";
      var wrapTop=parseFloat(getComputedStyle(wrap).top)||0;
      var wrapH=wrap.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--sv-top",(wrapTop+wrapH+12)+"px");
      var lastTop=parseFloat(getComputedStyle(last).top)||0;
      var lastH=last.getBoundingClientRect().height;
      var needed=Math.max(0,(lastTop+lastH)-(wrapTop+wrapH));
      spacer.style.height=needed+"px";
      var baseMargin=parseFloat(getComputedStyle(list).marginTop)||0;
      list.style.marginTop=(baseMargin-needed)+"px";
    }
    sync();
    window.addEventListener("resize",sync,{passive:true});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(sync);
  })();

  /* ---------- Gallery: keep the upward drift at one steady speed on every screen ---------- */
  (function(){
    var tracks=[].slice.call(document.querySelectorAll(".gl-col-track"));
    if(!tracks.length)return;
    var SPEED=50; // px per second
    function tune(){tracks.forEach(function(t){var h=t.scrollHeight/2;if(h>0)t.style.animationDuration=(h/SPEED).toFixed(1)+"s"})}
    tune();
    window.addEventListener("resize",tune,{passive:true});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(tune);
    window.addEventListener("load",tune);
  })();

  /* ---------- Gallery: click a photo to open it large ---------- */
  (function(){
    var lb=document.getElementById("lightbox"),img=lb&&lb.querySelector(".lb-img");
    var opens=[].slice.call(document.querySelectorAll(".gl-open"));
    if(!lb||!opens.length)return;
    var ap=document.getElementById("allphotos"),allBtn=document.getElementById("gl-all");
    var list=[],cur=0,opener=null,hideT,apT,order=null;
    var nameEl=lb.querySelector(".lb-name"),countEl=lb.querySelector(".lb-count"),dotEl=lb.querySelector(".lb-dot");
    var SKY=[[5,[43,49,117]],[5.75,[91,90,168]],[6.5,[244,163,160]],[7.5,[248,201,138]],[9,[159,211,242]],[12,[88,169,238]],[15.5,[140,196,244]],[17.25,[255,196,107]],[18.25,[242,121,154]],[19.25,[90,74,146]],[20.5,[24,29,77]],[22,[11,16,48]]];
    function skyAt(t){
      if(t<=SKY[0][0])return "rgb("+SKY[0][1].join(",")+")";
      for(var i=1;i<SKY.length;i++)if(t<=SKY[i][0]){
        var a=SKY[i-1],b=SKY[i],f=(t-a[0])/(b[0]-a[0]);
        return "rgb("+[0,1,2].map(function(k){return Math.round(a[1][k]+(b[1][k]-a[1][k])*f)}).join(",")+")";
      }
      return "rgb("+SKY[SKY.length-1][1].join(",")+")";
    }
    function partOf(t){return t>=20.5?"Night":t<6?"Early morning":t<7.5?"Sunrise":t<11?"Morning":t<15?"Midday":t<17.25?"Afternoon":t<18.75?"Golden hour":"Dusk"}
    opens.forEach(function(b){var i=+b.dataset.index;if(!list[i])list[i]={hour:+b.dataset.hour,name:b.dataset.name||"",full:b.dataset.full,thumb:b.dataset.thumb,alt:b.getAttribute("aria-label").replace(/^Open photo: /,"")}});
    var shutterSnd=new Audio("/sounds/shutter.mp3");
    shutterSnd.preload="auto";shutterSnd.volume=.8;
    function shutter(){
      try{shutterSnd.currentTime=0;var p=shutterSnd.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
    }
    function navOrder(){return order||list.map(function(_,i){return i})}
    function show(i){
      cur=i;var p=list[cur];
      img.alt=p.alt;img.src=p.thumb;
      var o=navOrder();nameEl.textContent=p.name;dotEl.style.background=skyAt(p.hour);countEl.textContent=(o.indexOf(cur)+1)+" / "+o.length;
      var big=new Image();big.onload=function(){if(list[cur]===p)img.src=p.full};big.src=p.full;
    }
    function step(d){var o=navOrder(),pos=o.indexOf(cur);show(o[(pos+d+o.length)%o.length])}
    function open(i,from){
      order=(ap&&from&&from.closest&&from.closest(".ap-item"))?[].slice.call(ap.querySelectorAll(".ap-item .gl-open")).map(function(x){return+x.dataset.index}):null;
      opener=from;clearTimeout(hideT);show(i);lb.hidden=false;
      shutter();
      if(!calmMotion){lb.classList.remove("flash");void lb.offsetWidth;lb.classList.add("flash");setTimeout(function(){lb.classList.remove("flash")},500)}
      document.documentElement.classList.add("lb-open");
      requestAnimationFrame(function(){lb.classList.add("open")});
      lb.querySelector(".lb-close").focus();
    }
    function close(){
      lb.classList.remove("open");document.documentElement.classList.remove("lb-open");
      hideT=setTimeout(function(){lb.hidden=true},calmMotion?0:220);
      if(opener)opener.focus();
    }
    function openAll(){
      if(!ap)return;
      clearTimeout(apT);ap.hidden=false;ap.scrollTop=0;layoutGrid();
      document.documentElement.classList.add("ap-open");
      requestAnimationFrame(function(){ap.classList.add("open")});
      ap.querySelector(".ap-close").focus();
    }
    function closeAll(){
      ap.classList.remove("open");document.documentElement.classList.remove("ap-open");
      apT=setTimeout(function(){ap.hidden=true},calmMotion?0:220);
      if(allBtn)allBtn.focus();
    }
    var todOn=false;
    var grid=ap&&ap.querySelector(".ap-grid");
    if(ap)[].forEach.call(ap.querySelectorAll(".ap-item"),function(it){var b=it.querySelector(".gl-open");it.dataset.hour=b?b.dataset.hour:12;it.dataset.idx=b?b.dataset.index:0});
    function layoutGrid(){
      if(!grid||ap.hidden)return;
      var cs=getComputedStyle(grid),tracks=cs.gridTemplateColumns.split(" ");
      var colW=parseFloat(tracks[0]),gap=parseFloat(cs.columnGap)||0;
      if(!colW)return;
      [].forEach.call(grid.children,function(it){
        var im=it.querySelector(".ap-img"),r=(+im.getAttribute("height"))/(+im.getAttribute("width"));
        it.style.gridRowEnd="span "+Math.ceil(colW*r+gap);
      });
    }
    window.addEventListener("resize",layoutGrid,{passive:true});
    var tod=ap&&ap.querySelector(".ap-tod"),range=tod&&tod.querySelector(".ap-tod-range"),resetBtn=tod&&tod.querySelector(".ap-tod-reset"),raf=0;
    var NEAR=2.5; // hours either side that count as "this time of day"
    function arrangeTime(){
      raf=0;
      var t=+range.value,items=[].slice.call(grid.children),first=new Map();
      var dist=function(el){return Math.abs(el.dataset.hour-t)};
      var next=todOn?items.slice().sort(function(x,y){return dist(x)-dist(y)||x.dataset.idx-y.dataset.idx}):items.slice().sort(function(x,y){return x.dataset.idx-y.dataset.idx});
      var same=next.every(function(el,i){return el===items[i]});
      if(!same){ap.scrollTop=0;items.forEach(function(el){first.set(el,el.getBoundingClientRect())});next.forEach(function(el){grid.appendChild(el)})}
      var near=0;
      next.forEach(function(el){var far=todOn&&dist(el)>NEAR;if(!far)near++;el.classList.toggle("ap-dim",far)});
      tod.style.setProperty("--sky",skyAt(t));
      if(t>=20.5)tod.setAttribute("data-night","");else tod.removeAttribute("data-night");
      tod.querySelector(".ap-tod-h").style.transform="rotate("+((t%12)/12*360)+"deg)";
      tod.querySelector(".ap-tod-m").style.transform="rotate("+((t%1)*360)+"deg)";
      tod.querySelector(".ap-tod-time").textContent=todOn?partOf(t):"Time of day";
      tod.querySelector(".ap-tod-part").textContent=todOn?near+" photo"+(near===1?"":"s"):"Drag the sun to browse";
      range.setAttribute("aria-valuetext",todOn?partOf(t):"Drag to choose a time of day");
      resetBtn.hidden=!todOn;
      if(same||calmMotion||!next[0].animate)return;
      next.forEach(function(el,idx){
        var a=first.get(el),r=el.getBoundingClientRect(),dx=a.left-r.left,dy=a.top-r.top;
        if(!dx&&!dy)return;
        el.animate([{transform:"translate("+dx+"px,"+dy+"px)"},{transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"});
      });
    }
    if(range){
      range.addEventListener("input",function(){todOn=true;if(!raf)raf=requestAnimationFrame(arrangeTime)});
      resetBtn.addEventListener("click",function(){todOn=false;range.value=12;arrangeTime()});
    }
    var tilt=null;
    function tiltMove(e){
      var it=e.target.closest&&e.target.closest(".ap-item");
      if(tilt&&tilt!==it){tilt.classList.remove("tilting");tilt.style.removeProperty("--rx");tilt.style.removeProperty("--ry");tilt=null}
      if(!it)return;
      var r=it.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      it.classList.add("tilting");tilt=it;
      it.style.setProperty("--ry",((px-.5)*14).toFixed(2)+"deg");
      it.style.setProperty("--rx",((.5-py)*14).toFixed(2)+"deg");
      it.style.setProperty("--gx",(px*100).toFixed(1)+"%");
      it.style.setProperty("--gy",(py*100).toFixed(1)+"%");
    }
    if(ap&&!calmMotion&&window.matchMedia("(hover:hover) and (pointer:fine)").matches){
      ap.addEventListener("pointermove",tiltMove,{passive:true});
      ap.addEventListener("pointerleave",function(){if(tilt){tilt.classList.remove("tilting");tilt.style.removeProperty("--rx");tilt.style.removeProperty("--ry");tilt=null}});
    }
    document.addEventListener("click",function(e){
      var b=e.target.closest&&e.target.closest(".gl-open");
      if(b){open(+b.dataset.index,b);return}
      if(e.target.closest&&e.target.closest("#gl-all")){openAll();return}
      if(ap&&!ap.hidden&&lb.hidden&&e.target.closest(".ap-close")){closeAll();return}
      if(lb.hidden)return;
      if(e.target===lb||e.target.closest(".lb-close"))close();
      else if(e.target.closest(".lb-prev"))step(-1);
      else if(e.target.closest(".lb-next"))step(1);
    });
    var sx=0,sy=0,swiping=false;
    lb.addEventListener("pointerdown",function(e){if(e.pointerType==="mouse"||!e.target.closest(".lb-img"))return;swiping=true;sx=e.clientX;sy=e.clientY});
    lb.addEventListener("pointerup",function(e){
      if(!swiping)return;swiping=false;
      var dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)step(dx<0?1:-1);
    });
    lb.addEventListener("pointercancel",function(){swiping=false});
    document.addEventListener("keydown",function(e){
      if(ap&&ap.classList.contains("open")&&(lb.hidden||!lb.classList.contains("open"))){if(e.key==="Escape")closeAll();return}
      if(lb.hidden||!lb.classList.contains("open"))return;
      if(e.key==="Escape")close();
      else if(e.key==="ArrowLeft")step(-1);
      else if(e.key==="ArrowRight")step(1);
      else if(e.key==="Tab"){
        var f=[].slice.call(lb.querySelectorAll("button")),first=f[0],last=f[f.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    });
  })();

  /* ---------- Pixel: a tiny guide ---------- */
  (function(){
    var px=document.getElementById("pixel"),bub=document.getElementById("px-bubble"),pup=document.getElementById("px-pupils");
    if(!px)return;
    var desk=window.matchMedia("(min-width:900px) and (hover:hover) and (pointer:fine)");
    var tips={
      hero:["Hi! I’m Pixel, Yashita’s design buddy.","Psst… press C to copy her email.","Her socials and resume are in the bar below.","Hover anything to inspect it, just like Figma.","Click anywhere on the canvas for a surprise shape."],
      exp:["Hover a card to select its frame and open the details.","Company names link to their websites.","Consequence is a product she designs, with two sites."],
      touch:["Hi! I’m Pixel, Yashita’s design buddy.","Tap the key to copy her email.","Her socials and resume are in the bar below.","Scroll down to see where she’s worked."]
    };
    var ctx="hero",idx={hero:0,exp:0,touch:0},hideT,nextT;
    function list(){return desk.matches?tips[ctx]:tips.touch}
    function key(){return desk.matches?ctx:"touch"}
    function say(text,ms){
      clearTimeout(hideT);clearTimeout(nextT);
      bub.textContent=text;bub.classList.add("on");
      hideT=setTimeout(function(){bub.classList.remove("on");nextT=setTimeout(cycle,4000)},ms||5200);
    }
    function cycle(){var k=key(),l=list();say(l[idx[k]%l.length]);idx[k]++}
    function react(cls,ms){px.classList.remove(cls);void px.offsetWidth;px.classList.add(cls);setTimeout(function(){px.classList.remove(cls)},ms)}
    function reveal(){px.classList.add("in");react("wave",1600);cycle()}
    if(window.__introDone)setTimeout(reveal,4500);
    else document.addEventListener("introdone",function(){setTimeout(reveal,4500)},{once:true});
    px.addEventListener("click",function(e){e.stopPropagation();react("jump",520);react("happy",900);cycle()});
    var exp=document.getElementById("experience");
    if(exp&&"IntersectionObserver" in window){new IntersectionObserver(function(en){var c=en[0].isIntersecting?"exp":"hero";if(c!==ctx){ctx=c;if(desk.matches){clearTimeout(nextT);nextT=setTimeout(cycle,700)}}},{threshold:.2}).observe(exp)}
    document.addEventListener("px",function(e){
      var d=e.detail;
      if(d==="copied"){react("happy",2600);react("jump",520);say("Copied! Now go say hi 👋",3200)}
      else if(d==="soon"){react("happy",1000);say("That link is coming soon!",2600)}
      else{var n={"0":"rectangle","1":"circle","2":"triangle","3":"star"}[d];if(n){react("happy",1200);say("Nice pick! Click anywhere to drop a "+n+".",3200)}}
    });
    window.addEventListener("pointermove",function(e){
      var r=px.querySelector(".px-svg").getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height*.45;
      var dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1,m=Math.min(2.6,d/40);
      pup.setAttribute("transform","translate("+(dx/d*m).toFixed(2)+" "+(dy/d*m).toFixed(2)+")");
    },{passive:true});
  })();

  /* ---------- Copy email ---------- */
  var email="figmaebae@gmail.com";
  var btn=document.getElementById("copy"),key=document.getElementById("key"),label=document.getElementById("label"),live=document.getElementById("live");
  var idleLabel=label.innerHTML,timer;
  var check='<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function fallback(t){return new Promise(function(res,rej){var ta=document.createElement("textarea");ta.value=t;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}ta.remove();ok?res():rej()})}
  function write(t){return(navigator.clipboard&&window.isSecureContext)?navigator.clipboard.writeText(t).catch(function(){return fallback(t)}):fallback(t)}
  function setStatus(s){
    btn.dataset.status=s;
    if(s==="copied"){document.dispatchEvent(new CustomEvent("px",{detail:"copied"}));key.innerHTML=check;label.innerHTML='Copied <span class="ink">'+email+'</span>';live.textContent="Copied "+email+" to clipboard"}
    else if(s==="error"){key.textContent="C";label.innerHTML='Couldn’t copy. Email me at <span class="ink">'+email+'</span>';live.textContent="Couldn't copy. Email is "+email}
    else{key.textContent="C";label.innerHTML=idleLabel;live.textContent=""}
  }
  function copy(){write(email).then(function(){setStatus("copied")},function(){setStatus("error")});clearTimeout(timer);timer=setTimeout(function(){setStatus("idle")},2400)}
  function typing(el){return el&&(el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))}
  btn.addEventListener("click",copy);
  window.addEventListener("keydown",function(e){if(e.key.toLowerCase()!=="c"||e.metaKey||e.ctrlKey||e.altKey||e.repeat||typing(e.target))return;btn.dataset.pressed="true";copy()});
  window.addEventListener("keyup",function(e){if(e.key.toLowerCase()==="c")btn.dataset.pressed="false"});
  window.addEventListener("blur",function(){btn.dataset.pressed="false"});

  /* ---------- Figma cursor + shape drops (mouse/trackpad only) ---------- */
  var fine=window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var calm=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if(!fine)return;
  document.documentElement.classList.add("fx");
  var cur=document.getElementById("cursor"),tag=document.getElementById("tag");
  var x=-100,y=-100;
  function place(){cur.style.transform="translate3d("+x+"px,"+y+"px,0)"}
  window.addEventListener("pointermove",function(e){
    x=e.clientX;y=e.clientY;place();cur.classList.add("on");
    var t=e.target.closest&&e.target.closest("[data-cursor]");
    var showLabel=t&&t.classList.contains("copy");
    var txt=showLabel?t.getAttribute("data-cursor"):"You";
    if(tag.textContent!==txt)tag.textContent=txt;
    cur.dataset.mode=showLabel?(t.classList.contains("variant")?"comp":"sel"):"";
  },{passive:true});
  document.addEventListener("pointerleave",function(){cur.classList.remove("on")});
  window.addEventListener("blur",function(){cur.classList.remove("on")});
  window.addEventListener("pointerdown",function(e){cur.classList.add("down");if(!calm&&!e.target.closest(".ui,.pixel"))drop(e.clientX,e.clientY)});
  window.addEventListener("pointerup",function(){cur.classList.remove("down")});

  var colors=["#f24e1e","#ff7262","#a259ff","#1abcfe","#0acf83"];
  var shapes=[
    '<rect x="3" y="3" width="18" height="18" rx="2"/>',
    '<circle cx="12" cy="12" r="9.5"/>',
    '<path d="M12 2.5 21.5 20h-19z"/>',
    '<path d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 16.8 6.1 20l1.3-6.5L2.5 8.9l6.6-.8z"/>'
  ];
  var i=0,live_=0;
  function drop(px,py){
    if(live_>24)return;
    var c=colors[i%colors.length],s=shapes[tool==="move"?Math.floor(Math.random()*shapes.length):+tool];i++;
    var el=document.createElement("div");el.className="shape";
    el.innerHTML='<svg viewBox="0 0 24 24" fill="'+c+'">'+s+'</svg>';
    document.body.appendChild(el);live_++;
    var r=Math.round(Math.random()*60-30),dx=Math.round(Math.random()*40-20);
    var a=el.animate([
      {transform:"translate("+px+"px,"+py+"px) scale(0) rotate("+(r-60)+"deg)",opacity:1},
      {transform:"translate("+px+"px,"+py+"px) scale(1.1) rotate("+r+"deg)",opacity:1,offset:.3},
      {transform:"translate("+(px+dx)+"px,"+(py-36)+"px) scale(.85) rotate("+(r+25)+"deg)",opacity:0}
    ],{duration:1100,easing:"cubic-bezier(.2,.7,.2,1)"});
    a.onfinish=function(){el.remove();live_--};
  }

}
