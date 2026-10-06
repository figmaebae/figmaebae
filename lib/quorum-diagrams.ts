// The three diagrams from the Quorum case study, as inline SVG. Colours come from CSS (see .q-dg in the stylesheet),
// so they follow light and dark mode. Marker ids are unique across the three.
export const DG_DEPS = `<svg viewBox="0 0 1100 512" role="img" aria-label="Procurement stocks inventory in after quality check and inventory sends low-stock alerts back to procurement. Orders reserve then deduct stock, and accepted returns put it back. Bookings share the catalogue. Approvals gate procurement, discounts feed orders, and the dashboard only reads.">
      <defs>
        <marker id="ma" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker>
        <marker id="mb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah acc"/></marker>
        <marker id="mc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah mut"/></marker>
      </defs>
      <!-- dashboard reads -->
      <path class="ln dash" d="M492 100 L236 237" marker-end="url(#mc)"/>
      <path class="ln dash" d="M539 100 V229" marker-end="url(#mc)"/>
      <path class="ln dash" d="M588 100 L837 237" marker-end="url(#mc)"/>
      <text class="lb" x="552" y="176">reads</text>
      <!-- procurement <-> inventory -->
      <path class="ln acc" d="M270 255 H431" marker-end="url(#mb)"/>
      <text class="lb acc" x="352" y="243" text-anchor="middle">stock in after QC</text>
      <path class="ln dash" d="M437 285 H275" marker-end="url(#mc)"/>
      <text class="lb" x="353" y="306" text-anchor="middle">low stock → raise PR</text>
      <!-- orders -> inventory -->
      <path class="ln acc" d="M808 261 H647" marker-end="url(#mb)"/>
      <text class="lb acc" x="727" y="248" text-anchor="middle">reserve, then deduct</text>
      <path class="ln acc" d="M808 285 H647" marker-end="url(#mb)"/>
      <text class="lb acc" x="750" y="312" text-anchor="middle">accepted return: stock back</text>
      <!-- bookings -> inventory -->
      <path class="ln dash" d="M826 411 L631 304" marker-end="url(#mc)"/>
      <text class="lb" x="716" y="424" text-anchor="middle">shares the catalogue</text>
      <!-- discounts -> orders -->
      <path class="ln" d="M922 136 V231" marker-end="url(#ma)"/>
      <text class="lb" x="934" y="188">coupon at checkout</text>
      <!-- approvals <-> procurement -->
      <path class="ln" d="M167 295 V404" marker-end="url(#ma)"/>
      <path class="ln" d="M193 411 V301" marker-end="url(#ma)"/>
      <text class="lb" x="157" y="358" text-anchor="end">PO over limit</text>
      <text class="lb" x="205" y="358">approved</text>
      <!-- nodes -->
      <rect class="nd sys" x="449" y="52" width="180" height="48" rx="12"/><text class="t" x="539" y="82" text-anchor="middle">Dashboard</text>
      <rect class="nd" x="832" y="88" width="180" height="48" rx="12"/><text class="t" x="922" y="118" text-anchor="middle">Discounts</text>
      <rect class="nd" x="89" y="241" width="181" height="54" rx="12"/><text class="t" x="179" y="264" text-anchor="middle">Procurement</text><text class="s" x="179" y="283" text-anchor="middle">PR · PO · GRN</text>
      <rect class="nd hot" x="437" y="234" width="204" height="67" rx="13"/><text class="t" x="539" y="262" text-anchor="middle">Inventory</text><text class="s" x="539" y="282" text-anchor="middle">physical · reserved · available</text>
      <rect class="nd" x="808" y="241" width="180" height="54" rx="12"/><text class="t" x="898" y="264" text-anchor="middle">Orders</text><text class="s" x="898" y="283" text-anchor="middle">marketplace · B2B · walk-in</text>
      <rect class="nd" x="89" y="411" width="181" height="54" rx="12"/><text class="t" x="179" y="444" text-anchor="middle">Approvals</text>
      <rect class="nd" x="808" y="411" width="180" height="54" rx="12"/><text class="t" x="898" y="434" text-anchor="middle">Bookings</text><text class="s" x="898" y="453" text-anchor="middle">staff · rooms · machines</text>
    </svg>`;

