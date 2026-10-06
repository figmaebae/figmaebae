// The three diagrams from the Quorum case study, as inline SVG. Colours come from CSS (see .q-dg in the stylesheet),
// so they follow light and dark mode. Marker ids are unique across the three.
export const DG_DEPS = `<svg viewBox="0 0 900 400" role="img" aria-label="Procurement, orders and bookings all change inventory; approvals gate procurement; discounts feed orders; the dashboard only reads.">
      <defs>
        <marker id="ma" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker>
        <marker id="mb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah acc"/></marker>
        <marker id="mc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah mut"/></marker>
      </defs>
      <!-- dashboard reads -->
      <path class="ln dash" d="M410 70 L190 186" marker-end="url(#mc)"/>
      <path class="ln dash" d="M450 70 V180" marker-end="url(#mc)"/>
      <path class="ln dash" d="M490 70 L700 186" marker-end="url(#mc)"/>
      <text class="lb" x="460" y="132">reads</text>
      <!-- proc <-> inventory -->
      <path class="ln acc" d="M225 200 H361" marker-end="url(#mb)"/>
      <text class="lb acc" x="293" y="192" text-anchor="middle">stock in after QC</text>
      <path class="ln dash" d="M365 224 H229" marker-end="url(#mc)"/>
      <text class="lb" x="295" y="242" text-anchor="middle">low stock → raise PR</text>
      <!-- orders -> inventory -->
      <path class="ln acc" d="M675 205 H539" marker-end="url(#mb)"/>
      <text class="lb acc" x="607" y="197" text-anchor="middle">reserve, then deduct</text>
      <!-- bookings -> inventory -->
      <path class="ln acc" d="M690 330 L522 240" marker-end="url(#mb)"/>
      <text class="lb acc" x="604" y="322" text-anchor="start">service uses products</text>
      <!-- discounts -> orders -->
      <path class="ln" d="M770 100 V184" marker-end="url(#ma)"/>
      <text class="lb" x="778" y="146">coupon at checkout</text>
      <!-- approvals <-> procurement -->
      <path class="ln" d="M140 232 V326" marker-end="url(#ma)"/>
      <path class="ln" d="M162 330 V236" marker-end="url(#ma)"/>
      <text class="lb" x="132" y="284" text-anchor="end">PO over limit</text>
      <text class="lb" x="170" y="284">approved</text>
      <!-- nodes -->
      <rect class="nd sys" x="375" y="30" width="150" height="40" rx="9"/><text class="t" x="450" y="55" text-anchor="middle">Dashboard</text>
      <rect class="nd" x="695" y="60" width="150" height="40" rx="9"/><text class="t" x="770" y="85" text-anchor="middle">Discounts</text>
      <rect class="nd" x="75" y="188" width="150" height="44" rx="9"/><text class="t" x="150" y="207" text-anchor="middle">Procurement</text><text class="s" x="150" y="222" text-anchor="middle">PR · PO · GRN</text>
      <rect class="nd hot" x="365" y="182" width="170" height="56" rx="10"/><text class="t" x="450" y="206" text-anchor="middle">Inventory</text><text class="s" x="450" y="222" text-anchor="middle">physical · reserved · available</text>
      <rect class="nd" x="675" y="188" width="150" height="44" rx="9"/><text class="t" x="750" y="207" text-anchor="middle">Orders</text><text class="s" x="750" y="222" text-anchor="middle">marketplace · B2B · walk-in</text>
      <rect class="nd" x="75" y="330" width="150" height="44" rx="9"/><text class="t" x="150" y="357" text-anchor="middle">Approvals</text>
      <rect class="nd" x="675" y="330" width="150" height="44" rx="9"/><text class="t" x="750" y="349" text-anchor="middle">Bookings</text><text class="s" x="750" y="364" text-anchor="middle">staff · rooms · machines</text>
    </svg>`;

