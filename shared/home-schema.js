/* TAKE HIGH · Home (прототип V3): тексти і фото, які змінюються в адмінці («Тексти Home»).
   Вкладка → блок → поля. def — текст з прототипу; він показується, поки поле в адмінці порожнє.
   Фото за замовчуванням: «v3:<файл>» = site/img/v3/<файл>. */
window.TH_HOME_SCHEMA = [
 {
  "id": "hero",
  "title": "Перший екран",
  "desc": "Повноекранне відео з одним рядком.",
  "secs": [
   {
    "title": "Перший екран",
    "desc": "",
    "fields": [
     {
      "k": "heroTitle",
      "label": "Напис на відео",
      "type": "t",
      "max": 40,
      "def": "Big wave surf club"
     },
     {
      "k": "heroPoster",
      "label": "Кадр, поки відео вантажиться",
      "type": "p",
      "def": "v3:8ab0d37d8a.jpg"
     }
    ]
   }
  ]
 },
 {
  "id": "who",
  "title": "Who we are",
  "desc": "Хто ми: три картки — Nazaré, Indonesia, Crew. На телефоні гортаються вбік.",
  "secs": [
   {
    "title": "Заголовок блоку",
    "desc": "",
    "fields": [
     {
      "k": "whoLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "Who we are"
     },
     {
      "k": "whoTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "A big-wave team from Ukraine, based in Nazaré"
     },
     {
      "k": "whoLead",
      "label": "Опис",
      "type": "a",
      "max": 220,
      "def": "TAKE HIGH is a big-wave surf club. Athletes, Jet Ski pilots and a safety team work as one crew on some of the biggest waves on Earth."
     }
    ]
   },
   {
    "title": "Картка 1 · Nazaré",
    "desc": "",
    "fields": [
     {
      "k": "who1Img",
      "label": "Фото",
      "type": "p",
      "def": "v3:9509da4ffe.jpg"
     },
     {
      "k": "who1Kick",
      "label": "Надпис над назвою",
      "type": "t",
      "max": 40,
      "def": "Main base · Portugal"
     },
     {
      "k": "who1Title",
      "label": "Назва",
      "type": "t",
      "max": 24,
      "def": "Nazaré"
     },
     {
      "k": "who1Text",
      "label": "Текст (до 2 рядків)",
      "type": "a",
      "max": 120,
      "def": "The biggest surfed waves in the world. The team lives and works here all winter."
     },
     {
      "k": "who1Go",
      "label": "Текст посилання",
      "type": "t",
      "max": 30,
      "def": "Explore Nazaré"
     }
    ]
   },
   {
    "title": "Картка 2 · Indonesia",
    "desc": "",
    "fields": [
     {
      "k": "who2Img",
      "label": "Фото",
      "type": "p",
      "def": "v3:05f750be6c.jpg"
     },
     {
      "k": "who2Kick",
      "label": "Надпис над назвою",
      "type": "t",
      "max": 40,
      "def": "Training base"
     },
     {
      "k": "who2Title",
      "label": "Назва",
      "type": "t",
      "max": 24,
      "def": "Indonesia"
     },
     {
      "k": "who2Text",
      "label": "Текст (до 2 рядків)",
      "type": "a",
      "max": 120,
      "def": "Warm water and steady waves. The team trains here between big-wave seasons."
     },
     {
      "k": "who2Go",
      "label": "Текст посилання",
      "type": "t",
      "max": 30,
      "def": "Explore Indonesia"
     }
    ]
   },
   {
    "title": "Картка 3 · Crew",
    "desc": "",
    "fields": [
     {
      "k": "who3Img",
      "label": "Фото",
      "type": "p",
      "def": "v3:8bfd06c726.jpg"
     },
     {
      "k": "who3Kick",
      "label": "Надпис над назвою",
      "type": "t",
      "max": 40,
      "def": "The people"
     },
     {
      "k": "who3Title",
      "label": "Назва",
      "type": "t",
      "max": 24,
      "def": "Crew"
     },
     {
      "k": "who3Text",
      "label": "Текст (до 2 рядків)",
      "type": "a",
      "max": 120,
      "def": "Athletes, Jet Ski pilots and a safety team. One unit on and off the water."
     },
     {
      "k": "who3Go",
      "label": "Текст посилання",
      "type": "t",
      "max": 30,
      "def": "Meet the crew"
     }
    ]
   }
  ]
 },
 {
  "id": "what",
  "title": "What we do",
  "desc": "Що ми робимо: три вкладки для різних людей, у кожній три картки.",
  "secs": [
   {
    "title": "Заголовок блоку",
    "desc": "",
    "fields": [
     {
      "k": "whatLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "What we do"
     },
     {
      "k": "whatTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "Big waves at the core, and many ways in"
     },
     {
      "k": "whatLead",
      "label": "Опис",
      "type": "a",
      "max": 220,
      "def": "Choose what fits you: train with the team, grow as an athlete or pilot, or come to Nazaré as a guest."
     }
    ]
   },
   {
    "title": "Вкладка 1 · Guests and companies",
    "desc": "",
    "fields": [
     {
      "k": "what1Tab",
      "label": "Назва вкладки",
      "type": "t",
      "max": 30,
      "def": "Guests and companies"
     },
     {
      "k": "what11Img",
      "label": "Картка 1 · фото",
      "type": "p",
      "def": "v3:72e462094e.jpg"
     },
     {
      "k": "what11Title",
      "label": "Картка 1 · назва",
      "type": "t",
      "max": 40,
      "def": "Nazaré Experience"
     },
     {
      "k": "what11Text",
      "label": "Картка 1 · текст",
      "type": "a",
      "max": 120,
      "def": "A day with the team for 1–3 people or a small private group."
     },
     {
      "k": "what12Img",
      "label": "Картка 2 · фото",
      "type": "p",
      "def": "v3:3298800892.jpg"
     },
     {
      "k": "what12Title",
      "label": "Картка 2 · назва",
      "type": "t",
      "max": 40,
      "def": "Team building"
     },
     {
      "k": "what12Text",
      "label": "Картка 2 · текст",
      "type": "a",
      "max": 120,
      "def": "Bring your team to Nazaré and spend a day with TAKE HIGH."
     },
     {
      "k": "what13Img",
      "label": "Картка 3 · фото",
      "type": "p",
      "def": "v3:91385d56d6.jpg"
     },
     {
      "k": "what13Title",
      "label": "Картка 3 · назва",
      "type": "t",
      "max": 40,
      "def": "Corporate events"
     },
     {
      "k": "what13Text",
      "label": "Картка 3 · текст",
      "type": "a",
      "max": 120,
      "def": "Private and company events with the team, small or large."
     }
    ]
   },
   {
    "title": "Вкладка 2 · Athletes and pilots",
    "desc": "",
    "fields": [
     {
      "k": "what2Tab",
      "label": "Назва вкладки",
      "type": "t",
      "max": 30,
      "def": "Athletes and pilots"
     },
     {
      "k": "what21Img",
      "label": "Картка 1 · фото",
      "type": "p",
      "def": "v3:02c4864223.jpg"
     },
     {
      "k": "what21Title",
      "label": "Картка 1 · назва",
      "type": "t",
      "max": 40,
      "def": "Train with the team"
     },
     {
      "k": "what21Text",
      "label": "Картка 1 · текст",
      "type": "a",
      "max": 120,
      "def": "Training blocks at the bases in Nazaré and Indonesia."
     },
     {
      "k": "what22Img",
      "label": "Картка 2 · фото",
      "type": "p",
      "def": "v3:8028e13c08.jpg"
     },
     {
      "k": "what22Title",
      "label": "Картка 2 · назва",
      "type": "t",
      "max": 40,
      "def": "Surfer development"
     },
     {
      "k": "what22Text",
      "label": "Картка 2 · текст",
      "type": "a",
      "max": 120,
      "def": "A clear path from your first big days to competing."
     },
     {
      "k": "what23Img",
      "label": "Картка 3 · фото",
      "type": "p",
      "def": "v3:3a26644634.jpg"
     },
     {
      "k": "what23Title",
      "label": "Картка 3 · назва",
      "type": "t",
      "max": 40,
      "def": "Pilot development"
     },
     {
      "k": "what23Text",
      "label": "Картка 3 · текст",
      "type": "a",
      "max": 120,
      "def": "Learn to tow surfers in and pick them up safely."
     }
    ]
   },
   {
    "title": "Вкладка 3 · Partners and fans",
    "desc": "",
    "fields": [
     {
      "k": "what3Tab",
      "label": "Назва вкладки",
      "type": "t",
      "max": 30,
      "def": "Partners and fans"
     },
     {
      "k": "what31Img",
      "label": "Картка 1 · фото",
      "type": "p",
      "def": "v3:117f2c6563.jpg"
     },
     {
      "k": "what31Title",
      "label": "Картка 1 · назва",
      "type": "t",
      "max": 40,
      "def": "Partner with us"
     },
     {
      "k": "what31Text",
      "label": "Картка 1 · текст",
      "type": "a",
      "max": 120,
      "def": "Equipment, media, travel or support for the athletes."
     },
     {
      "k": "what32Img",
      "label": "Картка 2 · фото",
      "type": "p",
      "def": "v3:2535f99f89.jpg"
     },
     {
      "k": "what32Title",
      "label": "Картка 2 · назва",
      "type": "t",
      "max": 40,
      "def": "Follow the updates"
     },
     {
      "k": "what32Text",
      "label": "Картка 2 · текст",
      "type": "a",
      "max": 120,
      "def": "News, sessions and the film, straight to your email."
     },
     {
      "k": "what33Img",
      "label": "Картка 3 · фото",
      "type": "p",
      "def": "v3:6398463e5f.jpg"
     },
     {
      "k": "what33Title",
      "label": "Картка 3 · назва",
      "type": "t",
      "max": 40,
      "def": "Talk to the team"
     },
     {
      "k": "what33Text",
      "label": "Картка 3 · текст",
      "type": "a",
      "max": 120,
      "def": "Ask us anything. We reply by email."
     }
    ]
   }
  ]
 },
 {
  "id": "how",
  "title": "How we work",
  "desc": "Як ми працюємо: ролі в команді, 6 кроків підготовки і спорядження простими словами.",
  "secs": [
   {
    "title": "Заголовок блоку",
    "desc": "",
    "fields": [
     {
      "k": "howLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "How we work"
     },
     {
      "k": "howTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "From the first training to the last wave"
     },
     {
      "k": "howLead",
      "label": "Опис",
      "type": "a",
      "max": 220,
      "def": "A big-wave session lasts a few hours. Getting ready for it takes months. Here is how the team works, step by step."
     }
    ]
   },
   {
    "title": "Ролі",
    "desc": "Спочатку що людина робить, потім назва ролі.",
    "fields": [
     {
      "k": "role1Text",
      "label": "Роль 1 · що робить",
      "type": "a",
      "max": 120,
      "def": "Rides the wave. Trains all year to handle its size and speed."
     },
     {
      "k": "role1Name",
      "label": "Роль 1 · назва",
      "type": "t",
      "max": 20,
      "def": "Surfer"
     },
     {
      "k": "role2Text",
      "label": "Роль 2 · що робить",
      "type": "a",
      "max": 120,
      "def": "Drives the Jet Ski and pulls the surfer into the wave at the right moment and speed."
     },
     {
      "k": "role2Name",
      "label": "Роль 2 · назва",
      "type": "t",
      "max": 20,
      "def": "Pilot"
     },
     {
      "k": "role3Text",
      "label": "Роль 3 · що робить",
      "type": "a",
      "max": 120,
      "def": "Watches the ocean from the cliff and tells the team by radio which waves are coming."
     },
     {
      "k": "role3Name",
      "label": "Роль 3 · назва",
      "type": "t",
      "max": 20,
      "def": "Spotter"
     },
     {
      "k": "role4Text",
      "label": "Роль 4 · що робить",
      "type": "a",
      "max": 120,
      "def": "Waits nearby on a second Jet Ski, ready to pick up the surfer after a fall."
     },
     {
      "k": "role4Name",
      "label": "Роль 4 · назва",
      "type": "t",
      "max": 20,
      "def": "Rescue"
     }
    ]
   },
   {
    "title": "Кроки",
    "desc": "На телефоні спочатку видно 3 кроки, решта — за кнопкою.",
    "fields": [
     {
      "k": "step1Img",
      "label": "Крок 1 · фото",
      "type": "p",
      "def": "v3:a84bf25086.jpg"
     },
     {
      "k": "step1Title",
      "label": "Крок 1 · назва",
      "type": "t",
      "max": 40,
      "def": "Prepare"
     },
     {
      "k": "step1Text",
      "label": "Крок 1 · текст",
      "type": "a",
      "max": 200,
      "def": "Fitness, breath-hold practice and medical checks on land, all year round."
     },
     {
      "k": "step2Img",
      "label": "Крок 2 · фото",
      "type": "p",
      "def": "v3:2771cdc2fd.jpg"
     },
     {
      "k": "step2Title",
      "label": "Крок 2 · назва",
      "type": "t",
      "max": 40,
      "def": "Learn and train together"
     },
     {
      "k": "step2Text",
      "label": "Крок 2 · текст",
      "type": "a",
      "max": 200,
      "def": "Surfers and pilots practise pick-ups, hand signals and tow‑ins together in calm water, long before the big days."
     },
     {
      "k": "step3Img",
      "label": "Крок 3 · фото",
      "type": "p",
      "def": "v3:95f58c731d.jpg"
     },
     {
      "k": "step3Title",
      "label": "Крок 3 · назва",
      "type": "t",
      "max": 40,
      "def": "Check the equipment"
     },
     {
      "k": "step3Text",
      "label": "Крок 3 · текст",
      "type": "a",
      "max": 200,
      "def": "Boards, life vests, radios, Jet Skis and rescue sleds are checked and repaired before every swell."
     },
     {
      "k": "step4Img",
      "label": "Крок 4 · фото",
      "type": "p",
      "def": "v3:b82eac5eb9.jpg"
     },
     {
      "k": "step4Title",
      "label": "Крок 4 · назва",
      "type": "t",
      "max": 40,
      "def": "Plan the session"
     },
     {
      "k": "step4Text",
      "label": "Крок 4 · текст",
      "type": "a",
      "max": 200,
      "def": "The team reads the forecast, agrees who does what and goes through the safety plan together."
     },
     {
      "k": "step5Img",
      "label": "Крок 5 · фото",
      "type": "p",
      "def": "v3:154ab2f767.jpg"
     },
     {
      "k": "step5Title",
      "label": "Крок 5 · назва",
      "type": "t",
      "max": 40,
      "def": "Work on the water"
     },
     {
      "k": "step5Text",
      "label": "Крок 5 · текст",
      "type": "a",
      "max": 200,
      "def": "Surfers ride, pilots tow them in, the spotter guides from the cliff and the rescue team stays ready."
     },
     {
      "k": "step6Img",
      "label": "Крок 6 · фото",
      "type": "p",
      "def": "v3:2242c926c8.jpg"
     },
     {
      "k": "step6Title",
      "label": "Крок 6 · назва",
      "type": "t",
      "max": 40,
      "def": "Review"
     },
     {
      "k": "step6Text",
      "label": "Крок 6 · текст",
      "type": "a",
      "max": 200,
      "def": "After the session the team watches the footage and talks through what worked and what to change. This talk is called a debrief."
     }
    ]
   },
   {
    "title": "Спорядження",
    "desc": "",
    "fields": [
     {
      "k": "kitLabel",
      "label": "Надпис",
      "type": "t",
      "max": 30,
      "def": "The kit"
     },
     {
      "k": "kit1Img",
      "label": "Предмет 1 · фото",
      "type": "p",
      "def": "v3:1082d593fe.jpg"
     },
     {
      "k": "kit1Title",
      "label": "Предмет 1 · назва",
      "type": "t",
      "max": 30,
      "def": "Jet Ski"
     },
     {
      "k": "kit1Text",
      "label": "Предмет 1 · що це і навіщо",
      "type": "a",
      "max": 260,
      "def": "A small, fast water motorbike. The team uses it to pull surfers into waves too fast to catch by paddling, and to get them out of danger."
     },
     {
      "k": "kit1Used",
      "label": "Предмет 1 · хто користується (через кому)",
      "type": "t",
      "max": 60,
      "def": "Pilot, Rescue"
     },
     {
      "k": "kit2Img",
      "label": "Предмет 2 · фото",
      "type": "p",
      "def": "v3:75b905a037.jpg"
     },
     {
      "k": "kit2Title",
      "label": "Предмет 2 · назва",
      "type": "t",
      "max": 30,
      "def": "Rescue sled"
     },
     {
      "k": "kit2Text",
      "label": "Предмет 2 · що це і навіщо",
      "type": "a",
      "max": 260,
      "def": "A soft, flat platform fixed to the back of the Jet Ski. After a fall the surfer grabs it and lies on it, and the pilot drives them away from the breaking waves."
     },
     {
      "k": "kit2Used",
      "label": "Предмет 2 · хто користується (через кому)",
      "type": "t",
      "max": 60,
      "def": "Surfer, Rescue"
     }
    ]
   }
  ]
 },
 {
  "id": "access",
  "title": "Access to the team",
  "desc": "Доступ до команди: спочатку Nazaré Experience, потім Corporate Events. Кнопки відкривають форму з уже обраною темою.",
  "secs": [
   {
    "title": "Заголовок блоку",
    "desc": "",
    "fields": [
     {
      "k": "accLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "Access to the team"
     },
     {
      "k": "accTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "Come closer to big waves"
     }
    ]
   },
   {
    "title": "Nazaré Experience",
    "desc": "",
    "fields": [
     {
      "k": "expImg",
      "label": "Фото",
      "type": "p",
      "def": "v3:72e462094e.jpg"
     },
     {
      "k": "expEyebrow",
      "label": "Для кого",
      "type": "t",
      "max": 80,
      "def": "1–3 people or a small private group · Nazaré"
     },
     {
      "k": "expTitle",
      "label": "Назва",
      "type": "t",
      "max": 40,
      "def": "Nazaré Experience"
     },
     {
      "k": "expLead",
      "label": "Опис",
      "type": "a",
      "max": 400,
      "def": "Spend time with TAKE HIGH in Nazaré. Meet the team, get a safety briefing, see the equipment and how the crew prepares, and get closer to the world of big waves than the shore allows."
     },
     {
      "k": "expBtn",
      "label": "Текст кнопки",
      "type": "t",
      "max": 30,
      "def": "Request your Experience"
     },
     {
      "k": "expNote",
      "label": "Примітка дрібним текстом",
      "type": "a",
      "max": 400,
      "def": "If the weather, the ocean and safety allow, it can include the lighthouse, the route between the cliffs, small or big waves, a Jet Ski ride or the rescue sled. Nothing on the water is guaranteed; we agree the plan with you before the day."
     }
    ]
   },
   {
    "title": "Corporate Events",
    "desc": "",
    "fields": [
     {
      "k": "corpImg",
      "label": "Фото",
      "type": "p",
      "def": "v3:3298800892.jpg"
     },
     {
      "k": "corpEyebrow",
      "label": "Для кого",
      "type": "t",
      "max": 80,
      "def": "Companies and private groups · Nazaré"
     },
     {
      "k": "corpTitle",
      "label": "Назва",
      "type": "t",
      "max": 40,
      "def": "Corporate Events"
     },
     {
      "k": "corpLead",
      "label": "Опис",
      "type": "a",
      "max": 400,
      "def": "Team building and private events with TAKE HIGH, for small and large groups. Meet the team, see the Jet Skis and equipment, hear the TAKE HIGH story and enjoy hospitality at the lounge or another venue."
     },
     {
      "k": "corpBtn",
      "label": "Текст кнопки",
      "type": "t",
      "max": 30,
      "def": "Plan an event"
     },
     {
      "k": "corpNote",
      "label": "Примітка дрібним текстом",
      "type": "a",
      "max": 400,
      "def": "Agreed Experience elements can be added to the programme. Photos, videos and stories from past events will appear here."
     }
    ]
   }
  ]
 },
 {
  "id": "lists",
  "title": "Updates і Sessions",
  "desc": "Заголовки блоків. Самі новини — у розділі Новини, сесії — у розділі Сесії.",
  "secs": [
   {
    "title": "Updates from the team",
    "desc": "Чотири останні опубліковані новини (головна — перша) і фільтр за категоріями.",
    "fields": [
     {
      "k": "updLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "Updates from the team"
     },
     {
      "k": "updTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "News from the team"
     },
     {
      "k": "updBtn",
      "label": "Текст кнопки",
      "type": "t",
      "max": 30,
      "def": "All updates"
     }
    ]
   },
   {
    "title": "Real sessions",
    "desc": "Опубліковані сесії в порядку з розділу Сесії, гортаються вбік.",
    "fields": [
     {
      "k": "sesLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "Real sessions"
     },
     {
      "k": "sesTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "Latest work on the water"
     },
     {
      "k": "sesBtn",
      "label": "Текст кнопки",
      "type": "t",
      "max": 30,
      "def": "Explore Performance"
     }
    ]
   }
  ]
 },
 {
  "id": "partners",
  "title": "Partnerships",
  "desc": "Блок партнерства на Home. Список партнерів — з розділу Партнери.",
  "secs": [
   {
    "title": "Заголовок і фон",
    "desc": "",
    "fields": [
     {
      "k": "parBg",
      "label": "Фонове фото",
      "type": "p",
      "def": "v3:05b86e8a41.jpg"
     },
     {
      "k": "parLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "Partnerships"
     },
     {
      "k": "parTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "Partner with the team"
     },
     {
      "k": "parLead",
      "label": "Опис",
      "type": "a",
      "max": 220,
      "def": "We build every partnership around a real need of the team and a clear goal for the partner."
     }
    ]
   },
   {
    "title": "Три пункти і кнопка",
    "desc": "",
    "fields": [
     {
      "k": "par1Title",
      "label": "Пункт 1 · назва",
      "type": "t",
      "max": 40,
      "def": "Your role"
     },
     {
      "k": "par1Text",
      "label": "Пункт 1 · текст",
      "type": "a",
      "max": 160,
      "def": "Equipment, technology, travel, media or support for the athletes."
     },
     {
      "k": "par2Title",
      "label": "Пункт 2 · назва",
      "type": "t",
      "max": 40,
      "def": "What we create together"
     },
     {
      "k": "par2Text",
      "label": "Пункт 2 · текст",
      "type": "a",
      "max": 160,
      "def": "Content, events, product tests and stories from the water."
     },
     {
      "k": "par3Title",
      "label": "Пункт 3 · назва",
      "type": "t",
      "max": 40,
      "def": "How to start"
     },
     {
      "k": "par3Text",
      "label": "Пункт 3 · текст",
      "type": "a",
      "max": 160,
      "def": "Tell us about your brand and idea. We reply and agree the details together."
     },
     {
      "k": "parBtn",
      "label": "Текст кнопки",
      "type": "t",
      "max": 30,
      "def": "Discuss a partnership"
     }
    ]
   }
  ]
 },
 {
  "id": "contact",
  "title": "Форма і підписка",
  "desc": "Форма «Get in touch» (заявки йдуть у Звернення) і підписка «Follow the updates» (у Підписки).",
  "secs": [
   {
    "title": "Форма звернення",
    "desc": "",
    "fields": [
     {
      "k": "appLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "Get in touch"
     },
     {
      "k": "appTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "Tell us what interests you"
     },
     {
      "k": "appLead",
      "label": "Опис",
      "type": "a",
      "max": 220,
      "def": "Fill in the sentence and send it. The team reads every request and replies by email within [X] working days."
     },
     {
      "k": "appTip",
      "label": "Підказка біля «i»",
      "type": "a",
      "max": 200,
      "def": "By sending, you agree that TAKE HIGH may use these details to reply to you."
     },
     {
      "k": "appAltLabel",
      "label": "Надпис над контактами",
      "type": "t",
      "max": 40,
      "def": "Prefer to write directly?"
     },
     {
      "k": "appEmail",
      "label": "Email команди",
      "type": "t",
      "max": 80,
      "def": "[team email]"
     },
     {
      "k": "appDoneTitle",
      "label": "Після відправки · заголовок",
      "type": "t",
      "max": 60,
      "def": "Thank you, we have your request"
     },
     {
      "k": "appDoneText",
      "label": "Після відправки · текст",
      "type": "a",
      "max": 200,
      "def": "The team will reply to your email within [X] working days. Meanwhile, follow our updates on Instagram."
     }
    ]
   },
   {
    "title": "Follow the updates",
    "desc": "",
    "fields": [
     {
      "k": "folBg",
      "label": "Фонове фото",
      "type": "p",
      "def": "v3:e427f632db.jpg"
     },
     {
      "k": "folLabel",
      "label": "Надпис",
      "type": "t",
      "max": 40,
      "def": "Follow the updates"
     },
     {
      "k": "folTitle",
      "label": "Заголовок",
      "type": "t",
      "max": 90,
      "def": "Not ready to apply? Stay close."
     },
     {
      "k": "folLead",
      "label": "Опис",
      "type": "a",
      "max": 220,
      "def": "Leave your email and we'll write when something new happens. No spam, unsubscribe any time."
     },
     {
      "k": "tile1",
      "label": "Плитка 1",
      "type": "t",
      "max": 24,
      "def": "Team news"
     },
     {
      "k": "tile2",
      "label": "Плитка 2",
      "type": "t",
      "max": 24,
      "def": "New sessions"
     },
     {
      "k": "tile3",
      "label": "Плитка 3",
      "type": "t",
      "max": 24,
      "def": "The film"
     },
     {
      "k": "tile4",
      "label": "Плитка 4",
      "type": "t",
      "max": 24,
      "def": "Events"
     },
     {
      "k": "tile5",
      "label": "Плитка 5",
      "type": "t",
      "max": 24,
      "def": "Nazaré Experience"
     },
     {
      "k": "tile6",
      "label": "Плитка 6",
      "type": "t",
      "max": 24,
      "def": "New formats"
     }
    ]
   }
  ]
 }
];
// категорії новин (фільтр на Home і в списку новин)
window.TH_CATEGORIES = ['Trips', 'Sessions', 'Training', 'Equipment', 'Team news', 'Events', 'Media', 'Partners'];
// теми форми «Get in touch»: група → теми
window.TH_TOPICS = [['Visit the team', ['Nazaré Experience', 'Team Building', 'Corporate Event']], ['Train with the team', ['Training', 'Athlete', 'Jet Ski Pilot']], ['Other', ['General Contact', 'Follow the Updates']]];
window.TH_GROUP_SIZES = ['1 person', '2 people', '3 people', '4–10 people', '11–30 people', '30+ people'];
window.TH_HOME_DEFAULTS = (function () { var o = {}; window.TH_HOME_SCHEMA.forEach(function (t) { t.secs.forEach(function (s) { s.fields.forEach(function (f) { o[f.k] = f.def; }); }); }); return o; })();
// категорія новини; для старих записів без категорії — за правилом переходу з «Розділ / Тип» (адмінка один раз записує її в дані)
window.TH_CAT_OF = function (n) {
  if (n && n.cat && window.TH_CATEGORIES.indexOf(n.cat) >= 0) return n.cat;
  var byType = { 'Session Report': 'Sessions', 'Technical': 'Equipment', 'Team Update': 'Team news', 'Partner Update': 'Partners' };
  if (n && byType[n.type]) return byType[n.type];
  if (n && n.section === 'Media') return 'Media';
  return 'Team news';
};
