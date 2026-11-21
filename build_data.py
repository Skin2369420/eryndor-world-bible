import json,re,datetime
from pathlib import Path
root=Path(__file__).parent
records=[]
def add(category,title,summary,body, status='canon', era='All Ages',region='World',tags=(),related=(),source='Eryndor Edition II / consolidated canon'):
    rid=re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-')
    if any(r['id']==rid for r in records):
        raise ValueError('Duplicate id '+rid)
    records.append(dict(id=rid,category=category,title=title,summary=summary,body=body,status=status,era=era,region=region,tags=list(tags),related=list(related),source=source,updated='2026-11-21'))

add('Foundations','Eryndor — Planetary Fundamentals','A five-continent, magically alive world, approximately 50,000 km in diameter.',
"Eryndor is approximately 50,000 km in diameter and 157,080 km around. Its surface is 60% water and 40% land. A 24-hour day, 360-day year, and four roughly 90-day seasons govern the working calendar.\n\nThe older 13,400-km diameter, 42,000-km circumference and 71%-water model are superseded.\n\nEveryday experienced gravity, hydrology, weather, agriculture and biology resemble ordinary physics; the explanation for familiar surface gravity on so large a planet is still undecided. World magic is a deliberate fantasy exception.",tags=['planet','cosmology','calendar'],related=['the-five-continents','natural-magic-the-worlds-breath'])
add('Foundations','The Five Continents','Avarra, Tharvorn, Sahrad, Orundel, Vaelora.',
"Avarra is Gloin Hammerfeld's principal campaign continent. Tharvorn is northern, Sahrad southern, Orundel eastern and Vaelora western. Every continent contains multiple peoples, states and traditions.\n\nTwin Titans dry-land shares: Avarra 32%, Orundel 28%, Tharvorn 12%, Sahrad 12%, Vaelora 11%, islands and separate archipelagos 5%. No island territory should be counted twice. Coastlines, countries, mapping scales and precise intercontinental routes await further survey.",related=['eryndor-planetary-fundamentals'],tags=['map','geography','twin titans'])
add('Foundations','World Tone and Creative Rules','Dark and gritty yet hopeful; no species is uniformly good or evil.',
"Eryndor contains exploitation, conquest, famine, prejudice and catastrophic loss, alongside friendship, celebration, scholarship, rescue and reform. Consequences matter. Fantasy-scale cities and heroes are allowed without requiring Earth-historical ceilings.\n\nLong-lived peoples can have large families; birth rates are not silently adjusted. A person may devote a century to a craft or choose domestic life; cultures have distinct expectations. No single trait determines everyone in a people. The creator can revise accepted canon with explicit supersession and a retained change log.",tags=['tone','society','continuity'])
add('Foundations','Ages Versus Eras','Worldwide Ages are not the same as continent-specific historical eras.',
"Five worldwide Ages are recognized; the current one is the Fifth Age. Each civilization may name and subdivide historical time differently. The Second Age's Awakening, Wonder and Fire divisions are Avarran conventions, not mandatory world calendars.\n\nThe campaign's date is Autumn Day 22, Year 3847 of the Era of Crowns, within the Fifth Age. That year number must not automatically be counted from the global beginning of the Fifth Age.",related=['the-second-age-avarran-chronology','current-campaign-pause'],tags=['calendar','ages','eras'])
add('Foundations','Current World Population','2.0628 billion modeled residents across 28 numerical categories.',
"The current sixfold planning census contains 2,062,800,000 modeled residents: Avarra 1,019,760,000; Tharvorn 171,000,000; Sahrad 282,222,000; Orundel 393,600,000; Vaelora 196,218,000. This replaces a 343.8-million draft.\n\nGlobal Khazari 144 million, Eldar 108 million, Urakai 186 million, humans 960 million. The Seven Khazari Throne domains total 132 million and are INCLUDED within worldwide Khazari; Karak-Varn's 22.8 million are included within the Thrones. Drakari, Aelwyn and Living Mountains are not precisely enumerated.\n\nThis is a worldbuilding resimulation, not sudden births or a confirmed omniscient census. Metro-versus-domain boundaries need reconciliation.",tags=['census','population','scale'])
add('Foundations','World Geography Awaiting Remapping','A vast planet needs resurveyed roads, coastlines, maps and densities.',
"The adopted 50,000-km world and the Twin Titans land allocation supersede earlier diagrams. Broad historical geography and relative regional relations survive, but many route lengths, schematics, old (x,y) throne coordinates and map-image scale bars are still provisional.\n\nExact river sources, political boundaries, coastlines, local population envelopes and long-distance voyage durations require later consistent mapping. Illustrative maps do not establish canon by themselves.",status='open',tags=['atlas','mapping','unresolved'])

