/* Eryndor Complete Source Vault: full-text preservation, reader and searching. No dependencies. */
(()=>{
  'use strict';
  const manifestUrl='./data/source-vault-index.json';
  const byId=id=>document.getElementById(id);
  const groupsEl=byId('vaultGroups');
  const resultsEl=byId('vaultResults');
  const mainEl=byId('vaultMain');
  const inputEl=byId('vaultSearch');
  let manifest=null;
  let activeGroup='All';
  let activeQuery='';
  let activeDocId=null;
  let readingRaw=false;
  let searchBusy=false;
  const cache=new Map();
  const esc=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatSize=n=>n>1_000_000?(n/1_000_000).toFixed(1)+' MB':Math.round(n/1000)+' KB';
  const sourceHref=id=>'#source/'+id;
  const groupLabel=g=>g==='World Bible'?'The World Bible':g;
  const externalLink=(url,label)=>{ if(!/^https:\/\//i.test(String(url)))return esc(label);return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;};

  async function loadManifest(){
    const res=await fetch(manifestUrl,{cache:'no-cache'});
    if(!res.ok)throw new Error('Source index unavailable: HTTP '+res.status);
    const doc=await res.json();
    if(!Array.isArray(doc.sources)||!doc.sources.length)throw new Error('Invalid source index');
    const ids=new Set();
    for(const page of doc.sources){
      if(!/^[0-9a-f-]{36}$/i.test(page.id)||ids.has(page.id)||!page.path.startsWith('./data/source-vault/'))throw new Error('Invalid source index entry');
      ids.add(page.id);
    }
    return doc;
  }
  async function fetchDoc(item){
    if(!item)throw new Error('Unknown Eryndor source');
    if(cache.has(item.id))return cache.get(item.id);
    const promise=fetch(item.path,{cache:'no-cache'}).then(async response=>{
      if(!response.ok)throw new Error('Unable to load '+item.title+' (HTTP '+response.status+')');
      const doc=await response.json();
      if(doc.id!==item.id||typeof doc.rawNotionMarkup!=='string')throw new Error('Invalid source data: '+item.title);
      return doc;
    });
    cache.set(item.id,promise);
    try{return await promise;}catch(error){cache.delete(item.id);throw error;}
  }
  function groupCounts(){
    return [['All',manifest.sources.length],...manifest.groups.map(group=>[group,manifest.sources.filter(x=>x.group===group).length])];
  }
  function matchSource(item){
    if(activeGroup!=='All'&&item.group!==activeGroup)return false;
    if(!activeQuery.trim())return true;
    const words=activeQuery.toLocaleLowerCase().trim().split(/\s+/);
    const text=[item.title,item.group,item.authority].join(' ').toLocaleLowerCase();
    return words.every(word=>text.includes(word));
  }
  function refreshSidebar(){
    groupsEl.innerHTML=groupCounts().map(([label,count])=>`<button class="vault-group ${activeGroup===label?'active':''}" data-vault-group="${esc(label)}" type="button">${esc(groupLabel(label))}<span>${count}</span></button>`).join('');
    const candidates=manifest.sources.filter(matchSource);
    resultsEl.innerHTML=`<div class="vault-results-count">${candidates.length} of ${manifest.sources.length} source volumes</div>`+
      (candidates.length?candidates.map(item=>`<a href="${sourceHref(item.id)}" class="vault-result ${activeDocId===item.id?'active':''}"><strong>${esc(item.title)}</strong><small>${esc(item.group)} · ${formatSize(item.bytes)}</small></a>`).join(''):`<div class="vault-empty">No titles match those filters. For a search inside every chapter, use the full-text search button in the reading pane.</div>`);
  }
  function introPage(){
    const filtered=manifest.sources.filter(matchSource);
    mainEl.innerHTML=`<div class="vault-document"><div class="vault-subhead">COMPLETE NOTION SOURCE RECORDS</div>
      <h2 class="vault-doc-heading">${activeGroup==='All'?'The entire preserved archive':esc(groupLabel(activeGroup))}</h2>
      <div class="vault-source-callout">${esc(manifest.notice)} The source documents are maintained as original historical records; they are not all equally authoritative. The curated <a href="./index.html#library">Encyclopedia</a> remains the working index of accepted canon.</div>
      <div class="vault-doc-actions"><button id="vaultSearchAll" class="vault-btn primary" ${searchBusy?'disabled':''}>⌕ Search inside all ${manifest.sources.length} complete documents</button><span style="font-size:12px;color:#a6b3b6">Enter a phrase in the left search field first</span></div>
      <div class="vault-source-list">${filtered.map(item=>`<a class="vault-source-card" href="${sourceHref(item.id)}"><small>${esc(item.group)}</small><strong>${esc(item.title)}</strong><p>${formatSize(item.bytes)} · ${esc(item.authority)}</p></a>`).join('')||'<p>No matching documents.</p>'}</div></div>`;
    document.title='Complete Source Vault · Eryndor';
  }
  function cleanNotion(text){
    return String(text)
      .replace(/<callout\b[^>]*>/g,'\n').replace(/<\/callout>/g,'\n')
      .replace(/<page\b[^>]*>/g,'\n').replace(/<\/page>/g,'\n')
      .replace(/<mention\b[^>]*>/g,'').replace(/<\/mention>/g,'')
      .replace(/<b>/g,'**').replace(/<\/b>/g,'**')
      .replace(/<strong>/g,'**').replace(/<\/strong>/g,'**')
      .replace(/<i>/g,'*').replace(/<\/i>/g,'*')
      .replace(/<u>/g,'').replace(/<\/u>/g,'')
      .replace(/<table\b[^>]*>/g,'\n').replace(/<\/table>/g,'\n')
      .replace(/<tr\b[^>]*>/g,'\n').replace(/<\/tr>/g,'\n')
      .replace(/<td\b[^>]*>/g,' | ').replace(/<\/td>/g,'')
      .replace(/<[^>]+>/g,'')
      .replace(/&nbsp;/g,' ').replace(/&quot;/g,'"')
      .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
  function inlineContent(src){
    let text=esc(src);
    text=text.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
    text=text.replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
    text=text.replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,(_full,label,url)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    return text;
  }
  function renderReadable(markup){
    const lines=cleanNotion(markup).replace(/\r/g,'').split('\n');
    const result=[];
    let paragraph=[],items=[],ordered=false,code=[],isCode=false;
    const flushParagraph=()=>{if(paragraph.length){result.push(`<p>${paragraph.map(inlineContent).join('<br>')}</p>`);paragraph=[];}};
    const flushItems=()=>{if(items.length){const type=ordered?'ol':'ul';result.push(`<${type}>${items.map(x=>`<li>${inlineContent(x)}</li>`).join('')}</${type}>`);items=[];}};
    const flushCode=()=>{if(code.length){result.push(`<pre class="vault-source-raw">${esc(code.join('\n'))}</pre>`);code=[];}};
    for(const line of lines){
      const trimmed=line.trim();
      if(/^```/.test(trimmed)){flushParagraph();flushItems();if(isCode){flushCode();isCode=false;}else{isCode=true;}continue;}
      if(isCode){code.push(line);continue;}
      const heading=trimmed.match(/^(#{1,5})\s+(.+)$/);
      if(heading){flushParagraph();flushItems();const h=Math.min(5,heading[1].length+1);result.push(`<h${h}>${inlineContent(heading[2])}</h${h}>`);continue;}
      if(!trimmed){flushParagraph();flushItems();continue;}
      if(/^---+$/.test(trimmed)){flushParagraph();flushItems();result.push('<hr class="vault-rule">');continue;}
      const bullet=trimmed.match(/^[-*]\s+(.+)$/),enumerated=trimmed.match(/^\d+[.)]\s+(.+)$/);
      if(bullet||enumerated){flushParagraph();const currentOrdered=!!enumerated;if(items.length&&ordered!==currentOrdered)flushItems();ordered=currentOrdered;items.push((bullet||enumerated)[1]);continue;}
      flushItems();paragraph.push(trimmed);
    }
    flushParagraph();flushItems();flushCode();
    return result.join('\n');
  }
  async function openSource(id){
    const item=manifest.sources.find(x=>x.id===id);
    activeDocId=item?.id??null;
    refreshSidebar();
    if(!item){mainEl.innerHTML='<div class="vault-blank">This source does not exist in the archive. <a href="#">Return to the source list.</a></div>';return;}
    mainEl.innerHTML='<div class="vault-loading">Loading the complete text of this volume…</div>';
    try{
      const doc=await fetchDoc(item);
      if(location.hash!=='#source/'+id)return;
      const contents=readingRaw?`<pre class="vault-source-raw" id="vaultOriginal">${esc(doc.rawNotionMarkup)}</pre>`:`<div class="vault-doc-body">${renderReadable(doc.rawNotionMarkup)}</div>`;
      mainEl.innerHTML=`<article class="vault-document"><div class="vault-subhead">${esc(item.group)} · ${esc(item.authority)}</div>
        <h1 class="vault-doc-heading">${esc(item.title)}</h1>
        <div class="vault-doc-meta">Unabridged source material · ${formatSize(item.bytes)} · <strong>Not automatically current canon</strong></div>
        <div class="vault-doc-actions"><a class="vault-btn" href="#">← All source volumes</a>
          <button class="vault-btn ${!readingRaw?'primary':''}" data-vault-view="read" type="button">Readable chapter</button>
          <button class="vault-btn ${readingRaw?'primary':''}" data-vault-view="raw" type="button">Exact original markup</button>
          <button class="vault-btn" data-vault-copy="${item.id}" type="button">Copy source text</button>
          ${externalLink(doc.sourceUrl??item.sourceUrl,'Original Notion page ↗')}
        </div>
        <div class="vault-source-callout">This volume reproduces the preserved source text. Its original markup is available using “Exact original markup.” Older source versions may contain superseded facts, and gaps in original conversations remain explicitly unresolved.</div>
        ${contents}</article>`;
      document.title=item.title+' · Eryndor Archive';
    }catch(error){mainEl.innerHTML=`<div class="vault-blank">${esc(error.message)}<p><a href="#">Return to the source list.</a></p></div>`;}
  }
  async function runFullSearch(){
    const query=inputEl.value.trim();
    if(query.length<2){mainEl.innerHTML='<div class="vault-blank">Enter at least two characters into the source search field, then select “Search inside all complete documents.”</div>';return;}
    if(searchBusy)return;
    activeQuery=query;
    searchBusy=true;
    mainEl.innerHTML=`<div class="vault-document"><div class="vault-subhead">WHOLE-ARCHIVE CONTENT SEARCH</div><h1 class="vault-doc-heading">Searching ${manifest.sources.length} complete documents</h1><p class="vault-search-status" id="vaultProgress">Loading source pages…</p><div id="vaultHits"></div></div>`;
    const phrase=query.toLocaleLowerCase();
    const tokens=phrase.split(/\s+/).filter(Boolean);
    const sources=manifest.sources;
    let complete=0,failed=[];
    const hitlist=[];
    // Bound network parallelism, so mobile devices remain usable on slower connections.
    const concurrency=6,workers=[];
    let cursor=0;
    const work=async()=>{
      while(cursor<sources.length){
        const index=cursor++,item=sources[index];
        try{
          const doc=await fetchDoc(item);
          const raw=doc.rawNotionMarkup.toLocaleLowerCase();
          const title=item.title.toLocaleLowerCase();
          if(tokens.every(t=>raw.includes(t)||title.includes(t))){
            let pos=raw.indexOf(phrase);
            if(pos<0)pos=raw.indexOf(tokens[0]);
            const from=Math.max(0,pos-115),to=Math.min(doc.rawNotionMarkup.length,pos+210);
            let preview=doc.rawNotionMarkup.slice(from,to).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
            hitlist.push({item,preview});
          }
        }catch(error){failed.push({name:item.title,error:error.message});}
        complete++;
        const progress=byId('vaultProgress');if(progress)progress.textContent=`Examined ${complete} of ${sources.length} unabridged documents… ${hitlist.length} matching volume(s).`;
      }
    };
    for(let i=0;i<concurrency;i++)workers.push(work());
    await Promise.all(workers);
    searchBusy=false;
    hitlist.sort((a,b)=>a.item.title.localeCompare(b.item.title));
    mainEl.innerHTML=`<div class="vault-document"><div class="vault-subhead">WHOLE-ARCHIVE FULL-TEXT SEARCH</div><h1 class="vault-doc-heading">${hitlist.length} matching source volumes</h1>
      <p class="vault-search-status">Searched ${complete-failed.length} of ${sources.length} complete documents for “${esc(query)}”. ${failed.length?`${failed.length} pages could not be loaded and are listed below.`:'Every archived source was checked.'}</p>
      <div class="vault-doc-actions"><button id="vaultSearchAll" class="vault-btn primary">Search again</button><a href="#" class="vault-btn">Browse all volumes</a></div>
      ${hitlist.map(({item,preview})=>`<a href="${sourceHref(item.id)}" class="vault-search-card"><strong>${esc(item.title)}</strong><small>${esc(item.group)}</small><p>${esc(preview)}</p></a>`).join('')||'<div class="vault-blank">No matches in the recovered archive. Try a shorter name or another spelling.</div>'}
      ${failed.length?`<div class="vault-source-callout">Failed source loads: ${failed.map(x=>esc(x.name)).join('; ')}. Results are incomplete until those pages load.</div>`:''}</div>`;
  }
  function reroute(){
    if(!manifest)return;
    const route=decodeURIComponent(location.hash.slice(1));
    if(route.startsWith('source/'))openSource(route.slice(7));
    else{activeDocId=null;refreshSidebar();introPage();}
    window.scrollTo({top:0,behavior:'instant'});
  }
  inputEl.addEventListener('input',()=>{activeQuery=inputEl.value;refreshSidebar();if(!location.hash||location.hash==='#')introPage();});
  document.addEventListener('click',async e=>{
    const group=e.target.closest('[data-vault-group]');
    if(group){activeGroup=group.dataset.vaultGroup;refreshSidebar();if(activeDocId){location.hash='#';}else introPage();return;}
    const view=e.target.closest('[data-vault-view]');
    if(view){readingRaw=view.dataset.vaultView==='raw';if(activeDocId)openSource(activeDocId);return;}
    const copy=e.target.closest('[data-vault-copy]');
    if(copy){const item=manifest?.sources.find(x=>x.id===copy.dataset.vaultCopy);if(!item)return;try{const doc=await fetchDoc(item);await navigator.clipboard.writeText(doc.rawNotionMarkup);copy.textContent='Copied to clipboard ✓';}catch{copy.textContent='Select text in Exact original markup to copy';}return;}
    if(e.target.closest('#vaultSearchAll')){e.preventDefault();await runFullSearch();}
  });
  window.addEventListener('hashchange',reroute);
  loadManifest().then(index=>{
    manifest=index;
    byId('vaultCount').textContent=String(index.sourceCount);
    byId('vaultSize').textContent=formatSize(index.totalBytes);
    refreshSidebar();
    reroute();
  }).catch(error=>{
    mainEl.innerHTML=`<div class="vault-blank">Could not open the source index: ${esc(error.message)}. You can still browse the <a href="./index.html#library">working encyclopedia</a>.</div>`;
    resultsEl.textContent='Source index unavailable';
  });
})();