export const DG_SWIM = `<svg viewBox="0 0 860 880" role="img" aria-label="Swimlane: requester raises a PR; the system checks the limit; an approver approves or rejects; purchasing converts to PO; the system emails the vendor; stores create a GRN and run QC; stock updates with accepted quantity; accounts record the invoice; the system runs a 3-way match.">
      <defs>
        <marker id="sa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker>
        <marker id="sb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah acc"/></marker>
        <marker id="sr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah bad"/></marker>
      </defs>
      <rect class="lane" x="20" y="0" width="140" height="880"/><rect class="lane" x="300" y="0" width="140" height="880"/><rect class="lane" x="580" y="0" width="140" height="880"/>
      <text class="lanetxt" x="90" y="28" text-anchor="middle">REQUESTER</text><text class="lanetxt" x="230" y="28" text-anchor="middle">APPROVER</text><text class="lanetxt" x="370" y="28" text-anchor="middle">PURCHASING</text><text class="lanetxt" x="510" y="28" text-anchor="middle">STORES</text><text class="lanetxt" x="650" y="28" text-anchor="middle">ACCOUNTS</text><text class="lanetxt" x="790" y="28" text-anchor="middle">SYSTEM</text>
      <!-- edges -->
      <path class="ln" d="M150 90 H790 V136" marker-end="url(#sa)"/><text class="lb" x="470" y="82" text-anchor="middle">submit</text>
      <path class="ln" d="M734 170 H230 V216" marker-end="url(#sa)"/><text class="lb" x="480" y="162" text-anchor="middle">over limit</text>
      <path class="ln acc" d="M790 200 V300 H370 V313" marker-end="url(#sb)"/><text class="lb acc" x="580" y="292" text-anchor="middle">under limit: auto-approved</text>
      <path class="ln acc" d="M230 280 V340 H306" marker-end="url(#sb)"/><text class="lb acc" x="238" y="330">approve</text>
      <path class="ln bad" d="M174 250 H90 V117" marker-end="url(#sr)"/><text class="lb bad" x="98" y="200">reject +</text><text class="lb bad" x="98" y="214">reason</text>
      <path class="ln" d="M430 340 H790 V393" marker-end="url(#sa)"/><text class="lb" x="610" y="332" text-anchor="middle">create &amp; send</text>
      <path class="ln" d="M790 443 V500 H574" marker-end="url(#sa)"/><text class="lb" x="680" y="492" text-anchor="middle">goods arrive</text>
      <path class="ln" d="M510 523 V556" marker-end="url(#sa)"/>
      <path class="ln" d="M566 590 H790 V643" marker-end="url(#sa)"/><text class="lb" x="680" y="582" text-anchor="middle">QC result</text>
      <path class="ln" d="M790 693 V750 H714" marker-end="url(#sa)"/>
      <path class="ln acc" d="M650 773 V830 H726" marker-end="url(#sb)"/><text class="lb acc" x="658" y="812">bill</text>
      <!-- nodes -->
      <rect class="nd" x="30" y="67" width="120" height="46" rx="8"/><text class="t" x="90" y="87" text-anchor="middle">Raise PR</text><text class="s" x="90" y="103" text-anchor="middle">items, qty, date</text>
      <polygon class="dia" points="734,170 790,140 846,170 790,200"/><text class="t" x="790" y="174" text-anchor="middle">Over limit?</text>
      <polygon class="dia" points="174,250 230,220 286,250 230,280"/><text class="t" x="230" y="254" text-anchor="middle">Approve?</text>
      <rect class="nd" x="310" y="317" width="120" height="46" rx="8"/><text class="t" x="370" y="337" text-anchor="middle">Convert to PO</text><text class="s" x="370" y="353" text-anchor="middle">PR fields carried</text>
      <rect class="nd sys" x="730" y="397" width="120" height="46" rx="8"/><text class="t" x="790" y="417" text-anchor="middle">PO emailed</text><text class="s" x="790" y="433" text-anchor="middle">PR closed</text>
      <rect class="nd" x="450" y="477" width="120" height="46" rx="8"/><text class="t" x="510" y="497" text-anchor="middle">Create GRN</text><text class="s" x="510" y="513" text-anchor="middle">received qty</text>
      <polygon class="dia" points="454,590 510,560 566,590 510,620"/><text class="t" x="510" y="594" text-anchor="middle">QC pass?</text>
      <rect class="nd sys" x="730" y="647" width="120" height="46" rx="8"/><text class="t" x="790" y="667" text-anchor="middle">Stock updated</text><text class="s" x="790" y="683" text-anchor="middle">accepted qty only</text>
      <rect class="nd" x="590" y="727" width="120" height="46" rx="8"/><text class="t" x="650" y="747" text-anchor="middle">Record invoice</text><text class="s" x="650" y="763" text-anchor="middle">upload the bill</text>
      <rect class="nd hot" x="730" y="807" width="120" height="46" rx="8"/><text class="t" x="790" y="827" text-anchor="middle">3-way match</text><text class="s" x="790" y="843" text-anchor="middle">PO = GRN = bill</text>
      <!-- badges -->
      <circle class="badge" cx="30" cy="67" r="10"/><text class="bt" x="30" y="71" text-anchor="middle">1</text>
      <circle class="badge" cx="196" cy="230" r="10"/><text class="bt" x="196" y="234" text-anchor="middle">2</text>
      <circle class="badge" cx="310" cy="317" r="10"/><text class="bt" x="310" y="321" text-anchor="middle">3</text>
      <circle class="badge" cx="450" cy="477" r="10"/><text class="bt" x="450" y="481" text-anchor="middle">4</text>
      <circle class="badge" cx="476" cy="570" r="10"/><text class="bt" x="476" y="574" text-anchor="middle">5</text>
      <circle class="badge" cx="590" cy="727" r="10"/><text class="bt" x="590" y="731" text-anchor="middle">6</text>
    </svg>`;