ages=[
('First Age','Its length is unknown and no authentic contemporary records survive. Old stories describe extraordinary prosperity, but their historical accuracy is unverified. It ended when the First Great Cataclysm destroyed or shattered moons. Lost moon-specific magics did not return.', 'open','First Age'),
('First Great Cataclysm','Catastrophic alteration of the earlier lunar system ended the First Age. Destroyed moons permanently ended their associated magical powers; fragments of some shattered bodies became new moons and new magical sources. The exact collision mechanism and old moon count remain unknown.','canon','End of First Age'),
('The Second Age — Avarran Chronology','Exactly 1,437 years worldwide, divided in Avarran histories into Awakening (1–321), Wonder (322–1,321) and Fire (1,322–1,437). Other continents may use different names, eras and date boundaries.','canon','Second Age'),
('Era of Awakening','Years 1–321 in Avarran chronology. Peoples rebuilt after lunar disruption, learned to support their societies through mundane agriculture, engineering, records and sanitation alongside surviving magic. Unequal recovery, famine, exploitation and reform all occurred.','canon','Second Age'),
('Era of Wonder','Years 322–1,321 in Avarran chronology. A thousand-year flourishing of new fragment-moon magics, engineering, art, education, medicine, trade and great kingdoms, with continuing inequality, conflict and reform. The destroyed First Age magics were not recovered.','canon','Second Age'),
('Era of Fire','Years 1,322–1,437 in Avarran chronology. Exiled dark mages transformed fertile southeastern Avarra into the Southern Wastes and created its volcano. Elsewhere, independent kingdoms and cultures continued their own histories. This era is NOT blank: dedicated annals and regional histories exist.','canon','Second Age'),
('Southern Wastes Dark Mages','At the start of the Era of Fire, communities exiled mages who had accessed dark magic. The mages gathered in southeastern Avarra, destroyed fertile farming land by magic, created a volcano and lived in isolation without external diplomacy or trade. The mages survived far into the Third Age. Their identities and ultimate fate remain open.','canon','Second and Third Ages'),
('End of Second Age — Global Earthquakes','In Second Age Year 1,437, planet-wide earthquakes struck Eryndor. The already ancient Ironspine mountain ring amplified and transmitted aftershocks approximately tenfold globally. Extreme-western Avarran lowlands rose into new mountains; these are not the Ironspine. Many individuals perished, but no existing species was wiped out. An unnamed magic helped prevent extinction; its mechanism remains open.','canon','End of Second Age'),
('The Created Southern Volcano','Created by the dark mages at the start of the Era of Fire. The end-of-Age earthquakes intensified it. Mages harnessed and restrained its potential eruption, limiting destruction but unknowingly increasing their own magical power. The intervention does not guarantee there was no eruption, damage or death.','canon','Second Age'),
('Third Age Framework','A proposed span of 8,873 years, using nine Avarran eras whose individual names, year ranges and events have not been finalized. This is a working framework, not universal era terminology.','working','Third Age'),
('Creation of the Orcs','Sometime in the Third Age, surviving dark mages from the Southern Wastes created the Orcs/Urakai by an undecided method. Their aim was to besiege Khazari strongholds and eventually attack Eldar and human kingdoms. No Orc existed in either the First or Second Age. The objectives are confirmed, but whether particular assaults actually occurred is open.','canon','Third Age'),
('Fourth Age Framework','World Age immediately preceding the current Fifth Age. Exact duration, chronology, disasters, kingdoms and transitions need development; do not manufacture a bridging history without a canon decision.','open','Fourth Age'),
('Fifth Age — Era of Crowns','The campaign takes place in the Fifth Age, Year 3,847 of Avarra’s Era of Crowns. The start of this era is not automatically the same as the start of the worldwide Fifth Age. Other current continental eras remain undecided.','canon','Fifth Age'),
('Concord of Crowns','An uneasy settlement among major powers has helped maintain peace for nearly two centuries before the campaign opening. Exact treaty terms and signatories remain incompletely recorded; not all regions are peaceful.','canon','Fifth Age'),
('Eastern–Western Wars Involving Orcs','Historical Goblin and Ogre alliances with Orc forces, and the wars contributing to western prejudices, must be dated to the Third Age or later, because Orcs did not exist before then. Exact wars, leaders and dates are open.','canon','Third Age and later'),
]
for title,body,status,era in ages:
    add('History',title,body.split('.')[0]+'.',body,status=status,era=era,region='World' if title not in ('Era of Fire','Southern Wastes Dark Mages','The Created Southern Volcano') else 'Avarra',tags=['chronology','history'])

