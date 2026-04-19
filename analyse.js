<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="R&L Est.">
<title>R&L Estimator</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500&family=Great+Vibes&family=Cormorant+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#1a2332;--bg2:#243044;--bg3:#2e3f5c;
  --accent:#f0a500;--hot:#e05c2a;--cold:#2a7ae0;
  --text:#e8edf5;--dim:#8a9ab5;--border:#334466;
  --inp:#0f1825;--green:#2ecc71;--red:#e74c3c;
  --crimson:#c0182e;--gold:#c8961a;
  --safe:env(safe-area-inset-bottom,0px);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;overflow:hidden;}
#app{display:flex;flex-direction:column;height:100vh;height:100dvh;}
header{background:#fff;border-bottom:3px solid var(--crimson);padding:10px 20px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;gap:6px;}
.brand-logo{display:flex;flex-direction:column;align-items:center;line-height:1;width:100%;text-align:center;}
.brand-rl{font-family:'Great Vibes',cursive;font-weight:400;font-size:48px;color:var(--crimson);letter-spacing:1px;line-height:1.1;}
.brand-sub{font-family:'Cormorant SC','Barlow Condensed',sans-serif;font-weight:600;font-size:9px;color:var(--gold);letter-spacing:5px;text-transform:uppercase;margin-top:2px;}
.hdr-bottom{display:flex;align-items:center;gap:8px;width:100%;}
.proj-input{background:#f5f0ec;border:1px solid #ddd;color:#333;font-family:'Barlow',sans-serif;font-size:13px;padding:7px 12px;border-radius:4px;flex:1;}
.proj-input:focus{outline:none;border-color:var(--crimson);}
.hdr-btn{background:var(--crimson);color:#fff;border:none;border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;padding:6px 10px;cursor:pointer;}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-bottom:1px solid var(--border);flex-shrink:0;}
.sum-card{background:var(--bg2);padding:6px 8px;text-align:center;}
.sum-label{font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;}
.sum-val{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;}
.sum-val.or{color:var(--hot);}.sum-val.bl{color:var(--cold);}.sum-val.gr{color:var(--green);}
.tabs{display:flex;background:var(--inp);border-bottom:2px solid var(--border);flex-shrink:0;overflow-x:auto;-webkit-overflow-scrolling:touch;}
.tabs::-webkit-scrollbar{display:none;}
.tab{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:.8px;padding:11px 14px;cursor:pointer;text-transform:uppercase;color:var(--dim);border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap;flex-shrink:0;}
.tab.a-pdf{color:var(--accent);border-color:var(--accent);}
.tab.a-rates{color:#8b5cf6;border-color:#8b5cf6;}
.tab.a-hot{color:var(--hot);border-color:var(--hot);}
.tab.a-cold{color:var(--cold);border-color:var(--cold);}
.content{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px;}
.hidden{display:none!important;}
.sec-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.badge{font-size:9px;padding:2px 6px;border-radius:2px;font-weight:700;letter-spacing:.5px;}
.badge-hot{background:var(--hot);color:#fff;}.badge-cold{background:var(--cold);color:#fff;}.badge-rates{background:#8b5cf6;color:#fff;}
.row-card{background:var(--bg2);border:1px solid var(--border);border-radius:6px;margin-bottom:8px;overflow:hidden;}
.row-card-header{background:var(--inp);padding:8px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
.row-card-body{padding:8px 10px;display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.row-card-total{padding:6px 10px;background:rgba(46,204,113,.08);border-top:1px solid var(--border);text-align:right;}
.field-group{display:flex;flex-direction:column;gap:2px;}
.field-label{font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;}
.field-val{font-family:'Barlow Condensed',sans-serif;font-size:14px;color:var(--accent);}
input[type=text],input[type=number]{background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;padding:7px 8px;border-radius:4px;width:100%;-webkit-appearance:none;}
input[type=text]:focus,input[type=number]:focus{outline:none;border-color:var(--accent);}
input[type=number]{text-align:right;}
.total-price{color:var(--green);font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;}
.btn-add{background:var(--bg3);color:var(--accent);border:1px dashed var(--accent);font-size:12px;padding:10px;width:100%;margin-top:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:4px;}
.btn-danger{background:var(--red);color:#fff;font-size:11px;padding:5px 9px;border-radius:3px;border:none;cursor:pointer;flex-shrink:0;}
.btn-apply{background:#1a3a1a;color:var(--green);border:1px solid var(--green);font-size:12px;padding:10px;border-radius:4px;width:100%;margin-top:8px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;}
.btn-ghost{background:transparent;color:var(--dim);border:1px solid var(--border);font-size:11px;padding:8px;border-radius:4px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;text-transform:uppercase;width:100%;margin-top:6px;}
.grand-total{background:var(--inp);border:2px solid var(--accent);border-radius:6px;padding:12px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.gt-item{text-align:center;}
.gt-label{font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
.gt-val{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:var(--accent);}
.gt-val.gr{color:var(--green);font-size:24px;}.gt-val.bl{color:var(--cold);}
.rate-card{background:var(--inp);border:1px solid var(--border);border-radius:6px;margin-bottom:10px;overflow:hidden;}
.rate-hdr{background:var(--bg2);padding:8px 12px;border-bottom:1px solid var(--border);font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
.rate-hdr.hot{color:var(--hot);}.rate-hdr.cold{color:var(--cold);}.rate-hdr.paint{color:var(--accent);}
.rate-row{display:flex;align-items:center;padding:7px 12px;border-bottom:1px solid rgba(51,68,102,.4);gap:8px;}
.rate-row:last-child{border-bottom:none;}
.rate-name{flex:1;font-size:11px;color:var(--dim);}
.rate-unit{font-size:10px;color:var(--dim);width:38px;text-align:center;flex-shrink:0;}
.rate-inp{background:var(--bg2);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;padding:5px 8px;border-radius:3px;width:80px;text-align:right;flex-shrink:0;-webkit-appearance:none;}
.rate-inp:focus{outline:none;border-color:#8b5cf6;}
.info-box{background:var(--bg2);border-left:3px solid var(--accent);padding:10px 12px;font-size:11px;color:var(--dim);border-radius:0 4px 4px 0;margin-top:10px;line-height:1.6;}
.info-box strong{color:var(--accent);}
.content-pad{height:calc(20px + var(--safe));}
.drop-zone{border:2px dashed var(--accent);border-radius:8px;background:var(--inp);padding:28px 16px;text-align:center;cursor:pointer;position:relative;}
.drop-zone input[type=file]{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg);}}
.prog-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:var(--accent);}
.step{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dim);padding:5px 8px;border-radius:4px;margin-bottom:3px;}
.step.done{color:var(--green);background:rgba(46,204,113,.08);}
.step.active{color:var(--text);background:rgba(240,165,0,.08);}
.result-banner{padding:12px;border-radius:6px;margin-top:10px;display:none;font-size:13px;gap:10px;align-items:flex-start;}
.result-banner.show{display:flex;}
.result-banner.success{background:#1a3a2a;border:1px solid var(--green);color:var(--green);}
.result-banner.error{background:#3a1a1a;border:1px solid var(--red);color:var(--red);}

/* ── TAKE-OFF TABLE ── */
.takeoff-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:10px;border-radius:6px;border:1px solid var(--border);}
.takeoff-table{width:100%;border-collapse:collapse;min-width:900px;}
.takeoff-table thead tr{background:var(--inp);}
.takeoff-table thead th{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dim);padding:8px 6px;text-align:right;border-bottom:2px solid var(--border);white-space:nowrap;}
.takeoff-table thead th:first-child,.takeoff-table thead th:nth-child(2),.takeoff-table thead th:nth-child(3){text-align:left;}
.takeoff-table tbody tr{border-bottom:1px solid rgba(51,68,102,0.4);transition:background .15s;}
.takeoff-table tbody tr:hover{background:rgba(240,165,0,0.04);}
.takeoff-table tbody tr:nth-child(even){background:rgba(255,255,255,0.02);}
.takeoff-table tbody td{padding:7px 6px;font-size:12px;text-align:right;vertical-align:middle;}
.takeoff-table tbody td:first-child,.takeoff-table tbody td:nth-child(2),.takeoff-table tbody td:nth-child(3){text-align:left;}
.takeoff-table tbody td input{background:transparent;border:none;color:var(--text);font-family:'Barlow',sans-serif;font-size:12px;text-align:right;width:100%;min-width:50px;padding:2px 0;-webkit-appearance:none;}
.takeoff-table tbody td input:focus{outline:none;color:var(--accent);}
.takeoff-table tbody td input.left{text-align:left;}
.takeoff-table tbody td.calc{color:var(--accent);font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;}
.takeoff-table tbody td.price{color:var(--green);font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;}
.takeoff-table tbody td.del-cell{text-align:center;width:28px;}
.del-btn{background:none;border:none;color:#444;cursor:pointer;font-size:13px;padding:2px 4px;border-radius:3px;line-height:1;}
.del-btn:hover{background:var(--red);color:#fff;}
/* section group header */
.grp-hdr td{background:linear-gradient(90deg,rgba(224,92,42,0.15),transparent);font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--hot);padding:5px 6px!important;border-top:1px solid rgba(224,92,42,0.3);}
/* totals row */
.tot-row td{background:var(--inp);font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:var(--accent);border-top:2px solid var(--border);}
.tot-row td.price{color:var(--green);font-size:15px;}
/* cold table */
.takeoff-table.cold thead tr{background:var(--inp);}
.takeoff-table.cold .grp-hdr td{background:linear-gradient(90deg,rgba(42,122,224,0.15),transparent);color:var(--cold);border-top:1px solid rgba(42,122,224,0.3);}
/* add row btn */
.add-row-btn{background:none;border:1px dashed var(--border);color:var(--dim);font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 12px;border-radius:4px;cursor:pointer;width:100%;margin-top:6px;transition:all .2s;}
.add-row-btn:hover{border-color:var(--accent);color:var(--accent);}


.tab.a-prices{color:#10b981;border-color:#10b981;}
.prices-table{width:100%;border-collapse:collapse;font-size:12px;}
.prices-table thead th{background:var(--inp);font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dim);padding:8px 6px;text-align:left;border-bottom:2px solid var(--border);position:sticky;top:0;z-index:1;}
.prices-table thead th:nth-child(n+3){text-align:right;}
.prices-table tbody tr{border-bottom:1px solid rgba(51,68,102,0.3);}
.prices-table tbody tr:hover{background:rgba(16,185,129,0.05);}
.prices-table tbody td{padding:7px 6px;font-size:12px;vertical-align:middle;}
.prices-table tbody td:nth-child(n+3){text-align:right;font-family:'Barlow Condensed',sans-serif;font-size:13px;}
.prices-table tbody td.sec-name{font-weight:600;color:var(--text);}
.prices-table tbody td.sec-cat{font-size:10px;color:var(--dim);}
.prices-table tbody td.sec-rate{color:#10b981;font-weight:700;}
.prices-table tbody td.sec-total{color:var(--green);font-weight:700;font-size:14px;}
.prices-table tbody td.sec-match{color:var(--accent);}
.price-summary{background:var(--inp);border:2px solid #10b981;border-radius:6px;padding:12px;margin-bottom:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;}
.price-summary .ps-label{font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
.price-summary .ps-val{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;}
.no-match-badge{font-size:9px;background:rgba(231,76,60,0.2);color:var(--red);padding:2px 6px;border-radius:2px;margin-left:4px;}
.match-badge{font-size:9px;background:rgba(16,185,129,0.15);color:#10b981;padding:2px 6px;border-radius:2px;margin-left:4px;}
.prices-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:6px;}

.tab.a-revisions{color:#f59e0b;border-color:#f59e0b;}
.rev-drop{border:2px dashed var(--border);border-radius:8px;background:var(--inp);padding:20px 16px;text-align:center;cursor:pointer;position:relative;transition:border-color .2s;}
.rev-drop:hover{border-color:var(--accent);}
.rev-drop input[type=file]{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;}
.rev-drop.loaded{border-color:var(--green);background:rgba(46,204,113,0.06);}
.rev-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.rev-change{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:6px;margin-bottom:6px;font-size:12px;}
.rev-change.added{background:rgba(46,204,113,0.1);border-left:3px solid var(--green);}
.rev-change.removed{background:rgba(231,76,60,0.1);border-left:3px solid var(--red);}
.rev-change.changed{background:rgba(240,165,0,0.1);border-left:3px solid var(--accent);}
.rev-badge{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:10px;letter-spacing:1px;padding:2px 6px;border-radius:3px;flex-shrink:0;margin-top:1px;}
.rev-badge.added{background:var(--green);color:#111;}
.rev-badge.removed{background:var(--red);color:#fff;}
.rev-badge.changed{background:var(--accent);color:#111;}
.rev-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;}
.rev-sum-card{background:var(--inp);border-radius:6px;padding:10px;text-align:center;}
.rev-sum-label{font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}
.rev-sum-val{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;}
.rev-spinner{display:none;width:18px;height:18px;border:2px solid var(--border);border-top-color:#f59e0b;border-radius:50%;animation:spin .7s linear infinite;}

/* Jobs modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
.modal-box{background:var(--bg2);border-radius:12px 12px 0 0;width:100%;max-width:600px;max-height:80vh;display:flex;flex-direction:column;border-top:3px solid var(--accent);}
.modal-hdr{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);flex-shrink:0;}
.modal-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--accent);}
.modal-close{background:none;border:none;color:var(--dim);font-size:20px;cursor:pointer;padding:4px 8px;}
.modal-body{flex:1;overflow-y:auto;padding:12px;}
.job-card{background:var(--inp);border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;}
.job-card:hover{border-color:var(--accent);}
.job-info{flex:1;min-width:0;}
.job-name{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.job-meta{font-size:10px;color:var(--dim);margin-top:2px;}
.job-actions{display:flex;gap:6px;flex-shrink:0;}
.job-load-btn{background:var(--accent);color:#111;border:none;border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;padding:5px 10px;cursor:pointer;}
.job-del-btn{background:none;border:1px solid var(--border);color:var(--dim);border-radius:4px;font-size:11px;padding:5px 8px;cursor:pointer;}
.job-del-btn:hover{border-color:var(--red);color:var(--red);}
.no-jobs{text-align:center;padding:30px;color:var(--dim);font-size:13px;}
.unsaved-dot{display:inline-block;width:6px;height:6px;background:var(--accent);border-radius:50%;margin-left:4px;vertical-align:middle;}

/* Confidence scores */
.conf-high{background:#1a3a1a;color:#2ecc71;border-left:3px solid #2ecc71;}
.conf-med{background:#3a2f00;color:#f0a500;border-left:3px solid #f0a500;}
.conf-low{background:#3a1a1a;color:#e74c3c;border-left:3px solid #e74c3c;}
.conf-badge{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:10px;padding:2px 6px;border-radius:3px;display:inline-block;}
.conf-badge.high{background:rgba(46,204,113,0.2);color:#2ecc71;}
.conf-badge.med{background:rgba(240,165,0,0.2);color:#f0a500;}
.conf-badge.low{background:rgba(231,76,60,0.2);color:#e74c3c;}

/* Approval modal */
.approval-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
.approval-modal{background:var(--bg2);border-radius:12px;width:100%;max-width:640px;max-height:90vh;display:flex;flex-direction:column;border:2px solid var(--accent);}
.approval-hdr{padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;}
.approval-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;letter-spacing:2px;color:var(--accent);}
.approval-body{flex:1;overflow-y:auto;padding:12px;}
.approval-item{background:var(--inp);border-radius:6px;padding:10px 12px;margin-bottom:8px;border-left:4px solid var(--border);}
.approval-item.flagged{border-left-color:var(--red);}
.approval-item.review{border-left-color:var(--accent);}
.approval-item-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.approval-item-name{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;}
.approval-flag{font-size:10px;color:var(--red);margin-top:3px;font-style:italic;}
.approval-fields{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;}
.approval-field label{font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px;}
.approval-field input{background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:'Barlow',sans-serif;font-size:13px;padding:5px 8px;border-radius:4px;width:100%;-webkit-appearance:none;}
.approval-field input:focus{outline:none;border-color:var(--accent);}
.approval-footer{padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:8px;flex-shrink:0;}
.btn-approve-all{background:var(--green);color:#111;border:none;border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;letter-spacing:1px;padding:10px 16px;cursor:pointer;flex:1;}
.btn-approve-cancel{background:transparent;color:var(--dim);border:1px solid var(--border);border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;padding:10px 16px;cursor:pointer;}
.needs-review-bar{background:rgba(231,76,60,0.1);border:1px solid var(--red);border-radius:6px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;font-size:12px;cursor:pointer;}
.needs-review-bar .nr-count{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:var(--red);}

.work-badge{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:9px;padding:2px 5px;border-radius:2px;letter-spacing:.5px;}
.work-badge.new{background:rgba(46,204,113,0.2);color:var(--green);}
.work-badge.existing{background:rgba(138,154,181,0.2);color:var(--dim);}
.work-badge.remove{background:rgba(231,76,60,0.2);color:var(--red);}
</style>
</head>
<body>
<div id="app">
<header>
  <div class="brand-logo">
    <span class="brand-rl">Reynolds &amp; Litchfield</span>
    <span class="brand-sub">Constructional Engineers &nbsp;·&nbsp; Established 1960</span>
  </div>
  <div class="hdr-bottom">
    <input class="proj-input" type="text" id="projName" placeholder="Project / Tender name..." style="flex:1;width:auto;font-size:13px;padding:7px 12px;border-radius:4px;background:#f5f0ec;border:1px solid #ddd;color:#333;font-family:'Barlow',sans-serif;" onchange="markUnsaved()">
    <button onclick="saveEstimate()" title="Save estimate" style="background:#1a3a1a;color:var(--green);border:1px solid var(--green);border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;padding:6px 10px;cursor:pointer;flex-shrink:0;" id="save-btn">💾 Save</button>
    <button onclick="showJobs()" title="Load estimate" style="background:var(--bg2);color:var(--accent);border:1px solid var(--accent);border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;padding:6px 10px;cursor:pointer;flex-shrink:0;" id="jobs-btn">📂 Jobs</button>
    <button class="hdr-btn" onclick="exportCSV()" style="flex-shrink:0;padding:7px 14px;font-size:12px;">⬇ CSV</button>
    <button onclick="generateQuote()" style="background:var(--crimson);color:#fff;border:none;border-radius:4px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;padding:6px 10px;cursor:pointer;flex-shrink:0;">📄 Quote</button>
  </div>
</header>
<div class="summary">
  <div class="sum-card"><div class="sum-label">Hot Rolled T</div><div class="sum-val or" id="s-hr-tns">0.000</div></div>
  <div class="sum-card"><div class="sum-label">Cold Rolled m</div><div class="sum-val bl" id="s-cr-m">0.00</div></div>
  <div class="sum-card"><div class="sum-label">Total</div><div class="sum-val gr" id="s-total">£0</div></div>
</div>
<div class="tabs">
  <div class="tab a-pdf" id="tab-pdf" onclick="switchTab('pdf')">📄 Drawing</div>
  <div class="tab" id="tab-rates" onclick="switchTab('rates')">💷 Rates</div>
  <div class="tab" id="tab-hot" onclick="switchTab('hot')">🔥 Hot Rolled</div>
  <div class="tab" id="tab-cold" onclick="switchTab('cold')">❄ Cold Rolled</div>
  <div class="tab" id="tab-prices" onclick="switchTab('prices')">📋 Section Prices</div>
  <div class="tab" id="tab-revisions" onclick="switchTab('revisions')">🔀 Revisions</div>
  <div style="flex:1"></div>
  <button onclick="resetAll()" style="background:none;border:none;color:#e74c3c;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:11px 14px;cursor:pointer;white-space:nowrap;flex-shrink:0;border-left:1px solid var(--border);">↺ Reset</button>
</div>
<div class="content">

  <div id="panel-pdf">
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dim);flex-shrink:0">Drawing Scale</div>
      <select id="drawingScale" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;padding:6px 10px;border-radius:4px;flex:1;min-width:120px;-webkit-appearance:none;">
        <option value="auto">Auto-detect from drawing</option>
        <option value="1:50">1:50</option>
        <option value="1:100">1:100 (most common)</option>
        <option value="1:200">1:200</option>
        <option value="1:250">1:250</option>
        <option value="1:500">1:500</option>
        <option value="custom">Custom scale...</option>
      </select>
      <input type="text" id="customScale" placeholder="e.g. 1:150" style="display:none;width:100px;font-size:13px;padding:6px 8px;">
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dim);flex-shrink:0">Drawing Type</div>
      <select id="drawingType" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;padding:6px 10px;border-radius:4px;flex:1;-webkit-appearance:none;">
        <option value="ga">General Arrangement (GA)</option>
        <option value="framing">Framing Plan</option>
        <option value="elevation">Elevation / Section</option>
        <option value="schedule">Member Schedule</option>
        <option value="detail">Detail Drawing</option>
      </select>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dim);flex-shrink:0">Work Type</div>
      <select id="workType" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;padding:6px 10px;border-radius:4px;flex:1;-webkit-appearance:none;" onchange="updateWorkTypeHint()">
        <option value="new">New build — extract all steel</option>
        <option value="alteration">Alteration / extension — new steel only</option>
        <option value="demolition">Demolition items only</option>
        <option value="all">Show all — new + existing + removed</option>
      </select>
    </div>
    <div id="work-type-hint" style="background:rgba(240,165,0,0.08);border-left:3px solid var(--accent);padding:8px 12px;font-size:11px;color:var(--dim);border-radius:0 4px 4px 0;margin-bottom:10px;display:none">
      <strong style="color:var(--accent)">Alteration mode:</strong> AI will ignore existing steel and only extract members marked as NEW, ADDITIONAL or TO BE PROVIDED. Members marked EXISTING, EX. or TO REMAIN will be excluded.
    </div>
    <div class="drop-zone">
      <input type="file" id="pdfInput" accept=".pdf,application/pdf" onchange="handleFile(event)">
      <span style="font-size:44px;display:block;margin-bottom:10px">📐</span>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;letter-spacing:2px;color:var(--accent);margin-bottom:5px">TAP TO UPLOAD DRAWING</div>
      <div style="color:var(--dim);font-size:12px;line-height:1.6">Structural PDF — AI extracts all members automatically</div>
    </div>
    <div id="progBox" style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:14px;margin-top:12px;display:none">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div class="spinner" id="spinner"></div>
        <div class="prog-title" id="progTitle">Reading…</div>
      </div>
      <div class="step" id="s1"><span>⏳</span> Reading PDF file</div>
      <div class="step" id="s2"><span>⏳</span> Sending to AI server</div>
      <div class="step" id="s3"><span>⏳</span> Identifying steel members</div>
      <div class="step" id="s4"><span>⏳</span> Extracting quantities &amp; sections</div>
      <div class="step" id="s5"><span>⏳</span> Populating take-off sheets</div>
    </div>
    <div class="result-banner" id="resultBanner">
      <span id="resultIcon" style="font-size:22px;flex-shrink:0"></span>
      <div id="resultText"></div>
    </div>
    <div class="info-box">
      <strong>Reads:</strong> GA drawings, framing plans, elevations, member schedules. Finds UC, UB, RHS, CHS, Z &amp; C purlins, angles. Edit rows after import if needed.
    </div>
    <div class="content-pad"></div>
  </div>

  <div id="panel-rates" class="hidden">
    <div class="sec-title">Rates Library <span class="badge badge-rates">YOUR RATES</span></div>

    <!-- QUICK RATE CALCULATOR -->
    <div id="quick-rate-box" style="background:linear-gradient(135deg,rgba(192,24,46,0.15),rgba(200,150,26,0.08));border:1px solid rgba(192,24,46,0.4);border-radius:8px;padding:14px;margin-bottom:14px;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--crimson,#c0182e);margin-bottom:10px;">⚡ Quick Rate — £ per Tonne</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Supply £/T</div>
          <input type="number" id="q_supply" placeholder="e.g. 800" onchange="calcQuickRate()" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;padding:8px;border-radius:4px;width:100%;text-align:right;-webkit-appearance:none;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Fabricate £/T</div>
          <input type="number" id="q_fab" placeholder="e.g. 300" onchange="calcQuickRate()" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;padding:8px;border-radius:4px;width:100%;text-align:right;-webkit-appearance:none;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Erect £/T</div>
          <input type="number" id="q_erect" placeholder="e.g. 250" onchange="calcQuickRate()" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;padding:8px;border-radius:4px;width:100%;text-align:right;-webkit-appearance:none;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Galvanise £/T</div>
          <input type="number" id="q_galv" placeholder="e.g. 650" onchange="calcQuickRate()" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;padding:8px;border-radius:4px;width:100%;text-align:right;-webkit-appearance:none;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Paint £/T</div>
          <input type="number" id="q_paint" placeholder="e.g. 150" onchange="calcQuickRate()" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;padding:8px;border-radius:4px;width:100%;text-align:right;-webkit-appearance:none;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Connections £/T</div>
          <input type="number" id="q_conn" placeholder="e.g. 100" onchange="calcQuickRate()" style="background:var(--inp);border:1px solid var(--border);color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;padding:8px;border-radius:4px;width:100%;text-align:right;-webkit-appearance:none;">
        </div>
      </div>
      <!-- Rate breakdown row -->
      <div style="background:rgba(0,0,0,0.2);border-radius:4px;padding:8px 10px;margin-bottom:8px;display:flex;flex-wrap:wrap;gap:6px;font-family:'Barlow Condensed',sans-serif;font-size:11px;color:var(--dim);">
        <span>Supply: <strong id="qr-supply-val" style="color:var(--text)">£0</strong></span>
        <span style="color:var(--border)">|</span>
        <span>Fab: <strong id="qr-fab-val" style="color:var(--text)">£0</strong></span>
        <span style="color:var(--border)">|</span>
        <span>Erect: <strong id="qr-erect-val" style="color:var(--text)">£0</strong></span>
        <span style="color:var(--border)">|</span>
        <span>Galv: <strong id="qr-galv-val" style="color:var(--text)">£0</strong></span>
        <span style="color:var(--border)">|</span>
        <span>Paint: <strong id="qr-paint-val" style="color:var(--text)">£0</strong></span>
        <span style="color:var(--border)">|</span>
        <span>Conn: <strong id="qr-conn-val" style="color:var(--text)">£0</strong></span>
      </div>
      <div style="background:var(--inp);border-radius:6px;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;">
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;">Total Tonnes</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:var(--hot)" id="qr-tonnes">0.000</div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;">Rate £/T</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:var(--accent)" id="qr-rate">£0</div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px;">Total £</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:800;color:var(--green)" id="qr-total">£0</div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--dim);margin-top:8px;text-align:center;">Updates automatically from Hot Rolled take-off tonnage</div>
    </div>

    <div class="rate-card">
      <div class="rate-hdr hot">🔥 Hot Rolled Steel</div>
      <div class="rate-row"><span class="rate-name">UC Columns (S275)</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_uc_s275" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">UC Columns (S355)</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_uc_s355" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">UB Beams / Rafters (S275)</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_ub_s275" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">UB Beams / Rafters (S355)</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_ub_s355" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">RHS / SHS</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_rhs" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">CHS</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_chs" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Angles / Plates</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_angles" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">General (default)</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_hr_default" placeholder="0"></div>
    </div>
    <div class="rate-card">
      <div class="rate-hdr hot">⚙ Galvanising &amp; Erection</div>
      <div class="rate-row"><span class="rate-name">Galv — Light sections</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_galv_light" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Galv — Heavy sections</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_galv_heavy" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Galv — General</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_galv_default" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Erection</span><span class="rate-unit">£/T</span><input class="rate-inp" type="number" id="r_erection" placeholder="0"></div>
    </div>
    <div class="rate-card">
      <div class="rate-hdr paint">🖌 Painting &amp; Coatings</div>
      <div class="rate-row"><span class="rate-name">Blast &amp; 1 Coat Primer</span><span class="rate-unit">£/m²</span><input class="rate-inp" type="number" id="r_blast_prime" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Full System (3 coats)</span><span class="rate-unit">£/m²</span><input class="rate-inp" type="number" id="r_paint_3coat" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Intumescent 30 min</span><span class="rate-unit">£/m²</span><input class="rate-inp" type="number" id="r_intumescent_30" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">General Paint</span><span class="rate-unit">£/m²</span><input class="rate-inp" type="number" id="r_paint_default" placeholder="0"></div>
    </div>
    <div class="rate-card">
      <div class="rate-hdr cold">❄ Cold Rolled (Metsec)</div>
      <div class="rate-row"><span class="rate-name">Z Purlins Light (Z140–170)</span><span class="rate-unit">£/m</span><input class="rate-inp" type="number" id="r_zpurlin_light" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Z Purlins Med (Z200–242)</span><span class="rate-unit">£/m</span><input class="rate-inp" type="number" id="r_zpurlin_med" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Z Purlins Heavy (Z262+)</span><span class="rate-unit">£/m</span><input class="rate-inp" type="number" id="r_zpurlin_heavy" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">C Side Rails Light</span><span class="rate-unit">£/m</span><input class="rate-inp" type="number" id="r_crail_light" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">C Side Rails Med</span><span class="rate-unit">£/m</span><input class="rate-inp" type="number" id="r_crail_med" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Eaves Beam / Apex</span><span class="rate-unit">£/m</span><input class="rate-inp" type="number" id="r_eaves" placeholder="0"></div>
      <div class="rate-row"><span class="rate-name">Cold Rolled General</span><span class="rate-unit">£/m</span><input class="rate-inp" type="number" id="r_cr_default" placeholder="0"></div>
    </div>
    <button class="btn-apply" onclick="applyRates()">✔ Apply All Rates to Take-Off</button>
    <button class="btn-ghost" onclick="resetRates()">↺ Reset All Rates</button>
    <div class="content-pad"></div>
  </div>

  <div id="panel-hot" class="hidden">
    <div class="sec-title">Hot Rolled Steel <span class="badge badge-hot">UC · UB · RHS · CHS</span></div>
    <div class="takeoff-wrap">
      <table class="takeoff-table">
        <thead>
          <tr>
            <th style="min-width:60px">Dwg No.</th>
            <th style="min-width:80px">Type</th>
            <th style="min-width:120px">Section</th>
            <th>Length<br>mm</th>
            <th>Qty</th>
            <th>Total<br>m</th>
            <th>Kg/m</th>
            <th>Total<br>Kg</th>
            <th>Rate<br>£/T</th>
            <th>Steel<br>£</th>
            <th>M²/m</th>
            <th>Galv<br>£/T</th>
            <th>Surface<br>m²</th>
            <th>Paint<br>£/m²</th>
            <th>Total<br>£</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="hot-rows"></tbody>
        <tfoot>
          <tr class="tot-row">
            <td colspan="7" style="text-align:left;padding-left:6px;color:var(--dim)">TOTALS</td>
            <td id="tot-hr-kg" style="color:var(--hot)">0</td>
            <td></td>
            <td id="tot-hr-total" class="price">£0</td>
            <td></td>
            <td></td>
            <td id="tot-hr-sa" style="color:var(--accent)">0.00</td>
            <td></td>
            <td class="price" style="font-size:16px" id="tot-hr-grand">£0</td>
            <td></td>
          </tr>
          <tr style="background:var(--bg2)">
            <td colspan="7" style="padding:4px 6px;font-size:10px;color:var(--dim);font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;text-transform:uppercase">Tonnes</td>
            <td colspan="9" style="padding:4px 6px;font-family:'Barlow Condensed',sans-serif;font-size:13px;color:var(--hot)" id="tot-hr-tns">0.000 T</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <button class="add-row-btn" onclick="addRow('hot')">+ Add Member</button>
    <div class="content-pad"></div>
  </div>
  <div id="panel-cold" class="hidden">
    <div class="sec-title">Cold Rolled — Metsec <span class="badge badge-cold">PURLINS · RAILS</span></div>
    <div class="takeoff-wrap">
      <table class="takeoff-table cold">
        <thead>
          <tr>
            <th style="min-width:60px">Dwg No.</th>
            <th style="min-width:80px">Type</th>
            <th style="min-width:100px">Section</th>
            <th>Length<br>mm</th>
            <th>Qty</th>
            <th>Total<br>m</th>
            <th>Kg/m</th>
            <th>Weight<br>Kg</th>
            <th>Rate<br>£/m</th>
            <th>Price<br>£</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="cold-rows"></tbody>
        <tfoot>
          <tr class="tot-row">
            <td colspan="5" style="text-align:left;padding-left:6px;color:var(--dim)">TOTALS</td>
            <td id="tot-cr-m" style="color:var(--cold)">0.00</td>
            <td></td>
            <td id="tot-cr-kg" style="color:var(--cold)">0</td>
            <td></td>
            <td id="tot-cr-price" class="price">£0</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <button class="add-row-btn" onclick="addRow('cold')">+ Add Member</button>
    <div class="content-pad"></div>
  </div>



  <div id="panel-revisions" class="hidden">
    <div class="sec-title" style="color:#f59e0b">Revision Comparison <span class="badge" style="background:#f59e0b;color:#111">REV A vs REV B</span></div>
    <div class="info-box" style="margin-bottom:12px">
      <strong>Upload two drawing sets.</strong> AI will identify new steel, removed steel, size changes, length changes and calculate the cost difference between revisions.
    </div>

    <div class="rev-grid">
      <!-- Rev A -->
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">Previous Issue (Rev A)</div>
        <div class="rev-drop" id="drop-a">
          <input type="file" accept=".pdf" onchange="loadRevFile('a', event)">
          <div style="font-size:28px;margin-bottom:6px">📄</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:var(--dim)">TAP TO UPLOAD REV A</div>
          <div id="drop-a-name" style="font-size:11px;color:var(--dim);margin-top:4px">Original drawing</div>
        </div>
      </div>
      <!-- Rev B -->
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">New Issue (Rev B)</div>
        <div class="rev-drop" id="drop-b">
          <input type="file" accept=".pdf" onchange="loadRevFile('b', event)">
          <div style="font-size:28px;margin-bottom:6px">📄</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:var(--dim)">TAP TO UPLOAD REV B</div>
          <div id="drop-b-name" style="font-size:11px;color:var(--dim);margin-top:4px">Latest drawing</div>
        </div>
      </div>
    </div>

    <!-- Compare button -->
    <button id="compare-btn" onclick="compareRevisions()" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#111;border:none;border-radius:6px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:14px;letter-spacing:2px;text-transform:uppercase;padding:12px;width:100%;cursor:pointer;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:10px;" disabled>
      <div class="rev-spinner" id="rev-spinner"></div>
      <span id="compare-btn-text">Upload both drawings to compare</span>
    </button>

    <!-- Results -->
    <div id="rev-results" style="display:none">
      <div class="rev-summary">
        <div class="rev-sum-card"><div class="rev-sum-label">Added</div><div class="rev-sum-val" id="rv-added" style="color:var(--green)">0</div></div>
        <div class="rev-sum-card"><div class="rev-sum-label">Removed</div><div class="rev-sum-val" id="rv-removed" style="color:var(--red)">0</div></div>
        <div class="rev-sum-card"><div class="rev-sum-label">Changed</div><div class="rev-sum-val" id="rv-changed" style="color:var(--accent)">0</div></div>
        <div class="rev-sum-card"><div class="rev-sum-label">Cost Diff</div><div class="rev-sum-val" id="rv-cost" style="color:var(--green)">£0</div></div>
      </div>
      <div id="rv-changes-list"></div>
      <button onclick="applyRevBToTakeoff()" id="apply-rev-btn" style="background:#1a3a1a;color:var(--green);border:1px solid var(--green);font-size:12px;padding:10px;border-radius:4px;width:100%;margin-top:8px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;display:none">
        ✔ Apply Rev B Members to Take-Off
      </button>
    </div>

    <div class="content-pad"></div>
  </div>

  <div id="panel-prices" class="hidden">
    <div class="sec-title" style="color:#10b981">Section Prices <span class="badge" style="background:#10b981;color:#fff">YOUR R&L RATES</span></div>
    <div class="price-summary">
      <div><div class="ps-label">Sections Matched</div><div class="ps-val" id="sp-matched" style="color:#10b981">0</div></div>
      <div><div class="ps-label">Unmatched</div><div class="ps-val" id="sp-unmatched" style="color:var(--red)">0</div></div>
      <div><div class="ps-label">Total Material £</div><div class="ps-val" id="sp-total" style="color:var(--green)">£0</div></div>
    </div>
    <div class="info-box" style="margin-bottom:10px;">
      <strong>Auto-priced from R&L rate book.</strong> Shows only sections used in your current take-off. Total = (total metres × kg/m ÷ 1000) × £/T rate. Edit lengths/qty in Hot Rolled tab then come back here.
    </div>
    <div class="prices-wrap">
      <table class="prices-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Category</th>
            <th>Kg/m</th>
            <th>£/T Rate</th>
            <th>Total m</th>
            <th>Total Kg</th>
            <th>Material £</th>
          </tr>
        </thead>
        <tbody id="prices-rows">
          <tr><td colspan="7" style="padding:20px;text-align:center;color:var(--dim)">Upload a drawing or add members to Hot Rolled tab first</td></tr>
        </tbody>
      </table>
    </div>
    <div class="content-pad"></div>
  </div>


<!-- Approval modal -->
<div class="approval-modal-bg" id="approval-modal" style="display:none">
  <div class="approval-modal">
    <div class="approval-hdr">
      <span class="approval-title">⚠️ Human Review Required</span>
      <button style="background:none;border:none;color:var(--dim);font-size:20px;cursor:pointer;" onclick="closeApproval()">✕</button>
    </div>
    <div class="approval-body" id="approval-body"></div>
    <div class="approval-footer">
      <button class="btn-approve-all" onclick="approveAll()">✅ Approve All &amp; Import to Take-Off</button>
      <button class="btn-approve-cancel" onclick="closeApproval()">Cancel</button>
    </div>
  </div>
</div>

<!-- Jobs modal -->
<div class="modal-bg" id="jobs-modal" style="display:none" onclick="if(event.target===this)closeJobs()">
  <div class="modal-box">
    <div class="modal-hdr">
      <span class="modal-title">📂 Saved Jobs</span>
      <button class="modal-close" onclick="closeJobs()">✕</button>
    </div>
    <div class="modal-body" id="jobs-list"></div>
  </div>
</div>

</div>
</div>
<script>
let hotRows=[],coldRows=[],nid=1;
function mkH(d={}){return{id:nid++,dwg:d.dwg||'',type:d.type||'',section:d.section||'',length:d.length||'',qty:d.qty||'',kgm:d.kgm||'',m2m:d.m2m||'',rate:'',galvRate:'',paintRate:'',notes:d.notes||'',confidence:d.confidence||100,flag:d.flag||''};}
function mkC(d={}){return{id:nid++,dwg:d.dwg||'',type:d.type||'',section:d.section||'',length:d.length||'',qty:d.qty||'',kgm:d.kgm||'',rate:'',notes:d.notes||'',confidence:d.confidence||100,flag:d.flag||''};}
function addRow(t){if(t==='hot'){hotRows.push(mkH());renderHot();}else{coldRows.push(mkC());renderCold();}}
function delRow(t,id){if(t==='hot'){hotRows=hotRows.filter(r=>r.id!==id);renderHot();}else{coldRows=coldRows.filter(r=>r.id!==id);renderCold();}}
function upd(t,id,f,v){const rows=t==='hot'?hotRows:coldRows;const r=rows.find(x=>x.id===id);if(r){r[f]=v;t==='hot'?renderHot():renderCold();markUnsaved();}}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');}
function calcH(r){
  const len=+r.length||0,qty=+r.qty||0,kgm=+r.kgm||0,m2m=+r.m2m||0;
  const rate=+r.rate||0,gr=+r.galvRate||0,pr=+r.paintRate||0;
  const totalM=(len/1000)*qty,kg=totalM*kgm,tns=kg/1000,sa=totalM*m2m;
  return{totalM,kg,tns,sa,sp:tns*rate,gp:tns*gr,pp:sa*pr,total:tns*rate+tns*gr+sa*pr};
}
function calcC(r){
  const totalM=((+r.length||0)/1000)*(+r.qty||0);
  return{totalM,kg:totalM*(+r.kgm||0),price:totalM*(+r.rate||0)};
}

// ── SORT helpers ──
function sectionWeight(section){
  const m=section.match(/x(\d+(\.\d+)?)(UC|UB|RHS|CHS|SHS)?$/i);
  return m?parseFloat(m[1]):0;
}
function sortHot(){
  hotRows.sort((a,b)=>{
    const wa=+a.kgm||sectionWeight(a.section),wb=+b.kgm||sectionWeight(b.section);
    if(wa!==wb)return wa-wb;
    return (a.section||'').localeCompare(b.section||'');
  });
}
function sortCold(){
  coldRows.sort((a,b)=>(a.section||'').localeCompare(b.section||''));
}

// ── HOT ROLLED TABLE ──
function renderHot(){
  sortHot();
  let sKg=0,sSA=0,sTot=0;
  let rows='';
  hotRows.forEach(r=>{
    const c=calcH(r);sKg+=c.kg;sSA+=c.sa;sTot+=c.total;
    rows+=`<tr data-id="${r.id}">
      <td><input class="left" type="text" value="${esc(r.dwg)}" onchange="upd('hot',${r.id},'dwg',this.value)" placeholder="—"></td>
      <td><input class="left" type="text" value="${esc(r.type)}" onchange="upd('hot',${r.id},'type',this.value)" placeholder="Type"></td>
      <td><input class="left" type="text" value="${esc(r.section)}" onchange="upd('hot',${r.id},'section',this.value)" placeholder="Section"></td>
      <td><input type="number" value="${r.length||''}" onchange="upd('hot',${r.id},'length',this.value)" placeholder="0"></td>
      <td><input type="number" value="${r.qty||''}" onchange="upd('hot',${r.id},'qty',this.value)" placeholder="0"></td>
      <td class="calc">${c.totalM.toFixed(2)}</td>
      <td><input type="number" value="${r.kgm||''}" onchange="upd('hot',${r.id},'kgm',this.value)" placeholder="0.00" step="0.01"></td>
      <td class="calc">${c.kg.toFixed(1)}</td>
      <td><input type="number" value="${r.rate||''}" onchange="upd('hot',${r.id},'rate',this.value)" placeholder="0"></td>
      <td class="price">£${c.sp.toFixed(0)}</td>
      <td><input type="number" value="${r.m2m||''}" onchange="upd('hot',${r.id},'m2m',this.value)" placeholder="0.000" step="0.001"></td>
      <td><input type="number" value="${r.galvRate||''}" onchange="upd('hot',${r.id},'galvRate',this.value)" placeholder="0"></td>
      <td class="calc">${c.sa.toFixed(2)}</td>
      <td><input type="number" value="${r.paintRate||''}" onchange="upd('hot',${r.id},'paintRate',this.value)" placeholder="0"></td>
      <td class="price">£${c.total.toFixed(0)}</td>
      <td class="del-cell"><button class="del-btn" onclick="delRow('hot',${r.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('hot-rows').innerHTML=rows;
  // totals
  const kgEl=document.getElementById('tot-hr-kg');if(kgEl)kgEl.textContent=Math.round(sKg).toLocaleString();
  const tnsEl=document.getElementById('tot-hr-tns');if(tnsEl)tnsEl.textContent=(sKg/1000).toFixed(3)+' T';
  const saEl=document.getElementById('tot-hr-sa');if(saEl)saEl.textContent=sSA.toFixed(2);
  document.getElementById('tot-hr-total').textContent='£'+Math.round(sTot).toLocaleString();
  updateSummary();
}

// ── COLD ROLLED TABLE ──
function renderCold(){
  sortCold();
  let sM=0,sKg=0,sP=0;
  let rows='';
  coldRows.forEach(r=>{
    const c=calcC(r);sM+=c.totalM;sKg+=c.kg;sP+=c.price;
    rows+=`<tr data-id="${r.id}">
      <td><input class="left" type="text" value="${esc(r.dwg)}" onchange="upd('cold',${r.id},'dwg',this.value)" placeholder="—"></td>
      <td><input class="left" type="text" value="${esc(r.type)}" onchange="upd('cold',${r.id},'type',this.value)" placeholder="Type"></td>
      <td><input class="left" type="text" value="${esc(r.section)}" onchange="upd('cold',${r.id},'section',this.value)" placeholder="Section"></td>
      <td><input type="number" value="${r.length||''}" onchange="upd('cold',${r.id},'length',this.value)" placeholder="0"></td>
      <td><input type="number" value="${r.qty||''}" onchange="upd('cold',${r.id},'qty',this.value)" placeholder="0"></td>
      <td class="calc">${c.totalM.toFixed(2)}</td>
      <td><input type="number" value="${r.kgm||''}" onchange="upd('cold',${r.id},'kgm',this.value)" placeholder="0.00" step="0.01"></td>
      <td class="calc">${c.kg.toFixed(1)}</td>
      <td><input type="number" value="${r.rate||''}" onchange="upd('cold',${r.id},'rate',this.value)" placeholder="0"></td>
      <td class="price">£${c.price.toFixed(0)}</td>
      <td class="del-cell"><button class="del-btn" onclick="delRow('cold',${r.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('cold-rows').innerHTML=rows;
  document.getElementById('tot-cr-m').textContent=sM.toFixed(2);
  document.getElementById('tot-cr-kg').textContent=Math.round(sKg).toLocaleString();
  document.getElementById('tot-cr-price').textContent='£'+Math.round(sP).toLocaleString();
  updateSummary();
}

function updateSummary(){
  const hrKg=hotRows.reduce((s,r)=>s+calcH(r).kg,0);
  const hrT=hotRows.reduce((s,r)=>s+calcH(r).total,0);
  const crM=coldRows.reduce((s,r)=>s+calcC(r).totalM,0);
  const crT=coldRows.reduce((s,r)=>s+calcC(r).price,0);
  document.getElementById('s-hr-tns').textContent=(hrKg/1000).toFixed(3);
  document.getElementById('s-cr-m').textContent=crM.toFixed(2);
  document.getElementById('s-total').textContent='£'+Math.round(hrT+crT).toLocaleString();
}
function switchTab(tab){
  ['pdf','rates','hot','cold','prices','revisions'].forEach(t=>{
    const p=document.getElementById('panel-'+t);
    const tb=document.getElementById('tab-'+t);
    if(p)p.classList.toggle('hidden',t!==tab);
    if(tb)tb.className='tab'+(t===tab?' a-'+t:'');
  });
  if(tab==='rates')calcQuickRate();
  if(tab==='prices')renderPrices();
}
function gv(id){return parseFloat(document.getElementById(id)?.value)||0;}
function matchH(row){
  const t=(row.type+' '+row.section).toLowerCase();
  let rate=0;
  if(/\buc\b|column/.test(t))rate=/s355/.test(t)?gv('r_uc_s355'):gv('r_uc_s275');
  else if(/\bub\b|beam|rafter/.test(t))rate=/s355/.test(t)?gv('r_ub_s355'):gv('r_ub_s275');
  else if(/rhs|shs/.test(t))rate=gv('r_rhs');
  else if(/chs/.test(t))rate=gv('r_chs');
  else if(/angle|plate/.test(t))rate=gv('r_angles');
  return{rate:rate||gv('r_hr_default'),galvRate:gv('r_galv_default'),paintRate:gv('r_paint_default')};
}
function matchC(row){
  const t=(row.type+' '+row.section).toLowerCase();
  const s=parseInt((row.section||'').match(/(\d{3})/)?.[1]||'0');
  if(/z|purlin/.test(t)){if(s>=262)return gv('r_zpurlin_heavy')||gv('r_cr_default');if(s>=200)return gv('r_zpurlin_med')||gv('r_cr_default');return gv('r_zpurlin_light')||gv('r_cr_default');}
  if(/\bc\d|rail|side/.test(t))return(s>=200?gv('r_crail_med'):gv('r_crail_light'))||gv('r_cr_default');
  if(/eave|apex/.test(t))return gv('r_eaves')||gv('r_cr_default');
  return gv('r_cr_default');
}
function applyRates(){
  hotRows.forEach(r=>{const m=matchH(r);r.rate=m.rate||'';r.galvRate=m.galvRate||'';r.paintRate=m.paintRate||'';});
  coldRows.forEach(r=>{r.rate=matchC(r)||'';});
  renderHot();renderCold();
  const btn=event.target,orig=btn.textContent;
  btn.textContent='✔ Applied!';btn.style.background='var(--green)';btn.style.color='#111';
  setTimeout(()=>{btn.textContent=orig;btn.style.background='';btn.style.color='';},2000);
}
function resetRates(){document.querySelectorAll('.rate-inp').forEach(i=>i.value='');}
function resetAll(){
  if(!confirm('Reset everything?\n\nThis will clear all members, rates and the project name.\n\nAre you sure?'))return;
  hotRows=[];coldRows=[];nid=1;
  
// ── R&L SECTION PRICE DATABASE ──
// HR: {normKey: [weight, m2m, rate_per_tonne, display_section, category]}
const HR_PRICES = {"1016X305X487":[486.7,3.2025,1200.0,"1016*305*487","Cat C"],"1016X305X437":[437.0,3.1683,1200.0,"1016*305*437","Cat C"],"1016X305X393":[392.7,3.1416,1200.0,"1016*305*393","Cat C"],"1016X305X349":[349.4,3.1306,1200.0,"1016*305*349","Cat C"],"1016X305X314":[314.3,3.1084,1200.0,"1016*305*314","Cat C"],"1016X305X272":[272.3,3.1042,1200.0,"1016*305*272","Cat C"],"1016X305X249":[248.7,3.0839,1200.0,"1016*305*249","Cat C"],"1016X305X222":[222.0,3.0636,1200.0,"1016*305*222","Cat C"],"914X419X388":[388.0,3.4416,1200.0,"914*419*388","Cat C"],"914X419X343":[343.3,3.4193,1200.0,"914*419*343","Cat C"],"914X305X289":[289.1,3.0066,1200.0,"914*305*289","Cat C"],"914X305X253":[253.4,2.9901,1200.0,"914*305*253","Cat C"],"914X305X224":[224.2,2.9594,1200.0,"914*305*224","Cat C"],"914X305X201":[200.9,2.9532,1200.0,"914*305*201","Cat C"],"838X292X226":[226.5,2.8086,1200.0,"838*292*226","Cat C"],"838X292X194":[193.8,2.7907,1200.0,"838*292*194","Cat C"],"838X292X176":[175.9,2.7792,1200.0,"838*292*176","Cat C"],"762X267X197":[196.8,2.5584,1200.0,"762*267*197","Cat C"],"762X267X173":[173.0,2.5258,1200.0,"762*267*173","Cat C"],"762X267X147":[146.9,2.512,1200.0,"762*267*147","Cat C"],"762X267X134":[133.9,2.5039,1200.0,"762*267*134","Cat C"],"686X254X170":[170.2,2.3488,1200.0,"686*254*170","Cat C"],"686X254X152":[152.4,2.347,1200.0,"686*254*152","Cat C"],"686X254X140":[140.1,2.3257,1200.0,"686*254*140","Cat C"],"686X254X125":[125.2,2.3162,1200.0,"686*254*125","Cat C"],"610X305X238":[238.1,2.4524,1200.0,"610*305*238","Cat C"],"610X305X179":[179.0,2.4165,1200.0,"610*305*179","Cat C"],"610X305X149":[149.2,2.3872,1200.0,"610*305*149","Cat C"],"610X229X140":[139.9,2.1125,1080.0,"610*229*140","Cat A/B"],"610X229X125":[125.1,2.0892,1080.0,"610*229*125","Cat A/B"],"610X229X113":[113.0,2.0792,1080.0,"610*229*113","Cat A/B"],"610X229X101":[101.2,2.0746,1080.0,"610*229*101","Cat A/B"],"610X178X100":[100.3,1.8856,1250.0,"610*178*100","Advanced"],"610X178X92":[92.2,1.8809,1250.0,"610*178*92","Advanced"],"610X178X82":[81.8,1.8732,1250.0,"610*178*82","Advanced"],"533X312X272":[273.3,2.3695,1250.0,"533*312*272","Advanced"],"533X312X219":[218.8,2.3412,1250.0,"533*312*219","Advanced"],"533X312X182":[181.5,2.3051,1250.0,"533*312*182","Advanced"],"533X312X150":[150.6,2.2891,1250.0,"533*312*150","Advanced"],"533X210X138":[138.3,1.8947,1250.0,"533*210*138","Advanced"],"533X210X122":[122.0,1.891,1080.0,"533*210*122","Cat A/B"],"533X210X109":[109.0,1.8748,1080.0,"533*210*109","Cat A/B"],"533X210X101":[101.0,1.8685,1080.0,"533*210*101","Cat A/B"],"533X210X92":[92.1,1.8604,1080.0,"533*210*92","Cat A/B"],"533X210X82":[82.2,1.8495,1080.0,"533*210*82","Cat A/B"],"533X165X85":[84.8,1.6875,1250.0,"533*165*85","Advanced"],"533X165X74":[74.7,1.6807,1250.0,"533*165*74","Advanced"],"533X165X66":[65.7,1.6688,1250.0,"533*165*66","Advanced"],"457X191X161":[161.4,1.727,1250.0,"457*191*161","Advanced"],"457X191X133":[133.3,1.7062,1250.0,"457*191*133","Advanced"],"457X191X106":[105.8,1.6716,1250.0,"457*191*106","Advanced"],"457X191X98":[98.3,1.6711,1080.0,"457*191*98","Cat A/B"],"457X191X89":[89.3,1.661,1080.0,"457*191*89","Cat A/B"],"457X191X82":[82.0,1.6482,1080.0,"457*191*82","Cat A/B"],"457X191X74":[74.3,1.642,1080.0,"457*191*74","Cat A/B"],"457X191X67":[67.1,1.6305,1080.0,"457*191*67","Cat A/B"],"457X152X82":[82.1,1.5106,1080.0,"457*152*82","Cat A/B"],"457X152X74":[74.2,1.4988,1080.0,"457*152*74","Cat A/B"],"457X152X67":[67.2,1.4986,1080.0,"457*152*67","Cat A/B"],"457X152X60":[59.8,1.489,1080.0,"457*152*60","Cat A/B"],"457X152X52":[52.3,1.4801,1080.0,"457*152*52","Cat A/B"],"406X178X85":[85.3,1.5183,1250.0,"406*178*85","Advanced"],"406X178X74":[74.2,1.5137,1080.0,"406*178*74","Cat A/B"],"406X178X67":[67.1,1.4963,1080.0,"406*178*67","Cat A/B"],"406X178X60":[60.1,1.4905,1080.0,"406*178*60","Cat A/B"],"406X178X54":[54.1,1.4769,1080.0,"406*178*54","Cat A/B"],"406X140X53":[53.3,1.3485,1250.0,"406*140*53","Advanced"],"406X140X46":[46.0,1.3386,1080.0,"406*140*46","Cat A/B"],"406X140X39":[39.0,1.3299,1080.0,"406*140*39","Cat A/B"],"356X171X67":[67.1,1.3823,1080.0,"356*171*67","Cat A/B"],"356X171X57":[57.0,1.3737,1080.0,"356*171*57","Cat A/B"],"356X171X51":[51.0,1.3617,1080.0,"356*171*51","Cat A/B"],"356X171X45":[45.0,1.359,1080.0,"356*171*45","Cat A/B"],"356X127X39":[39.1,1.1808,1080.0,"356*127*39","Cat A/B"],"356X127X33":[33.1,1.1717,1080.0,"356*127*33","Cat A/B"],"305X165X54":[54.0,1.2582,1080.0,"305*165*54","Cat A/B"],"305X165X46":[46.1,1.2493,1080.0,"305*165*46","Cat A/B"],"305X165X40":[40.3,1.2412,1080.0,"305*165*40","Cat A/B"],"305X127X48":[48.1,1.0919,1080.0,"305*127*48","Cat A/B"],"305X127X42":[41.9,1.081,1080.0,"305*127*42","Cat A/B"],"305X127X37":[37.0,1.0693,1080.0,"305*127*37","Cat A/B"],"305X102X33":[32.8,1.0102,1080.0,"305*102*33","Cat A/B"],"305X102X28":[28.2,1.0011,1080.0,"305*102*28","Cat A/B"],"305X102X25":[24.8,0.992,1080.0,"305*102*25","Cat A/B"],"254X146X43":[43.0,1.0793,1080.0,"254*146*43","Cat A/B"],"254X146X37":[37.0,1.0693,1080.0,"254*146*37","Cat A/B"],"254X146X31":[31.1,1.0574,1080.0,"254*146*31","Cat A/B"],"254X102X28":[28.3,0.9028,1080.0,"254*102*28","Cat A/B"],"254X102X25":[25.2,0.8996,1080.0,"254*102*25","Cat A/B"],"254X102X22":[22.0,0.891,1080.0,"254*102*22","Cat A/B"],"203X133X30":[30.0,0.924,1080.0,"203*133*30","Cat A/B"],"203X133X25":[25.1,0.9162,1080.0,"203*133*25","Cat A/B"],"203X102X23":[23.1,0.79,1080.0,"203*102*23","Cat A/B"],"178X102X19":[19.0,0.7353,1080.0,"178*102*19","Cat A/B"],"152X89X16":[16.0,0.64,1080.0,"152*89*16","Cat A/B"],"127X76X13":[13.0,0.5382,1080.0,"127*76*13","Cat A/B"],"356X406X634":[633.9,2.5229,1200.0,"356*406*634","Cat C"],"356X406X551":[551.0,2.4685,1200.0,"356*406*551","Cat C"],"356X406X467":[467.0,2.4191,1200.0,"356*406*467","Cat C"],"356X406X393":[393.0,2.3816,1200.0,"356*406*393","Cat C"],"356X406X340":[339.9,2.3487,1200.0,"356*406*340","Cat C"],"356X406X287":[287.1,2.3112,1200.0,"356*406*287","Cat C"],"356X406X235":[235.1,2.2805,1200.0,"356*406*235","Cat C"],"356X368X202":[201.9,2.1805,1080.0,"356*368*202","Cat A/B"],"356X368X177":[177.0,2.1771,1080.0,"356*368*177","Cat A/B"],"356X368X153":[152.9,2.1559,1080.0,"356*368*153","Cat A/B"],"356X368X129":[129.0,2.1414,1080.0,"356*368*129","Cat A/B"],"305X305X283":[282.9,1.9407,1080.0,"305*305*283","Cat A/B"],"305X305X240":[240.0,1.9104,1080.0,"305*305*240","Cat A/B"],"305X305X198":[198.1,1.8701,1080.0,"305*305*198","Cat A/B"],"305X305X158":[158.1,1.834,1080.0,"305*305*158","Cat A/B"],"305X305X137":[136.9,1.8208,1080.0,"305*305*137","Cat A/B"],"305X305X118":[117.9,1.8157,1080.0,"305*305*118","Cat A/B"],"305X305X97":[96.9,1.7927,1080.0,"305*305*97","Cat A/B"],"254X254X167":[167.1,1.5808,1080.0,"254*254*167","Cat A/B"],"254X254X132":[132.0,1.5444,1080.0,"254*254*132","Cat A/B"],"254X254X107":[107.1,1.5208,1080.0,"254*254*107","Cat A/B"],"254X254X89":[88.9,1.5024,1080.0,"254*254*89","Cat A/B"],"254X254X73":[73.1,1.4912,1080.0,"254*254*73","Cat A/B"],"203X203X127":[127.5,1.275,1250.0,"203*203*127","Advanced"],"203X203X113":[113.5,1.2712,1250.0,"203*203*113","Advanced"],"203X203X100":[99.6,1.255,1250.0,"203*203*100","Advanced"],"203X203X86":[86.1,1.2398,1080.0,"203*203*86","Cat A/B"],"203X203X71":[71.0,1.2212,1080.0,"203*203*71","Cat A/B"],"203X203X60":[60.0,1.212,1080.0,"203*203*60","Cat A/B"],"203X203X52":[52.0,1.2012,1080.0,"203*203*52","Cat A/B"],"203X203X46":[46.1,1.1894,1080.0,"203*203*46","Cat A/B"],"152X152X51":[51.2,0.937,1250.0,"152*152*51","Advanced"],"152X152X44":[44.0,0.924,1250.0,"152*152*44","Advanced"],"152X152X37":[37.0,0.9139,1080.0,"152*152*37","Cat A/B"],"152X152X30":[30.0,0.9,1080.0,"152*152*30","Cat A/B"],"152X152X23":[23.0,0.8901,1080.0,"152*152*23","Cat A/B"],"PFC430X100":[64.4,1.23,1250.0,"PFC430*100","Advanced"],"PFC380X100":[54.0,1.1286,1250.0,"PFC380*100","Advanced"],"PFC300X100":[45.5,0.9691,1250.0,"PFC300*100","Advanced"],"PFC300X90":[41.4,0.9315,1150.0,"PFC300*90","PFC/RSA"],"PFC260X90":[34.8,0.8526,1150.0,"PFC260*90","PFC/RSA"],"PFC260X75":[27.6,0.7949,1150.0,"PFC260*75","PFC/RSA"],"PFC230X90":[32.2,0.7953,1150.0,"PFC230*90","PFC/RSA"],"PFC230X75":[25.7,0.7376,1150.0,"PFC230*75","PFC/RSA"],"PFC200X90":[29.7,0.7366,1150.0,"PFC200*90","PFC/RSA"],"PFC200X75":[23.4,0.6786,1150.0,"PFC200*75","PFC/RSA"],"PFC180X90":[26.1,0.6969,1150.0,"PFC180*90","PFC/RSA"],"PFC180X75":[20.3,0.6374,1150.0,"PFC180*75","PFC/RSA"],"PFC150X90":[23.9,0.6381,1150.0,"PFC150*90","PFC/RSA"],"PFC150X75":[17.9,0.5782,1150.0,"PFC150*75","PFC/RSA"],"PFC125X65":[14.8,0.4884,1150.0,"PFC125*65","PFC/RSA"],"PFC100X50":[10.2,0.3825,1150.0,"PFC100*50","PFC/RSA"],"RSA200X150X18":[47.1,0.6872,1150.0,"RSA200*150*18","PFC/RSA"],"RSA200X150X15":[39.6,0.6867,1150.0,"RSA200*150*15","PFC/RSA"],"RSA200X150X12":[32.0,0.6864,1150.0,"RSA200*150*12","PFC/RSA"],"RSA200X100X15":[33.7,0.5864,1150.0,"RSA200*100*15","PFC/RSA"],"RSA200X100X12":[27.3,0.5867,1150.0,"RSA200*100*12","PFC/RSA"],"RSA200X100X10":[23.0,0.5883,1150.0,"RSA200*100*10","PFC/RSA"],"RSA150X90X15":[26.6,0.4695,1150.0,"RSA150*90*15","PFC/RSA"],"RSA150X90X12":[21.6,0.4698,1150.0,"RSA150*90*12","PFC/RSA"],"RSA150X90X10":[18.2,0.4703,1150.0,"RSA150*90*10","PFC/RSA"],"RSA150X75X15":[24.8,0.4387,1150.0,"RSA150*75*15","PFC/RSA"],"RSA150X75X12":[20.2,0.44,1150.0,"RSA150*75*12","PFC/RSA"],"RSA150X75X10":[17.0,0.4398,1150.0,"RSA150*75*10","PFC/RSA"],"RSA125X75X12":[17.8,0.3904,1150.0,"RSA125*75*12","PFC/RSA"],"RSA125X75X10":[15.0,0.3902,1150.0,"RSA125*75*10","PFC/RSA"],"RSA125X75X8":[12.2,0.3919,1150.0,"RSA125*75*8","PFC/RSA"],"RSA100X75X12":[15.4,0.3405,1150.0,"RSA100*75*12","PFC/RSA"],"RSA100X75X10":[13.0,0.3405,1150.0,"RSA100*75*10","PFC/RSA"],"RSA100X75X8":[10.6,0.3423,1150.0,"RSA100*75*8","PFC/RSA"],"RSA100X65X10":[12.3,0.3226,1150.0,"RSA100*65*10","PFC/RSA"],"RSA100X65X8":[9.94,0.3213,1150.0,"RSA100*65*8","PFC/RSA"],"RSA100X65X7":[8.77,0.3215,1150.0,"RSA100*65*7","PFC/RSA"],"RSA200X200X24":[71.1,0.7842,1150.0,"RSA200*200*24","PFC/RSA"],"RSA200X200X20":[59.9,0.7841,1150.0,"RSA200*200*20","PFC/RSA"],"RSA200X200X18":[54.2,0.7837,1150.0,"RSA200*200*18","PFC/RSA"],"RSA200X200X16":[48.5,0.7847,1150.0,"RSA200*200*16","PFC/RSA"],"RSA150X150X18":[40.1,0.5867,1150.0,"RSA150*150*18","PFC/RSA"],"RSA150X150X15":[33.8,0.5868,1150.0,"RSA150*150*15","PFC/RSA"],"RSA150X150X12":[27.3,0.5853,1150.0,"RSA150*150*12","PFC/RSA"],"RSA150X150X10":[23.0,0.5867,1150.0,"RSA150*150*10","PFC/RSA"],"RSA120X120X15":[26.6,0.4682,1150.0,"RSA120*120*15","PFC/RSA"],"RSA120X120X12":[21.6,0.4685,1150.0,"RSA120*120*12","PFC/RSA"],"RSA120X120X10":[18.2,0.4688,1150.0,"RSA120*120*10","PFC/RSA"],"RSA120X120X8":[14.7,0.4685,1150.0,"RSA120*120*8","PFC/RSA"],"RSA100X100X15":[21.9,0.3896,1150.0,"RSA100*100*15","PFC/RSA"],"RSA100X100X12":[17.8,0.3891,1150.0,"RSA100*100*12","PFC/RSA"],"RSA100X100X10":[15.0,0.3888,1150.0,"RSA100*100*10","PFC/RSA"],"RSA100X100X8":[12.2,0.3904,1150.0,"RSA100*100*8","PFC/RSA"],"RSA90X90X12":[15.9,0.35,1150.0,"RSA90*90*12","PFC/RSA"],"RSA90X90X10":[13.4,0.3493,1150.0,"RSA90*90*10","PFC/RSA"],"RSA90X90X8":[10.9,0.3504,1150.0,"RSA90*90*8","PFC/RSA"],"RSA90X90X7":[9.61,0.3506,1150.0,"RSA90*90*7","PFC/RSA"],"RSA80X80X10":[11.9,0.32,1150.0,"RSA80*80*10","PFC/RSA"],"RSA80X80X8":[9.63,0.32,1150.0,"RSA80*80*8","PFC/RSA"],"RSA80X80X6":[7.34,0.32,1150.0,"RSA80*80*6","PFC/RSA"],"RSA75X75X8":[8.99,0.3,1150.0,"RSA75*75*8","PFC/RSA"],"RSA75X75X6":[6.85,0.3,1150.0,"RSA75*75*6","PFC/RSA"],"RSA70X70X10":[10.3,0.28,1150.0,"RSA70*70*10","PFC/RSA"],"RSA70X70X8":[8.36,0.28,1150.0,"RSA70*70*8","PFC/RSA"],"RSA70X70X7":[7.38,0.28,1150.0,"RSA70*70*7","PFC/RSA"],"RSA70X70X6":[6.38,0.28,1150.0,"RSA70*70*6","PFC/RSA"],"RSA65X65X7":[6.83,0.26,1150.0,"RSA65*65*7","PFC/RSA"],"RSA60X60X10":[8.69,0.24,1150.0,"RSA60*60*10","PFC/RSA"],"RSA60X60X8":[7.09,0.24,1150.0,"RSA60*60*8","PFC/RSA"],"RSA60X60X6":[5.42,0.24,1150.0,"RSA60*60*6","PFC/RSA"],"RSA60X60X5":[4.57,0.24,1150.0,"RSA60*60*5","PFC/RSA"],"RSA50X50X8":[5.82,0.2,1150.0,"RSA50*50*8","PFC/RSA"],"RSA50X50X6":[4.47,0.2,1150.0,"RSA50*50*6","PFC/RSA"],"RSA50X50X5":[3.77,0.2,1150.0,"RSA50*50*5","PFC/RSA"],"RSA50X50X4":[3.06,0.2,1150.0,"RSA50*50*4","PFC/RSA"],"RSA50X50X3":[2.33,0.2,1150.0,"RSA50*50*3","PFC/RSA"],"RSA45X45X6":[4.0,0.18,1150.0,"RSA45*45*6","PFC/RSA"],"RSA45X45X5":[3.38,0.18,1150.0,"RSA45*45*5","PFC/RSA"],"RSA45X45X4":[2.74,0.18,1150.0,"RSA45*45*4","PFC/RSA"],"RSA45X45X3":[2.09,0.18,1150.0,"RSA45*45*3","PFC/RSA"],"RSA40X40X6":[3.52,0.16,1150.0,"RSA40*40*6","PFC/RSA"],"RSA40X40X5":[2.97,0.16,1150.0,"RSA40*40*5","PFC/RSA"],"RSA40X40X4":[2.42,0.16,1150.0,"RSA40*40*4","PFC/RSA"],"RSA40X40X3":[1.84,0.16,1150.0,"RSA40*40*3","PFC/RSA"],"RSA30X30X5":[2.18,0.12,1150.0,"RSA30*30*5","PFC/RSA"],"RSA30X30X4":[1.78,0.12,1150.0,"RSA30*30*4","PFC/RSA"],"RSA30X30X3":[1.36,0.12,1150.0,"RSA30*30*3","PFC/RSA"],"RSA25X25X5":[1.77,0.1,1150.0,"RSA25*25*5","PFC/RSA"],"RSA25X25X4":[1.45,0.1,1150.0,"RSA25*25*4","PFC/RSA"],"RSA25X25X3":[1.12,0.1,1150.0,"RSA25*25*3","PFC/RSA"],"FLT8X100":[6.28,0.216,1150.0,"FLT8*100","Flats"],"FLT8X110":[6.908,0.236,1150.0,"FLT8*110","Flats"],"FLT8X120":[7.536,0.256,1150.0,"FLT8*120","Flats"],"FLT8X130":[8.164,0.276,1150.0,"FLT8*130","Flats"],"FLT8X140":[8.792,0.296,1150.0,"FLT8*140","Flats"],"FLT8X150":[9.42,0.316,1150.0,"FLT8*150","Flats"],"FLT8X180":[11.304,0.376,1150.0,"FLT8*180","Flats"],"FLT8X200":[12.56,0.416,1150.0,"FLT8*200","Flats"],"FLT8X220":[13.816,0.456,1150.0,"FLT8*220","Flats"],"FLT8X250":[15.7,0.516,1150.0,"FLT8*250","Flats"],"FLT8X275":[17.27,0.566,1150.0,"FLT8*275","Flats"],"FLT10X100":[7.85,0.22,1150.0,"FLT10*100","Flats"],"FLT10X110":[8.635,0.24,1150.0,"FLT10*110","Flats"],"FLT10X120":[9.42,0.26,1150.0,"FLT10*120","Flats"],"FLT10X130":[10.205,0.28,1150.0,"FLT10*130","Flats"],"FLT10X140":[10.99,0.3,1150.0,"FLT10*140","Flats"],"FLT10X150":[11.775,0.32,1150.0,"FLT10*150","Flats"],"FLT10X160":[12.56,0.34,1150.0,"FLT10*160","Flats"],"FLT10X180":[14.13,0.38,1150.0,"FLT10*180","Flats"],"FLT10X200":[15.7,0.42,1150.0,"FLT10*200","Flats"],"FLT10X220":[17.27,0.46,1150.0,"FLT10*220","Flats"],"FLT10X250":[19.625,0.52,1150.0,"FLT10*250","Flats"],"FLT10X275":[21.587,0.57,1150.0,"FLT10*275","Flats"],"FLT10X300":[23.55,0.62,1150.0,"FLT10*300","Flats"],"FLT10X350":[27.475,0.72,1150.0,"FLT10*350","Flats"],"FLT10X400":[31.4,0.82,1150.0,"FLT10*400","Flats"],"FLT12X100":[9.42,0.224,1150.0,"FLT12*100","Flats"],"FLT12X110":[10.362,0.244,1150.0,"FLT12*110","Flats"],"FLT12X120":[11.304,0.264,1150.0,"FLT12*120","Flats"],"FLT12X130":[12.246,0.284,1150.0,"FLT12*130","Flats"],"FLT12X140":[13.188,0.304,1150.0,"FLT12*140","Flats"],"FLT12X150":[14.13,0.324,1150.0,"FLT12*150","Flats"],"FLT12X160":[15.072,0.344,1150.0,"FLT12*160","Flats"],"FLT12X180":[16.956,0.384,1150.0,"FLT12*180","Flats"],"FLT12X200":[18.84,0.424,1150.0,"FLT12*200","Flats"],"FLT12X220":[20.724,0.464,1150.0,"FLT12*220","Flats"],"FLT12X250":[23.55,0.524,1150.0,"FLT12*250","Flats"],"FLT12X275":[25.905,0.574,1150.0,"FLT12*275","Flats"],"FLT12X300":[28.26,0.624,1150.0,"FLT12*300","Flats"],"FLT12X350":[32.97,0.724,1150.0,"FLT12*350","Flats"],"FLT12X375":[35.325,0.774,1150.0,"FLT12*375","Flats"],"FLT12X400":[37.68,0.824,1150.0,"FLT12*400","Flats"],"FLT12X450":[42.39,0.924,1150.0,"FLT12*450","Flats"],"FLT15X100":[11.775,0.23,1150.0,"FLT15*100","Flats"],"FLT15X110":[12.953,0.25,1150.0,"FLT15*110","Flats"],"FLT15X120":[14.13,0.27,1150.0,"FLT15*120","Flats"],"FLT15X130":[15.307,0.29,1150.0,"FLT15*130","Flats"],"FLT15X140":[16.485,0.31,1150.0,"FLT15*140","Flats"],"FLT15X150":[17.662,0.33,1150.0,"FLT15*150","Flats"],"FLT15X160":[18.84,0.35,1150.0,"FLT15*160","Flats"],"FLT15X180":[21.195,0.39,1150.0,"FLT15*180","Flats"],"FLT15X200":[23.55,0.43,1150.0,"FLT15*200","Flats"],"FLT15X220":[25.905,0.47,1150.0,"FLT15*220","Flats"],"FLT15X250":[29.438,0.53,1150.0,"FLT15*250","Flats"],"FLT15X300":[35.325,0.63,1150.0,"FLT15*300","Flats"],"FLT15X350":[41.213,0.73,1150.0,"FLT15*350","Flats"],"FLT15X375":[44.156,0.78,1150.0,"FLT15*375","Flats"],"FLT15X400":[47.1,0.83,1150.0,"FLT15*400","Flats"],"FLT15X450":[52.987,0.93,1150.0,"FLT15*450","Flats"],"FLT20X100":[15.7,0.24,1150.0,"FLT20*100","Flats"],"FLT20X110":[17.27,0.26,1150.0,"FLT20*110","Flats"],"FLT20X120":[18.84,0.28,1150.0,"FLT20*120","Flats"],"FLT20X130":[20.41,0.3,1150.0,"FLT20*130","Flats"],"FLT20X140":[21.98,0.32,1150.0,"FLT20*140","Flats"],"FLT20X150":[23.55,0.34,1150.0,"FLT20*150","Flats"],"FLT20X160":[25.12,0.36,1150.0,"FLT20*160","Flats"],"FLT20X180":[28.26,0.4,1150.0,"FLT20*180","Flats"],"FLT20X200":[31.4,0.44,1150.0,"FLT20*200","Flats"],"FLT20X220":[34.54,0.48,1150.0,"FLT20*220","Flats"],"FLT20X250":[39.25,0.54,1150.0,"FLT20*250","Flats"],"FLT20X300":[47.1,0.64,1150.0,"FLT20*300","Flats"],"FLT20X350":[54.95,0.74,1150.0,"FLT20*350","Flats"],"FLT20X375":[58.875,0.79,1150.0,"FLT20*375","Flats"],"FLT20X400":[62.8,0.84,1150.0,"FLT20*400","Flats"],"FLT20X450":[70.65,0.94,1150.0,"FLT20*450","Flats"],"FLT25X100":[19.625,0.25,1150.0,"FLT25*100","Flats"],"FLT25X110":[21.587,0.27,1150.0,"FLT25*110","Flats"],"FLT25X120":[23.55,0.29,1150.0,"FLT25*120","Flats"],"FLT25X130":[25.512,0.31,1150.0,"FLT25*130","Flats"],"FLT25X140":[27.475,0.33,1150.0,"FLT25*140","Flats"],"FLT25X150":[29.438,0.35,1150.0,"FLT25*150","Flats"],"FLT25X160":[31.4,0.37,1150.0,"FLT25*160","Flats"],"FLT25X180":[35.325,0.41,1150.0,"FLT25*180","Flats"],"FLT25X200":[39.25,0.45,1150.0,"FLT25*200","Flats"],"FLT25X220":[43.175,0.49,1150.0,"FLT25*220","Flats"],"FLT25X250":[49.062,0.55,1150.0,"FLT25*250","Flats"],"FLT25X300":[58.875,0.65,1150.0,"FLT25*300","Flats"],"FLT25X350":[68.688,0.75,1150.0,"FLT25*350","Flats"],"FLT25X375":[73.594,0.8,1150.0,"FLT25*375","Flats"],"FLT25X400":[78.5,0.85,1150.0,"FLT25*400","Flats"],"FLT25X450":[88.312,0.95,1150.0,"FLT25*450","Flats"],"FLT30X100":[23.55,0.26,1150.0,"FLT30*100","Flats"],"FLT30X110":[25.905,0.28,1150.0,"FLT30*110","Flats"],"FLT30X120":[28.26,0.3,1150.0,"FLT30*120","Flats"],"FLT30X130":[30.615,0.32,1150.0,"FLT30*130","Flats"],"FLT30X140":[32.97,0.34,1150.0,"FLT30*140","Flats"],"FLT30X150":[35.325,0.36,1150.0,"FLT30*150","Flats"],"FLT30X180":[42.39,0.42,1150.0,"FLT30*180","Flats"],"FLT30X200":[47.1,0.46,1150.0,"FLT30*200","Flats"],"FLT30X220":[51.81,0.5,1150.0,"FLT30*220","Flats"],"FLT30X250":[58.875,0.56,1150.0,"FLT30*250","Flats"],"FLT30X300":[70.65,0.66,1150.0,"FLT30*300","Flats"],"FLT30X350":[82.425,0.76,1150.0,"FLT30*350","Flats"],"FLT30X375":[88.312,0.81,1150.0,"FLT30*375","Flats"],"FLT30X400":[94.2,0.86,1150.0,"FLT30*400","Flats"],"FLT30X450":[105.96,0.96,1150.0,"FLT30*450","Flats"],"FLT40X100":[31.4,0.28,1150.0,"FLT40*100","Flats"],"FLT40X110":[34.54,0.3,1150.0,"FLT40*110","Flats"],"FLT40X130":[40.82,0.34,1150.0,"FLT40*130","Flats"],"FLT40X150":[47.1,0.38,1150.0,"FLT40*150","Flats"],"FLT40X180":[56.52,0.44,1150.0,"FLT40*180","Flats"],"FLT40X200":[62.8,0.48,1150.0,"FLT40*200","Flats"],"FLT40X220":[69.08,0.52,1150.0,"FLT40*220","Flats"],"FLT40X250":[78.5,0.58,1150.0,"FLT40*250","Flats"],"FLT40X300":[94.2,0.68,1150.0,"FLT40*300","Flats"],"FLT40X350":[109.9,0.78,1150.0,"FLT40*350","Flats"],"FLT40X375":[117.75,0.83,1150.0,"FLT40*375","Flats"],"FLT40X400":[125.6,0.88,1150.0,"FLT40*400","Flats"],"PLT8X100":[6.28,0.216,1150.0,"PLT8*100","Flats"],"PLT8X110":[6.908,0.236,1150.0,"PLT8*110","Flats"],"PLT8X120":[7.536,0.256,1150.0,"PLT8*120","Flats"],"PLT8X130":[8.164,0.276,1150.0,"PLT8*130","Flats"],"PLT8X140":[8.792,0.296,1150.0,"PLT8*140","Flats"],"PLT8X150":[9.42,0.316,1150.0,"PLT8*150","Flats"],"PLT8X180":[11.304,0.376,1150.0,"PLT8*180","Flats"],"PLT8X200":[12.56,0.416,1150.0,"PLT8*200","Flats"],"PLT8X220":[13.816,0.456,1150.0,"PLT8*220","Flats"],"PLT8X250":[15.7,0.516,1150.0,"PLT8*250","Flats"],"PLT8X275":[17.27,0.566,1150.0,"PLT8*275","Flats"],"PLT10X100":[7.85,0.22,1150.0,"PLT10*100","Flats"],"PLT10X110":[8.635,0.24,1150.0,"PLT10*110","Flats"],"PLT10X120":[9.42,0.26,1150.0,"PLT10*120","Flats"],"PLT10X130":[10.205,0.28,1150.0,"PLT10*130","Flats"],"PLT10X140":[10.99,0.3,1150.0,"PLT10*140","Flats"],"PLT10X150":[11.775,0.32,1150.0,"PLT10*150","Flats"],"PLT10X160":[12.56,0.34,1150.0,"PLT10*160","Flats"],"PLT10X180":[14.13,0.38,1150.0,"PLT10*180","Flats"],"PLT10X200":[15.7,0.42,1150.0,"PLT10*200","Flats"],"PLT10X220":[17.27,0.46,1150.0,"PLT10*220","Flats"],"PLT10X250":[19.625,0.52,1150.0,"PLT10*250","Flats"],"PLT10X275":[21.587,0.57,1150.0,"PLT10*275","Flats"],"PLT10X300":[23.55,0.62,1150.0,"PLT10*300","Flats"],"PLT10X350":[27.475,0.72,1150.0,"PLT10*350","Flats"],"PLT10X400":[31.4,0.82,1150.0,"PLT10*400","Flats"],"PLT10X450":[35.325,0.92,1150.0,"PLT10*450","Flats"],"PLT12X100":[9.42,0.224,1150.0,"PLT12*100","Flats"],"PLT12X110":[10.362,0.244,1150.0,"PLT12*110","Flats"],"PLT12X120":[11.304,0.264,1150.0,"PLT12*120","Flats"],"PLT12X130":[12.246,0.284,1150.0,"PLT12*130","Flats"],"PLT12X140":[13.188,0.304,1150.0,"PLT12*140","Flats"],"PLT12X150":[14.13,0.324,1150.0,"PLT12*150","Flats"],"PLT12X160":[15.072,0.344,1150.0,"PLT12*160","Flats"],"PLT12X180":[16.956,0.384,1150.0,"PLT12*180","Flats"],"PLT12X200":[18.84,0.424,1150.0,"PLT12*200","Flats"],"PLT12X220":[20.724,0.464,1150.0,"PLT12*220","Flats"],"PLT12X250":[23.55,0.524,1150.0,"PLT12*250","Flats"],"PLT12X275":[25.905,0.574,1150.0,"PLT12*275","Flats"],"PLT12X300":[28.26,0.624,1150.0,"PLT12*300","Flats"],"PLT12X350":[32.97,0.724,1150.0,"PLT12*350","Flats"],"PLT12X375":[35.325,0.774,1150.0,"PLT12*375","Flats"],"PLT12X400":[37.68,0.824,1150.0,"PLT12*400","Flats"],"PLT12X450":[42.39,0.924,1150.0,"PLT12*450","Flats"],"PLT15X100":[11.775,0.23,1150.0,"PLT15*100","Flats"],"PLT15X110":[12.953,0.25,1150.0,"PLT15*110","Flats"],"PLT15X120":[14.13,0.27,1150.0,"PLT15*120","Flats"],"PLT15X130":[15.307,0.29,1150.0,"PLT15*130","Flats"],"PLT15X140":[16.485,0.31,1150.0,"PLT15*140","Flats"],"PLT15X150":[17.662,0.33,1150.0,"PLT15*150","Flats"],"PLT15X160":[18.84,0.35,1150.0,"PLT15*160","Flats"],"PLT15X180":[21.195,0.39,1150.0,"PLT15*180","Flats"],"PLT15X200":[23.55,0.43,1150.0,"PLT15*200","Flats"],"PLT15X220":[25.905,0.47,1150.0,"PLT15*220","Flats"],"PLT15X250":[29.438,0.53,1150.0,"PLT15*250","Flats"],"PLT15X300":[35.325,0.63,1150.0,"PLT15*300","Flats"],"PLT15X350":[41.213,0.73,1150.0,"PLT15*350","Flats"],"PLT15X375":[44.156,0.78,1150.0,"PLT15*375","Flats"],"PLT15X400":[47.1,0.83,1150.0,"PLT15*400","Flats"],"PLT15X450":[52.987,0.93,1150.0,"PLT15*450","Flats"],"PLT20X100":[15.7,0.24,1150.0,"PLT20*100","Flats"],"PLT20X110":[17.27,0.26,1150.0,"PLT20*110","Flats"],"PLT20X120":[18.84,0.28,1150.0,"PLT20*120","Flats"],"PLT20X130":[20.41,0.3,1150.0,"PLT20*130","Flats"],"PLT20X140":[21.98,0.32,1150.0,"PLT20*140","Flats"],"PLT20X150":[23.55,0.34,1150.0,"PLT20*150","Flats"],"PLT20X160":[25.12,0.36,1150.0,"PLT20*160","Flats"],"PLT20X180":[28.26,0.4,1150.0,"PLT20*180","Flats"],"PLT20X200":[31.4,0.44,1150.0,"PLT20*200","Flats"],"PLT20X220":[34.54,0.48,1150.0,"PLT20*220","Flats"],"PLT20X250":[39.25,0.54,1150.0,"PLT20*250","Flats"],"PLT20X300":[47.1,0.64,1150.0,"PLT20*300","Flats"],"PLT20X350":[54.95,0.74,1150.0,"PLT20*350","Flats"],"PLT20X375":[58.875,0.79,1150.0,"PLT20*375","Flats"],"PLT20X400":[62.8,0.84,1150.0,"PLT20*400","Flats"],"PLT20X450":[70.65,0.94,1150.0,"PLT20*450","Flats"],"PLT25X100":[19.625,0.25,1150.0,"PLT25*100","Flats"],"PLT25X110":[21.587,0.27,1150.0,"PLT25*110","Flats"],"PLT25X120":[23.55,0.29,1150.0,"PLT25*120","Flats"],"PLT25X130":[25.512,0.31,1150.0,"PLT25*130","Flats"],"PLT25X140":[27.475,0.33,1150.0,"PLT25*140","Flats"],"PLT25X150":[29.438,0.35,1150.0,"PLT25*150","Flats"],"PLT25X160":[31.4,0.37,1150.0,"PLT25*160","Flats"],"PLT25X180":[35.325,0.41,1150.0,"PLT25*180","Flats"],"PLT25X200":[39.25,0.45,1150.0,"PLT25*200","Flats"],"PLT25X220":[43.175,0.49,1150.0,"PLT25*220","Flats"],"PLT25X250":[49.062,0.55,1150.0,"PLT25*250","Flats"],"PLT25X300":[58.875,0.65,1150.0,"PLT25*300","Flats"],"PLT25X350":[68.688,0.75,1150.0,"PLT25*350","Flats"],"PLT25X375":[73.594,0.8,1150.0,"PLT25*375","Flats"],"PLT25X400":[78.5,0.85,1150.0,"PLT25*400","Flats"],"PLT25X450":[88.312,0.95,1150.0,"PLT25*450","Flats"],"PLT30X100":[23.55,0.26,1150.0,"PLT30*100","Flats"],"PLT30X110":[25.905,0.28,1150.0,"PLT30*110","Flats"],"PLT30X120":[28.26,0.3,1150.0,"PLT30*120","Flats"],"PLT30X130":[30.615,0.32,1150.0,"PLT30*130","Flats"],"PLT30X140":[32.97,0.34,1150.0,"PLT30*140","Flats"],"PLT30X150":[35.325,0.36,1150.0,"PLT30*150","Flats"],"PLT30X180":[42.39,0.42,1150.0,"PLT30*180","Flats"],"PLT30X200":[47.1,0.46,1150.0,"PLT30*200","Flats"],"PLT30X220":[51.81,0.5,1150.0,"PLT30*220","Flats"],"PLT30X250":[58.875,0.56,1150.0,"PLT30*250","Flats"],"PLT30X300":[70.65,0.66,1150.0,"PLT30*300","Flats"],"PLT30X350":[82.425,0.76,1150.0,"PLT30*350","Flats"],"PLT30X375":[88.312,0.81,1150.0,"PLT30*375","Flats"],"PLT30X400":[94.2,0.86,1150.0,"PLT30*400","Flats"],"PLT30X450":[105.96,0.96,1150.0,"PLT30*450","Flats"],"PLT40X100":[31.4,0.28,1150.0,"PLT40*100","Flats"],"PLT40X110":[34.54,0.3,1150.0,"PLT40*110","Flats"],"PLT40X130":[40.82,0.34,1150.0,"PLT40*130","Flats"],"PLT40X150":[47.1,0.38,1150.0,"PLT40*150","Flats"],"PLT40X180":[56.52,0.44,1150.0,"PLT40*180","Flats"],"PLT40X200":[62.8,0.48,1150.0,"PLT40*200","Flats"],"PLT40X220":[69.08,0.52,1150.0,"PLT40*220","Flats"],"PLT40X250":[78.5,0.58,1150.0,"PLT40*250","Flats"],"PLT40X300":[94.2,0.68,1150.0,"PLT40*300","Flats"],"PLT40X350":[109.9,0.78,1150.0,"PLT40*350","Flats"],"PLT40X375":[117.75,0.83,1150.0,"PLT40*375","Flats"],"PLT40X400":[125.6,0.88,1150.0,"PLT40*400","Flats"],"FLT15X624":[73.476,1.278,1150.0,"FLT15*624","Flats"],"FLT15X619":[72.887,1.268,1150.0,"FLT15*619","Flats"],"FLT15X612":[72.063,1.254,1150.0,"FLT15*612","Flats"],"FLT15X607":[71.474,1.244,1150.0,"FLT15*607","Flats"],"FLT15X603":[71.003,1.236,1150.0,"FLT15*603","Flats"],"FLT15X599":[70.532,1.228,1150.0,"FLT15*599","Flats"],"FLT15X595":[70.061,1.22,1150.0,"FLT15*595","Flats"],"FLT15X575":[67.706,1.18,1150.0,"FLT15*575","Flats"],"FLT15X573":[67.471,1.176,1150.0,"FLT15*573","Flats"],"FLT15X571":[67.235,1.172,1150.0,"FLT15*571","Flats"],"FLT15X569":[67.0,1.168,1150.0,"FLT15*569","Flats"],"FLT15X522":[61.465,1.074,1150.0,"FLT15*522","Flats"],"FLT15X518":[60.995,1.066,1150.0,"FLT15*518","Flats"],"FLT15X515":[60.641,1.06,1150.0,"FLT15*515","Flats"],"FLT15X511":[60.17,1.052,1150.0,"FLT15*511","Flats"],"FLT15X509":[59.935,1.048,1150.0,"FLT15*509","Flats"],"FLT15X507":[59.699,1.044,1150.0,"FLT15*507","Flats"],"FLT15X505":[59.464,1.04,1150.0,"FLT15*505","Flats"],"FLT15X465":[54.754,0.96,1150.0,"FLT15*465","Flats"],"FLT15X461":[54.283,0.952,1150.0,"FLT15*461","Flats"],"FLT15X459":[54.047,0.948,1150.0,"FLT15*459","Flats"],"FLT15X456":[53.694,0.942,1150.0,"FLT15*456","Flats"],"FLT15X455":[53.576,0.94,1150.0,"FLT15*455","Flats"],"FLT15X414":[48.748,0.858,1150.0,"FLT15*414","Flats"],"FLT15X412":[48.513,0.854,1150.0,"FLT15*412","Flats"],"FLT15X410":[48.277,0.85,1150.0,"FLT15*410","Flats"],"FLT15X409":[48.16,0.848,1150.0,"FLT15*409","Flats"],"FLT15X406":[47.806,0.842,1150.0,"FLT15*406","Flats"],"FLT15X404":[47.571,0.838,1150.0,"FLT15*404","Flats"],"FLT15X357":[42.037,0.744,1150.0,"FLT15*357","Flats"],"FLT15X356":[41.919,0.742,1150.0,"FLT15*356","Flats"],"FLT15X354":[41.683,0.738,1150.0,"FLT15*354","Flats"],"FLT15X353":[41.566,0.736,1150.0,"FLT15*353","Flats"],"FLT15X352":[41.448,0.734,1150.0,"FLT15*352","Flats"]};
// CR: {normKey: [weight, rate_per_metre, display_section, unit]}
const CR_PRICES = {"142Z13":[2.84,3.5,"142Z13","/metre"],"142Z14":[3.05,3.76,"142Z14","/metre"],"142Z15":[3.26,3.99,"142Z15","/metre"],"142Z16":[3.47,4.25,"142Z16","/metre"],"142Z18":[3.89,4.85,"142Z18","/metre"],"142Z20":[4.3,5.44,"142Z20","/metre"],"172Z13":[3.25,4.14,"172Z13","/metre"],"172Z14":[3.49,4.45,"172Z14","/metre"],"172Z15":[3.73,4.73,"172Z15","/metre"],"172Z16":[3.98,5.06,"172Z16","/metre"],"172Z18":[4.45,5.67,"172Z18","/metre"],"172Z20":[4.93,6.26,"172Z20","/metre"],"172Z23":[5.63,7.2,"172Z23","/metre"],"172Z25":[6.09,7.76,"172Z25","/metre"],"202Z13":[3.56,4.54,"202Z13","/metre"],"202Z14":[3.82,4.87,"202Z14","/metre"],"202Z15":[4.09,5.22,"202Z15","/metre"],"202Z16":[4.35,5.52,"202Z16","/metre"],"202Z18":[4.88,6.23,"202Z18","/metre"],"202Z20":[5.4,6.84,"202Z20","/metre"],"202Z23":[6.17,7.86,"202Z23","/metre"],"202Z27":[7.19,9.17,"202Z27","/metre"],"232Z14":[4.15,5.56,"232Z14","/metre"],"232Z15":[4.44,5.96,"232Z15","/metre"],"232Z16":[4.73,6.32,"232Z16","/metre"],"232Z18":[5.3,7.07,"232Z18","/metre"],"232Z20":[5.87,7.84,"232Z20","/metre"],"232Z23":[6.71,9.06,"232Z23","/metre"],"232Z25":[7.27,9.74,"232Z25","/metre"],"262Z15":[4.79,6.46,"262Z15","/metre"],"262Z16":[5.11,6.89,"262Z16","/metre"],"262Z18":[5.73,7.76,"262Z18","/metre"],"262Z20":[6.34,8.62,"262Z20","/metre"],"262Z23":[7.26,9.86,"262Z23","/metre"],"262Z25":[7.86,10.59,"262Z25","/metre"],"262Z29":[9.06,12.23,"262Z29","/metre"],"302Z18":[7.1,8.8,"302Z18","/metre"],"302Z20":[7.86,9.74,"302Z20","/metre"],"302Z23":[9.01,11.21,"302Z23","/metre"],"302Z25":[9.76,12.15,"302Z25","/metre"],"302Z29":[11.27,14.03,"302Z29","/metre"],"342Z20":[8.49,10.9,"342Z20","/metre"],"342Z23":[9.73,12.53,"342Z23","/metre"],"342Z25":[10.55,13.62,"342Z25","/metre"],"342Z27":[11.37,14.66,"342Z27","/metre"],"342Z30":[12.58,16.2,"342Z30","/metre"],"402Z30":[14.37,18.51,"402Z30","/metre"],"142C13":[2.84,3.5,"142C13","/metre"],"142C14":[3.05,3.76,"142C14","/metre"],"142C15":[3.26,3.99,"142C15","/metre"],"142C16":[3.47,4.25,"142C16","/metre"],"142C18":[3.89,4.85,"142C18","/metre"],"142C20":[4.3,5.44,"142C20","/metre"],"172C13":[3.25,4.14,"172C13","/metre"],"172C14":[3.49,4.45,"172C14","/metre"],"172C15":[3.73,4.73,"172C15","/metre"],"172C16":[3.98,5.06,"172C16","/metre"],"172C18":[4.45,5.67,"172C18","/metre"],"172C20":[4.93,6.26,"172C20","/metre"],"172C23":[5.63,7.2,"172C23","/metre"],"172C25":[6.09,7.76,"172C25","/metre"],"202C13":[3.56,4.54,"202C13","/metre"],"202C14":[3.82,4.87,"202C14","/metre"],"202C15":[4.09,5.22,"202C15","/metre"],"202C16":[4.35,5.52,"202C16","/metre"],"202C18":[4.88,6.23,"202C18","/metre"],"202C20":[5.4,6.84,"202C20","/metre"],"202C23":[6.17,7.86,"202C23","/metre"],"202C27":[7.19,9.17,"202C27","/metre"],"232C14":[4.15,5.56,"232C14","/metre"],"232C15":[4.44,5.96,"232C15","/metre"],"232C16":[4.73,632.0,"232C16","/metre"],"23CZ18":[5.3,7.07,"23CZ18","/metre"],"232C20":[5.87,7.84,"232C20","/metre"],"232C23":[6.71,9.06,"232C23","/metre"],"232C25":[7.27,9.74,"232C25","/metre"],"262C15":[4.79,6.46,"262C15","/metre"],"262C16":[5.11,6.89,"262C16","/metre"],"262C18":[5.73,7.76,"262C18","/metre"],"262C20":[6.34,8.62,"262C20","/metre"],"262C23":[7.26,9.86,"262C23","/metre"],"262C25":[7.86,10.59,"262C25","/metre"],"262C29":[9.06,12.23,"262C29","/metre"],"302C18":[7.1,8.8,"302C18","/metre"],"302C20":[7.86,9.74,"302C20","/metre"],"302C23":[9.01,11.21,"302C23","/metre"],"302C25":[9.76,12.15,"302C25","/metre"],"302C29":[11.27,14.03,"302C29","/metre"],"342C20":[8.49,10.9,"342C20","/metre"],"342C23":[9.73,12.53,"342C23","/metre"],"342C25":[10.55,13.62,"342C25","/metre"],"342C27":[11.37,14.66,"342C27","/metre"],"342C30":[12.58,16.2,"342C30","/metre"],"402C30":[14.37,18.51,"402C30","/metre"],"142M13":[2.85,3.5,"142M13","/metre"],"142M14":[3.06,3.76,"142M14","/metre"],"142M15":[3.28,3.99,"142M15","/metre"],"142M16":[3.49,4.25,"142M16","/metre"],"142M18":[3.9,4.85,"142M18","/metre"],"142M20":[4.32,5.44,"142M20","/metre"],"150M15":[3.28,4.36,"150M15","/metre"],"150M20":[4.32,5.76,"150M20","/metre"],"M165M15":[3.73,4.95,"M165M15","/metre"],"165M20":[4.93,6.58,"165M20","/metre"],"172M13":[3.26,4.14,"172M13","/metre"],"172M14":[3.5,4.45,"172M14","/metre"],"172M15":[3.75,4.73,"172M15","/metre"],"172M16":[3.99,5.06,"172M16","/metre"],"172M18":[4.47,5.67,"172M18","/metre"],"172M20":[4.94,6.26,"172M20","/metre"],"172M23":[5.65,7.2,"172M23","/metre"],"172M25":[6.11,7.76,"172M25","/metre"],"202M13":[3.57,4.54,"202M13","/metre"],"202M14":[3.83,4.87,"202M14","/metre"],"202M15":[4.1,5.22,"202M15","/metre"],"202M16":[4.36,5.52,"202M16","/metre"],"202M18":[4.89,6.23,"202M18","/metre"],"202M20":[5.41,6.84,"202M20","/metre"],"202M23":[6.19,7.86,"202M23","/metre"],"202M27":[7.21,9.17,"202M27","/metre"],"232M14":[4.16,5.56,"232M14","/metre"],"232M15":[4.45,5.96,"232M15","/metre"],"232M16":[4.74,6.32,"232M16","/metre"],"232M18":[5.32,7.07,"232M18","/metre"],"232M20":[5.89,7.84,"232M20","/metre"],"232M23":[6.73,9.06,"232M23","/metre"],"232M25":[7.29,9.74,"232M25","/metre"],"262M15":[4.81,6.46,"262M15","/metre"],"262M16":[5.12,6.89,"262M16","/metre"],"262M18":[5.74,7.76,"262M18","/metre"],"262M20":[6.36,8.62,"262M20","/metre"],"262M23":[7.27,9.86,"262M23","/metre"],"262M25":[7.88,10.59,"262M25","/metre"],"262M29":[9.08,12.23,"262M29","/metre"],"302M18":[7.1,8.8,"302M18","/metre"],"302M20":[7.86,9.74,"302M20","/metre"],"302M23":[9.01,11.21,"302M23","/metre"],"302M25":[9.76,12.15,"302M25","/metre"],"302M29":[11.27,14.03,"302M29","/metre"],"342M20":[8.49,10.9,"342M20","/metre"],"342M23":[9.73,12.53,"342M23","/metre"],"342M25":[10.55,13.62,"342M25","/metre"],"342M27":[11.37,14.66,"342M27","/metre"],"342M30":[12.58,16.2,"342M30","/metre"],"M440":[0.5,0.69,"M440","each"],"M490":[0.5,0.75,"M490","each"],"M540":[0.5,0.77,"M540","each"],"M620":[0.5,0.9,"M620","each"],"M660":[0.5,0.93,"M660","each"],"M750":[0.5,1.23,"M750","each"],"M840":[0.5,1.34,"M840","each"],"M940":[0.5,1.66,"M940","each"],"M1190":[0.5,1.9,"M1190","each"],"170E20":[5.89,10.69,"170E20","/metre"],"170E23":[6.73,11.73,"170E23","/metre"],"200E20":[6.36,11.14,"200E20","/metre"],"230E20":[6.83,11.77,"230E20","/metre"],"230E25":[8.47,14.62,"230E25","/metre"],"270E25":[9.76,15.79,"270E25","/metre"],"270E29":[11.27,18.15,"270E29","/metre"],"330E30":[12.58,21.11,"330E30","/metre"],"BOC142":[0.61,2.68,"BOC142","each"],"BOC172":[0.75,2.85,"BOC172","each"],"BOC202":[0.9,3.11,"BOC202","each"],"BOC232":[1.04,3.36,"BOC232","each"],"BOC262":[1.18,3.62,"BOC262","each"],"BOC302":[3.7,9.11,"BOC302","each"],"BOC342":[4.1,9.86,"BOC342","each"],"TC142":[0.44,1.32,"TC142","each"],"TC172":[0.6,1.79,"TC172","each"],"TC202":[0.74,2.21,"TC202","each"],"TC232":[0.9,2.57,"TC232","each"],"TC262":[1.07,3.16,"TC262","each"],"TC302":[1.2,3.59,"TC302","each"],"TC342":[1.48,4.42,"TC342","each"],"SL142C13":[2.64,3.34,"SL142C13","each"],"SL142C14":[2.64,3.34,"SL142C14","each"],"SL142C15":[2.64,3.34,"SL142C15","each"],"SL142C16":[2.64,3.34,"SL142C16","each"],"SL142C18":[2.64,3.34,"SL142C18","each"],"SL142C20":[2.64,3.34,"SL142C20","each"],"SL172C13":[4.35,5.61,"SL172C13","each"],"SL172C14":[4.35,5.61,"SL172C14","each"],"SL172C15":[4.35,5.61,"SL172C15","each"],"SL172C16":[4.35,5.61,"SL172C16","each"],"SL172C18":[4.35,5.61,"SL172C18","each"],"SL172C20":[4.35,5.61,"SL172C20","each"],"SL172C23":[4.35,5.61,"SL172C23","each"],"SL172C25":[4.35,5.61,"SL172C25","each"],"SL202C13":[6.0,7.72,"SL202C13","each"],"SL202C14":[6.0,7.72,"SL202C14","each"],"SL202C15":[6.0,7.72,"SL202C15","each"],"SL202C16":[6.0,7.72,"SL202C16","each"],"SL202C18":[6.0,7.72,"SL202C18","each"],"SL202C20":[6.0,7.72,"SL202C20","each"],"SL202C23":[6.0,7.72,"SL202C23","each"],"SL202C27":[6.0,7.72,"SL202C27","each"],"SL232C14":[6.94,7.48,"SL232C14","each"],"SL232C15":[6.94,7.48,"SL232C15","each"],"SL232C16":[6.94,7.48,"SL232C16","each"],"SL232C18":[6.94,7.48,"SL232C18","each"],"SL232C20":[6.94,7.48,"SL232C20","each"],"SL232C23":[6.94,7.48,"SL232C23","each"],"SL232C25":[6.94,7.48,"SL232C25","each"],"SL262C15":[9.55,10.52,"SL262C15","each"],"SL262C16":[9.55,10.52,"SL262C16","each"],"SL262C18":[9.55,10.52,"SL262C18","each"],"SL262C20":[9.55,10.52,"SL262C20","each"],"SL262C23":[9.55,10.52,"SL262C23","each"],"SL262C25":[9.55,10.52,"SL262C25","each"],"SL262C29":[9.55,10.52,"SL262C29","each"],"SL302C18":[15.26,19.09,"SL302C18","each"],"SL302C20":[15.26,19.09,"SL302C20","each"],"SL302C23":[15.26,19.09,"SL302C23","each"],"SL302C25":[15.26,19.09,"SL302C25","each"],"SL302C29":[15.26,19.09,"SL302C29","each"],"SL342C20":[20.81,24.38,"SL342C20","each"],"SL342C23":[20.81,24.38,"SL342C23","each"],"SL342C25":[20.81,24.38,"SL342C25","each"],"SL342C27":[20.81,24.38,"SL342C27","each"],"SL342C30":[20.81,24.38,"SL342C30","each"],"SL142Z13":[1.74,2.14,"SL142Z13","each"],"SL142Z14":[1.87,2.3,"SL142Z14","each"],"SL142Z15":[2.0,2.47,"SL142Z15","each"],"SL142Z16":[2.13,2.61,"SL142Z16","each"],"SL142Z18":[2.39,2.94,"SL142Z18","each"],"SL142Z20":[2.64,3.34,"SL142Z20","each"],"SL172Z13":[2.32,2.95,"SL172Z13","each"],"SL172Z14":[2.49,3.18,"SL172Z14","each"],"SL172Z15":[2.66,3.38,"SL172Z15","each"],"SL172Z16":[2.84,3.6,"SL172Z16","each"],"SL172Z18":[3.18,4.05,"SL172Z18","each"],"SL172Z20":[3.52,4.49,"SL172Z20","each"],"SL172Z23":[4.02,5.12,"SL172Z23","each"],"SL172Z25":[4.35,5.52,"SL172Z25","each"],"SL202Z13":[2.97,3.8,"SL202Z13","each"],"SL202Z14":[3.19,4.05,"SL202Z14","each"],"SL202Z15":[3.41,4.34,"SL202Z15","each"],"SL202Z16":[3.63,4.58,"SL202Z16","each"],"SL202Z18":[4.07,5.18,"SL202Z18","each"],"SL202Z20":[4.5,5.72,"SL202Z20","each"],"SL202Z23":[5.15,6.55,"SL202Z23","each"],"SL202Z27":[6.0,7.61,"SL202Z27","each"],"SL232Z14":[3.96,5.31,"SL232Z14","each"],"SL232Z15":[4.24,5.65,"SL232Z15","each"],"SL232Z16":[4.51,6.02,"SL232Z16","each"],"SL232Z18":[5.06,6.78,"SL232Z18","each"],"SL232Z20":[5.6,7.48,"SL232Z20","each"],"SL232Z23":[6.4,8.65,"SL232Z23","each"],"SL232Z25":[6.94,9.29,"SL232Z25","each"],"SL262Z15":[5.05,6.81,"SL262Z15","each"],"SL262Z16":[5.39,7.25,"SL262Z16","each"],"SL262Z18":[6.04,8.17,"SL262Z18","each"],"SL262Z20":[6.68,9.07,"SL262Z20","each"],"SL262Z23":[7.65,10.36,"SL262Z23","each"],"SL262Z25":[8.28,11.22,"SL262Z25","each"],"SL262Z29":[9.55,12.78,"SL262Z29","each"],"SL302Z18":[9.61,11.91,"SL302Z18","each"],"SL302Z20":[10.64,13.2,"SL302Z20","each"],"SL302Z23":[12.2,15.18,"SL302Z23","each"],"SL302Z25":[13.22,16.45,"SL302Z25","each"],"SL302Z29":[15.26,18.98,"SL302Z29","each"],"SL342Z20":[14.04,18.02,"SL342Z20","each"],"SL342Z23":[16.09,20.72,"SL342Z23","each"],"SL342Z25":[17.45,22.51,"SL342Z25","each"],"SL342Z27":[18.81,24.22,"SL342Z27","each"],"SL342Z30":[20.81,26.81,"SL342Z30","each"],"SAG-1000":[0.5,1.03,"Sag-1000","each"],"SAG-1300":[0.5,1.32,"Sag-1300","each"],"SAG-1500":[0.5,1.53,"Sag-1500","each"],"SAG-1700":[0.5,1.74,"Sag-1700","each"],"SAG-1900":[0.5,1.96,"Sag-1900","each"],"SAG-2100":[0.5,2.15,"Sag-2100","each"],"SAG-2300":[0.5,2.35,"Sag-2300","each"],"SAG-2500":[0.5,2.56,"Sag-2500","each"],"SRS-1000":[0.5,3.87,"SRS-1000","each"],"SRS-1300":[0.5,3.98,"SRS-1300","each"],"SRS-1500":[0.5,4.22,"SRS-1500","each"],"SRS-1700":[0.5,4.68,"SRS-1700","each"],"SRS-1900":[0.5,5.63,"SRS-1900","each"],"SRS-2100":[0.5,5.98,"SRS-2100","each"],"SRS-2300":[0.5,6.32,"SRS-2300","each"],"SRS-2500":[0.5,6.63,"SRS-2500","each"],"EBB-1000":[0.5,3.87,"EBB-1000","each"],"EBB-1300":[0.5,3.98,"EBB-1300","each"],"EBB-1500":[0.5,4.22,"EBB-1500","each"],"EBB-1700":[0.5,4.68,"EBB-1700","each"],"EBB-1900":[0.5,5.63,"EBB-1900","each"],"EBB-2100":[0.5,5.98,"EBB-2100","each"],"EBB-2300":[0.5,6.32,"EBB-2300","each"],"EBB-2500":[0.5,6.63,"EBB-2500","each"],"DTW-2000":[0.5,7.54,"DTW-2000","each"],"DTW-2500":[0.5,8.44,"DTW-2500","each"],"DTW-3000":[0.5,9.34,"DTW-3000","each"],"DTW-3500":[0.5,10.36,"DTW-3500","each"],"DTW-4000":[0.5,11.53,"DTW-4000","each"],"DTW-4500":[0.5,12.57,"DTW-4500","each"],"DTW-5000":[0.5,13.17,"DTW-5000","each"],"CL45X45X2":[1.37,2.65,"CL45x45x2","/metre"],"CL100X100X2":[3.2,4.66,"CL100x100x2","/metre"],"HCS-1000":[2.84,7.01,"HCS-1000","each"],"HCS-1300":[2.84,7.74,"HCS-1300","each"],"HCS-1500":[2.84,8.45,"HCS-1500","each"],"HCS-1700":[2.84,9.23,"HCS-1700","each"],"HCS-1900":[2.84,10.04,"HCS-1900","each"],"HCS-2100":[2.84,10.75,"HCS-2100","each"],"HCS-2300":[2.84,11.53,"HCS-2300","each"],"HCS-2500":[2.84,12.3,"HCS-2500","each"],"HCS-2700":[2.84,14.26,"HCS-2700","each"],"HCS-2900":[2.84,15.09,"HCS-2900","each"],"HCS-3100":[2.84,15.93,"HCS-3100","each"],"HCS-3300":[2.84,16.77,"HCS-3300","each"],"HCS-3500":[2.84,17.6,"HCS-3500","each"],"PJR-1000":[5.32,10.57,"PJR-1000","each"],"PJR-1300":[5.32,12.56,"PJR-1300","each"],"PJR-1500":[5.32,13.88,"PJR-1500","each"],"PJR-1700":[5.32,15.21,"PJR-1700","each"],"PJR-1900":[5.32,16.54,"PJR-1900","each"],"PJR-2100":[5.32,17.56,"PJR-2100","each"],"PJR-2300":[5.32,19.15,"PJR-2300","each"],"PJR-2500":[5.32,20.51,"PJR-2500","each"],"PJR-2700":[5.32,27.36,"PJR-2700","each"],"PJR-2900":[5.32,29.12,"PJR-2900","each"],"PJR-3100":[5.32,30.88,"PJR-3100","each"],"PJR-3300":[5.32,32.65,"PJR-3300","each"],"PJR-3500":[5.32,33.86,"PJR-3500","each"]};

function normSection(s){
  return String(s||'').toUpperCase().replace(/[x\*]/g,'X').replace(/\s+/g,'').replace(/UB|UC|RHS|SHS|CHS|PFC|RSA|FLT|PLT/g,m=>m);
}

function lookupHR(section){
  if(!section)return null;
  const n=normSection(section);
  if(HR_PRICES[n])return HR_PRICES[n];
  // Try fuzzy: strip suffix letters
  const keys=Object.keys(HR_PRICES);
  for(const k of keys){
    if(k.startsWith(n)||n.startsWith(k))return HR_PRICES[k];
  }
  return null;
}

function renderPrices(){
  let matched=0,unmatched=0,totalMat=0;
  const rows=[];
  
  hotRows.forEach(r=>{
    if(!r.section&&!r.type)return;
    const c=calcH(r);
    const p=lookupHR(r.section);
    if(p){
      const [kgm,m2m,rate,dispSec,cat]=p;
      const useKgm=c.kg>0?c.kg/c.totalM:(kgm||+r.kgm||0);
      const totalKg=c.totalM*(useKgm||kgm);
      const matCost=(totalKg/1000)*rate;
      totalMat+=matCost;
      matched++;
      rows.push(`<tr>
        <td class="sec-name">${esc(r.section||dispSec)}<span class="match-badge">✓</span></td>
        <td class="sec-cat">${cat}</td>
        <td class="sec-rate">${(kgm||+r.kgm||0).toFixed(1)}</td>
        <td class="sec-rate">£${rate.toLocaleString()}/T</td>
        <td>${c.totalM.toFixed(2)}m</td>
        <td>${totalKg.toFixed(1)}kg</td>
        <td class="sec-total">£${Math.round(matCost).toLocaleString()}</td>
      </tr>`);
    }else{
      unmatched++;
      rows.push(`<tr>
        <td class="sec-name">${esc(r.section||r.type)}<span class="no-match-badge">not found</span></td>
        <td class="sec-cat" style="color:var(--dim)">—</td>
        <td style="color:var(--dim)">${(+r.kgm||0).toFixed(1)}</td>
        <td style="color:var(--dim)">—</td>
        <td>${c.totalM.toFixed(2)}m</td>
        <td style="color:var(--dim)">${c.kg.toFixed(1)}kg</td>
        <td style="color:var(--dim)">—</td>
      </tr>`);
    }
  });

  document.getElementById('prices-rows').innerHTML=rows.length?rows.join(''):'<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--dim)">No members in Hot Rolled take-off yet</td></tr>';
  document.getElementById('sp-matched').textContent=matched;
  document.getElementById('sp-unmatched').textContent=unmatched;
  document.getElementById('sp-total').textContent='£'+Math.round(totalMat).toLocaleString();
}


// ── REVISION COMPARISON ──
let revFiles = {a: null, b: null};

function loadRevFile(rev, e){
  const f = e.target.files[0];
  if(!f) return;
  revFiles[rev] = f;
  const drop = document.getElementById('drop-'+rev);
  const name = document.getElementById('drop-'+rev+'-name');
  drop.classList.add('loaded');
  name.textContent = f.name;
  name.style.color = 'var(--green)';
  // Enable compare button if both loaded
  const btn = document.getElementById('compare-btn');
  if(revFiles.a && revFiles.b){
    btn.disabled = false;
    btn.style.opacity = '1';
    document.getElementById('compare-btn-text').textContent = '🔀 Compare Revisions';
  }
}

async function compareRevisions(){
  if(!revFiles.a || !revFiles.b) return;
  const btn = document.getElementById('compare-btn');
  const spinner = document.getElementById('rev-spinner');
  btn.disabled = true;
  spinner.style.display = 'block';
  document.getElementById('compare-btn-text').textContent = 'Analysing drawings...';
  document.getElementById('rev-results').style.display = 'none';

  try{
    const [b64a, b64b] = await Promise.all([toB64(revFiles.a), toB64(revFiles.b)]);

    const resp = await fetch('/api/compare', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({revA: b64a, revB: b64b})
    });

    const rawText = await resp.text();
    if(!rawText) throw new Error('Empty response');
    let data;
    try{ data = JSON.parse(rawText); } catch(e){ throw new Error('Server error: '+rawText.slice(0,200)); }
    if(!resp.ok || data.error) throw new Error(data.error || 'Server error '+resp.status);

    displayRevResults(data);
  } catch(err){
    document.getElementById('compare-btn-text').textContent = '❌ ' + err.message;
    btn.disabled = false;
  }
  spinner.style.display = 'none';
  btn.disabled = false;
}

function displayRevResults(data){
  const {added=[], removed=[], changed=[], costDiff=0, revBMembers=[]} = data;
  
  document.getElementById('rv-added').textContent = added.length;
  document.getElementById('rv-removed').textContent = removed.length;
  document.getElementById('rv-changed').textContent = changed.length;
  const cd = Math.round(costDiff);
  document.getElementById('rv-cost').textContent = (cd>=0?'+':'') + '£'+Math.abs(cd).toLocaleString();
  document.getElementById('rv-cost').style.color = cd>=0 ? 'var(--green)' : 'var(--red)';

  let html = '';
  added.forEach(m=>{
    html += `<div class="rev-change added">
      <span class="rev-badge added">ADDED</span>
      <div><strong style="color:var(--green)">${esc(m.section)}</strong> — ${esc(m.type)}<br>
      <span style="color:var(--dim)">${m.qty}no × ${m.length}mm${m.notes?' · '+esc(m.notes):''}</span></div>
    </div>`;
  });
  removed.forEach(m=>{
    html += `<div class="rev-change removed">
      <span class="rev-badge removed">REMOVED</span>
      <div><strong style="color:var(--red)">${esc(m.section)}</strong> — ${esc(m.type)}<br>
      <span style="color:var(--dim)">${m.qty}no × ${m.length}mm${m.notes?' · '+esc(m.notes):''}</span></div>
    </div>`;
  });
  changed.forEach(m=>{
    html += `<div class="rev-change changed">
      <span class="rev-badge changed">CHANGED</span>
      <div><strong style="color:var(--accent)">${esc(m.section)}</strong> — ${esc(m.type)}<br>
      <span style="color:var(--dim)">${esc(m.change)}</span></div>
    </div>`;
  });

  if(!html) html = '<div style="padding:20px;text-align:center;color:var(--green)">✅ No changes detected between revisions</div>';

  document.getElementById('rv-changes-list').innerHTML = html;
  document.getElementById('rev-results').style.display = 'block';
  document.getElementById('compare-btn-text').textContent = '🔀 Compare Again';

  // Show apply button if there are Rev B members
  if(revBMembers && revBMembers.length > 0){
    window._revBMembers = revBMembers;
    document.getElementById('apply-rev-btn').style.display = 'block';
  }
}

function applyRevBToTakeoff(){
  if(!window._revBMembers) return;
  const {hotRolled=[], coldRolled=[]} = window._revBMembers;
  if(hotRolled.length > 0){ hotRows = hotRolled.map(d=>mkH(d)); renderHot(); }
  if(coldRolled.length > 0){ coldRows = coldRolled.map(d=>mkC(d)); renderCold(); }
  switchTab('hot');
}

// ── SAVE & LOAD ESTIMATES ──
const JOBS_KEY = 'rl_jobs';

function getJobs(){
  try{ return JSON.parse(localStorage.getItem(JOBS_KEY)||'[]'); }
  catch(e){ return []; }
}

function saveEstimate(){
  const name = (document.getElementById('projName').value||'').trim();
  if(!name){ alert('Please enter a project name first'); document.getElementById('projName').focus(); return; }
  
  const jobs = getJobs();
  const existing = jobs.findIndex(j=>j.name===name);
  
  const job = {
    name,
    saved: new Date().toLocaleString('en-GB'),
    hotRows: hotRows.map(r=>({...r})),
    coldRows: coldRows.map(r=>({...r})),
    rates: getRates()
  };

  if(existing >= 0){
    if(!confirm(`Update existing job "${name}"?`)) return;
    jobs[existing] = job;
  } else {
    jobs.unshift(job);
  }

  // Keep max 50 jobs
  if(jobs.length > 50) jobs.pop();
  
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  
  const btn = document.getElementById('save-btn');
  btn.textContent = '✅ Saved!';
  btn.style.background = 'var(--green)';
  btn.style.color = '#111';
  setTimeout(()=>{ btn.textContent = '💾 Save'; btn.style.background = ''; btn.style.color = ''; }, 2000);
  markSaved();
}

function getRates(){
  const ids = ['r_uc_s275','r_uc_s355','r_ub_s275','r_ub_s355','r_rhs','r_chs','r_angles','r_hr_default',
    'r_galv_light','r_galv_heavy','r_galv_default','r_erection',
    'r_blast_prime','r_paint_3coat','r_intumescent_30','r_paint_default',
    'r_zpurlin_light','r_zpurlin_med','r_zpurlin_heavy','r_crail_light','r_crail_med','r_eaves','r_cr_default',
    'q_supply','q_fab','q_erect','q_galv','q_paint','q_conn'];
  const r = {};
  ids.forEach(id=>{ const el=document.getElementById(id); if(el) r[id]=el.value; });
  return r;
}

function setRates(rates){
  if(!rates) return;
  Object.entries(rates).forEach(([id,val])=>{ const el=document.getElementById(id); if(el) el.value=val; });
}

function loadJob(name){
  const jobs = getJobs();
  const job = jobs.find(j=>j.name===name);
  if(!job) return;
  
  if(hotRows.filter(r=>r.section||r.type).length > 0){
    if(!confirm(`Load "${name}"? This will replace your current take-off.`)) return;
  }

  document.getElementById('projName').value = job.name;
  hotRows = (job.hotRows||[]).map(r=>({...r, id:nid++}));
  coldRows = (job.coldRows||[]).map(r=>({...r, id:nid++}));
  setRates(job.rates||{});
  renderHot(); renderCold(); calcQuickRate();
  closeJobs();
  markSaved();
  switchTab('hot');
}

function deleteJob(name){
  if(!confirm(`Delete "${name}"?`)) return;
  const jobs = getJobs().filter(j=>j.name!==name);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  renderJobsList();
}

function showJobs(){
  renderJobsList();
  document.getElementById('jobs-modal').style.display='flex';
}

function closeJobs(){
  document.getElementById('jobs-modal').style.display='none';
}

function renderJobsList(){
  const jobs = getJobs();
  const el = document.getElementById('jobs-list');
  if(!jobs.length){
    el.innerHTML='<div class="no-jobs">No saved jobs yet.<br>Save your first estimate using the 💾 button.</div>';
    return;
  }
  el.innerHTML = jobs.map(j=>{
    const hrT = (j.hotRows||[]).reduce((s,r)=>s+(((+r.length||0)/1000)*(+r.qty||0)*(+r.kgm||0)),0)/1000;
    const meta = `Saved ${j.saved} · ${hrT.toFixed(2)}T hot rolled · ${(j.hotRows||[]).length} members`;
    return `<div class="job-card">
      <div class="job-info">
        <div class="job-name">${esc(j.name)}</div>
        <div class="job-meta">${meta}</div>
      </div>
      <div class="job-actions">
        <button class="job-load-btn" onclick="loadJob('${esc(j.name)}')">Load</button>
        <button class="job-del-btn" onclick="deleteJob('${esc(j.name)}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function markUnsaved(){
  const btn = document.getElementById('save-btn');
  if(btn && !btn.textContent.includes('●')) btn.textContent = '💾 Save ●';
}
function markSaved(){
  const btn = document.getElementById('save-btn');
  if(btn) btn.textContent = '💾 Save';
}


// ── QUOTE PDF GENERATOR ──
function generateQuote(){
  const proj = document.getElementById('projName').value || 'Untitled Project';
  const today = new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'});
  const validity = new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'});

  // Gather totals
  const hrRows = hotRows.filter(r=>r.section||r.type);
  const crRows = coldRows.filter(r=>r.section||r.type);
  const hrTotalKg = hrRows.reduce((s,r)=>s+calcH(r).kg, 0);
  const hrTotalT = hrTotalKg/1000;
  const hrTotalSA = hrRows.reduce((s,r)=>s+calcH(r).sa, 0);
  const hrTotal = hrRows.reduce((s,r)=>s+calcH(r).total, 0);
  const crTotalM = crRows.reduce((s,r)=>s+calcC(r).totalM, 0);
  const crTotal = crRows.reduce((s,r)=>s+calcC(r).price, 0);
  const grandTotal = hrTotal + crTotal;

  // Build hot rolled table rows
  const hrTableRows = hrRows.map(r=>{
    const c=calcH(r);
    return `<tr>
      <td>${esc(r.dwg)||'—'}</td>
      <td>${esc(r.type)}</td>
      <td><strong>${esc(r.section)}</strong></td>
      <td class="num">${r.length||0}</td>
      <td class="num">${r.qty||0}</td>
      <td class="num">${c.totalM.toFixed(2)}</td>
      <td class="num">${(+r.kgm||0).toFixed(1)}</td>
      <td class="num">${c.kg.toFixed(1)}</td>
      <td class="num">${(+r.m2m||0).toFixed(3)}</td>
      <td class="num">${c.sa.toFixed(2)}</td>
      <td class="num">${r.rate?'£'+(+r.rate).toLocaleString():''}</td>
      <td class="num money">${c.total>0?'£'+Math.round(c.total).toLocaleString():''}</td>
    </tr>`;
  }).join('');

  // Build cold rolled table rows
  const crTableRows = crRows.map(r=>{
    const c=calcC(r);
    return `<tr>
      <td>${esc(r.dwg)||'—'}</td>
      <td>${esc(r.type)}</td>
      <td><strong>${esc(r.section)}</strong></td>
      <td class="num">${r.length||0}</td>
      <td class="num">${r.qty||0}</td>
      <td class="num">${c.totalM.toFixed(2)}</td>
      <td class="num">${(+r.kgm||0).toFixed(2)}</td>
      <td class="num">${c.kg.toFixed(1)}</td>
      <td class="num">${r.rate?'£'+(+r.rate||0).toFixed(2):''}</td>
      <td class="num money">${c.price>0?'£'+Math.round(c.price).toLocaleString():''}</td>
    </tr>`;
  }).join('');

  // Section prices from rate book
  let sectionPriceRows = '';
  let sectionTotal = 0;
  hrRows.forEach(r=>{
    const p = lookupHR(r.section);
    if(p){
      const [kgm,m2m,rate,dispSec,cat]=p;
      const c=calcH(r);
      const totalKg=c.kg;
      const matCost=(totalKg/1000)*rate;
      sectionTotal+=matCost;
      sectionPriceRows+=`<tr>
        <td><strong>${esc(r.section||dispSec)}</strong></td>
        <td>${esc(r.type)}</td>
        <td>${cat}</td>
        <td class="num">${(kgm||+r.kgm||0).toFixed(1)}</td>
        <td class="num">£${rate.toLocaleString()}/T</td>
        <td class="num">${c.totalM.toFixed(2)}m</td>
        <td class="num">${totalKg.toFixed(1)}kg</td>
        <td class="num money">£${Math.round(matCost).toLocaleString()}</td>
      </tr>`;
    }
  });

  // Quick rates breakdown
  const supply=parseFloat(document.getElementById('q_supply')?.value)||0;
  const fab=parseFloat(document.getElementById('q_fab')?.value)||0;
  const erect=parseFloat(document.getElementById('q_erect')?.value)||0;
  const galv=parseFloat(document.getElementById('q_galv')?.value)||0;
  const paint=parseFloat(document.getElementById('q_paint')?.value)||0;
  const conn=parseFloat(document.getElementById('q_conn')?.value)||0;
  const totalRate=supply+fab+erect+galv+paint+conn;
  const hasRates = totalRate > 0;

  const quoteHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>R&L Estimate — ${esc(proj)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,sans-serif;font-size:10px;color:#1a2332;background:#fff;padding:20px;}
  
  /* HEADER */
  .hdr{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:16px;border-bottom:3px solid #c0182e;margin-bottom:20px;}
  .logo-rl{font-family:Georgia,serif;font-size:36px;color:#c0182e;font-style:italic;line-height:1;}
  .logo-sub{font-size:8px;color:#c8961a;letter-spacing:3px;text-transform:uppercase;margin-top:2px;}
  .logo-est{font-size:7px;color:#999;letter-spacing:1px;margin-top:1px;}
  .hdr-right{text-align:right;font-size:9px;color:#555;line-height:1.6;}
  .hdr-right strong{color:#1a2332;font-size:11px;}
  
  /* PROJECT INFO */
  .proj-box{background:#f8f6f2;border-left:4px solid #c0182e;padding:10px 14px;margin-bottom:16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
  .proj-item label{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:2px;}
  .proj-item strong{font-size:11px;color:#1a2332;}
  
  /* SUMMARY BOXES */
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px;}
  .sum-box{border:1px solid #e0ddd6;border-radius:4px;padding:10px;text-align:center;}
  .sum-box label{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;}
  .sum-box .val{font-size:16px;font-weight:bold;color:#1a2332;}
  .sum-box.total .val{color:#2ecc71;font-size:18px;}
  
  /* SECTION TITLES */
  .sec-hdr{background:#1a2332;color:#fff;padding:6px 10px;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:0;margin-top:16px;}
  .sec-hdr.hot{background:#c0182e;}
  .sec-hdr.cold{background:#2a7ae0;}
  .sec-hdr.prices{background:#1d6b4e;}
  .sec-hdr.rates{background:#856404;}
  
  /* TABLES */
  table{width:100%;border-collapse:collapse;margin-bottom:4px;}
  thead th{background:#f0ede8;padding:5px 4px;font-size:8px;font-weight:bold;text-align:left;border-bottom:1px solid #d0cdc8;text-transform:uppercase;letter-spacing:0.5px;}
  thead th.num{text-align:right;}
  tbody td{padding:4px 4px;font-size:9px;border-bottom:1px solid #f0ede8;vertical-align:middle;}
  tbody td.num{text-align:right;}
  tbody td.money{font-weight:bold;color:#1a6b3a;}
  tbody tr:nth-child(even){background:#fafafa;}
  tfoot td{padding:5px 4px;font-size:9px;font-weight:bold;border-top:2px solid #1a2332;background:#f0ede8;}
  tfoot td.money{color:#1a6b3a;font-size:11px;}
  tfoot td.num{text-align:right;}
  
  /* RATES TABLE */
  .rates-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:4px;}
  .rate-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0ede8;font-size:9px;}
  .rate-row .rate-name{color:#555;}
  .rate-row .rate-val{font-weight:bold;}
  .rate-total-row{display:flex;justify-content:space-between;padding:6px 0;border-top:2px solid #1a2332;font-size:10px;font-weight:bold;margin-top:4px;}
  
  /* GRAND TOTAL */
  .grand-total-box{background:#1a2332;color:#fff;padding:14px 20px;margin-top:20px;display:flex;justify-content:space-between;align-items:center;border-radius:4px;}
  .gt-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:.7;}
  .gt-val{font-size:24px;font-weight:bold;color:#2ecc71;}
  .gt-sub{font-size:9px;opacity:.6;margin-top:2px;}
  
  /* FOOTER */
  .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e0ddd6;display:flex;justify-content:space-between;font-size:8px;color:#999;}
  .validity{background:#fff8e6;border:1px solid #c8961a;border-radius:3px;padding:6px 10px;font-size:9px;color:#856404;margin-top:12px;}
  
  @media print{
    body{padding:10px;}
    .no-print{display:none!important;}
    @page{margin:15mm;size:A4 landscape;}
  }
  
  .print-btn{position:fixed;bottom:20px;right:20px;background:#c0182e;color:#fff;border:none;border-radius:6px;padding:12px 20px;font-size:13px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">🖨️ Save as PDF</button>

<!-- HEADER -->
<div class="hdr">
  <div>
    <div class="logo-rl">Reynolds &amp; Litchfield</div>
    <div class="logo-sub">Constructional Engineers</div>
    <div class="logo-est">Established 1960</div>
  </div>
  <div class="hdr-right">
    <strong>STEEL ESTIMATE</strong><br>
    Date: ${today}<br>
    Ref: RL-${Date.now().toString().slice(-6)}
  </div>
</div>

<!-- PROJECT INFO -->
<div class="proj-box">
  <div class="proj-item"><label>Project</label><strong>${esc(proj)}</strong></div>
  <div class="proj-item"><label>Date Issued</label><strong>${today}</strong></div>
  <div class="proj-item"><label>Valid Until</label><strong>${validity}</strong></div>
</div>

<!-- SUMMARY -->
<div class="summary">
  <div class="sum-box"><label>Hot Rolled</label><div class="val">${hrTotalT.toFixed(3)}T</div></div>
  <div class="sum-box"><label>Surface Area</label><div class="val">${hrTotalSA.toFixed(1)}m²</div></div>
  <div class="sum-box"><label>Cold Rolled</label><div class="val">${crTotalM.toFixed(1)}m</div></div>
  <div class="sum-box total"><label>Grand Total</label><div class="val">£${Math.round(grandTotal).toLocaleString()}</div></div>
</div>

${hrRows.length > 0 ? `
<!-- HOT ROLLED -->
<div class="sec-hdr hot">🔥 Hot Rolled Steel Take-Off</div>
<table>
  <thead><tr>
    <th>Dwg</th><th>Type</th><th>Section</th>
    <th class="num">Length<br>mm</th><th class="num">Qty</th>
    <th class="num">Total m</th><th class="num">Kg/m</th>
    <th class="num">Total Kg</th><th class="num">M²/m</th>
    <th class="num">Surface m²</th><th class="num">Rate</th>
    <th class="num">Total £</th>
  </tr></thead>
  <tbody>${hrTableRows}</tbody>
  <tfoot><tr>
    <td colspan="7">TOTALS</td>
    <td class="num">${hrTotalKg.toFixed(1)}</td>
    <td></td>
    <td class="num">${hrTotalSA.toFixed(2)}</td>
    <td></td>
    <td class="num money">£${Math.round(hrTotal).toLocaleString()}</td>
  </tr></tfoot>
</table>` : ''}

${crRows.length > 0 ? `
<!-- COLD ROLLED -->
<div class="sec-hdr cold">❄ Cold Rolled (Metsec) Take-Off</div>
<table>
  <thead><tr>
    <th>Dwg</th><th>Type</th><th>Section</th>
    <th class="num">Length mm</th><th class="num">Qty</th>
    <th class="num">Total m</th><th class="num">Kg/m</th>
    <th class="num">Weight Kg</th><th class="num">Rate £/m</th>
    <th class="num">Price £</th>
  </tr></thead>
  <tbody>${crTableRows}</tbody>
  <tfoot><tr>
    <td colspan="5">TOTALS</td>
    <td class="num">${crTotalM.toFixed(2)}m</td>
    <td></td>
    <td></td><td></td>
    <td class="num money">£${Math.round(crTotal).toLocaleString()}</td>
  </tr></tfoot>
</table>` : ''}

${sectionPriceRows ? `
<!-- SECTION PRICES -->
<div class="sec-hdr prices">📋 Section Material Prices (R&L Rate Book)</div>
<table>
  <thead><tr>
    <th>Section</th><th>Type</th><th>Category</th>
    <th class="num">Kg/m</th><th class="num">Rate</th>
    <th class="num">Total m</th><th class="num">Weight Kg</th>
    <th class="num">Material £</th>
  </tr></thead>
  <tbody>${sectionPriceRows}</tbody>
  <tfoot><tr>
    <td colspan="7">TOTAL MATERIAL COST</td>
    <td class="num money">£${Math.round(sectionTotal).toLocaleString()}</td>
  </tr></tfoot>
</table>` : ''}

${hasRates ? `
<!-- QUICK RATES -->
<div class="sec-hdr rates">💷 Rate Breakdown — ${hrTotalT.toFixed(3)} Tonnes Hot Rolled</div>
<div class="rates-grid">
  <div>
    ${supply?`<div class="rate-row"><span class="rate-name">Supply £/T</span><span class="rate-val">£${supply.toLocaleString()}/T = £${Math.round(hrTotalT*supply).toLocaleString()}</span></div>`:''}
    ${fab?`<div class="rate-row"><span class="rate-name">Fabricate £/T</span><span class="rate-val">£${fab.toLocaleString()}/T = £${Math.round(hrTotalT*fab).toLocaleString()}</span></div>`:''}
    ${erect?`<div class="rate-row"><span class="rate-name">Erect £/T</span><span class="rate-val">£${erect.toLocaleString()}/T = £${Math.round(hrTotalT*erect).toLocaleString()}</span></div>`:''}
  </div>
  <div>
    ${galv?`<div class="rate-row"><span class="rate-name">Galvanise £/T</span><span class="rate-val">£${galv.toLocaleString()}/T = £${Math.round(hrTotalT*galv).toLocaleString()}</span></div>`:''}
    ${paint?`<div class="rate-row"><span class="rate-name">Paint £/T</span><span class="rate-val">£${paint.toLocaleString()}/T = £${Math.round(hrTotalT*paint).toLocaleString()}</span></div>`:''}
    ${conn?`<div class="rate-row"><span class="rate-name">Connections £/T</span><span class="rate-val">£${conn.toLocaleString()}/T = £${Math.round(hrTotalT*conn).toLocaleString()}</span></div>`:''}
  </div>
</div>
<div class="rate-total-row"><span>TOTAL RATE</span><span>£${totalRate.toLocaleString()}/T × ${hrTotalT.toFixed(3)}T = £${Math.round(hrTotalT*totalRate).toLocaleString()}</span></div>
` : ''}

<!-- GRAND TOTAL -->
<div class="grand-total-box">
  <div>
    <div class="gt-label">Grand Total — ${esc(proj)}</div>
    <div class="gt-sub">Hot rolled + Cold rolled · ${today}</div>
  </div>
  <div class="gt-val">£${Math.round(grandTotal).toLocaleString()}</div>
</div>

<!-- VALIDITY -->
<div class="validity">
  ⚠️ This estimate is valid for 30 days from the date of issue (until ${validity}). Prices are subject to change after this date. This estimate is based on the information provided and may be subject to revision upon receipt of full drawings and specification.
</div>

<!-- FOOTER -->
<div class="footer">
  <div>Reynolds &amp; Litchfield Ltd · Constructional Engineers · Established 1960</div>
  <div>Generated by R&L Estimator · ${today}</div>
</div>

</body>
</html>`;

  // Open in new window for printing/saving as PDF
  const win = window.open('', '_blank');
  win.document.write(quoteHtml);
  win.document.close();
}

// ── CONFIDENCE & HUMAN APPROVAL ──
let _pendingHR = [], _pendingCR = [];

function confClass(c){ return c>=80?'high':c>=60?'med':'low'; }
function confLabel(c){ return c>=80?'✓ '+c+'%':c>=60?'⚠ '+c+'%':'⚠ '+c+'% — CHECK'; }

function showApprovalIfNeeded(hr, cr){
  // Check if any items need review (confidence < 70)
  const flaggedHR = hr.filter(r=>(r.confidence||80) < 70);
  const flaggedCR = cr.filter(r=>(r.confidence||80) < 70);
  const totalFlagged = flaggedHR.length + flaggedCR.length;

  if(totalFlagged === 0){
    // All high confidence — import directly
    if(hr.length>0){hotRows=hr.map(d=>mkH(d));renderHot();}
    if(cr.length>0){coldRows=cr.map(d=>mkC(d));renderCold();}
    return false;
  }

  // Store pending and show approval modal
  _pendingHR = hr;
  _pendingCR = cr;

  const body = document.getElementById('approval-body');
  let html = `<div style="font-size:12px;color:var(--dim);margin-bottom:12px;">
    The AI found <strong style="color:var(--red)">${totalFlagged} item${totalFlagged>1?'s':''}</strong> it's not fully confident about. 
    Please check and correct these before importing. High-confidence items will import automatically.
  </div>`;

  // Show flagged items with editable fields
  flaggedHR.forEach((r,i)=>{
    const cc = confClass(r.confidence||0);
    html += `<div class="approval-item flagged" id="apr-hr-${i}">
      <div class="approval-item-hdr">
        <span class="approval-item-name">${esc(r.type||'Hot Rolled')} — ${esc(r.section)}</span>
        <span class="conf-badge ${cc}">${confLabel(r.confidence||0)}</span>
      </div>
      ${r.flag?`<div class="approval-flag">⚠ ${esc(r.flag)}</div>`:''}
      <div class="approval-fields">
        <div class="approval-field"><label>Section</label><input type="text" value="${esc(r.section)}" id="apr-hr-${i}-sec"></div>
        <div class="approval-field"><label>Length (mm)</label><input type="number" value="${r.length||0}" id="apr-hr-${i}-len"></div>
        <div class="approval-field"><label>Qty</label><input type="number" value="${r.qty||0}" id="apr-hr-${i}-qty"></div>
      </div>
    </div>`;
  });

  flaggedCR.forEach((r,i)=>{
    const cc = confClass(r.confidence||0);
    html += `<div class="approval-item flagged" id="apr-cr-${i}">
      <div class="approval-item-hdr">
        <span class="approval-item-name">${esc(r.type||'Cold Rolled')} — ${esc(r.section)}</span>
        <span class="conf-badge ${cc}">${confLabel(r.confidence||0)}</span>
      </div>
      ${r.flag?`<div class="approval-flag">⚠ ${esc(r.flag)}</div>`:''}
      <div class="approval-fields">
        <div class="approval-field"><label>Section</label><input type="text" value="${esc(r.section)}" id="apr-cr-${i}-sec"></div>
        <div class="approval-field"><label>Length (mm)</label><input type="number" value="${r.length||0}" id="apr-cr-${i}-len"></div>
        <div class="approval-field"><label>Qty</label><input type="number" value="${r.qty||0}" id="apr-cr-${i}-qty"></div>
      </div>
    </div>`;
  });

  body.innerHTML = html;
  document.getElementById('approval-modal').style.display='flex';
  return true;
}

function approveAll(){
  // Read back any corrections from the approval form
  const flaggedHR = _pendingHR.filter(r=>(r.confidence||80) < 70);
  const flaggedCR = _pendingCR.filter(r=>(r.confidence||80) < 70);

  flaggedHR.forEach((r,i)=>{
    const sec = document.getElementById(`apr-hr-${i}-sec`);
    const len = document.getElementById(`apr-hr-${i}-len`);
    const qty = document.getElementById(`apr-hr-${i}-qty`);
    if(sec) r.section = sec.value;
    if(len) r.length = parseFloat(len.value)||0;
    if(qty) r.qty = parseFloat(qty.value)||0;
    r.confidence = 100; // Mark as approved
    r.flag = '';
  });

  flaggedCR.forEach((r,i)=>{
    const sec = document.getElementById(`apr-cr-${i}-sec`);
    const len = document.getElementById(`apr-cr-${i}-len`);
    const qty = document.getElementById(`apr-cr-${i}-qty`);
    if(sec) r.section = sec.value;
    if(len) r.length = parseFloat(len.value)||0;
    if(qty) r.qty = parseFloat(qty.value)||0;
    r.confidence = 100;
    r.flag = '';
  });

  // Import all
  if(_pendingHR.length>0){hotRows=_pendingHR.map(d=>mkH(d));renderHot();}
  if(_pendingCR.length>0){coldRows=_pendingCR.map(d=>mkC(d));renderCold();}

  closeApproval();

  // Show confidence summary in take-off
  const lowConf = [..._pendingHR,..._pendingCR].filter(r=>(r.confidence||100)<80);
  if(lowConf.length){
    showNeedsReviewBar(lowConf.length);
  }
}

function closeApproval(){
  document.getElementById('approval-modal').style.display='none';
}

function showNeedsReviewBar(count){
  // Show a sticky bar on hot/cold tabs if items were auto-approved with low confidence
  const existing = document.getElementById('review-bar');
  if(existing) existing.remove();
  const bar = document.createElement('div');
  bar.id = 'review-bar';
  bar.className = 'needs-review-bar';
  bar.innerHTML = `<div class="nr-count">${count}</div>
    <div><strong style="color:var(--red)">item${count>1?'s':''} flagged for review</strong><br>
    <span style="color:var(--dim);font-size:11px">Check rows marked ⚠ in the take-off — confidence score was below 80%</span></div>`;
  const hotPanel = document.getElementById('panel-hot');
  if(hotPanel) hotPanel.insertBefore(bar, hotPanel.firstChild);
}
for(let i=0;i<2;i++)hotRows.push(mkH());
  coldRows.push(mkC());
  document.getElementById('projName').value='';
  document.getElementById('drawingScale').value='auto';
  document.getElementById('drawingType').value='ga';
  document.getElementById('progBox').style.display='none';
  document.getElementById('resultBanner').className='result-banner';
  resetRates();
  renderHot();renderCold();renderPrices();
  switchTab('pdf');
}
function calcQuickRate(){
  const supply=parseFloat(document.getElementById('q_supply').value)||0;
  const fab=parseFloat(document.getElementById('q_fab').value)||0;
  const erect=parseFloat(document.getElementById('q_erect').value)||0;
  const galv=parseFloat(document.getElementById('q_galv').value)||0;
  const paint=parseFloat(document.getElementById('q_paint').value)||0;
  const conn=parseFloat(document.getElementById('q_conn').value)||0;
  const totalRate=supply+fab+erect+galv+paint+conn;
  const tonnes=hotRows.reduce((s,r)=>s+calcH(r).kg,0)/1000;
  const total=tonnes*totalRate;
  document.getElementById('qr-tonnes').textContent=tonnes.toFixed(3);
  document.getElementById('qr-rate').textContent='£'+Math.round(totalRate).toLocaleString();
  document.getElementById('qr-total').textContent='£'+Math.round(total).toLocaleString();
  // Breakdown
  const fmt=v=>v?'£'+Math.round(tonnes*v).toLocaleString():'£0';
  document.getElementById('qr-supply-val').textContent=fmt(supply);
  document.getElementById('qr-fab-val').textContent=fmt(fab);
  document.getElementById('qr-erect-val').textContent=fmt(erect);
  document.getElementById('qr-galv-val').textContent=fmt(galv);
  document.getElementById('qr-paint-val').textContent=fmt(paint);
  document.getElementById('qr-conn-val').textContent=fmt(conn);
}
function handleFile(e){
  const f=e.target.files[0];
  if(!f)return;
  processFile(f);
}
function toB64(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(',')[1]);
    r.onerror=()=>rej(new Error('Could not read file'));
    r.readAsDataURL(file);
  });
}
function setStep(n,s){
  const el=document.getElementById('s'+n);
  if(!el)return;
  el.className='step'+(s==='done'?' done':s==='active'?' active':'');
  el.querySelector('span').textContent=s==='done'?'✅':s==='active'?'🔄':'⏳';
}
function showErr(msg){
  document.getElementById('spinner').style.display='none';
  document.getElementById('progTitle').textContent='Failed';
  const b=document.getElementById('resultBanner');
  b.className='result-banner error show';
  document.getElementById('resultIcon').textContent='❌';
  document.getElementById('resultText').textContent=msg;
}
async function processFile(file){
  const pb=document.getElementById('progBox');
  const rb=document.getElementById('resultBanner');
  pb.style.display='block';
  rb.className='result-banner';
  document.getElementById('spinner').style.display='';
  document.getElementById('progTitle').textContent='Reading Drawing…';
  [1,2,3,4,5].forEach(n=>setStep(n,''));
  try{
    setStep(1,'active');
    const b64=await toB64(file);
    if(!b64.startsWith('JVBERi'))throw new Error('Not a valid PDF file.');
    setStep(1,'done');
    setStep(2,'active');
    const scaleInfo=getScaleInfo();
    const resp=await fetch('/api/analyse',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({pdfBase64:b64,scale:scaleInfo.scale,drawingType:scaleInfo.type,workType:scaleInfo.workType})
    });
    setStep(2,'done');
    setStep(3,'active');
    const rawText=await resp.text();
    if(!rawText||rawText.trim()==='')throw new Error('Empty response — please try again.');
    let data;
    try{data=JSON.parse(rawText);}
    catch(e){throw new Error('Server error: '+rawText.slice(0,300));}
    if(!resp.ok||data.error)throw new Error(data.error||'Server error '+resp.status);
    setStep(3,'done');
    setStep(4,'active');
    const hr=data.hotRolled||[],cr=data.coldRolled||[];
    if(hr.length===0&&cr.length===0)throw new Error('No steel members found. Check the PDF is a structural drawing with member sizes shown.');
    setStep(4,'done');
    setStep(5,'active');
    setStep(5,'active');
    // Check confidence — show approval modal if any items flagged
    const needsReview = showApprovalIfNeeded(hr, cr);
    setStep(5,'done');
    document.getElementById('spinner').style.display='none';
    const lowConf = [...hr,...cr].filter(r=>(r.confidence||80)<70).length;
    if(needsReview){
      document.getElementById('progTitle').textContent='Review Required ⚠';
      rb.className='result-banner show';
      rb.style.background='rgba(240,165,0,0.1)';
      rb.style.border='1px solid var(--accent)';
      rb.style.color='var(--accent)';
      document.getElementById('resultIcon').textContent='⚠️';
      document.getElementById('resultText').innerHTML='<strong>'+hr.length+' hot + '+cr.length+' cold members found.</strong> '+lowConf+' item'+(lowConf>1?'s':'')+' need your review before import.';
    } else {
      document.getElementById('progTitle').textContent='Complete ✓';
      rb.className='result-banner success show';
      document.getElementById('resultIcon').textContent='✅';
      document.getElementById('resultText').innerHTML='<strong>Done!</strong> Found '+hr.length+' hot rolled + '+cr.length+' cold rolled members — all high confidence. Set your rates then tap Apply.';
      setTimeout(()=>{if(hr.length>0)switchTab('hot');else if(cr.length>0)switchTab('cold');},1500);
    }
  }catch(err){showErr(err.message);}
}
function exportCSV(){
  const proj=document.getElementById('projName').value||'Estimate';
  let csv='R&L ESTIMATOR,'+proj+'\n\nHOT ROLLED\nDwg,Type,Section,Length mm,Qty,Total m,Kg/m,Total Kg,M2/m,Surface m2,Rate,Steel £,Galv,Galv £,Paint,Paint £,Total £,Notes\n';
  hotRows.forEach(r=>{const c=calcH(r);csv+='"'+r.dwg+'","'+r.type+'","'+r.section+'",'+r.length+','+r.qty+','+c.totalM.toFixed(2)+','+r.kgm+','+c.kg.toFixed(1)+','+r.m2m+','+c.sa.toFixed(2)+','+r.rate+','+c.sp.toFixed(2)+','+r.galvRate+','+c.gp.toFixed(2)+','+r.paintRate+','+c.pp.toFixed(2)+','+c.total.toFixed(2)+',"'+r.notes+'"\n';});
  csv+='\nCOLD ROLLED\nDwg,Type,Section,Length mm,Qty,Total m,Kg/m,Weight Kg,Rate,Price £,Notes\n';
  coldRows.forEach(r=>{const c=calcC(r);csv+='"'+r.dwg+'","'+r.type+'","'+r.section+'",'+r.length+','+r.qty+','+c.totalM.toFixed(2)+','+r.kgm+','+c.kg.toFixed(1)+','+r.rate+','+c.price.toFixed(2)+',"'+r.notes+'"\n';});
  const hrT=hotRows.reduce((s,r)=>s+calcH(r).total,0),crT=coldRows.reduce((s,r)=>s+calcC(r).price,0);
  csv+='\nHot Rolled Total,£'+hrT.toFixed(2)+'\nCold Rolled Total,£'+crT.toFixed(2)+'\nGRAND TOTAL,£'+(hrT+crT).toFixed(2)+'\n';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=proj.replace(/\s+/g,'_')+'_Estimate.csv';a.click();
}
document.getElementById('drawingScale').addEventListener('change',function(){
  const ci=document.getElementById('customScale');
  ci.style.display=this.value==='custom'?'block':'none';
});
function getScaleInfo(){
  const sel=document.getElementById('drawingScale');
  const typ=document.getElementById('drawingType');
  const wt=document.getElementById('workType');
  let scale=sel.value;
  if(scale==='custom'){
    scale=document.getElementById('customScale').value||'unknown';
  }
  return{scale,type:typ.value,workType:wt?wt.value:'new'};
}
function updateWorkTypeHint(){
  const wt=document.getElementById('workType');
  const hint=document.getElementById('work-type-hint');
  if(!wt||!hint)return;
  const msgs={
    new:'',
    alteration:'<strong style="color:var(--accent)">Alteration mode:</strong> AI will ignore existing steel and only extract members marked as NEW, ADDITIONAL or TO BE PROVIDED. Members marked EXISTING, EX. or TO REMAIN will be excluded.',
    demolition:'<strong style="color:var(--red)">Demolition mode:</strong> AI will only extract members marked for removal, demolition or to be cut out.',
    all:'<strong style="color:var(--accent)">All mode:</strong> AI will extract all steel and label each item as NEW, EXISTING or REMOVE so you can filter manually.'
  };
  hint.style.display=wt.value==='new'?'none':'block';
  hint.innerHTML=msgs[wt.value]||'';
  // Change border colour for demolition
  hint.style.borderLeftColor=wt.value==='demolition'?'var(--red)':'var(--accent)';
  hint.style.background=wt.value==='demolition'?'rgba(231,76,60,0.08)':'rgba(240,165,0,0.08)';
}
for(let i=0;i<2;i++)hotRows.push(mkH());
coldRows.push(mkC());
renderHot();renderCold();
</script>
</body>
</html>