export const DG_SWIM = `<svg viewBox="0 0 969 730" role="img" aria-label="Swimlane across requester, approver, purchasing, stores, accounts and system: the requester raises a PR and submits it; the system either auto-approves it under the rule or sends it to the approver, who approves it or rejects it with a reason; purchasing converts the PR to a PO and sends it by email or WhatsApp; stores create a GRN and run a quality check; stock updates with the accepted quantity; accounts record the invoice; the system checks that PO, GRN and bill match.">
      <defs>
        <marker id="sa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker>
        <marker id="sb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah acc"/></marker>
        <marker id="sr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah bad"/></marker>
      </defs>
      <rect class="lane" x="16" y="10" width="156.2" height="710"/><rect class="lane" x="328.3" y="10" width="156.2" height="710"/><rect class="lane" x="640.7" y="10" width="156.2" height="710"/>
      <text class="lanetxt" x="94.1" y="34" text-anchor="middle">REQUESTER</text><text class="lanetxt" x="250.3" y="34" text-anchor="middle">APPROVER</text><text class="lanetxt" x="406.4" y="34" text-anchor="middle">PURCHASING</text><text class="lanetxt" x="562.6" y="34" text-anchor="middle">STORES</text><text class="lanetxt" x="718.8" y="34" text-anchor="middle">ACCOUNTS</text><text class="lanetxt" x="874.9" y="34" text-anchor="middle">SYSTEM</text>
      <!-- edges -->
      <path class="ln" d="M161.1 80 H874.9 V110" marker-end="url(#sa)"/><text class="lb" x="484.5" y="72" text-anchor="middle">submit</text>
      <path class="ln" d="M806.9 142 H250.3 V174" marker-end="url(#sa)"/><text class="lb" x="562.6" y="134" text-anchor="middle">needs approval</text>
      <path class="ln bad" d="M182.3 210 H94.1 V105" marker-end="url(#sr)"/><text class="lb bad" x="102.1" y="164">reject +</text><text class="lb bad" x="102.1" y="178">reason</text>
      <path class="ln acc" d="M250.3 239 V298 H336.4" marker-end="url(#sb)"/><text class="lb acc" x="260.3" y="290">approve</text>
      <path class="ln acc" d="M874.9 171 V256 H406.4 V274" marker-end="url(#sb)"/><text class="lb acc" x="640.65" y="248" text-anchor="middle">rule met: auto-approved</text>
      <path class="ln" d="M406.4 319 V332" marker-end="url(#sa)"/>
      <path class="ln" d="M473.4 354 H562.6 V398" marker-end="url(#sa)"/><text class="lb" x="479.4" y="346">goods arrive</text>
      <path class="ln" d="M562.6 441 V459" marker-end="url(#sa)"/>
      <path class="ln" d="M629.6 486 H874.9 V532" marker-end="url(#sa)"/><text class="lb" x="752.25" y="478" text-anchor="middle">inspection done</text>
      <path class="ln" d="M874.9 573 V625 H788.8" marker-end="url(#sa)"/>
      <path class="ln acc" d="M718.8 646 V694 H804.9" marker-end="url(#sb)"/><text class="lb acc" x="727.8" y="684">bill</text>
      <!-- nodes -->
      <rect class="nd" x="27.1" y="59" width="134" height="42" rx="8"/><text class="t" x="94.1" y="76" text-anchor="middle">Raise PR</text><text class="s" x="94.1" y="91" text-anchor="middle">items, qty, date</text>
      <polygon class="dia" points="806.9,142 874.9,113 942.9,142 874.9,171"/><text class="t" x="874.9" y="146" text-anchor="middle">Auto-approve?</text>
      <polygon class="dia" points="182.3,210 250.3,181 318.3,210 250.3,239"/><text class="t" x="250.3" y="214" text-anchor="middle">Approve?</text>
      <rect class="nd" x="339.4" y="277" width="134" height="42" rx="8"/><text class="t" x="406.4" y="294" text-anchor="middle">Convert to PO</text><text class="s" x="406.4" y="309" text-anchor="middle">PR fields carried</text>
      <rect class="nd" x="339.4" y="333" width="134" height="42" rx="8"/><text class="t" x="406.4" y="350" text-anchor="middle">Send PO</text><text class="s" x="406.4" y="365" text-anchor="middle">email or WhatsApp</text>
      <rect class="nd" x="495.6" y="399" width="134" height="42" rx="8"/><text class="t" x="562.6" y="416" text-anchor="middle">Create GRN</text><text class="s" x="562.6" y="431" text-anchor="middle">received qty</text>
      <rect class="nd" x="495.6" y="465" width="134" height="42" rx="8"/><text class="t" x="562.6" y="482" text-anchor="middle">Quality check</text><text class="s" x="562.6" y="497" text-anchor="middle">approve or reject</text>
      <rect class="nd sys" x="807.9" y="532" width="134" height="42" rx="8"/><text class="t" x="874.9" y="549" text-anchor="middle">Stock updated</text><text class="s" x="874.9" y="564" text-anchor="middle">accepted qty only</text>
      <rect class="nd" x="651.8" y="604" width="134" height="42" rx="8"/><text class="t" x="718.8" y="621" text-anchor="middle">Record invoice</text><text class="s" x="718.8" y="636" text-anchor="middle">upload or key in</text>
      <rect class="nd hot" x="807.9" y="673" width="134" height="42" rx="8"/><text class="t" x="874.9" y="690" text-anchor="middle">3-way match</text><text class="s" x="874.9" y="705" text-anchor="middle">PO = GRN = bill</text>
      <!-- step numbers -->
      <circle class="nb" cx="29.099999999999994" cy="59" r="9"/><text class="nt" x="29.099999999999994" y="62.5" text-anchor="middle">1</text><circle class="nb" cx="214.3" cy="184" r="9"/><text class="nt" x="214.3" y="187.5" text-anchor="middle">2</text><circle class="nb" cx="341.4" cy="277" r="9"/><text class="nt" x="341.4" y="280.5" text-anchor="middle">3</text><circle class="nb" cx="497.6" cy="399" r="9"/><text class="nt" x="497.6" y="402.5" text-anchor="middle">4</text><circle class="nb" cx="497.6" cy="465" r="9"/><text class="nt" x="497.6" y="468.5" text-anchor="middle">5</text><circle class="nb" cx="653.8" cy="604" r="9"/><text class="nt" x="653.8" y="607.5" text-anchor="middle">6</text>
    </svg>`;