areas=[
('Avarra','Principal campaign continent. Ancient Ironspine ring, Seven Thrones, Veiled Inland Sea, Letharion, Aldermere, Valtoria, far-western uplift and southeastern Southern Wastes.', 'canon'),
('Tharvorn','Northern continent of winter coasts, forests, mountains, fjords, upland strongholds and independent maritime cultures.','canon'),
('Sahrad','Southern continent of great river systems, farming basins, desert corridors, oases, scholarly institutions and varied states.','canon'),
('Orundel','Eastern continent of rainforests, highlands, rivers, grasslands, civic river leagues and independent cultures.','canon'),
('Vaelora','Western continent of great forests, lakes, coastal courts, small hidden settlements and complex social traditions.','canon'),
('Ironspine Mountains','Vast, discontinuous ancient mountain system forming a ring around the Veiled Inland Sea. Predates the First Age, and amplified earthquakes at the end of the Second Age. Home to the Seven Khazari Thrones.','canon'),
('Veiled Inland Sea','Hidden or unusually inaccessible inland water body enclosed by the Ironspine ring, with shore settlements. Its precise magical concealment and possible lunar relation remain unresolved.','open'),
('New Western Avarran Mountains','Extreme-western tip of Avarra, raised during the Second Age-ending global earthquakes. Not the ancient Ironspine. Exact range name and final boundaries need confirmed mapping.','canon'),
('Southern Wastes','Southeastern Avarran badlands magically transformed from fertile farmland by exiled dark mages at the start of the Era of Fire; include their artificially created volcano.','canon'),
('Letharion','Great Eldar woodland realm in western Avarra, with recognized High Sovereign, independent subcultures and forest communities.','canon'),
('Aldermere','Human state with diverse practical and duty-centered traditions. Reports indicate Valtorian military mobilization near its frontier.','canon'),
('Valtoria','Powerful human empire with military and bureaucratic institutions; troop movement near Aldermere is reported, not an established war.','canon'),
('Northern Holds','Northern human cultural and political grouping. Three unnamed mountain holds lost communication in opening rumors, but must not be assumed to be among the Seven Great Thrones.','canon'),
('Merchant Republics','Varied maritime and commercial states governed through merchant influence and diverse civic structures.','canon'),
('Southern Sultanates','Varied southern scholarly, ceremonial and trade-oriented states, not a single unified culture.','canon'),
('Eastern Grasslands','Avarran prairie/grassland societies, including Centaur and mixed towns. Current canon does not place established Urakai cities there; such towns belong to southeastern badlands and neighboring regions.','canon'),
('Shattered Isles','Named islands and coastal region with maritime and independent cultures; exact map boundaries still being developed.','working'),
('The Seven Khazari Thrones','Seven independent Ironspine mountain kingdoms linked by trade, diplomacy and Deepways; 132 million modeled domain residents combined, including 22.8 million in the Karak-Varn planning envelope.','canon'),
('Deepways','Khazari underground travel and freight network, with tolls, guarded junctions, flood risks and imperfect access. No instant teleportation; large caravan journeys take days or longer.','canon'),
]
for title,body,status in areas:add('Places',title,body.split('.')[0]+'.',body,status=status,region=title if title in ('Avarra','Tharvorn','Sahrad','Orundel','Vaelora') else 'Avarra',tags=['atlas','geography'])

thrones=[('Karak-Varn','King Durgan IV Stonehand','22,800,000','Iron and weapons, archives, mining, military engineering.'),('Az-Rhumen','Queen Osma Scaleweaver','18,600,000','Surveying, runic mathematics, stonecutting, Deepway standards.'),('Thar-Keld','King Hadrun Ashpeak','19,200,000','Alpine metals, northern trade, snow tunnels, winter engineering.'),('Durn-Khaz','Queen Berra Flintmantle','18,000,000','Deep cavern agriculture, water capture and ventilation.'),('Karak-Orun','King Torven Blackanvil','18,600,000','Eastern toll gates, armour, wagonworks and border contracts.'),('Morn-Tar','Queen Drena Saltvein','18,000,000','Underground lakes, aquaculture, hydraulics, copper and canals.'),('Vuldur-Kaz','King Borrum Cindergate','16,800,000','Geothermal crafts, glass, refractories and furnace iron.')]
for title,ruler,pop,spec in thrones:
    add('Realms',title,f'Independent Khazari Throne ruled by {ruler}.',f'{title} is one of the seven independent Khazari Mountain Thrones in the ancient Ironspine system. Current adopted sixfold resident/domain planning total: {pop}. Ruler: {ruler}. Key industries and traditions: {spec}\n\nThe reported total is a domain/metropolitan envelope, not necessarily only the core city. Exact urban/territorial population boundaries need mapping. Other Throne populations are part of the 132-million subtotal and must not be added again to the global Khazari figure.',status='canon' if title=='Karak-Varn' else 'working',region='Avarra',tags=['throne','kingdom','khazari'],related=['the-seven-khazari-thrones','deepways'])