export const DG_ROUTE = `<svg viewBox="0 0 1000 440" role="img" aria-label="Decision tree: trial signups go through account, six questions and optional setup to the dashboard; buyers pay, then the system checks whether the email exists, sending new users into setup and returning users straight to their old dashboard; logins check whether the user has more than one entity.">
      <defs>
        <marker id="ra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker>
        <marker id="rb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah acc"/></marker>
      </defs>
      <text class="lanetxt" x="100" y="22" text-anchor="middle">ENTRY</text><text class="lanetxt" x="890" y="22" text-anchor="middle">LANDS ON</text>
      <!-- edges -->
      <path class="ln" d="M175 70 H221" marker-end="url(#ra)"/><path class="ln" d="M375 70 H421" marker-end="url(#ra)"/><path class="ln" d="M575 70 H621" marker-end="url(#ra)"/><path class="ln" d="M775 70 H796" marker-end="url(#ra)"/>
      <path class="ln" d="M175 190 H221" marker-end="url(#ra)"/><path class="ln" d="M375 190 H436" marker-end="url(#ra)"/>
      <path class="ln" d="M500 160 V96" marker-end="url(#ra)"/><text class="lb" x="508" y="132">no: set password</text>
      <path class="ln acc" d="M560 190 H621" marker-end="url(#rb)"/><text class="lb acc" x="568" y="182">yes</text>
      <path class="ln acc" d="M775 190 H796" marker-end="url(#rb)"/>
      <path class="ln" d="M175 330 H236" marker-end="url(#ra)"/>
      <path class="ln" d="M360 330 H421" marker-end="url(#ra)"/><text class="lb" x="368" y="322">yes</text>
      <path class="ln" d="M575 330 H796" marker-end="url(#ra)"/>
      <path class="ln" d="M300 360 V400 H796" marker-end="url(#ra)"/><text class="lb" x="308" y="388">no</text>
      <!-- entries -->
      <rect class="nd hot" x="25" y="48" width="150" height="44" rx="9"/><text class="t" x="100" y="67" text-anchor="middle">Website</text><text class="s" x="100" y="82" text-anchor="middle">start free trial</text>
      <rect class="nd hot" x="25" y="168" width="150" height="44" rx="9"/><text class="t" x="100" y="187" text-anchor="middle">Pricing page</text><text class="s" x="100" y="202" text-anchor="middle">buy a plan</text>
      <rect class="nd hot" x="25" y="308" width="150" height="44" rx="9"/><text class="t" x="100" y="327" text-anchor="middle">Login</text><text class="s" x="100" y="342" text-anchor="middle">email + password</text>
      <!-- trial row -->
      <rect class="nd" x="225" y="48" width="150" height="44" rx="9"/><text class="t" x="300" y="67" text-anchor="middle">Create account</text><text class="s" x="300" y="82" text-anchor="middle">work email</text>
      <rect class="nd" x="425" y="48" width="150" height="44" rx="9"/><text class="t" x="500" y="67" text-anchor="middle">6 required questions</text><text class="s" x="500" y="82" text-anchor="middle">org, industry, role…</text>
      <rect class="nd" x="625" y="48" width="150" height="44" rx="9"/><text class="t" x="700" y="67" text-anchor="middle">Module setup</text><text class="s" x="700" y="82" text-anchor="middle">optional, skippable</text>
      <rect class="nd end" x="800" y="48" width="180" height="44" rx="9"/><text class="te" x="890" y="67" text-anchor="middle">Dashboard</text><text class="se" x="890" y="82" text-anchor="middle">widgets set by industry, role</text>
      <!-- pricing row -->
      <rect class="nd sys" x="225" y="168" width="150" height="44" rx="9"/><text class="t" x="300" y="187" text-anchor="middle">Payment</text><text class="s" x="300" y="202" text-anchor="middle">checkout</text>
      <polygon class="dia" points="440,190 500,160 560,190 500,220"/><text class="t" x="500" y="194" text-anchor="middle" style="font-size:10.5px">Email known?</text>
      <rect class="nd sys" x="625" y="168" width="150" height="44" rx="9"/><text class="t" x="700" y="187" text-anchor="middle">Skip the wizard</text><text class="s" x="700" y="202" text-anchor="middle">plan reactivated</text>
      <rect class="nd end" x="800" y="168" width="180" height="44" rx="9"/><text class="te" x="890" y="187" text-anchor="middle">Their old dashboard</text><text class="se" x="890" y="202" text-anchor="middle">“Welcome back” toast</text>
      <!-- login row -->
      <polygon class="dia" points="240,330 300,300 360,330 300,360"/><text class="t" x="300" y="334" text-anchor="middle" style="font-size:10.5px">Entities &gt; 1?</text>
      <rect class="nd" x="425" y="308" width="150" height="44" rx="9"/><text class="t" x="500" y="327" text-anchor="middle">Entity picker</text><text class="s" x="500" y="342" text-anchor="middle">status, role per entity</text>
      <rect class="nd end" x="800" y="308" width="180" height="44" rx="9"/><text class="te" x="890" y="327" text-anchor="middle">Consolidated view</text><text class="se" x="890" y="342" text-anchor="middle">switch from the top bar</text>
      <rect class="nd end" x="800" y="378" width="180" height="44" rx="9"/><text class="te" x="890" y="397" text-anchor="middle">Entity dashboard</text><text class="se" x="890" y="412" text-anchor="middle">straight in</text>
    </svg>`;
