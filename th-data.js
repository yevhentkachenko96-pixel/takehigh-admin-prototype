/* TAKE HIGH · спільні дані прототипу (адмінка + сайт).
   Початковий контент узято з вайрфрейму сайту (TAKE HIGH Wireframe) і файлу «Тексти для сайту» (біографії, Instagram).
   Фото задаються ключами; файли фото підставляє збірка. */
(function () {
  var A = 'Alex Sousa';
  var D = {
    version: 3,
    copyOrig: {
      oneLine: 'TAKE HIGH is a Ukrainian-founded big-wave team and performance organisation, with its main base in Nazaré, Portugal, and a training and operations base in Indonesia.',
      extended: 'TAKE HIGH is a Ukrainian-founded big-wave team and sporting organisation, with its main base in Nazaré, Portugal, and a training and operations base in Indonesia. We develop athletes and crews to perform at the highest level, prepare equipment, create owned media and build long-term partnerships. At the centre are sport, people, teamwork, precision and respect for the ocean and local knowledge. The film and our original stories share the team’s journey; the next media format is a season series. For guests, we are preparing Inside Nazaré and other personal formats with limited participant numbers.',
      performance: 'We aim to compete at the highest level in big-wave surfing. We are developing athletes and crews, working on equipment, preparation, safety and interaction on the water. If that standard of work speaks to you, reach out.',
      media: 'TAKE HIGH is a Ukrainian-founded big-wave team built around sporting work, owned stories and documentary practice. We work with editorial teams, institutions and cultural partners when there is a strong reason, real people and original material to work with.',
      mediaRelease: 'The film is being prepared through separate release layers: a physical premiere screening in Lisbon, a daytime TAKE HIGH companion event in Nazaré, festival screenings according to their own status, and a later free public YouTube Premiere.',
      partners: 'We work with partners who strengthen the team as a whole and share the ambition behind its sporting mission. Collaboration is built around a specific TAKE HIGH need and the partner’s objective - across the sporting programme, technology, media, events, travel or day-to-day team work - with clearly agreed contributions, rights, materials, timelines, costs and responsibilities.\n\nThe partner should receive a real role in a sporting story, original materials and agreed rights for its own communications. We define the shared goal and how to evaluate the result before work begins. Rights to the film, private event, YouTube release, athlete and long-term TAKE HIGH remain separate.',
      nazare: 'We are preparing Inside Nazaré - a personal introduction to TAKE HIGH and the world of big waves in Nazaré, Portugal. It is a chance to see the people, equipment, preparation and rhythm of the team from up close.',
      nazare2: 'The programme, season, conditions, people and admissible modules define the actual experience; a big wave, water launch or named athlete is not guaranteed.'
    },

    members: [
      { id: 'anton', name: 'Anton Maznyi', group: 'Crew', role: 'Co-Founder & Managing Director', sport: 'Big-Wave Athlete & Jet Ski Pilot', proof: 'Represented Ukraine at the 2024 ISA World Surfing Games in Puerto Rico and earned a podium finish at the 2024 Ukrainian Longboard Championship.', ig: 'https://www.instagram.com/anton_maznyi/', portrait: 'crew_anton', portraitAuthor: A, status: 'pub', changed: '30.10.2026 10:00' },
      { id: 'vitaly', name: 'Vitaly Sarvir', group: 'Crew', role: 'Co-Founder & Sporting Director', sport: 'Big-Wave Athlete & Jet Ski Pilot', proof: 'The first Ukrainian big-wave surfer to ride Nazaré, now leading TAKE HIGH’s sporting development.', ig: 'https://www.instagram.com/vitaly_ucraniano', portrait: 'crew_vitaly', portraitAuthor: A, status: 'pub', changed: '30.10.2026 10:02' },
      { id: 'alexander', name: 'Alexander Zateev', group: 'Crew', role: 'Rescue Operations Lead', sport: 'Big-Wave Athlete & Jet Ski Pilot', proof: 'Designs and leads practical crew training, turning complex rescue and ocean procedures into clear, repeatable team practice.', ig: 'https://www.instagram.com/808om/', portrait: 'crew_alexander', portraitAuthor: A, status: 'pub', changed: '30.10.2026 10:04' },
      { id: 'ruslan', name: 'Ruslan Kulish', group: 'Crew', role: 'Indonesia Operations Lead', sport: 'Big-Wave Athlete & Jet Ski Pilot', proof: 'Has led TAKE HIGH’s Indonesia base since its launch in 2025 and represented Ukraine at the 2023 ISA World Surfing Games.', ig: 'https://www.instagram.com/rus_kulish', portrait: 'crew_ruslan', portraitAuthor: 'TAKE HIGH', status: 'pub', changed: '30.10.2026 10:06' },
      { id: 'pavlo', name: 'Pavlo Fitsai', group: 'Crew', role: 'Technical & Logistics Lead', sport: 'Big-Wave Athlete & Jet Ski Pilot', proof: 'Technical specialist responsible for Jet Ski readiness, equipment and logistics, with hands-on operational experience and ongoing professional training.', ig: 'https://www.instagram.com/paulo.fitsai', portrait: 'crew_pavlo', portraitAuthor: A, status: 'pub', changed: '30.10.2026 10:08' },
      { id: 'yuliia', name: 'Yuliia Kulish', group: 'Crew', role: 'Ocean Communications Lead', sport: 'Big-Wave Athlete & Spotter', proof: '2024 Ukrainian Women’s Open champion and Team Ukraine athlete at the 2023 ISA World Surfing Games, supporting crew operations, administration, media review and onshore spotting in Nazaré and Indonesia.', ig: 'https://www.instagram.com/julia.o.kulish', portrait: 'crew_yuliia', portraitAuthor: 'TAKE HIGH', status: 'pub', changed: '02.11.2026 14:20' },
      { id: 'herasymenko', name: 'Yulia Herasymenko', group: 'Media', role: 'Camera & Media Operator', sport: '', proof: '', ig: '', portrait: 'club0', portraitAuthor: A, status: 'pub', changed: '28.10.2026 12:00' },
      { id: 'ghidirmic', name: 'Katarina Patek Ghidirmic', group: 'Documentary Partner', role: 'Documentary & Production Partner', sport: '', proof: '', ig: '', portrait: 'club1', portraitAuthor: A, status: 'pub', changed: '28.10.2026 12:05' },
      { id: 'tkachenko', name: 'Mark Tkachenko', group: 'Athlete Development Programme', role: 'Athlete', sport: '', proof: '', ig: '', portrait: 'club2', portraitAuthor: A, status: 'pub', changed: '28.10.2026 12:10' },
      { id: 'cardoso', name: 'Hugo Cardoso', group: 'Athlete Development Programme', role: 'Athlete', sport: '', proof: '', ig: '', portrait: 'club3', portraitAuthor: A, status: 'pub', changed: '28.10.2026 12:12' }
    ],

    news: [
      { id: 'n1', slug: 'news-session-report', section: 'Performance', type: 'Session Report', date: '', title: 'Morning session: crew rotation and jet ski readiness', deck: 'How the crew split roles between pilots, spotters and rescue on a mid-size day, and what changed after the review.', img: 'DJI_0610', imgAuthor: A, imgCaption: '', tags: ['Indonesia', 'Technical'], featured: true, place: 'Indonesia', point: null, people: ['alexander', 'pavlo'], others: [], partner: '', body: '', source: '', status: 'pub', changed: '02.11.2026 18:40' },
      { id: 'n2', slug: 'news-preparation-week', section: 'Club', type: 'Team Update', date: '', title: 'A preparation week at the Indonesia base', deck: 'Training blocks, equipment checks and the daily rhythm of the team between swells.', img: 'DSCF9720', imgAuthor: A, imgCaption: '', tags: ['Indonesia'], featured: false, place: 'Indonesia', point: null, people: ['ruslan'], others: [], partner: '', body: '', source: '', status: 'pub', changed: '30.10.2026 09:12' },
      { id: 'n3', slug: 'news-jet-ski-prep', section: 'Performance', type: 'Technical', date: '', title: 'How we prepare jet skis between sessions', deck: 'A short checklist from the technical lead on engines, sleds and spare parts.', img: 'DSCF7121', imgAuthor: A, imgCaption: '', tags: ['Technical'], featured: false, place: 'Indonesia', point: null, people: ['pavlo'], others: [], partner: '', body: '', source: '', status: 'pub', changed: '29.10.2026 16:30' },
      { id: 'n4', slug: 'news-film-update', section: 'Media', type: 'Announcement', date: '', title: 'TAKE HIGH documentary: production update', deck: 'Where the film stands now and how we will share release information.', img: null, imgAuthor: '', imgCaption: '', tags: ['Film'], featured: false, place: '—', point: null, people: [], others: [], partner: '', body: '', source: '', status: 'pub', changed: '27.10.2026 11:05' },
      { id: 'n5', slug: 'news-in-pictures', section: 'Media', type: 'In Pictures', date: '', title: 'In pictures: a week of training', deck: 'A selection of frames from the beach, the water and the workshop.', img: 'DSCF9704', imgAuthor: A, imgCaption: '', tags: ['Indonesia'], featured: false, place: 'Indonesia', point: null, people: [], others: [], partner: '', body: '', source: '', status: 'pub', changed: '21.10.2026 10:02' },
      { id: 'n6', slug: 'news-partner-update', section: 'Partnerships', type: 'Partner Update', date: '', title: '[Partner] joins the technical programme', deck: 'What the partner contributes to the sporting work and how the result will be measured.', img: null, imgAuthor: '', imgCaption: '', tags: ['Technical'], featured: false, place: '—', point: null, people: [], others: [], partner: '', body: '', source: '', status: 'pub', changed: '15.10.2026 13:47' },
      { id: 'n7', slug: 'news-rescue-feature', section: 'Club', type: 'Feature', date: '', title: 'Turning rescue procedures into team practice', deck: 'How the crew trains repeatable rescue routines before the big-wave season.', img: 'DSCF9825', imgAuthor: A, imgCaption: '', tags: ['Nazaré'], featured: false, place: 'Nazaré', point: null, people: ['alexander'], others: [], partner: '', body: '', source: '', status: 'pub', changed: '08.10.2026 12:00' },
      { id: 'n8', slug: 'news-sports-events', section: 'Performance', type: 'Feature', date: '', title: 'Sports Events: the direction we are developing', deck: 'Why events sit inside Performance and what has to be confirmed before we announce one.', img: null, imgAuthor: '', imgCaption: '', tags: ['Sports Events'], featured: false, place: '—', point: null, people: ['vitaly'], others: [], partner: '', body: '', source: '', status: 'pub', changed: '30.09.2026 08:55' }
    ],
    tags: ['Nazaré', 'Indonesia', 'Film', 'Next Wave', 'Technical', 'Sports Events'],

    events: [
      { id: 'e1', es: 'announced', title: '[Event title] — film screening', type: 'Screening', film: 'TAKE HIGH', start: '', end: '', tz: 'Europe/Lisbon', place: '[City, venue]', point: null, desc: '', img: null, cta: '', status: 'pub', changed: '01.11.2026 10:20' },
      { id: 'e2', es: 'registration_open', title: '[Event title] — community evening', type: 'Companion event', film: '', start: '', end: '', tz: 'Europe/Lisbon', place: '[City, venue]', point: null, desc: '', img: null, cta: 'https://tickets.example', status: 'pub', changed: '30.10.2026 17:45' },
      { id: 'e3', es: 'sold_out', title: '[Event title] — festival screening', type: 'Festival', film: 'TAKE HIGH', start: '', end: '', tz: 'Europe/Lisbon', place: '[City, venue]', point: null, desc: '', img: null, cta: '', status: 'pub', changed: '02.11.2026 09:05' },
      { id: 'e4', es: 'completed', title: '[Event title] — talk', type: 'Talk', film: '', start: '', end: '', tz: 'Europe/Lisbon', place: '[City, venue]', point: null, desc: '', img: null, cta: '', status: 'pub', changed: '28.10.2026 14:10' },
      { id: 'e5', es: 'cancelled', title: '[Event title] — sporting event', type: 'Sporting event', film: '', start: '', end: '', tz: 'Europe/Lisbon', place: '[City, venue]', point: null, desc: '', img: null, cta: '', status: 'pub', changed: '12.09.2026 11:00' }
    ],

    films: [
      { id: 'f1', title: 'TAKE HIGH', slug: 'take-high', state: 0, statusLine: '', poster: null, teaserText: 'A documentary about the team, the work around the waves and the people behind it.',
        logline: '[One-sentence logline]', synS: '[Short synopsis — 2–3 sentences about the team, the season and what is at stake.]', synL: '[Long synopsis — one or two paragraphs. The permanent film story, without dated release details.]',
        makingText: '[How the film was made: people, places, production, behind the scenes and the real sporting work — without an invented hero narrative.]', makingPhotos: [],
        credits: [{ role: 'Directed by', name: '[Name]' }, { role: 'Produced by', name: '[Name] · Katarina Patek Ghidirmic (Documentary & Production Partner)' }, { role: 'Camera', name: 'Yulia Herasymenko · [Name]' }, { role: 'With', name: 'Anton Maznyi, Vitaly Sarvir, Alexander Zateev, Ruslan Kulish, Pavlo Fitsai, Yuliia Kulish' }, { role: 'Partners', name: '[Only confirmed partners]' }],
        frames: [], teaser: '', trailer: '', watch: '',
        cdAt: '', cdTz: 'Europe/Lisbon', cdLabel: 'YouTube Premiere in', cdAfter: 'The premiere is live', cdUrl: '', ticketsUrl: '',
        releaseText: 'The film is being prepared through separate release layers: a physical premiere screening in Lisbon, a daytime TAKE HIGH companion event in Nazaré, festival screenings according to their own status, and a later free public YouTube Premiere.',
        timeline: [{ date: '[Date]', title: 'Premiere screening', place: 'Lisbon', conf: 'Confirmed' }, { date: '[Date]', title: 'Companion event (not a premiere)', place: 'Nazaré', conf: 'Preliminary' }, { date: '[Date]', title: 'Surf Film Festival screening', place: 'Nazaré', conf: 'Confirmed' }, { date: '[Date]', title: 'Free public premiere', place: 'YouTube', conf: 'Preliminary' }],
        pressText: 'Approved stills, synopsis, credits and contacts for editors.', pressFiles: [], pressEmail: '', home: true, status: 'pub', changed: '02.11.2026 16:12' }
    ],

    results: [
      { id: 'r1', date: '', event: '[Event]', result: '[Result]', people: [], athlete: '[Name]', type: 'Result', source: '[Source link]', status: 'pub', changed: '20.10.2026 12:00' },
      { id: 'r2', date: '', event: '[Event]', result: '[Result]', people: [], athlete: '[Name]', type: 'Nomination', source: '[Source link]', status: 'pub', changed: '18.10.2026 15:30' },
      { id: 'r3', date: '', event: '[Event]', result: '[Result]', people: [], athlete: '[Name]', type: 'Record attempt', source: '[Source link]', status: 'pub', changed: '02.11.2026 10:15' },
      { id: 'r4', date: '', event: '[Event]', result: '[Result]', people: [], athlete: '[Name]', type: 'Confirmed record', source: '[Source link]', status: 'pub', changed: '05.03.2026 09:40' }
    ],

    partners: [
      { id: 'p1', name: 'Zodiak', site: 'https://zoddiak.com', logo: 'logo_zodiak', dir: '', role: '', perm: '', status: 'pub', changed: '04.11.2026 10:00' },
      { id: 'p2', name: 'Wave Crushers', site: 'https://wcts.pt', logo: 'logo_wave_crushers', dir: '', role: '', perm: '', status: 'pub', changed: '04.11.2026 10:02' },
      { id: 'p3', name: 'West Tech Jet Ski', site: 'https://www.instagram.com/westtechjetski', logo: 'logo_west_tech_jet_ski', dir: '', role: '', perm: '', status: 'pub', changed: '04.11.2026 10:04' },
      { id: 'p4', name: 'Ocean Spirit Surf', site: 'https://www.instagram.com/oceanspiritsurf', logo: 'logo_ocean_spirit_surf', dir: '', role: '', perm: '', status: 'pub', changed: '04.11.2026 10:06' },
      { id: 'p5', name: 'Red Herrings Nazaré', site: 'https://redherringsnazare.com', logo: 'logo_red_herrings_nazar', dir: '', role: '', perm: '', status: 'pub', changed: '04.11.2026 10:08' },
      { id: 'p6', name: 'Barmaleys Studio', site: 'https://barmaleys.studio', logo: 'logo_barmaleys_studio', dir: '', role: '', perm: '', status: 'pub', changed: '04.11.2026 10:10' }
    ],
    cases: [
      { id: 'c1', title: '[Partner role in the sporting story]', partner: '[Partner]', dir: 'Technology', img: null, text: '[What was done, what rights, how the result was measured]', status: 'pub', changed: '28.10.2026 15:00' }
    ],

    products: [
      { id: 'pr1', slug: 'product-team-tee', name: 'Team Tee', col: 'Apparel', state: 'Каталог', images: [], short: 'Heavy cotton T-shirt with the TAKE HIGH emblem on the back.', story: '[Why this item exists and how it connects to the team.]', sizes: ['XS', 'S', 'M', 'L', 'XL'], out: ['XS'], colours: [], materials: '[Fabric, weight, care instructions.]', care: '', guide: null, news: [], status: 'pub', changed: '30.10.2026 13:00' },
      { id: 'pr2', slug: 'product-crew-jersey', name: 'Crew Jersey', col: 'Team Kit', state: 'Каталог', images: [], short: 'Replica of the jersey the crew wears on the beach and in the boat.', story: '[Why this item exists and how it connects to the team.]', sizes: ['S', 'M', 'L', 'XL'], out: [], colours: [], materials: '[Fabric, weight, care instructions.]', care: '', guide: null, news: [], status: 'pub', changed: '30.10.2026 13:04' },
      { id: 'pr3', slug: 'product-cap', name: 'Dolphin Cap', col: 'Accessories', state: 'Каталог', images: [], short: 'Six-panel cap with the embroidered dolphin mark.', story: '[Why this item exists and how it connects to the team.]', sizes: ['One size'], out: [], colours: [], materials: '[Fabric, weight, care instructions.]', care: '', guide: null, news: [], status: 'pub', changed: '02.11.2026 17:25' },
      { id: 'pr4', slug: 'product-hoodie', name: 'Nazaré Hoodie', col: 'Limited Releases', state: 'Каталог', images: [], short: 'Limited hoodie for the season.', story: '[Why this item exists and how it connects to the team.]', sizes: ['S', 'M', 'L', 'XL'], out: ['S', 'M'], colours: [], materials: '[Fabric, weight, care instructions.]', care: '', guide: null, news: [], status: 'pub', changed: '18.10.2026 10:10' }
    ],
    collections: ['Apparel', 'Team Kit', 'Accessories', 'Limited Releases'],

    pages: {
      home: {
        heroImg: 'hero', heroImgM: null, heroVid: null, heroVidM: null, heroAuthor: A,
        aboutTitle: 'A big-wave team and performance organisation', about: 'TAKE HIGH is a Ukrainian-founded big-wave team and performance organisation, with its main base in Nazaré, Portugal, and a training and operations base in Indonesia.', aboutImg: 'DSCF7054', aboutAuthor: A,
        sessions: [{ img: 'DJI_0610', place: '[Location]', date: '[Date]', st: 'Status', title: '[Session title]' }, { img: 'DSC04681', place: '[Location]', date: '[Date]', st: 'Status', title: '[Session title]' }, { img: 'DSC04711', place: '[Location]', date: '[Date]', st: 'Status', title: '[Session title]' }],
        season: [{ img: 'DSCF7121', title: 'Equipment', text: 'Jet skis, sleds and boards are checked before every session.' }, { img: 'DSCF9720', title: 'Crew work', text: 'Pilots, spotters and rescue train as one unit.' }, { img: 'DSCF6995', title: 'Logistics', text: 'Moving equipment between bases and spots.' }, { img: 'objectives', title: 'Objectives', text: 'What the team is working towards this season.' }],
        partnersTitle: 'Work with the team', partnersText: 'We build partnerships around a real need of the team and a clear objective for the partner.',
        seoTitle: '', seoDesc: '', og: null
      },
      performance: {
        heroImg: 'perf', title: 'The sporting programme', programme: 'We aim to compete at the highest level in big-wave surfing. We are developing athletes and crews, working on equipment, preparation, safety and interaction on the water. If that standard of work speaks to you, reach out.',
        season: '', goal: '', goalText: '[Season goal]. The team works towards [objective] with a focus on crew roles, equipment readiness and review after every session.',
        roles: [{ title: 'Pilot', text: 'Drives the jet ski: tow-in and rescue.' }, { title: 'Athlete', text: 'Rides the wave.' }, { title: 'Spotter', text: 'Watches the line-up from shore and calls sets.' }, { title: 'Rescue', text: 'Leads safety routines and pick-ups.' }],
        sessions: [{ img: 'DSCF9704', place: '[Location]', date: '[Date]', st: 'Confirmed', title: '[Session title]' }, { img: 'IMG_0606', place: '[Location]', date: '[Date]', st: 'Confirmed', title: '[Session title]' }, { img: 'DSCF7253', place: '[Location]', date: '[Date]', st: 'Confirmed', title: '[Session title]' }],
        prepImg: 'DSCF9720', prepTitle: 'Training, readiness and review', prepText: 'Training blocks on land and on the water, readiness checks before the season, and a review after every session.',
        equipment: [{ img: 'DSCF6995', title: 'Boards', text: '[Short description of confirmed technical work]' }, { img: 'DSCF7108', title: 'Jet skis & sleds', text: '[Short description of confirmed technical work]' }, { img: 'DSCF7121', title: 'Maintenance', text: '[Short description of confirmed technical work]' }],
        sportsText: 'We are developing sports events as part of the programme. Dates and formats will appear here once they are confirmed.', sportsImg: 'events',
        athleteText: '', seoTitle: '', seoDesc: '', og: null
      },
      club: {
        heroImg: 'DSCF9724', title: 'The people of TAKE HIGH', intro: 'TAKE HIGH is a Ukrainian-founded big-wave team and sporting organisation, with its main base in Nazaré, Portugal, and a training and operations base in Indonesia. We develop athletes and crews to perform at the highest level, prepare equipment, create owned media and build long-term partnerships. At the centre are sport, people, teamwork, precision and respect for the ocean and local knowledge. The film and our original stories share the team’s journey; the next media format is a season series. For guests, we are preparing Inside Nazaré and other personal formats with limited participant numbers.',
        tagline: 'Six core people', community: 'Supporters, guests and event participants are part of the community around the project.', seoTitle: '', seoDesc: '', og: null
      },
      media: {
        intro: 'TAKE HIGH is a Ukrainian-founded big-wave team built around sporting work, owned stories and documentary practice. We work with editorial teams, institutions and cultural partners when there is a strong reason, real people and original material to work with.',
        items: [{ kind: 'Фото', photo: 'DSCF7290' }, { kind: 'Фото', photo: 'DSCF7291' }, { kind: 'Фото', photo: 'DSCF9715' }, { kind: 'Фото', photo: 'DSCF9829' }, { kind: 'Фото', photo: 'DSCF9832' }, { kind: 'Фото', photo: 'DSCF7251' }, { kind: 'Фото', photo: 'DSCF7067' }, { kind: 'Фото', photo: 'DSCF9486' }],
        pressDesc: 'TAKE HIGH is a Ukrainian-founded big-wave team built around sporting work, owned stories and documentary practice. We work with editorial teams, institutions and cultural partners when there is a strong reason, real people and original material to work with.',
        pressPhotos: [], pressLogos: [], pressName: '[Name]', pressRole: '[Role]', pressEmail: 'press@[domain]', seoTitle: '', seoDesc: '', og: null
      },
      partnerships: {
        title: 'Partners who strengthen the team',
        intro: 'We work with partners who strengthen the team as a whole and share the ambition behind its sporting mission. Collaboration is built around a specific TAKE HIGH need and the partner’s objective - across the sporting programme, technology, media, events, travel or day-to-day team work - with clearly agreed contributions, rights, materials, timelines, costs and responsibilities.\n\nThe partner should receive a real role in a sporting story, original materials and agreed rights for its own communications. We define the shared goal and how to evaluate the result before work begins. Rights to the film, private event, YouTube release, athlete and long-term TAKE HIGH remain separate.',
        dirs: [{ _label: 'Performance', text: 'Sporting programme, preparation, season story and capability needs.' }, { _label: 'Technology', text: 'Real use, testing, feedback, technical story and rights.' }, { _label: 'Team', text: 'Travel, equipment, logistics, apparel and day-to-day support.' }, { _label: 'Media', text: 'Original production, rights, deliverables, distribution and measurement.' }, { _label: 'Project', text: 'A separate event, expedition or campaign with clear scope, costs and responsibilities.' }],
        steps: [{ title: 'Need', text: 'We name a specific need of the team.' }, { title: 'Objective', text: 'We agree the partner’s goal.' }, { title: 'Scope', text: 'Contributions, rights, materials, timeline and costs.' }, { title: 'Work', text: 'The partner gets a real role in the sporting story.' }, { title: 'Review', text: 'We evaluate the result against the shared goal.' }],
        seoTitle: '', seoDesc: '', og: null
      },
      access: {
        tagline: 'Meet the team up close', intro: 'Personal formats for guests who want to see how a big-wave team works. Each format opens only when it is ready.', heroImg: 'access', cardImg: 'nazare2',
        formats: [{ title: 'Family Experience' }, { title: 'Membership' }, { title: 'Concierge' }, { title: 'Expeditions' }], seoTitle: '', seoDesc: '', og: null
      },
      inside: {
        state: 'Готуємо', heroImg: 'nazare3',
        short: 'We are preparing Inside Nazaré - a personal introduction to TAKE HIGH and the world of big waves in Nazaré, Portugal. It is a chance to see the people, equipment, preparation and rhythm of the team from up close.',
        main: '', program: '',
        highlights: [{ photo: 'see0', title: 'People', text: 'Meet the crew and hear how the team works.' }, { photo: 'see1', title: 'Equipment', text: 'See jet skis, sleds and boards being prepared.' }, { photo: 'see2', title: 'Preparation', text: 'Watch the routines before a session.' }, { photo: 'see3', title: 'Rhythm', text: 'Spend time in the team’s daily rhythm in Nazaré.' }],
        disc: 'The programme, season, conditions, people and admissible modules define the actual experience; a big wave, water launch or named athlete is not guaranteed.',
        faq: [{ q: 'When does Inside Nazaré start?', a: '[Season and dates will be announced when the programme is ready.]' }, { q: 'Will I go on the water?', a: '[Water modules are not available yet. The programme defines what is possible.]' }, { q: 'Can I meet a specific athlete?', a: '[We do not guarantee a named athlete.]' }, { q: 'How many people can join?', a: '[Small groups with a limited number of participants.]' }],
        seoTitle: '', seoDesc: '', og: null
      },
      merch: {
        state: 'Каталог', heroImg: 'DSCF7067', title: 'Team kit and apparel', text: 'Clothing and accessories from the team’s own culture: the emblem, the jerseys and limited releases.', news: [], seoTitle: '', seoDesc: '', og: null
      }
    },

    settings: {
      footer: 'TAKE HIGH is a Ukrainian-founded big-wave team and performance organisation, with its main base in Nazaré, Portugal, and a training and operations base in Indonesia.',
      email: '', follow: 'https://www.instagram.com/',
      socials: [{ net: 'Instagram', url: 'https://www.instagram.com/' }, { net: 'YouTube', url: 'https://www.youtube.com/' }]
    },

    legal: [
      { id: 'privacy', name: 'Privacy Notice', version: '[x.x]', updated: '', body: '## 1. Who we are\n\n## 2. Data we collect\n\n## 3. Why we use it\n\n## 4. Email lists\n\n## 5. Your rights\n\n## 6. Contact', changed: '20.10.2026 12:30' },
      { id: 'cookies', name: 'Cookie Policy', version: '[x.x]', updated: '', body: '## 1. Who we are\n\n## 2. Data we collect\n\n## 3. Why we use it\n\n## 4. Email lists\n\n## 5. Your rights\n\n## 6. Contact', changed: '20.10.2026 12:42' },
      { id: 'terms', name: 'Terms of Use', version: '[x.x]', updated: '', body: '## 1. Who we are\n\n## 2. Data we collect\n\n## 3. Why we use it\n\n## 4. Email lists\n\n## 5. Your rights\n\n## 6. Contact', changed: '15.10.2026 09:10' }
    ],

    log: [
      { iso: '2026-11-02', when: '02.11.2026 18:40', who: 'Адміністратор', rec: 'Morning session: crew rotation and jet ski readiness', sec: 'Новини', act: 'Зроблено головною', from: 'Ні', to: 'Так' },
      { iso: '2026-11-02', when: '02.11.2026 16:12', who: 'Адміністратор', rec: 'TAKE HIGH', sec: 'Фільми', act: 'Змінено стан', from: '—', to: 'До релізу' },
      { iso: '2026-11-02', when: '02.11.2026 14:20', who: 'Адміністратор', rec: 'Yuliia Kulish', sec: 'Учасники', act: 'Опубліковано', from: 'Чернетка', to: 'Опубліковано' },
      { iso: '2026-10-20', when: '20.10.2026 11:15', who: 'Адміністратор', rec: 'Загальні налаштування', sec: 'Загальні налаштування', act: 'Змінено email для Contact', from: '—', to: 'info@takehighclub.com' }
    ]
  };

  var STATES = { film: ['До релізу', 'Тизер', 'Трейлер і таймер', 'Премʼєра', 'Вийшов'] };

  window.TH_DEFAULT = D;
  window.TH_IMG = window.TH_IMG || {};
  window.TH = {
    states: STATES,
    data: function () { return (window.__TH && window.__TH.data) || window.TH_DEFAULT; },
    img: function (k) {
      if (!k) return null;
      if (typeof k !== 'string') return null;
      if (k.indexOf('data:') === 0 || k.indexOf('blob:') === 0 || k.indexOf('http') === 0 || k.charAt(0) === '/') return k;
      var m = (window.__TH && window.__TH.img) || window.TH_IMG || {};
      return m[k] || null;
    },
    rec: function () { return (window.__TH && window.__TH.rec) || null; },
    live: function () { return !!window.__TH; },
    send: function (msg) {
      if (!window.__TH) return;
      try { msg.th = 1; window.parent.postMessage(msg, '*'); } catch (e) {}
    },
    now: function () {
      var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
      return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    },
    byId: function (list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; },
    photo: function (key, name, author) {
      if (!key) return { state: 'empty' };
      return { state: 'done', key: key, url: window.TH.img(key), name: name || (String(key).indexOf('data:') === 0 ? 'upload.jpg' : key + '.jpg'), meta: author ? 'JPG · автор: ' + author : 'JPG' };
    },
    newId: function (p) { return p + Date.now().toString(36); },
    fd: function (iso) { if (!iso) return ''; var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}:\d{2}))?/); return m ? (m[3] + '.' + m[2] + '.' + m[1] + (m[4] ? ' ' + m[4] : '')) : String(iso); },
    save: function (entity, id, rec, status, label) { window.TH.send({ type: 'save', entity: entity, id: id, rec: rec, status: status, label: label || '' }); },
    patch: function (entity, changes) { window.TH.send({ type: 'patch', entity: entity, changes: changes }); },
    order: function (entity, ids) { window.TH.send({ type: 'order', entity: entity, ids: ids }); },
    pageSave: function (page, rec) { window.TH.send({ type: 'page', page: page, rec: rec }); },
    memberNames: function (ids) { var D = window.TH.data(); return (ids || []).map(function (id) { var m = window.TH.byId(D.members, id); return m ? m.name : id; }); },
    memberIds: function (names) { var D = window.TH.data(); return (names || []).map(function (n) { for (var i = 0; i < D.members.length; i++) if (D.members[i].name === n) return D.members[i].id; return n; }); },
    rep: function (list, photoKeys) { return (list || []).map(function (it) { var o = {}; Object.keys(it).forEach(function (k) { o[k] = it[k]; }); (photoKeys || []).forEach(function (k) { var v = it[k]; o[k] = v ? { key: v, url: window.TH.img(v), name: String(v).indexOf('data:') === 0 ? 'upload.jpg' : v + '.jpg' } : null; }); return o; }); },
    gal: function (list) { return (list || []).map(function (it) { var k = typeof it === 'string' ? it : it.img; return { key: k, url: window.TH.img(k), author: (it && it.author) || '' }; }); }
  };
})();