culture_names=[
('Khazari','Dwarves; seven independent Throne cultures, expert engineering and the contribution ethic. Large family traditions coexist with centuries of specialized craft.','144,000,000'),
('Eldar','Elves; ancient woodlands, art, scholarship and multiple independently evolving cultures. Do not equate long lifespan with uniform birth rates or priorities.','108,000,000'),
('Urakai','Orcs, created during the Third Age. Modern societies have independent cities, crafts, laws, institutions, families and morality; diverse cultures in the southeastern badlands and elsewhere.','186,000,000'),
('Humans','Countless nations, traditions and occupations across all five continents. No single human morality or political model.','960,000,000'),
('Halflings','Farming, trade, community institutions and diverse urban and rural traditions.','72,000,000'),
('Gnomes','Invention, craft, scholarship, city and countryside communities, with varied individual livelihoods.','42,000,000'),
('Goblins','Independent urban and rural cultures, craft, trade, political participation and persecution in some regions; stereotypes are not innate truths.','84,000,000'),
('Ents','Ancient woodland people with varied attitudes to stewardship, settlement and roads.','1,200,000'),
('Centaurs','Grassland and settled communities with complex passage, water and political customs.','42,000,000'),
('Merfolk','Diverse maritime, coastal and riverine societies with trade and law.','72,000,000'),
('Giants','Varied mountain, upland and northern peoples, not all solitary monsters.','3,600,000'),
('Wolvenkin','Distinctive communities, rescue professions, family and civic traditions.','24,000,000'),
('Foxfolk','Diverse trading, farming, scholarly, diplomatic and mixed-community traditions.','24,000,000'),
('Lionfolk','Distinctive cultures across savannas, cities and other lands; civic law and social difference.','18,000,000'),
('Tigerfolk','Regional river and woodland cultures, medicine, travel, scholarship and varied political traditions.','18,000,000'),
('Elephantfolk','Independent cultures, often associated with water-law and records in some regions, not biologically fixed roles.','18,000,000'),
('Bearfolk','Northern, temperate and city cultures, including shelter, medicine, craft and civic institutions.','18,000,000'),
('Cowfolk','Agricultural, scholarly, trade and city life across multiple continents.','30,000,000'),
('Pigfolk','Craft, cooking, trade, engineering and varied settlements.','36,000,000'),
('Kobolds','Subterranean and surface settlements; safe engineering and craft traditions alongside varied reputations.','42,000,000'),
('Satyrs and Fauns','Forest and meadow communities with music, arts, farms, festivals and independent political customs.','24,000,000'),
('Pixies','Small-bodied communities, magical and mundane craft, independent settlement rights.','12,000,000'),
('Minotaurs','Complex urban and rural communities; feared in some places, but individuals are not inherently violent.','18,000,000'),
('Brownies and Boggarts','Small communities with complex labor and freedom traditions. Their exact shared or separate biological classification remains undecided.','18,000,000'),
('Ogres','Independent communities and solitary lives as well as genuinely dangerous groups; feared in some western regions.','12,000,000'),
('Trolls','Varied forest, mountain and river cultures; dangerous reputations and many distinct individual lives.','6,000,000'),
('Mushroom Folk','Fungal peoples with cultivation, ecology, medicine and community histories requiring detailed development.','18,000,000'),
('Harpies','Cliff and mountain societies, flight, navigation and a reputation for predation in some regions.','12,000,000'),
('Drakari','True dragons are ancient intelligent beings, diverse in politics and interests, not precisely counted. An old estimate suggested fewer than ten thousand, unconfirmed.','uncensused'),
('Aelwyn','Fae people with complex courts and magical settlements, not identical to Eldar or Pixies; no definitive census.','uncensused'),
('Living Mountains','Rare sentient mountains, distinct from Giants, Ents and ordinary mountains; their nature, origins and population remain undecided.','uncensused')
]
for name,desc,pop in culture_names:
    status='open' if name=='Living Mountains' else 'canon'
    add('Peoples',name,desc.split('.')[0]+'.',f'{desc}\n\nPresent-day planning population: {pop}. Numbers are planning values, not a sudden birth boom or immutable count. Every people has multiple cultures and communities; social roles and character cannot be deduced from species alone.',status=status,region='Across Eryndor',tags=['people','culture','population'])

magic=[
('Natural Magic — The Worlds Breath','The planet itself creates pervasive Natural Magic, independent of lunar sources. Ordinary living things and materials participate in it to varying degrees. Deep understanding and training are still necessary for sophisticated use.','canon'),
('Lunar Magic and Moons','The current system has around 221–255 moons (238 working midpoint). Moons themselves source lunar magic, but effects vary greatly: some nearly negligible, others powerful. Orbital location and alignment matter; individual domains remain largely unmapped.','canon'),
('First Age Lost Lunar Disciplines','When older source-moons were destroyed, particular magical disciplines truly ceased to exist. They are not hidden spells that can simply be rediscovered. New fragment-moon magic is distinct.','canon'),
('Divine Magic and the Gods','Gods of magic can govern, regulate or influence magical power without replacing the planet as the source of Natural Magic or the moons as the source of lunar power. The exact pantheon and links to moons remain unresolved.','canon'),
('Inherently Good, Grey and Evil Magic','Some magical forces themselves have good, morally ambiguous or evil natures; this differs from practitioners’ intentions or the moral standing of an entire people. Specific spell and deity classifications remain unfinished.','canon'),
('Magical Compatibility','Distinct disciplines have real affinities and resistances. Lunar alignment can strengthen or disturb interactions, but it does not create compatibility from nothing.','canon'),
('Ancient Harmonisation and Fusion','A lost ancient technique used Natural Magic as a shared medium to fuse otherwise distinct disciplines into a unified working. It predates the First Throne, is not exclusively Khazari, and cannot be assumed available to Gloin.','canon'),
('Runecraft','Khazari tradition of carefully inscribed symbols conducting magic into materials, devices and structures. Skill, correct design and training matter.','canon'),
('Deepcraft','Khazari earth-and-stone magic for sensing structure, water and hidden weaknesses, with limited manipulation.','canon'),
('Forgebinding','Integration of enchantment with durable craft and metalworking.','canon'),
('Hearthmagic','Protective, preservation and warming workings used around families and settlements.','canon'),
('Stonecalling','Rare tradition of communicating with or sensing mountain structures. Its extent and limitations remain in development.','working'),
('Ancestral Binding','Controversial magic associated with bloodlines, vows and inherited obligations. The First Throne practiced it; no link to Gloin has been established.','canon'),
('Everyday Practical Magic','Magic can aid food preservation, lamps, medicine, farms, repairs, signals and structural safety, but cannot cheaply erase every mundane difficulty or make everyone an expert mage.','canon'),
('Magitech and Technology','High-medieval daily life combines with hydraulic, steam, mechanical and selective magitech advances; Deepways, specialized rail carts and rare gyrocopters exist. Development is uneven and no modern electrical-industrial baseline is assumed.','canon'),
]
for name,body,status in magic:add('Magic',name,body.split('.')[0]+'.',body,status=status,region='World',tags=['magic','rules'])

