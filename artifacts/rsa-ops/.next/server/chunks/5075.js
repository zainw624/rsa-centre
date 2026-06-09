exports.id=5075,exports.ids=[5075],exports.modules={2162:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,90732,23)),Promise.resolve().then(c.t.bind(c,63695,23)),Promise.resolve().then(c.t.bind(c,72211,23)),Promise.resolve().then(c.t.bind(c,16630,23)),Promise.resolve().then(c.t.bind(c,76786,23)),Promise.resolve().then(c.t.bind(c,8246,23)),Promise.resolve().then(c.t.bind(c,66454,23)),Promise.resolve().then(c.t.bind(c,11331,23)),Promise.resolve().then(c.bind(c,54390))},6953:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>g,metadata:()=>f});var d=c(40974);c(55760);var e=c(90773);let f={title:"RSA Operations Centre",description:"Private Discord-authenticated operations centre for RSA league management.",metadataBase:new URL(process.env.NEXTAUTH_URL??"http://localhost:26138")};function g({children:a}){return(0,d.jsx)("html",{lang:"en",children:(0,d.jsx)("body",{children:(0,d.jsx)(e.Providers,{children:a})})})}},7471:(a,b,c)=>{"use strict";c.d(b,{Providers:()=>f});var d=c(95176),e=c(46095);function f({children:a}){return(0,d.jsx)(e.SessionProvider,{children:a})}},15170:(a,b,c)=>{"use strict";c.d(b,{default:()=>d});let d=(0,c(69334).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/runner/workspace/artifacts/rsa-ops/components/Sidebar.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/runner/workspace/artifacts/rsa-ops/components/Sidebar.tsx","default")},27358:(a,b,c)=>{"use strict";c.d(b,{default:()=>k});var d=c(95176),e=c(15993),f=c(31475),g=c.n(f),h=c(57327),i=c(46095);let j={owner:{label:"Bot Owner",color:"#f59e0b"},administrator:{label:"Administrator",color:"#c9a55a"},league:{label:"League Staff",color:"#60a5fa"},results:{label:"Official",color:"#34d399"},manager:{label:"Manager",color:"#a78bfa"},viewer:{label:"Member",color:"#64748b"}};function k(){let{data:a,status:b}=(0,i.useSession)(),[c,f]=(0,e.useState)(0),[k,l]=(0,e.useState)(!1),m=j[a?.user?.permission??"viewer"]??j.viewer,n=a?.user?.name??"RSA Member",o=a?.user?.image??null;return(0,d.jsxs)("div",{className:"tn-bar",children:[(0,d.jsx)("div",{className:"tn-left",children:(0,d.jsxs)("form",{action:"/search",method:"get",className:"tn-search-form",children:[(0,d.jsx)("label",{htmlFor:"tn-q",className:"sr-only",children:"Search"}),(0,d.jsx)("input",{id:"tn-q",name:"q",placeholder:"Search players, teams, fixtures…",className:"tn-search-input"}),(0,d.jsx)("button",{type:"submit",className:"tn-search-btn",children:"Search"})]})}),(0,d.jsxs)("div",{className:"tn-right",children:[(0,d.jsxs)(g(),{href:"/notifications",className:"tn-notif-btn","aria-label":"Notifications",children:[(0,d.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",width:"18",height:"18",children:(0,d.jsx)("path",{d:"M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 0 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6Z"})}),c>0&&(0,d.jsx)("span",{className:"tn-notif-badge",children:c>9?"9+":c})]}),"loading"===b?(0,d.jsx)("div",{className:"tn-user-skeleton"}):a?.user?(0,d.jsxs)("div",{className:"tn-user-wrap",children:[(0,d.jsxs)("button",{className:"tn-user-btn",onClick:()=>l(a=>!a),"aria-label":"User menu",children:[(0,d.jsx)("div",{className:"tn-user-avatar",children:o?(0,d.jsx)(h.default,{src:o,alt:n,fill:!0,sizes:"32px",className:"object-cover",referrerPolicy:"no-referrer",unoptimized:!0}):(0,d.jsx)("span",{className:"tn-user-initial",children:n.charAt(0).toUpperCase()})}),(0,d.jsxs)("div",{className:"tn-user-info",children:[(0,d.jsx)("span",{className:"tn-user-name",children:n}),(0,d.jsx)("span",{className:"tn-user-role",style:{color:m.color},children:m.label})]}),(0,d.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",width:"12",height:"12",className:"tn-chevron",style:{opacity:.4},children:(0,d.jsx)("polyline",{points:"6 9 12 15 18 9"})})]}),k&&(0,d.jsxs)("div",{className:"tn-dropdown",children:[(0,d.jsxs)("div",{className:"tn-dropdown-header",children:[(0,d.jsx)("div",{className:"tn-dd-avatar",children:o?(0,d.jsx)(h.default,{src:o,alt:n,fill:!0,sizes:"40px",className:"object-cover",referrerPolicy:"no-referrer",unoptimized:!0}):(0,d.jsx)("span",{className:"tn-dd-initial",children:n.charAt(0).toUpperCase()})}),(0,d.jsxs)("div",{children:[(0,d.jsx)("p",{className:"tn-dd-name",children:n}),(0,d.jsx)("p",{className:"tn-dd-role",style:{color:m.color},children:m.label})]})]}),a.user.roles?.length>0&&(0,d.jsx)("div",{className:"tn-dd-roles",children:a.user.roles.slice(0,4).map(a=>(0,d.jsx)("span",{className:"tn-dd-role-pill",children:a.replace("RSA | ","")},a))}),(0,d.jsx)("div",{className:"tn-dd-divider"}),(0,d.jsxs)(g(),{href:"/notifications",className:"tn-dd-item",onClick:()=>l(!1),children:["Notifications ",c>0&&(0,d.jsx)("span",{className:"tn-dd-count",children:c})]}),(0,d.jsx)("button",{onClick:()=>(0,i.signOut)({callbackUrl:"/login"}),className:"tn-dd-item tn-dd-signout",children:"Sign out"})]})]}):(0,d.jsx)(g(),{href:"/login",className:"tn-signin-btn",children:"Sign in"})]}),(0,d.jsx)("style",{children:`
        .tn-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(201,165,90,0.08);
          background: rgba(5,7,13,0.70);
          backdrop-filter: blur(8px);
          padding: 0 1rem;
          height: 52px;
          gap: 1rem;
          flex-shrink: 0;
        }
        .tn-left { flex: 1; min-width: 0; }
        .tn-search-form {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          max-width: 420px;
        }
        .tn-search-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 0.35rem 0.75rem;
          font-size: 0.8rem;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.15s;
        }
        .tn-search-input::placeholder { color: #334155; }
        .tn-search-input:focus { border-color: rgba(201,165,90,0.35); }
        .tn-search-btn {
          background: rgba(201,165,90,0.10);
          border: 1px solid rgba(201,165,90,0.22);
          border-radius: 7px;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #c9a55a;
          cursor: pointer;
          transition: background 0.12s;
          white-space: nowrap;
        }
        .tn-search-btn:hover { background: rgba(201,165,90,0.18); }
        .tn-right {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-shrink: 0;
        }
        .tn-notif-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          color: #64748b;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .tn-notif-btn:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; }
        .tn-notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 16px;
          height: 16px;
          background: #c9a55a;
          color: #0a0c10;
          font-size: 0.58rem;
          font-weight: 700;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }
        .tn-user-skeleton {
          width: 120px;
          height: 34px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          animation: tn-pulse 1.4s ease-in-out infinite;
        }
        @keyframes tn-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .tn-user-wrap { position: relative; }
        .tn-user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9px;
          padding: 0.3rem 0.625rem 0.3rem 0.3rem;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
        }
        .tn-user-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(201,165,90,0.18);
        }
        .tn-user-avatar {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(201,165,90,0.22);
          background: #0f1825;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tn-user-initial {
          font-size: 0.7rem;
          font-weight: 700;
          color: #c9a55a;
        }
        .tn-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
        }
        .tn-user-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        .tn-user-role {
          font-size: 0.62rem;
          line-height: 1;
          white-space: nowrap;
        }
        .tn-chevron { flex-shrink: 0; }
        /* Dropdown */
        .tn-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 220px;
          background: #0d1520;
          border: 1px solid rgba(201,165,90,0.14);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          z-index: 100;
          overflow: hidden;
          animation: tn-dropdown-in 0.12s ease-out;
        }
        @keyframes tn-dropdown-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tn-dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.875rem 0.875rem 0.75rem;
        }
        .tn-dd-avatar {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(201,165,90,0.25);
          background: #0f1825;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tn-dd-initial {
          font-size: 0.9rem;
          font-weight: 700;
          color: #c9a55a;
        }
        .tn-dd-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
          line-height: 1.2;
        }
        .tn-dd-role {
          font-size: 0.72rem;
          margin: 0.15rem 0 0;
          line-height: 1;
        }
        .tn-dd-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          padding: 0 0.875rem 0.75rem;
        }
        .tn-dd-role-pill {
          font-size: 0.62rem;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 999px;
          padding: 0.1rem 0.5rem;
          white-space: nowrap;
        }
        .tn-dd-divider { height: 1px; background: rgba(255,255,255,0.05); }
        .tn-dd-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.8rem;
          color: #94a3b8;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s, color 0.1s;
        }
        .tn-dd-item:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
        .tn-dd-count {
          font-size: 0.65rem;
          background: #c9a55a;
          color: #0a0c10;
          border-radius: 999px;
          padding: 0.05rem 0.35rem;
          font-weight: 700;
        }
        .tn-dd-signout:hover { color: #ef4444; background: rgba(239,68,68,0.05); }
        .tn-signin-btn {
          font-size: 0.8rem;
          font-weight: 600;
          color: #c9a55a;
          background: rgba(201,165,90,0.08);
          border: 1px solid rgba(201,165,90,0.22);
          border-radius: 8px;
          padding: 0.35rem 0.875rem;
          text-decoration: none;
          transition: background 0.12s;
        }
        .tn-signin-btn:hover { background: rgba(201,165,90,0.16); }
      `})]})}},30395:(a,b,c)=>{Promise.resolve().then(c.bind(c,90773))},45068:(a,b,c)=>{"use strict";c.d(b,{default:()=>d});let d=(0,c(69334).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/runner/workspace/artifacts/rsa-ops/components/TopNav.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/runner/workspace/artifacts/rsa-ops/components/TopNav.tsx","default")},45847:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>h});var d=c(40974);c(82111);var e=c(15170),f=c(45068);function g({children:a}){return(0,d.jsxs)("div",{className:"flex h-screen w-full overflow-hidden bg-[#060810]",children:[(0,d.jsx)("aside",{className:"hidden w-60 shrink-0 md:flex flex-col h-full",children:(0,d.jsx)(e.default,{})}),(0,d.jsxs)("div",{className:"flex flex-1 flex-col min-w-0 h-full overflow-hidden",children:[(0,d.jsx)(f.default,{}),(0,d.jsx)("main",{className:"flex-1 overflow-y-auto",children:(0,d.jsx)("div",{className:"px-5 py-6 md:px-8 md:py-8",children:a})})]})]})}function h({children:a}){return(0,d.jsx)(g,{children:a})}},49096:(a,b,c)=>{"use strict";Object.defineProperty(b,"__esModule",{value:!0}),!function(a,b){for(var c in b)Object.defineProperty(a,c,{enumerable:!0,get:b[c]})}(b,{default:function(){return i},getImageProps:function(){return h}});let d=c(30133),e=c(33522),f=c(92110),g=d._(c(82236));function h(a){let{props:b}=(0,e.getImgProps)(a,{defaultLoader:g.default,imgConf:{deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!1}});for(let[a,c]of Object.entries(b))void 0===c&&delete b[a];return{props:b}}let i=f.Image},55760:()=>{},57327:(a,b,c)=>{"use strict";c.d(b,{default:()=>e.a});var d=c(49096),e=c.n(d)},62410:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,91694,23)),Promise.resolve().then(c.t.bind(c,35433,23)),Promise.resolve().then(c.t.bind(c,44561,23)),Promise.resolve().then(c.t.bind(c,84936,23)),Promise.resolve().then(c.t.bind(c,71288,23)),Promise.resolve().then(c.t.bind(c,33052,23)),Promise.resolve().then(c.t.bind(c,60172,23)),Promise.resolve().then(c.t.bind(c,42845,23)),Promise.resolve().then(c.t.bind(c,22716,23))},83539:(a,b,c)=>{Promise.resolve().then(c.bind(c,7471))},84419:(a,b,c)=>{Promise.resolve().then(c.bind(c,15170)),Promise.resolve().then(c.bind(c,45068))},90773:(a,b,c)=>{"use strict";c.d(b,{Providers:()=>d});let d=(0,c(69334).registerClientReference)(function(){throw Error("Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/runner/workspace/artifacts/rsa-ops/app/providers.tsx","Providers")},97971:(a,b,c)=>{"use strict";c.d(b,{default:()=>o});var d=c(95176),e=c(31475),f=c.n(e),g=c(57327),h=c(46095),i=c(75998);let j={viewer:0,manager:1,results:2,league:3,administrator:4,owner:5},k=[{label:"Dashboard",href:"/dashboard",min:"viewer",group:"main"},{label:"Player Profiles",href:"/player-profiles",min:"viewer",group:"league"},{label:"Teams",href:"/teams",min:"viewer",group:"league"},{label:"Rosters",href:"/rosters",min:"viewer",group:"league"},{label:"Fixtures",href:"/fixtures",min:"viewer",group:"league"},{label:"Results",href:"/results",min:"viewer",group:"league"},{label:"League Table",href:"/league-table",min:"viewer",group:"league"},{label:"Statistics",href:"/statistics",min:"viewer",group:"league"},{label:"Transfers",href:"/transfers",min:"viewer",group:"ops"},{label:"Managers",href:"/managers",min:"viewer",group:"ops"},{label:"Staff",href:"/staff",min:"viewer",group:"ops"},{label:"World Cup",href:"/world-cup",min:"viewer",group:"ops"},{label:"Hall of Fame",href:"/hall-of-fame",min:"viewer",group:"records"},{label:"Awards",href:"/awards",min:"viewer",group:"records"},{label:"Archives",href:"/archives",min:"viewer",group:"records"},{label:"Discipline",href:"/discipline",min:"results",group:"manage"},{label:"Compliance",href:"/compliance",min:"league",group:"manage"},{label:"Activity",href:"/activity",min:"league",group:"manage"},{label:"Administration",href:"/administration",min:"administrator",group:"manage"}],l=[{key:"main",label:""},{key:"league",label:"League"},{key:"ops",label:"Operations"},{key:"records",label:"Records"},{key:"manage",label:"Management"}],m={owner:"Bot Owner",administrator:"Administrator",league:"League Staff",results:"Match Official",manager:"Manager",viewer:"RSA Member"},n={owner:"#f59e0b",administrator:"#c9a55a",league:"#60a5fa",results:"#34d399",manager:"#a78bfa",viewer:"#64748b"};function o(){let{data:a,status:b}=(0,h.useSession)(),c=(0,i.usePathname)(),e=a?.user?.permission??"viewer",o=k.filter(a=>{var b;return b=a.min,(j[e]??0)>=j[b]}),p=l.map(a=>({...a,items:o.filter(b=>b.group===a.key)})).filter(a=>a.items.length>0);return(0,d.jsxs)("aside",{className:"sb-wrap",children:[(0,d.jsxs)("div",{className:"sb-brand",children:[(0,d.jsx)("div",{className:"sb-logo-box",children:(0,d.jsx)(g.default,{src:"/assets/rsa1.png",alt:"RSA",fill:!0,sizes:"40px",className:"object-contain"})}),(0,d.jsxs)("div",{children:[(0,d.jsx)("p",{className:"sb-abbr",children:"RSA"}),(0,d.jsx)("p",{className:"sb-title",children:"Operations Centre"})]})]}),(0,d.jsx)("nav",{className:"sb-nav",role:"navigation","aria-label":"Main navigation",children:p.map(a=>(0,d.jsxs)("div",{children:[a.label?(0,d.jsx)("p",{className:"sb-group-label",children:a.label}):null,a.items.map(a=>{let b=c===a.href||"/dashboard"!==a.href&&c.startsWith(a.href+"/");return(0,d.jsx)(f(),{href:a.href,className:b?"sb-link sb-link-active":"sb-link",children:a.label},a.href)})]},a.key))}),(0,d.jsx)("div",{className:"sb-user",children:"loading"===b?(0,d.jsx)("div",{className:"sb-user-skeleton"}):a?.user?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)("div",{className:"sb-user-left",children:[(0,d.jsx)("div",{className:"sb-avatar",children:a.user.image?(0,d.jsx)(g.default,{src:a.user.image,alt:a.user.name??"User",fill:!0,sizes:"32px",className:"object-cover",referrerPolicy:"no-referrer",unoptimized:!0}):(0,d.jsx)("span",{className:"sb-avatar-initial",children:(a.user.name??"U").charAt(0).toUpperCase()})}),(0,d.jsxs)("div",{className:"sb-user-meta",children:[(0,d.jsx)("p",{className:"sb-user-name",children:a.user.name??"RSA Member"}),(0,d.jsx)("p",{className:"sb-user-role",style:{color:n[e]},children:m[e]??"Member"})]})]}),(0,d.jsx)("button",{onClick:()=>(0,h.signOut)({callbackUrl:"/login"}),className:"sb-signout",title:"Sign out","aria-label":"Sign out",children:(0,d.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",width:"15",height:"15",children:[(0,d.jsx)("path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}),(0,d.jsx)("polyline",{points:"16 17 21 12 16 7"}),(0,d.jsx)("line",{x1:"21",y1:"12",x2:"9",y2:"12"})]})})]}):null}),(0,d.jsx)("style",{children:`
        .sb-wrap {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(201,165,90,0.10);
          background: rgba(5,7,13,0.90);
          overflow: hidden;
        }
        .sb-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 1rem 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          flex-shrink: 0;
        }
        .sb-logo-box {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          overflow: hidden;
          border: 1px solid rgba(201,165,90,0.22);
          background: #060d16;
          flex-shrink: 0;
        }
        .sb-abbr {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          color: #c9a55a;
          text-transform: uppercase;
          margin: 0;
          line-height: 1;
        }
        .sb-title {
          font-size: 0.72rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0.15rem 0 0;
          line-height: 1;
        }
        .sb-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0.625rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 1px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .sb-group-label {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #334155;
          padding: 0.8rem 0.5rem 0.3rem;
          margin: 0;
        }
        .sb-link {
          display: block;
          border-radius: 7px;
          padding: 0.42rem 0.625rem;
          font-size: 0.78rem;
          color: #64748b;
          text-decoration: none;
          transition: background 0.1s, color 0.1s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-link:hover { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .sb-link-active {
          background: rgba(201,165,90,0.10);
          color: #c9a55a;
          font-weight: 600;
        }
        .sb-link-active:hover { background: rgba(201,165,90,0.14); color: #c9a55a; }
        .sb-user {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 0.75rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-shrink: 0;
          min-height: 58px;
        }
        .sb-user-skeleton {
          height: 32px;
          width: 100%;
          border-radius: 7px;
          background: rgba(255,255,255,0.04);
          animation: sb-pulse 1.4s ease-in-out infinite;
        }
        @keyframes sb-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .sb-user-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
          flex: 1;
        }
        .sb-avatar {
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(201,165,90,0.22);
          background: #0f1825;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sb-avatar-initial {
          font-size: 0.72rem;
          font-weight: 700;
          color: #c9a55a;
        }
        .sb-user-meta { min-width: 0; flex: 1; }
        .sb-user-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 0.66rem;
          margin: 0.1rem 0 0;
          line-height: 1;
        }
        .sb-signout {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          padding: 0.3rem;
          color: #334155;
          cursor: pointer;
          transition: color 0.12s, border-color 0.12s, background 0.12s;
        }
        .sb-signout:hover {
          color: #ef4444;
          border-color: rgba(239,68,68,0.28);
          background: rgba(239,68,68,0.06);
        }
      `})]})}},98491:(a,b,c)=>{Promise.resolve().then(c.bind(c,97971)),Promise.resolve().then(c.bind(c,27358))}};