export const DG_ROUTE = `<svg viewBox="0 0 1000 452" role="img" aria-label="Decision tree with three entry points and five landing spots. Website: start free trial, create account with work email and password, answer six required questions, optional module setup, then the dashboard with widgets set by industry and role. Pricing page: buy a plan, pay at checkout, then the system checks whether the email is known; if not, the user answers the six questions, if yes the wizard is skipped, the plan is reactivated and they land on their old dashboard with a welcome-back toast. Login: email and password, then the system checks whether the user has more than one entity; if not they go straight to the entity dashboard, if yes they pick an entity, and owners and admins can also open a consolidated view.">
      <defs>
        <marker id="ra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker>
        <marker id="rb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah acc"/></marker>
        <marker id="rc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah mut"/></marker>
      </defs>
      <text class="colt" x="110.4" y="33.8" text-anchor="middle">ENTRY</text><text class="colt" x="878.6" y="33.8" text-anchor="middle">LANDS ON</text>
      <!-- edges -->
      <path class="ln" d="M184.4 81.8 H227.3" marker-end="url(#ra)"/><path class="ln" d="M377.9 81.8 H422.1" marker-end="url(#ra)"/><path class="ln" d="M572.7 81.8 H616.9" marker-end="url(#ra)"/><path class="ln" d="M766.9 81.8 H786.4" marker-end="url(#ra)"/>
      <path class="ln" d="M500 169.5 V107.8" marker-end="url(#ra)"/><text class="lb" x="507.8" y="142.2">no: set password</text>
      <path class="ln" d="M184.4 198.1 H227.3" marker-end="url(#ra)"/><path class="ln" d="M377.9 198.1 H437" marker-end="url(#ra)"/>
      <path class="ln acc" d="M558.4 198.1 H616.9" marker-end="url(#rb)"/><text class="lb acc" x="566.2" y="190.9">yes</text>
      <path class="ln acc" d="M766.9 198.1 H786.4" marker-end="url(#rb)"/>
      <path class="ln" d="M184.4 334.4 H242.9" marker-end="url(#ra)"/><path class="ln" d="M363.6 334.4 H422.1" marker-end="url(#ra)"/><text class="lb" x="371.4" y="326">yes</text>
      <path class="ln" d="M572.7 334.4 H786.4" marker-end="url(#ra)"/><text class="lb" x="654.5" y="326" text-anchor="middle">pick an entity</text>
      <path class="ln" d="M305.2 305.8 V289.6 H762.3 V320.1 H786.4" marker-end="url(#ra)"/><text class="lb" x="313" y="283.1">no: single entity</text>
      <path class="ln dash" d="M500 356.5 V402.6 H786.4" marker-end="url(#rc)"/><text class="lb" x="507.8" y="394.2">owners, admins</text>
      <!-- entry points -->
      <rect class="nd hot" x="37.7" y="59.7" width="146.8" height="43.5" rx="9"/><text class="t" x="111" y="77.6" text-anchor="middle">Website</text><text class="s" x="111" y="89.9" text-anchor="middle">start free trial</text>
      <rect class="nd hot" x="37.7" y="176.6" width="146.8" height="43.5" rx="9"/><text class="t" x="111" y="194.5" text-anchor="middle">Pricing page</text><text class="s" x="111" y="206.8" text-anchor="middle">buy a plan</text>
      <rect class="nd hot" x="37.7" y="313" width="146.8" height="43.5" rx="9"/><text class="t" x="111" y="330.8" text-anchor="middle">Login</text><text class="s" x="111" y="343.2" text-anchor="middle">email + password</text>
      <!-- steps and checks -->
      <rect class="nd" x="232.5" y="59.7" width="145.5" height="43.5" rx="9"/><text class="t" x="305.2" y="77.6" text-anchor="middle">Create account</text><text class="s" x="305.2" y="89.9" text-anchor="middle">work email + password</text>
      <rect class="nd" x="426.6" y="59.7" width="146.1" height="43.5" rx="9"/><text class="t" x="499.7" y="77.6" text-anchor="middle">6 required questions</text><text class="s" x="499.7" y="89.9" text-anchor="middle">org, industry, role…</text>
      <rect class="nd" x="621.4" y="59.7" width="145.5" height="43.5" rx="9"/><text class="t" x="694.2" y="77.6" text-anchor="middle">Module setup</text><text class="s" x="694.2" y="89.9" text-anchor="middle">optional, skippable</text>
      <rect class="nd" x="232.5" y="176.6" width="145.5" height="43.5" rx="9"/><text class="t" x="305.2" y="194.5" text-anchor="middle">Payment</text><text class="s" x="305.2" y="206.8" text-anchor="middle">checkout</text>
      <polygon class="dia" points="441.6,198.7 500,169.5 558.4,198.7 500,227.9"/><text class="t dl" x="500" y="202.7" text-anchor="middle">Email known?</text>
      <rect class="nd sys" x="621.4" y="176.6" width="145.5" height="43.5" rx="9"/><text class="t" x="694.2" y="194.5" text-anchor="middle">Skip the wizard</text><text class="s" x="694.2" y="206.8" text-anchor="middle">plan reactivated</text>
      <polygon class="dia" points="246.8,335.1 305.2,305.8 363.6,335.1 305.2,364.3"/><text class="t dl" x="305.2" y="339.1" text-anchor="middle">Entities &gt; 1?</text>
      <rect class="nd" x="426.6" y="313" width="146.1" height="43.5" rx="9"/><text class="t" x="499.7" y="330.8" text-anchor="middle">Entity picker</text><text class="s" x="499.7" y="343.2" text-anchor="middle">status, role per entity</text>
      <!-- landing spots -->
      <rect class="nd land" x="790.9" y="59.7" width="176" height="43.5" rx="9"/><text class="t" x="878.9" y="77.6" text-anchor="middle">Dashboard</text><text class="s acc" x="878.9" y="89.9" text-anchor="middle">widgets set by industry, role</text>
      <rect class="nd land" x="790.9" y="176.6" width="176" height="43.5" rx="9"/><text class="t" x="878.9" y="194.5" text-anchor="middle">Their old dashboard</text><text class="s" x="878.9" y="206.8" text-anchor="middle">“Welcome back” toast</text>
      <rect class="nd land" x="790.9" y="313" width="176" height="43.5" rx="9"/><text class="t" x="878.9" y="330.8" text-anchor="middle">Entity dashboard</text><text class="s" x="878.9" y="343.2" text-anchor="middle">picked, or straight in</text>
      <rect class="nd land" x="790.9" y="381.2" width="176" height="42.9" rx="9"/><text class="t" x="878.9" y="398.7" text-anchor="middle">Consolidated view</text><text class="s" x="878.9" y="411" text-anchor="middle">owners and admins only</text>
    </svg>`;