history_regions=[
('Avarra — Second Age Annals','Awakening: River-Stone Breadhouses, Court of Four Weirs, Lantern Refuge. Wonder: Hall of Common Measure, Thousand-Bowl March, Toll-Bell War (604–607), Nine Hearth Hospitals. Fire: Southern Wastes creation, Ashward Flight, Queen Merea of Three Fords, Grove-Court of Seralith.'),
('Tharvorn — Second Age Annals','Awakening: First Salt-Winter, Cedar-Peg Routes, Lady Haldra of Veskhar Reach, Three-Bell Settlement. Wonder: Sea-Glass College, War of the Beacon Keys, Harbor Witness Compact, Blue-Snow Houses, Archive of Lost Crews. Fire: Frost-Hearth Confederation and Red-Lantern Custom.'),
('Sahrad — Second Age Annals','Awakening: Dry Steps, Brass-Well Kingdom, King Issaret, Queen Naluma, Waterkeeper’s Chains and Open Well Decree. Wonder: House of Five Bowls, Saffron Gate Dominion, War of Scattered Seals, Unsealed Caravan, Open Storage Hearings. Fire: Blue-Jar Crown and Dispute of Seventh Gate.'),
('Orundel — Second Age Annals','Awakening: Lost-Stair Flood, Chain of Safe Boats, Reed-Gold Assembly. Wonder: House of Patient Rivers, Green-Step Principalities, Four-Market Suppression, Six Rivers Symposium. Fire: Reed-Crown League and the regional War of Three Locks, concerning water rights and tolls.'),
('Vaelora — Second Age Annals','Awakening: Winter of Open Doors, Seven-Bark Compact, Glassmere Court. Wonder: Lanternwater Free Quays, Trial of Empty Chair, Silk-Rain Hall, Green-Needle Boycott, Book of Uncounted, Empty-Bowl Table. Fire: Lantern Orchard Councils and Orchard Reconciliation.'),
('Second Age — Dwarves, Elves and Humans','Established annal volume covers three principal peoples, elder courts and trading folk, maintaining independent historical responses to moon changes, social inequality and reform.'),
('Second Age — Ents, Centaurs and Merfolk','Established annal volume covers forests, pasture passage, maritime and river societies, with varied local memories of the world catastrophes.'),
('Second Age — Animal Peoples and Orc Absence','Established annal volume covers eight animal peoples, Living Mountains and the binding absence of Orcs before the Third Age.'),
]
for name,desc in history_regions:
    add('History',name,desc.split('.')[0]+'.',desc+'\n\nHistorical chronicle status: developed in the Second Age Annals; revision remains possible. Listed regional conflicts are distinct; they are not a single world war, and none involved Orcs before the Third Age.',status='working',era='Second Age',region=name.split(' —')[0] if ' —' in name else 'World',tags=['annals','regional history'])

