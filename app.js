/* Eryndor — Living World Bible. Zero build tools and zero external dependencies. */
(() => {
  'use strict';
  const DATA_URL = './data/world.json';
  const STORAGE_KEY = 'eryndor-world-bible-local-edits-v1';
  const HISTORY_KEY = 'eryndor-world-bible-local-history-v1';
  const STATUSES = {canon:'Canon',working:'Working lore',reported:'Reported',disputed:'Disputed',open:'Open',superseded:'Superseded',noncanon:'Non-canon'};
  const SHELVES = ['Foundations','History','Places','Realms','Peoples','Magic','People & NPCs','Campaign','Mysteries'];
  const SYMBOLS = {'Foundations':'✧','History':'◷','Places':'◇','Realms':'♜','Peoples':'◌','Magic':'✦','People & NPCs':'♟','Campaign':'⚔','Mysteries':'◎'};
  let base = null;
  let sourceIndex = null;
  const sourceCache = new Map();
  let sourceDeepIndexed = false;
  let sourceDeepIndexing = false;
  let sourceSearchQuery = '';
  let sourceFilterGroup = '';
  let edits = readStore(STORAGE_KEY, {});
  let revisionHistory = readStore(HISTORY_KEY, []);
  let libraryFilters = {q:'',category:'',status:'',era:''};
  let selectedDraft = null;
  const root = document.getElementById('app');
  const nav = document.getElementById('mainNav');
  const shelfNav = document.getElementById('shelfNav');
  const sidebar = document.getElementById('sidebar');
  const mobileShade = document.getElementById('mobileShade');
  const menuToggle = document.getElementById('menuToggle');

  function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function writeStore(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { showToast('Local browser storage unavailable; export drafts to avoid losing changes.'); return false; } }
  function esc(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function slug(text) { return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function countFmt(value) { return Number(value).toLocaleString('en-CA'); }
  function allRecords() {
    const official = base?.records || [];
    const map = new Map(official.map(item => [item.id, {...item, ...(edits[item.id] || {}),localDraft:!!edits[item.id]}]));
    for (const [id, record] of Object.entries(edits)) if (!map.has(id)) map.set(id,{...record,localDraft:true});
    return [...map.values()];
  }
  const byId = id => allRecords().find(x=>x.id===id);
  const recordsCategory = cat => allRecords().filter(x=>x.category===cat);
  const hrefRecord = id => `#record/${encodeURIComponent(id)}`;
  function statusChip(status) { return `<span class="status status-${esc(STATUSES[status]?status:'open')}">${esc(STATUSES[status]||status)}</span>`; }
  const field = (name,label,value='',required=false,wide=false,type='text') => `<div class="form-field ${wide?'wide':''}"><label for="f-${name}">${esc(label)}</label>${type==='textarea'?`<textarea class="textarea" name="${name}" id="f-${name}" ${required?'required':''}>${esc(value)}</textarea>`:`<input class="input" name="${name}" id="f-${name}" type="${type}" value="${esc(value)}" ${required?'required':''}/>`}</div>`;
  const notice = text => `<div class="notice">${text}</div>`;
  function recordCard(r) { return `<a class="record-card" href="${hrefRecord(r.id)}"><div class="record-category">${esc(r.category)} ${r.localDraft?'· LOCAL DRAFT':''}</div><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p><div class="record-card-foot">${statusChip(r.status)}<span class="card-arrow">↗</span></div></a>`; }
  function heading(eyebrow,title,desc='',actions='') { return `<div class="intro-row"><div><div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1>${desc?`<div class="page-description">${desc}</div>`:''}</div>${actions?`<div class="intro-actions">${actions}</div>`:''}</div>`; }
  function sectionHead(title,link='',desc=''){return `<div class="section-head"><h2 class="minor-title">${title}</h2>${link?`<a href="${link}">View collection ↗</a>`:desc?`<div class="section-note">${desc}</div>`:''}</div>`;}
  function inlineMarkup(value='') {
    return esc(value).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
  }
  function detailText(body) {
    if (!body) return '<p>No details have been added yet.</p>';
    return String(body).replace(/\r/g,'').split(/\n\s*\n/).map(part => {
      const lines=part.split('\n').map(s=>s.trim()).filter(Boolean);
      if (!lines.length) return '';
      if (lines.length===1 && /^#{1,4}\s+/.test(lines[0])) {
        const m=lines[0].match(/^(#{1,4})\s+(.+)$/);
        const level=Math.min(4,Math.max(2,m[1].length+1));
        return '<h'+level+'>'+inlineMarkup(m[2])+'</h'+level+'>';
      }
      if (lines.every(line=>/^[-*]\s+/.test(line))) return '<ul>'+lines.map(line=>'<li>'+inlineMarkup(line.replace(/^[-*]\s+/,''))+'</li>').join('')+'</ul>';
      if (lines.every(line=>/^\d+[.)]\s+/.test(line))) return '<ol>'+lines.map(line=>'<li>'+inlineMarkup(line.replace(/^\d+[.)]\s+/,''))+'</li>').join('')+'</ol>';
      return '<p>'+lines.map(inlineMarkup).join('<br>')+'</p>';
    }).join('');
  }
  function renderOverview() {
    const highlighted = ['the-second-age-avarran-chronology','southern-wastes-dark-mages','ironspine-mountains','creation-of-the-orcs','ancient-harmonisation-and-fusion','current-campaign-pause'].map(byId).filter(Boolean);
    const m=base.meta;
    return `<section class="hero"><div class="hero-art"></div><div class="hero-content"><div class="eyebrow">THE WORLD ENDURES · THE ARCHIVE REMEMBERS</div><h1 class="display-title">A world of <em>stone,</em><br>starlight &amp; stories.</h1><p class="lede">The canonical living encyclopedia of Eryndor. Five Ages, independent civilizations, lost magic—and a Khazari dwarf whose next choice remains unwritten.</p><div class="hero-buttons"><a class="btn btn-primary" href="#library">Explore the World Bible <span>↗</span></a><a class="btn btn-quiet" href="#campaign">Resume the campaign log</a></div></div></section>
      <div class="stats-grid"><div class="stat-card"><div class="stat-number">5</div><div class="stat-label">World Ages</div></div><div class="stat-card"><div class="stat-number">5</div><div class="stat-label">Continents</div></div><div class="stat-card"><div class="stat-number">${allRecords().length}</div><div class="stat-label">Indexed Records</div></div><div class="stat-card"><div class="stat-number">2.0628B</div><div class="stat-label">Modeled Residents</div></div></div>
      <div class="card-panel archive-banner"><div><div class="eyebrow">THE COMPLETE SOURCE ARCHIVE</div><h2 class="minor-title">54 original World Bible and Compendium volumes</h2><p>Browse the complete preserved chapters, older and newer, with no abbreviated replacements.</p></div><a class="btn btn-primary" href="#sources">Read all volumes ↗</a></div>
      ${sectionHead('From the World Bible','#library')}
      <div class="record-grid">${highlighted.map(recordCard).join('')}</div>
      ${sectionHead('The world at a glance')}
      <div class="overview-grid"><div class="card-panel"><div class="eyebrow">THE HISTORICAL RECORD</div><h3 class="minor-title" style="margin-top:14px">Five Ages. Countless histories.</h3><p>The First Age is undocumented. The Second Age spans exactly 1,437 years, divided into three established <em>Avarran</em> eras. The proposed Third Age spans 8,873 years. Present-day history belongs to the Fifth Age and the Era of Crowns.</p><div class="era-bar"><div></div><div></div><div></div></div><div class="era-labels"><span>AWAKENING</span><span>WONDER</span><span>FIRE</span></div><div style="margin-top:22px"><a class="btn btn-small btn-quiet" href="#history">Explore the Ages ↗</a></div></div>
      <div class="card-panel panel-highlight"><div class="eyebrow">CAMPAIGN · PAUSED</div><div class="scene-time">Autumn Day 22 · 11:25 AM</div><div class="scene-summary">Gloin and Maela stand before Hadrik Ironvein at the Royal Historical Archive.</div><p>Hadrik has asked what they uncovered. Gloin has not answered. No decisions, revelations or in-world time are added while worldbuilding continues.</p><a class="btn btn-small btn-quiet" href="#campaign">Open Campaign Ledger ↗</a></div></div>
      ${sectionHead('Keep the mystery intact','#continuity')}
      <div class="card-panel"><div class="eyebrow">CONTINUITY ETHIC</div><h3 class="minor-title" style="margin-top:12px">Not every unanswered question needs an answer.</h3><p>Gloin's possible First Throne ancestry is genuinely undecided. The Silence Below, vanished records and the dark mages' ultimate fate remain open. Historical reports are not automatic facts. Approved worldbuilding stays revisable when the creator explicitly changes it.</p><div class="meta-strip">${statusChip('canon')} ${statusChip('working')} ${statusChip('reported')} ${statusChip('open')} ${statusChip('disputed')}</div></div>
      ${notice(`<strong>Edition note:</strong> ${esc(m.notice)} This GitHub Pages site is public to read; only authorized repository contributors can publish changes.`)}`;
  }
  function renderLibrary() {
    const categories = ['All',...SHELVES];
    return `${heading('THE COMPENDIUM','The Encyclopedia','Search across every culture, character, kingdom, historical event, magical system and unresolved thread.',`<a class="btn btn-quiet" href="#drafts">✎ Add a local draft</a>`)}
      <div class="filter-bar"><div class="search-wrapper"><span aria-hidden="true">⌕</span><input id="librarySearch" class="input" type="search" placeholder="Search names, events, concepts…" aria-label="Search records" value="${esc(libraryFilters.q)}" autocomplete="off"></div>
      <select class="select" id="statusFilter" aria-label="Filter by canon status"><option value="">Every status</option>${Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${libraryFilters.status===k?'selected':''}>${esc(v)}</option>`).join('')}</select>
      <select class="select" id="eraFilter" aria-label="Filter by Age"><option value="">Every Age</option>${['First Age','Second Age','Third Age','Fourth Age','Fifth Age'].map(k=>`<option ${libraryFilters.era===k?'selected':''}>${k}</option>`).join('')}</select><div id="searchResultCount" class="filter-result"></div></div>
      <div class="chips" id="categoryChips">${categories.map(c=>`<button type="button" class="chip ${libraryFilters.category===(c==='All'?'':c)?'active':''}" data-cat="${esc(c==='All'?'':c)}">${esc(c)}</button>`).join('')}</div>
      <div class="record-grid" id="libraryGrid"></div>`;
  }
  function filteredRecords() {
    const q=libraryFilters.q.toLocaleLowerCase().trim();
    const words=q.split(/\s+/).filter(Boolean);
    return allRecords().filter(r => {
      if(libraryFilters.category && r.category!==libraryFilters.category) return false;
      if(libraryFilters.status && r.status!==libraryFilters.status) return false;
      if(libraryFilters.era && ![r.era,r.title,r.body].join(' ').includes(libraryFilters.era)) return false;
      if(!words.length) return true;
      const haystack=[r.title,r.summary,r.body,r.category,r.region,...(r.tags||[])].join(' ').toLocaleLowerCase();
      return words.every(w=>haystack.includes(w));
    }).sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  }
  function refreshLibrary() {
    const grid=document.getElementById('libraryGrid');if(!grid)return;
    const filtered=filteredRecords();
    grid.innerHTML=filtered.length?filtered.map(recordCard).join(''):`<div class="empty">No matching entries. Try fewer words or another status.<br><button type="button" class="btn btn-small" id="clearFilters" style="margin-top:15px">Reset filters</button></div>`;
    document.getElementById('searchResultCount').textContent=`${filtered.length} of ${allRecords().length} records`;
    document.querySelectorAll('#categoryChips .chip').forEach(e=>e.classList.toggle('active',(e.dataset.cat||'')===libraryFilters.category));
  }

  function archiveRows(){
    if(!sourceIndex?.items?.length) return '<div class="empty">The source archive index is not available.</div>';
    const search=sourceSearchQuery.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const items=sourceIndex.items.filter(item=>{
      if(sourceFilterGroup && item.group!==sourceFilterGroup)return false;
      const document=sourceCache.get(item.id);
      const content=sourceDeepIndexed ? (document?.rawNotionMarkup||'') : '';
      const haystack=[item.title,item.group,content].join(' ').toLocaleLowerCase();
      return search.every(word=>haystack.includes(word));
    });
    const groups=[...new Set(items.map(item=>item.group))];
    return '<div class="source-count">'+items.length+' of '+sourceIndex.items.length+' original source volumes</div>'+
      (items.length?groups.map(group=>'<section class="source-group"><h2 class="minor-title">'+esc(group)+'</h2><div class="source-list">'+
        items.filter(item=>item.group===group).map(item=>'<a class="source-link" href="#source/'+encodeURIComponent(item.id)+'"><span><strong>'+esc(item.title)+'</strong><small>Unabridged chapter · '+Math.round(item.bytes/1024).toLocaleString('en-CA')+' KB</small></span><span class="card-arrow">↗</span></a>').join('')+
        '</div></section>').join(''):'<div class="empty">No sources matched. Try another search.</div>');
  }
  function renderSourceArchive(){
    const groupNames=[...new Set(sourceIndex?.items?.map(x=>x.group)||[])];
    return heading('ORIGINAL WORLD LIBRARY','The Unabridged Archive',
      'Every accessible World Bible, Compendium, atlas, census and Second Age source volume is preserved here in full. Older accounts remain visible, including superseded details and unresolved contradictions.')
      +'<div class="card-panel source-toolbar"><div class="eyebrow">SOURCE PRESERVATION · '+(sourceIndex?.items?.length||'—')+' VOLUMES</div>'+
      '<p>This archive is the original historical record, not an automatic declaration that every old statement is current canon. The 149-entry encyclopedia tracks the reconciled working version. Full text and exact original markup are available in each volume.</p>'+
      '<div class="source-controls"><input id="sourceSearch" class="input" type="search" placeholder="Find a chapter, name or event…" aria-label="Search source archive" value="'+esc(sourceSearchQuery)+'"/>'+
      '<select id="sourceGroupFilter" class="select" aria-label="Filter archive collection"><option value="">Every collection</option>'+groupNames.map(g=>'<option value="'+esc(g)+'" '+(g===sourceFilterGroup?'selected':'')+'>'+esc(g)+'</option>').join('')+'</select></div>'+
      '<button class="btn btn-quiet" type="button" id="deepArchiveSearch">'+(sourceDeepIndexed?'Full-text search ready':'Enable search inside every source chapter')+'</button><p class="text-small" id="sourceIndexStatus">'+(sourceDeepIndexed?'All '+sourceIndex.items.length+' volumes indexed for full-text search.':'Search covers chapter titles and collections until full-text search is enabled.')+'</p></div>'+
      '<div id="sourceRows">'+archiveRows()+'</div>';
  }
  function updateSourceArchive(){
    const el=document.getElementById('sourceRows');if(el)el.innerHTML=archiveRows();
  }
  function renderSourceDetail(id){
    const item=sourceIndex?.items?.find(x=>x.id===id);
    if(!item)return heading('SOURCE NOT FOUND','No matching source volume','The requested original chapter is not in the archive.')+'<a class="btn" href="#sources">Return to complete archive</a>';
    return '<div class="breadcrumbs"><a href="#sources">COMPLETE SOURCE ARCHIVE</a> <span>›</span> '+esc(item.group)+'</div>'+
    '<div class="record-head"><div class="eyebrow">UNABRIDGED PRESERVED TEXT</div><h1 class="page-title">'+esc(item.title)+'</h1>'+
    '<p class="record-summary">Original chapter preserved in full, including historical revisions and material that may have been superseded by later canon.</p>'+
    '<div class="meta-strip"><span class="status status-working">Source record · check current canon</span><span>'+Math.round(item.bytes/1024)+' KB source file</span></div></div>'+
    '<div class="source-toolbar source-view-tools"><button class="btn btn-small" type="button" data-source-format="readable">Readable view</button> <button class="btn btn-small btn-quiet" type="button" data-source-format="exact">Exact source text</button>'+
    ' <a class="btn btn-small btn-quiet" href="./'+esc(item.path)+'" download>Download original JSON</a></div>'+
    '<div id="sourceBody" class="article-text source-article"><p>Opening the complete source chapter…</p></div>'+
    '<div class="notice">This is an intact source copy. Older versions may contradict newer decisions. For the reconciled working reference use <a href="#library">the encyclopedia</a>; open mysteries remain genuinely undecided.</div>';
  }
  function sourcePlainText(raw){
    return String(raw||'')
      .replace(/<callout\b[^>]*>/gi,'\n\n').replace(/<\/callout>/gi,'\n\n')
      .replace(/<page\b[^>]*>/gi,'\n\n').replace(/<\/page>/gi,'\n\n')
      .replace(/<mention\b[^>]*\/>/gi,' [linked reference] ')
      .replace(/<\/(p|tr|li|table|ul|ol|div)>/gi,'\n')
      .replace(/<\/(td|th)>/gi,' | ')
      .replace(/<b>/gi,'**').replace(/<\/b>/gi,'**')
      .replace(/<strong>/gi,'**').replace(/<\/strong>/gi,'**')
      .replace(/<i>/gi,'*').replace(/<\/i>/gi,'*')
      .replace(/<em>/gi,'*').replace(/<\/em>/gi,'*')
      .replace(/<br\s*\/?>/gi,'\n')
      .replace(/<[^>]*>/g,'')
      .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
      .replace(/\n{4,}/g,'\n\n\n').trim();
  }
  function showSourceFormat(id,format){
    const el=document.getElementById('sourceBody'),obj=sourceCache.get(id);
    if(!el||!obj||!location.hash.startsWith('#source/'+id))return;
    el.innerHTML=format==='exact'?'<pre class="source-exact">'+esc(obj.rawNotionMarkup)+'</pre>':detailText(sourcePlainText(obj.rawNotionMarkup));
    el.dataset.sourceFormat=format;
    document.querySelectorAll('[data-source-format]').forEach(x=>x.classList.toggle('active',x.dataset.sourceFormat===format));
  }
  async function loadSourceDetail(id){
    const item=sourceIndex?.items?.find(x=>x.id===id);
    if(!item)return;
    try {
      if(!sourceCache.has(id)){
        const response=await fetch('./'+item.path,{cache:'no-cache'});
        if(!response.ok)throw new Error('HTTP '+response.status);
        const payload=await response.json();
        if(payload.id!==id||typeof payload.rawNotionMarkup!=='string')throw new Error('Invalid original chapter');
        sourceCache.set(id,payload);
      }
      showSourceFormat(id,'readable');
    }catch(error){
      const el=document.getElementById('sourceBody');
      if(el&&location.hash==='#source/'+id)el.innerHTML='<p class="empty">Unable to open the original text: '+esc(error.message)+'</p>';
    }
  }
  async function indexFullSourceArchive(){
    if(sourceDeepIndexing||!sourceIndex)return;
    sourceDeepIndexing=true;
    const items=sourceIndex.items.filter(item=>!sourceCache.has(item.id));
    let problems=0;
    for(let i=0;i<items.length;i+=6){
      const batch=items.slice(i,i+6);
      const results=await Promise.allSettled(batch.map(async item=>{
        const response=await fetch('./'+item.path);
        if(!response.ok)throw new Error('HTTP '+response.status);
        const payload=await response.json();
        if(payload.id!==item.id||typeof payload.rawNotionMarkup!=='string')throw new Error('Source mismatch');
        sourceCache.set(item.id,payload);
      }));
      problems+=results.filter(x=>x.status==='rejected').length;
      const el=document.getElementById('sourceIndexStatus');
      if(el)el.textContent='Indexed '+sourceCache.size+' of '+sourceIndex.items.length+' original volumes…';
    }
    sourceDeepIndexed=sourceIndex.items.every(x=>sourceCache.has(x.id));
    sourceDeepIndexing=false;
    const status=document.getElementById('sourceIndexStatus');
    if(status)status.textContent=sourceDeepIndexed?'Full-text search ready across every one of the '+sourceIndex.items.length+' volumes.':'Indexed '+sourceCache.size+' volumes; '+problems+' could not load. Tap the button to retry.';
    const btn=document.getElementById('deepArchiveSearch');
    if(btn)btn.textContent=sourceDeepIndexed?'Full-text search ready':'Retry remaining source chapters';
    updateSourceArchive();
  }

  function renderHistory() {
    const ages=base.meta.ages;
    const selected=['first-great-cataclysm','era-of-awakening','era-of-wonder','era-of-fire','end-of-second-age-global-earthquakes','creation-of-the-orcs'].map(byId).filter(Boolean);
    const allAnnals=recordsCategory('History').filter(x=>x.title.includes('Annals'));
    return `${heading('THE BOOK OF AGES','History & the Turning of Time','Ages apply across Eryndor. Era names and divisions are not automatically universal.')}
      <div class="timeline">${ages.map((a,i)=>`<div class="timeline-node"><div class="timeline-marker"></div><div class="timeline-card"><div class="time-era">AGE ${['I','II','III','IV','V'][i]} · ${esc(a.years)}</div><h3>${esc(a.name)}</h3><p>${esc(a.status)}</p>${i===1?`<div class="era-bar"><div></div><div></div><div></div></div><div class="era-labels"><span>1–321</span><span>322–1,321</span><span>1,322–1,437</span></div>`:''}</div></div>`).join('')}</div>
      ${sectionHead('Landmark events and transitions')}
      <div class="record-grid">${selected.map(recordCard).join('')}</div>
      ${sectionHead('Second Age · Five continental annals','#library?category=History')}
      <div class="record-grid">${allAnnals.map(recordCard).join('')}</div>`;
  }
  function renderWorld() {
    const m=base.meta;
    const max=Math.max(...m.continents.map(x=>x.population));
    const throneTitles=['Karak-Varn','Az-Rhumen','Thar-Keld','Durn-Khaz','Karak-Orun','Morn-Tar','Vuldur-Kaz'];
    const crown=throneTitles.map(name=>byId(slug(name)));
    const ids=['avarra','tharvorn','sahrad','orundel','vaelora','ironspine-mountains','veiled-inland-sea','deepways','southern-wastes'].map(byId).filter(Boolean);
    return `${heading('THE KNOWN WORLD','Atlas of Eryndor','A planet of vast distances, independent kingdoms, hidden seas and diverse cultural landscapes.')}
      <div class="world-stats"><div class="stat-card"><div class="stat-number">50,000</div><div class="stat-label">Planet diameter · km</div></div><div class="stat-card"><div class="stat-number">60%</div><div class="stat-label">Water coverage</div></div><div class="stat-card"><div class="stat-number">40%</div><div class="stat-label">Land coverage</div></div><div class="stat-card"><div class="stat-number">5</div><div class="stat-label">Continents</div></div><div class="stat-card"><div class="stat-number">2.0628B</div><div class="stat-label">Modeled population</div></div></div>
      <div class="overview-grid"><div class="card-panel"><div class="eyebrow">POPULATION BY CONTINENT</div><h3 class="minor-title" style="margin-top:13px">Where the peoples live</h3><div class="population-rows">${m.continents.map(x=>`<div class="pop-row"><strong>${esc(x.name)}</strong><div class="track"><div class="fill" style="width:${(x.population/max*100).toFixed(2)}%"></div></div><div class="pop-value">${(x.population/1e6).toFixed(2)}M</div></div>`).join('')}</div></div>
      <div class="card-panel"><div class="eyebrow">THE TWIN TITANS MODEL</div><h3 class="minor-title" style="margin-top:13px">The largest lands</h3><p>Avarra occupies 32% and Orundel 28% of all planetary dry land. Tharvorn and Sahrad each account for 12%, Vaelora 11%, and separate islands and archipelagos 5%.</p><p>Planetary land area is approximately 3.142 billion km². Local terrain and map distances remain to be resurveyed at this scale.</p><a class="btn btn-small btn-quiet" href="${hrefRecord('world-geography-awaiting-remapping')}">Read mapping constraints ↗</a></div></div>
      ${sectionHead('The known lands and passages','#library?category=Places')}
      <div class="record-grid">${ids.map(recordCard).join('')}</div>
      ${sectionHead('The Seven Independent Khazari Thrones')}
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Throne</th><th>Ruler</th><th>Planning population</th></tr></thead><tbody>${crown.map(r=>{if(!r)return '';let info=r.body.match(/Ruler: ([^.]+)\./);let pop=r.body.match(/planning total: ([\d,]+)/);return `<tr><td><a href="${hrefRecord(r.id)}">${esc(r.title)}</a></td><td>${esc(info?.[1]||'See record')}</td><td>${esc(pop?.[1]||'Open')}</td></tr>`}).join('')}</tbody></table></div>
      ${notice('These figures are overlapping *domain or metropolitan planning envelopes*, not seven fully surveyed city-core censuses. Seven-Throne residents are already counted inside the 144-million global Khazari total.')}`;
  }
  function renderCampaign() {
    const c=base.meta.campaign;
    const days=['autumn-day-19-opening-and-borin','autumn-day-20-quarry-and-research','autumn-day-21-family-supper','autumn-day-22-mine-inspection'].map(byId).filter(Boolean);
    const important=['gloin-hammerfeld','maela-deepforge','borin-ashmantle','hadrik-ironvein','elska-hammerfeld','bruni-hammerfeld'].map(byId).filter(Boolean);
    return `${heading('THE ACTIVE CHRONICLE','Gloin Hammerfeld','The campaign is paused. This reference records what happened—not what is guaranteed to happen next.')}
      <div class="hero" style="min-height:290px"><div class="hero-art" style="opacity:.3"></div><div class="hero-content"><div class="eyebrow">LAST VERIFIED MOMENT · DO NOT ADVANCE</div><h2 class="display-title" style="font-size:clamp(32px,4.2vw,47px)">${esc(c.date)}</h2><div class="scene-time">${esc(c.time)} · ${esc(c.place)}</div><p class="scene-summary">${esc(c.state)}</p><div class="meta-strip"><span>GLOIN · AGE ${c.age}</span><span>FUNDS · ${esc(c.money)}</span></div></div></div>
      <div class="stats-grid"><div class="stat-card"><div class="stat-number">42</div><div class="stat-label">Gloin's age</div></div><div class="stat-card"><div class="stat-number">Day 22</div><div class="stat-label">Current scene</div></div><div class="stat-card"><div class="stat-number">10s 82c</div><div class="stat-label">Last confirmed purse</div></div><div class="stat-card"><div class="stat-number">0</div><div class="stat-label">Predetermined heirs</div></div></div>
      ${sectionHead('The campaign so far')}
      <div class="chapter-grid">${days.map((r,i)=>`<a class="chapter" href="${hrefRecord(r.id)}"><span class="chapter-index">${String(i+19).padStart(2,'0')}</span><div><h3>${esc(r.title.replace(/Autumn Day \d+ — /,''))}</h3><p>${esc(r.summary)}</p></div></a>`).join('')}</div>
      ${sectionHead('Known commitments and boundaries')}
      <div class="overview-grid"><div class="card-panel"><div class="eyebrow">NEXT INTENDED APPOINTMENTS</div><h3 class="minor-title" style="margin-top:12px">Training and research</h3><p>Maela: provisional runesmith apprenticeship twice weekly as schedules allow. Keldrun: civilian combat course, next planned Day 23 morning (time unconfirmed). Bruni: metallurgy lesson Day 23 at 11:30 AM. Elska: discreet ambient-magic research not yet begun.</p></div><div class="card-panel"><div class="eyebrow">WHO KNOWS WHAT</div><h3 class="minor-title" style="margin-top:12px">Knowledge must be earned</h3><p>Maela knows the recent inspection and workshop experiments. Hadrik has not yet heard detailed Day 22 findings. Family members know what Gloin disclosed at supper. No character can infer the First Throne secret or an alleged breach merely because the website contains a theory.</p></div></div>
      ${sectionHead('Key people','#library?category=People%20%26%20NPCs')}
      <div class="record-grid">${important.map(recordCard).join('')}</div>
      ${notice('Gloin’s possible First Throne ancestry remains genuinely undecided. Continue only through the player’s next choice; no implied plot progress is created by editing this site.')}`;
  }
  function renderContinuity() {
    const c=base.meta.continuity;
    const problems=c.filter(x=>['unresolved','source gap'].includes(x.level));
    const protect=c.filter(x=>['protected','guardrail'].includes(x.level));
    return `${heading('THE CANON COURT','Continuity Ledger','A living record of settled corrections, source gaps and mysteries that must not be pre-written.')}
      ${sectionHead('Outstanding reconciliation','',`${problems.length} active items`)}
      <div class="continuity-grid">${problems.map(x=>`<div class="continuity-item"><span class="level level-${esc(slug(x.level))}">● ${esc(x.level)}</span><h3>${esc(x.title)}</h3><p>${esc(x.detail)}</p></div>`).join('')}</div>
      ${sectionHead('Non-negotiable safeguards')}
      <div class="continuity-grid">${protect.map(x=>`<div class="continuity-item"><span class="level level-${esc(x.level)}">✧ ${esc(x.level)}</span><h3>${esc(x.title)}</h3><p>${esc(x.detail)}</p></div>`).join('')}</div>
      ${sectionHead('Status key')}
      <div class="card-panel"><div class="meta-strip">${Object.keys(STATUSES).map(statusChip).join('')}</div><p><strong>Canon</strong> is adopted. <strong>Working lore</strong> is approved for development but revisable. <strong>Reported</strong> is an attributed claim, not proof. <strong>Disputed</strong> preserves conflicting evidence. <strong>Open</strong> is genuinely undecided. <strong>Superseded</strong> remains an archival old version. <strong>Non-canon</strong> is excluded unless reconsidered.</p><div class="continuity-footer">All source revisions should retain the preceding decision, the reason it changed, and the date. No silent overwrites of critical mystery or population facts.</div></div>
      ${sectionHead('Open questions and disputed records','#library?category=Mysteries')}
      <div class="record-grid">${recordsCategory('Mysteries').slice(0,9).map(recordCard).join('')}</div>`;
  }
  function renderRecord(id) {
    const r=byId(id);
    if(!r)return `${heading('ARCHIVE','Record not found','This record may have been renamed or is not in the current edition.')}`+`<a class="btn" href="#library">Return to encyclopedia</a>`;
    const related=(r.related||[]).map(byId).filter(Boolean);
    const similar=allRecords().filter(x=>x.category===r.category&&x.id!==r.id&&!related.some(y=>y.id===x.id)).slice(0,3);
    return `<div class="record-head"><div class="breadcrumbs"><a href="#library">COMPENDIUM</a> <span>›</span> <a href="#library?category=${encodeURIComponent(r.category)}">${esc(r.category.toUpperCase())}</a> <span>›</span> RECORD</div>
      <div class="eyebrow">${esc(r.category)} · ${esc(r.era)}</div><h1 class="page-title">${esc(r.title)}</h1><p class="record-summary">${esc(r.summary)}</p><div class="meta-strip">${statusChip(r.status)} ${r.localDraft?'<span class="status status-working">Local draft override · not published</span>':''}<span>${esc(r.region)}</span><span>UPDATED ${esc(r.updated||'—')}</span></div><div class="record-tags">${(r.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div>
      <div class="record-layout"><div><div class="article-text">${detailText(r.body)}</div>${r.status==='open'||r.status==='disputed'?notice('This entry is not a resolved answer. Do not turn possibilities into canon without the creator’s explicit decision.'):''}
      <div style="margin-top:30px"><button class="btn btn-quiet" type="button" data-edit-id="${esc(r.id)}">✎ Make a local draft revision</button> <button class="btn" type="button" data-share-id="${esc(r.id)}">Copy record link</button></div>
      ${related.length?`${sectionHead('Cross-references')}<div class="related-list">${related.map(x=>`<a href="${hrefRecord(x.id)}">${esc(x.title)} ↗</a>`).join('')}</div>`:''}
      ${sectionHead('More from this section')}
      <div class="record-grid">${similar.map(recordCard).join('')}</div></div>
      <aside class="article-aside"><div class="article-meta"><div class="eyebrow">RECORD DETAILS</div><dl><dt>Canon status</dt><dd>${statusChip(r.status)}</dd><dt>Section</dt><dd>${esc(r.category)}</dd><dt>Period</dt><dd>${esc(r.era)}</dd><dt>Location / scope</dt><dd>${esc(r.region)}</dd><dt>Recorded source</dt><dd>${esc(r.source||'Local draft / user entry')}</dd><dt>Last revised</dt><dd>${esc(r.updated||'—')}</dd></dl></div></aside></div>`;
  }
  function renderDraftDesk(){
    const drafts=Object.values(edits).sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
    const r=selectedDraft?byId(selectedDraft):null;
    const current=r?{...r}:{category:'Foundations',title:'',summary:'',status:'working',era:'Fifth Age',region:'World',tags:[],related:[],body:'',source:'Creator local draft'};
    return `${heading('THE SCRIBE’S DESK','Local Drafts & Edits','Draft additions safely, compare decisions, and export your full World Bible as a JSON file. Nothing is published automatically.',`<button class="btn btn-quiet" id="exportData">↓ Export complete world.json</button>`)}
      <div class="local-banner"><strong>Important:</strong> These changes exist only in <em>this browser on this device</em>. Visitors can make their own private drafts, but they cannot change the official published website. To publish edits, export the JSON and commit it to your authorized GitHub repository. Export regularly—browser data can be cleared. Do not store secrets here; the published repository is public.</div>
      <div class="overview-grid"><div class="card-panel"><div class="eyebrow">${r?'EDIT AN ENTRY':'CREATE A NEW ENTRY'}</div><h2 class="minor-title" style="margin-top:12px">${r?'Draft changes to '+esc(r.title):'Write a new lore record'}</h2>
      <form id="draftForm" autocomplete="off"><div class="form-grid">${field('title','Record title',current.title,true,true)}
      <div class="form-field"><label for="f-category">Section</label><select class="select" id="f-category" name="category">${SHELVES.map(cat=>`<option value="${esc(cat)}" ${current.category===cat?'selected':''}>${esc(cat)}</option>`).join('')}</select></div>
      <div class="form-field"><label for="f-status">Canon status</label><select class="select" id="f-status" name="status">${Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${current.status===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
      ${field('era','Age or era',current.era)}${field('region','Place / scope',current.region)}${field('summary','One-line summary',current.summary,true,true)}${field('tags','Tags · comma-separated',(current.tags||[]).join(', '),false,true)}${field('related','Related record IDs · comma-separated',(current.related||[]).join(', '),false,true)}${field('body','Full text',current.body,true,true,'textarea')}</div>
      <div class="form-actions"><button type="submit" class="btn btn-primary">Save local draft</button><button type="button" class="btn btn-quiet" id="newDraft">New blank record</button>${r&&edits[r.id]?`<button type="button" class="btn btn-danger" data-delete-draft="${esc(r.id)}">Discard draft override</button>`:''}</div>
      </form></div>
      <div class="card-panel"><div class="eyebrow">DRAFT CHANGES</div><h2 class="minor-title" style="margin-top:12px">${drafts.length} local records</h2><div>${drafts.length?drafts.map(x=>`<div class="draft-item"><div><strong>${esc(x.title)}</strong><span class="muted">${esc(x.category)} · ${esc(x.updated||'not dated')}</span></div><button class="btn btn-small" type="button" data-edit-id="${esc(x.id)}">Edit</button></div>`).join(''):'<p>No local drafts saved yet.</p>'}</div><div class="form-actions"><button class="btn btn-quiet" id="exportData2">↓ Export full dataset</button><label class="btn btn-quiet" for="importFile">↑ Import JSON<input type="file" id="importFile" accept=".json,application/json" hidden></label></div><p class="text-small">Import merges records as local draft changes after validation. It does not erase published canon or deploy anything.</p><div class="sidebar-rule" style="margin:20px 0"></div><div class="eyebrow">RECENT LOCAL REVISIONS</div><div style="margin-top:10px">${revisionHistory.slice(0,7).map(h=>`<div class="draft-item"><div><strong>${esc(h.title)}</strong><span class="muted">${esc(h.when)} · ${esc(h.action)}</span></div></div>`).join('')||'<p>No local revision history yet.</p>'}</div></div></div>
      ${notice('Publishing procedure: Export <strong>world.json</strong>, update <code>data/world.json</code> in your GitHub repository (or ask me to make the commit through the GitHub connection), then GitHub Pages republishes the site. The old version remains in Git history.')}`;
  }
  function updateNav(route) {
    document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===route));
    const labels={home:'THE GREAT ARCHIVE',library:'ENCYCLOPEDIA',history:'THE BOOK OF AGES',world:'THE WORLD ATLAS',campaign:'GLOIN HAMMERFELD',continuity:'CANON & CONTINUITY',drafts:'THE SCRIBE’S DESK',sources:'THE COMPLETE SOURCE ARCHIVE',source:'ORIGINAL VOLUME',record:'COMPENDIUM ENTRY'};
    document.getElementById('locationLabel').textContent=labels[route]||'THE GREAT ARCHIVE';
    document.getElementById('navCount').textContent=allRecords().length;
    document.getElementById('draftCount').textContent=Object.keys(edits).length||'';
    const tallies=Object.fromEntries(SHELVES.map(c=>[c,recordsCategory(c).length]));
    shelfNav.innerHTML=SHELVES.map(cat=>`<a href="#library?category=${encodeURIComponent(cat)}"><span class="shelf-dot"></span>${esc(cat)}<span class="nav-count">${tallies[cat]}</span></a>`).join('');
    document.getElementById('footerEdition').textContent=base.meta.edition;
  }
  function route() {
    if(!base)return;
    const hash=decodeURI(location.hash.slice(1)||'home');
    const routeName=hash.startsWith('record/')?'record':hash.startsWith('source/')?'source':hash.split('?')[0]||'home';
    if(routeName==='library'&&hash.includes('?')){
      const query=new URLSearchParams(hash.split('?').slice(1).join('?'));
      libraryFilters.category=query.get('category')||'';
    }
    updateNav(routeName);
    const routes={home:renderOverview,library:renderLibrary,history:renderHistory,world:renderWorld,campaign:renderCampaign,continuity:renderContinuity,drafts:renderDraftDesk,sources:renderSourceArchive};
    if(routeName==='record')root.innerHTML=renderRecord(hash.slice(7));
    else if(routeName==='source'){const id=hash.slice(7);root.innerHTML=renderSourceDetail(id);void loadSourceDetail(id);}
    else root.innerHTML=(routes[routeName]||renderOverview)();
    if(routeName==='library')refreshLibrary();
    if(routeName==='sources')updateSourceArchive();
    document.title=`${routeName==='record'?(byId(hash.slice(7))?.title||'Record'):routeName[0].toUpperCase()+routeName.slice(1)} · Eryndor`;
    closeMobile();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function showToast(message) {
    const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');
    clearTimeout(showToast.timeout);showToast.timeout=setTimeout(()=>el.classList.remove('visible'),3300);
  }
  function closeMobile(){sidebar.classList.remove('open');mobileShade.hidden=true;menuToggle.setAttribute('aria-expanded','false')}
  function toggleMobile(){const open=!sidebar.classList.contains('open');sidebar.classList.toggle('open',open);mobileShade.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open))}
  function addRevision(action,record){revisionHistory.unshift({action,title:record.title,when:new Date().toISOString().slice(0,16).replace('T',' ')});revisionHistory=revisionHistory.slice(0,100);writeStore(HISTORY_KEY,revisionHistory)}
  function startEdit(id){selectedDraft=id;location.hash='#drafts';if(location.hash==='#drafts')route()}
  function saveDraft(form){
    const f=new FormData(form);const title=String(f.get('title')||'').trim();if(!title){showToast('A title is required');return;}
    const id=selectedDraft||slug(title);if(!id){showToast('Please use a title with letters or numbers');return;}
    const prev=byId(id);
    if(!selectedDraft && prev){showToast('A record with this title already exists. Open that record to edit it.');return;}
    const r={id,title,category:String(f.get('category')),status:String(f.get('status')),era:String(f.get('era')||'All Ages').trim(),region:String(f.get('region')||'World').trim(),summary:String(f.get('summary')||'').trim(),body:String(f.get('body')||'').trim(),tags:String(f.get('tags')||'').split(',').map(x=>x.trim()).filter(Boolean),related:String(f.get('related')||'').split(',').map(x=>x.trim()).filter(Boolean),source:prev?.source||'Creator local draft',updated:new Date().toISOString().slice(0,10)};
    const official=base.records.find(x=>x.id===id);
    edits[id]={...(official||{}),...r};
    writeStore(STORAGE_KEY,edits);addRevision(official?'Revised an existing record':'Created a new record',r);
    selectedDraft=id;showToast('Saved on this device only. Export to publish.');route();
  }
  function exportFull(){
    const merged=allRecords().map(({localDraft,...r})=>r);
    const output={meta:{...base.meta,edition:base.meta.edition+' · export',localExport:true,exported:new Date().toISOString(),notice:base.meta.notice},records:merged};
    const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'});
    const objectURL=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=objectURL;a.download='world.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);
    showToast('Complete world.json exported. Nothing has been published.');
  }
  async function importJSON(file){
    if(!file)return;try{
      if(file.size>15_000_000)throw new Error('File is too large');
      const payload=JSON.parse(await file.text());if(!payload||!Array.isArray(payload.records))throw new Error('Expected a JSON object with a records array');
      if(payload.records.length>20000)throw new Error('Too many entries');
      const ids=new Set();let changes=0;
      for(const x of payload.records){
        if(!x||typeof x!=='object'||typeof x.title!=='string'||typeof x.body!=='string'||typeof x.id!=='string'||!/^[a-z0-9-]{2,120}$/.test(x.id)||ids.has(x.id))throw new Error('Invalid or duplicate record ID');
        if(!SHELVES.includes(x.category)||!STATUSES[x.status])throw new Error('Unknown section or status in '+x.id);
        if(x.body.length>150000||x.title.length>250)throw new Error('Oversized record '+x.id);
        ids.add(x.id);
      }
      for(const x of payload.records){
        const prev=byId(x.id);
        if(JSON.stringify({...prev,localDraft:undefined})!==JSON.stringify({...x,localDraft:undefined})){
          edits[x.id]={id:x.id,title:x.title,body:x.body,summary:String(x.summary||''),status:x.status,category:x.category,era:String(x.era||'All Ages'),region:String(x.region||'World'),tags:Array.isArray(x.tags)?x.tags:[],related:Array.isArray(x.related)?x.related:[],source:String(x.source||'Imported record'),updated:new Date().toISOString().slice(0,10)};
          changes++;
        }
      }
      writeStore(STORAGE_KEY,edits);addRevision('Imported '+changes+' changed records',{title:file.name});showToast(`${changes} local record drafts imported; not published.`);route();
    }catch(err){showToast('Import failed: '+err.message)}
  }
  document.addEventListener('click', e=>{
    const format=e.target.closest('[data-source-format]');if(format){showSourceFormat(location.hash.slice(8),format.dataset.sourceFormat);return;}
    if(e.target.closest('#deepArchiveSearch')){void indexFullSourceArchive();return;}
    const edit=e.target.closest('[data-edit-id]');if(edit){e.preventDefault();startEdit(edit.dataset.editId);return;}
    const copy=e.target.closest('[data-share-id]');if(copy){e.preventDefault();const link=location.origin+location.pathname+hrefRecord(copy.dataset.shareId);if(navigator.clipboard?.writeText)navigator.clipboard.writeText(link).then(()=>showToast('Record link copied')).catch(()=>showToast('Copy the address from the browser.'));else showToast('Copy the address from the browser.');return;}
    if(e.target.closest('#exportData')||e.target.closest('#exportData2')){e.preventDefault();exportFull();return;}
    if(e.target.closest('#newDraft')){e.preventDefault();selectedDraft=null;route();return;}
    const del=e.target.closest('[data-delete-draft]');if(del){e.preventDefault();const id=del.dataset.deleteDraft;if(confirm('Discard this local draft override? Official published records will not change.')){const r=edits[id];delete edits[id];writeStore(STORAGE_KEY,edits);addRevision('Discarded local draft',r||{title:id});selectedDraft=null;route();}return;}
    const cat=e.target.closest('[data-cat]');if(cat){libraryFilters.category=cat.dataset.cat;refreshLibrary();return;}
    if(e.target.closest('#clearFilters')){libraryFilters={q:'',category:'',status:'',era:''};route();return;}
  });
  document.addEventListener('input',e=>{if(e.target.id==='librarySearch'){libraryFilters.q=e.target.value;refreshLibrary();}
    if(e.target.id==='sourceSearch'){sourceSearchQuery=e.target.value;updateSourceArchive();}});
  document.addEventListener('change',e=>{
    if(e.target.id==='statusFilter'){libraryFilters.status=e.target.value;refreshLibrary();}
    if(e.target.id==='sourceGroupFilter'){sourceFilterGroup=e.target.value;updateSourceArchive();}
    if(e.target.id==='eraFilter'){libraryFilters.era=e.target.value;refreshLibrary();}
    if(e.target.id==='importFile')importJSON(e.target.files?.[0]);
  });
  document.addEventListener('submit',e=>{if(e.target.id==='draftForm'){e.preventDefault();saveDraft(e.target);}});
  document.getElementById('searchTrigger').addEventListener('click',()=>{location.hash='#library';setTimeout(()=>document.getElementById('librarySearch')?.focus(),60)});
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();location.hash='#library';setTimeout(()=>document.getElementById('librarySearch')?.focus(),50)}
    if(e.key==='Escape')closeMobile();
  });
  menuToggle.addEventListener('click',toggleMobile);mobileShade.addEventListener('click',closeMobile);
  window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#drafts'))selectedDraft=null;route()});
  fetch(DATA_URL,{cache:'no-cache'}).then(async response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json()}).then(data=>{
    if(!data?.records||!data?.meta)throw new Error('Invalid archive format');base=data;fetch('./data/source-index.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Source index HTTP '+r.status);return r.json()}).then(index=>{sourceIndex=index;route()}).catch(()=>route());
  }).catch(err=>{
    root.innerHTML=`<div class="eyebrow">ARCHIVE UNAVAILABLE</div><h1 class="page-title">Could not load the World Bible</h1><p class="page-description">${esc(err.message)}. This site needs to be served by GitHub Pages or a local web server. Opening index.html directly as a file may block JSON loading.</p><div class="notice">For local testing, from the website folder run <code>python3 -m http.server 8000</code> and open <code>http://localhost:8000</code>.</div>`;
  });
})();