characters=[
('Gloin Hammerfeld','Khazari; age 42; common-born protagonist from Karak-Varn. Apprentice runesmith in training, civilian combat and engineering student; not enlisted in the army. Ancestry fully undecided even to the storyteller.','canon'),
('Durgan Hammerfeld','Age 168, Gloin’s father. Ironworker and repair smith, practical, gruff and caring.','canon'),
('Mara Hammerfeld','Age 161, Gloin’s mother. Household worker and textile mender; perceptive and warm but sharp when needed.','canon'),
('Bruni Hammerfeld','Age 57, older sister and apprentice armourer. Metallurgy lesson with Gloin planned on Day 23, 11:30 AM.','canon'),
('Tovin Hammerfeld','Age 34, younger brother, mine-maintenance technician in drainage, pumps and ventilation. Age/sibling order corrected retroactively.','canon'),
('Elska Hammerfeld','Age 26, youngest sister and clerk. Agreed to secretly research Common/Natural Magic harmonisation and report first to Gloin, not Hadrik.','canon'),
('Harn Coppervein','Age 174, maternal uncle and retired stonecutter.','canon'),
('Vessa Coppervein','Age 158, Harn’s wife and baker.','canon'),
('Rurik Coppervein','Age 39, cousin and cartwright’s assistant, long-standing family friendship.','canon'),
('Borin Ashmantle','Older mining engineer and family neighbor. Participated in closing the eastern mine’s lower access 63 years ago; kept portions of the original nine-level survey; did not enter the sealed chamber.','canon'),
('Maela Deepforge','Age 143, runesmith and Gloin’s apprenticeship mentor; attended the Day 22 mine inspection.','canon'),
('Hadrik Ironvein','About 176, royal historian researching First Throne anomalies and a possibly restricted Crownward repository. Has not yet heard all Day 22 observations.','canon'),
('Sergeant Keldrun Broadshield','About 187, civilian shield-and-axe trainer. Six-week course, three sessions weekly; Day 22 excused and Day 23 morning planned.','canon'),
('King Durgan IV Stonehand','Age 214, ruler of Karak-Varn for 86 years. No proof he knows about present mine activity.','canon'),
('Edrik Voss','Deputy Examiner of Royal Mining Office. Told Borin that a breach occurred and something came through; these are attributed claims, not verified findings.','reported'),
('Lord Chancellor Veyron','Senior government official involved in restricted records and eastern mine arrangements. Motives, authorization chain and whether Crown concealment occurred remain open.','open'),
('Captain Roderic Vale','Captain originally listed for inspection security; final observed attendance list differs and reason is unknown.','open'),
('Rennik Varn','Mine site supervisor at Day 22 inspection; responsible for requesting maintenance information.','canon'),
('Feldin','Structural assessor at Day 22 mine inspection.','canon'),
('Orsa','Resonance and materials assessor at Day 22 mine inspection.','canon'),
('Thrain Coppervein','Original eastern-mine chief surveyor, first in disappearance sequence; fate unproven.','reported'),
('Orik Feldspar','Engineer who helped seal mine, disappeared roughly six weeks after Thrain; fate unknown.','reported'),
('Dorin Blackmantle','Royal inspector last recorded entering Crownward administrative district; fate unknown.','reported'),
('Varric Stonehelm','Examiner-General during the old mine sealing, associated with transferred records and private repository.','canon'),
('Thargrim the Deepfather','Legendary founder or early sovereign of the First Throne; reliable details unestablished.','disputed'),
('Thargrim IV','Last universally acknowledged First Throne sovereign. Conflicting traditions describe sacrifice, overthrow or eastward survival. No version is confirmed.','disputed'),
]
for name,desc,status in characters:
    add('People & NPCs',name,desc.split('.')[0]+'.',desc,status=status,era='Fifth Age' if not name.startswith('Thargrim') else 'Unplaced antiquity',region='Karak-Varn' if name not in ('Thargrim the Deepfather','Thargrim IV') else 'Avarra',tags=['character','campaign'] if not name.startswith('Thargrim') else ['historical','person'])

add('Campaign','Current Campaign Pause','Autumn Day 22, Year 3847, ~11:25 AM at Hadrik’s desk.',
"The campaign is paused precisely at the Royal Historical Archive in Karak-Varn. Gloin Hammerfeld and Maela Deepforge stand at Hadrik Ironvein's desk, where he has asked what they uncovered. Gloin has not answered.\n\nGloin is 42, healthy, and has 10 silver crowns and 82 copper coins. Equipment: worn boots, clothes, personal axe, family keepsake of unknown significance, borrowed Foundations of First Throne Script, notebook and survey sketches. Borin holds the original survey.\n\nActive practices: three First Throne runes (Hold, Within, Until Command); recognizes additional symbols without mastering them. Maela apprenticeship twice weekly if schedules allow; Keldrun civilian combat course three times weekly (next planned Day 23 morning); Bruni metallurgy lesson Day 23 at 11:30 AM. Elska's research is agreed but has not yet begun. No additional events occur before the player resumes.",era='Fifth Age',region='Karak-Varn',tags=['bookmark','state','gloin'],related=['gloin-hammerfeld','eastern-mine-investigation'])
add('Campaign','Autumn Day 19 — Opening and Borin','Gloin woke on an outdoor bench, considered jobs, and pursued Borin’s mine warning.',
"The first verified scene opens at 7:20 AM, Autumn Day 19. Gloin, age 42, woke on a back-alley bench in Karak-Varn's Lower Eastern Quarter, not in the old superseded rented-room story.\n\nA job board offered a mine expedition, merchant caravan and three-year Royal Army service. He considered enlisting but first followed Borin. Borin disclosed a closed mine, hidden chamber, three missing engineers and a preserved original survey. Gloin saw three survey sheets describing nine levels versus six on public maps. He hid and overheard Edrik Voss's alleged breach account. By morning he sought Hadrik's historical expertise; later he discussed runesmithing with Maela. No enlistment occurred.",era='Fifth Age',region='Karak-Varn',tags=['chronicle','day 19'])
add('Campaign','Autumn Day 20 — Quarry and Research','Borin taught practical engineering at Old Quarry Access, followed by study and training.',
"Gloin met Borin at Old Quarry Access around 7 AM for underground structural instruction. They inspected ceiling fractures, damp, supports and wood timbers, then a repositioned survey marker bearing possible older First Throne geometry. This was NOT the sealed eastern mine. Breakfast followed.\n\nIn afternoon/evening Gloin consulted Hadrik and Maela, studied a dozen symbols (recognition, not mastery), practiced introductory axe control and pursued separate evidence. Some transaction times and original dialogue remain unrecovered.",era='Fifth Age',region='Karak-Varn',tags=['chronicle','day 20'])
add('Campaign','Autumn Day 21 — Family Supper','Family disclosures, eight-silver meal, metallurgy and discreet magical research commitments.',
"Gloin held a large family supper with Durgan, Mara, Bruni, Tovin, Elska, Rurik, Harn and Vessa. He disclosed the eastern mine's survey differences, missing engineers, First Throne clues, political reports and his uncertainties.\n\nThe supper cost 8 silver; the latest confirmed post-supper purse is 10 silver 82 copper, though an earlier sum has an 11-copper unexplained discrepancy. Bruni agreed to a Day 23 metallurgy lesson and Elska to discreet historical Common Magic research. Family knowledge comes from this direct disclosure; outsiders do not automatically learn it.",era='Fifth Age',region='Karak-Varn',tags=['chronicle','day 21'])
add('Campaign','Autumn Day 22 — Mine Inspection','Non-invasive structural and resonance investigation; sealed door remained closed.',
"Gloin woke at 4:30 AM and reached the eastern mine at approximately 5:52 AM. Maela, Rennik, Feldin and Orsa examined accessible passages and records, not the sealed chamber. The previously planned attendance included Edrik and Captain Vale but the difference remains unexplained.\n\nUnusual vibration was strongest near a replacement drainage stone, recurrent about every 19–21 seconds; other western wall features and maintenance records needed follow-up. The team did not prove any entity, deliberate breach or global conspiracy. Maela and Gloin later compared stone samples. Finally they reached Hadrik's Royal Historical Archive desk at about 11:25 AM. The scene pauses before Gloin's reply.",era='Fifth Age',region='Karak-Varn',tags=['chronicle','day 22'])
add('Campaign','Currency and Practical Economy','100 copper = 1 silver; 100 silver = 1 gold; 100 gold = 1 platinum.',
"The standard four-coin accounting system uses copper, silver crowns, gold crowns and platinum crowns, at 100:1 steps. A common bed is 2 copper, basic room 5, comfortable room 8, quality inn 1 silver; breakfast 2–5 copper, hearty meal 4–6 copper, small ale 2 copper, honey brew 3 copper. Local conditions, supply, war, materials and bargaining affect prices.\n\nGloin's recorded purse must change only when actual transactions occur. Do not invent costs or silently alter the ledger.",region='Karak-Varn',tags=['money','rules'])
add('Campaign','Player Agency and Story Rules','Gloin belongs to the player; NPCs act independently and mysteries have no preset answer.',
"Only the player chooses what Gloin says, thinks, attempts, intends and decides. Narration may show consequences, fair risk, injuries, training, relationships, world reaction and independent NPC agency. No plot armor or guaranteed hero status. The world remains dark and gritty yet hopeful.\n\nAlways maintain chronology, exact inventory and money, source attribution, NPC knowledge boundaries and the current pause; do not advance the story during editorial work. Ancestry and possible descent from the First Throne remain genuinely unchosen. Dialogue prompts are options, not commands.",tags=['campaign rules','agency'])

mysteries=[
('First Throne','Ancient Khazari civilization with engineering and runic sophistication beyond many present institutions. Estimates of over 40 million at its height are uncertain. Its political dissolution, evacuation and final ruler’s fate remain unresolved.','disputed'),
('Silence Below','Deep Resonance, Unlit Halls and Final Sealing are ancient episodes associated with the First Throne. Whether they involved a living entity, a magical disaster or other phenomena is unknown.','open'),
('Silence Below Date Anchor','Some records place events ~3,240 / 3,190 / 3,160 years before the Seven Thrones; others say the same figures in years ago. These reference frames conflict and must not be silently equated.','disputed'),
('Eastern Mine Investigation','Mine officially sealed 63 years ago. Public plans show six levels, Borin’s private survey nine. Older engineered lower galleries, a Hall Beneath the Mountain and sealed stone door are documented; no entity or active threat is proven.','open'),
('Missing Mine Engineers','Thrain, Orik and Dorin disappeared in sequence around the original sealing. Reports differ, and no body proves a death. Their precise fates remain undecided.','open'),
('Varric Stonehelm Repository','Historical records may have been transferred to a private Crownward repository with obscured access names. Hadrik is still verifying its records and possible safety; contents remain unknown.','open'),
('Edrik’s Alleged Western Wall Breach','Edrik claimed something came through a breach eleven nights before Day 19. Gloin overheard the statement but did not witness the breach. Inspection evidence does not prove his account.','reported'),
('Drainage Stone Resonance','Periodic readings near an old replacement stone and subsequent workshop material responses are separate observations. Exact causes and connections to the western wall are unknown.','open'),
('Gloin’s First Throne Ancestry','Direct descent is possible but neither true nor false in established canon; no hidden answer exists. Clues may emerge organically through play without predetermined chosen-one status.','open'),
('Dark Mages and Orc Creation Mechanism','Mages’ act of creating Orcs in the Third Age is canonical. Exact method, first communities, control, subsequent wars and ultimate fate of the mages remain undecided.','open'),
('No-Extinction Magical Intervention','An unidentified magical force contributed to survival of species during the Second Age-ending earthquakes; identity, intention and mechanics are not assigned.','open'),
('Karak-Varn Metro Versus Domain Census','22.8 million is the adopted sixfold metro/domain envelope, but district versus wider kingdom and satellite-village boundaries require reconciliation. Avoid double-counting.','open'),
('Gloin’s 11-Copper Ledger Discrepancy','Earlier purse plus known eight-silver supper produces 11 copper more than latest confirmed 10s82c; missing transaction or ledger mistake is unverified. Keep current confirmed balance.','disputed'),
('Unknown Fourth Age','Fourth Age duration, rulers, conflicts and transitions require design. Preserve open space rather than inserting invented connective history.','open'),
('Unmapped Lunar Pantheon','The moon-to-discipline and deity relationships are not fully identified; not all moons have strong or even observable effects.','open')
]
for title,body,status in mysteries:add('Mysteries',title,body.split('.')[0]+'.',body,status=status,tags=['mystery','continuity'])

# Record cross-references curated without relying on absent ids
m={r['id'] for r in records}
for r in records:r['related']=[id for id in r['related'] if id in m]
# add basics for categories, status and notices
meta={
 'title':'Eryndor — Living World Bible', 'edition':'Founding GitHub Edition 1.0', 'compiled':'2026-11-21',
 'notice':'This is a carefully condensed starting edition sourced from the Eryndor continuity work. Earlier compendium volumes are preserved separately and have not all been imported verbatim. Source export reconciliation remains open.',
 'worldStats':{'diameter':'50,000 km','population':'2.0628B','ages':'Five','continents':'Five','current':'Fifth Age · Era of Crowns Y3847'},
 'continents':[{'name':'Avarra','population':1019760000,'share':32},{'name':'Orundel','population':393600000,'share':28},{'name':'Sahrad','population':282222000,'share':12},{'name':'Vaelora','population':196218000,'share':11},{'name':'Tharvorn','population':171000000,'share':12}],
 'ages':[{'name':'First Age','years':'Unknown','status':'Unrecorded ancient era'},{'name':'Second Age','years':'1,437 years','status':'Three Avarran eras'},{'name':'Third Age','years':'8,873 years proposed','status':'Nine Avarran eras proposed'},{'name':'Fourth Age','years':'Undetermined','status':'Historical gap'},{'name':'Fifth Age','years':'Current','status':'Era of Crowns · Year 3847'}],
 'campaign':{'character':'Gloin Hammerfeld','age':42,'date':'Autumn Day 22 · Year 3847','time':'11:25 AM','place':'Royal Historical Archive · Karak-Varn','state':'Hadrik asked what Gloin and Maela uncovered. Gloin has not replied.','money':'10 silver, 82 copper','next':'Keldrun Day 23 morning; Bruni Day 23 at 11:30 AM; Elska research not started.'},
 'continuity':[{'title':'Gloin ancestry is genuinely unchosen','level':'protected','detail':'No author-side secret outcome, no chosen-one retcon.'},{'title':'First Throne dating discrepancy','level':'unresolved','detail':'Years before Seven Thrones versus years ago.'},{'title':'11-copper purse discrepancy','level':'unresolved','detail':'Last confirmed 10 silver 82 copper still controls.'},{'title':'City/domain demographic scope','level':'unresolved','detail':'22.8m Karak-Varn must not be counted twice.'},{'title':'Original transcript audit incomplete','level':'source gap','detail':'Some Day 19–21 original wording and transactions need transcript.'},{'title':'Ages versus local eras','level':'guardrail','detail':'Second Age era names are Avarran conventions.'},{'title':'Orcs absent before Third Age','level':'guardrail','detail':'No First/Second Age Orc events or culture.'},{'title':'Second Age already written','level':'guardrail','detail':'Detailed five-continent annals exist.'},{'title':'Old demographics superseded','level':'guardrail','detail':'Use sixfold census with no double counting.'},{'title':'Day 22 remains paused','level':'protected','detail':'No new dialogue or time passage without player.'}]
}
(root/'data'/'world.json').write_text(json.dumps({'meta':meta,'records':records},ensure_ascii=False,indent=2),encoding='utf8')
print('Records:',len(records),'Characters:',len([r for r in records if r['category']=='People & NPCs']),'bytes', (root/'data'/'world.json').stat().st_size)