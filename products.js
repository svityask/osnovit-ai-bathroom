// Каталог продуктов «Основит» для прототипа.
// Названия, фото и ссылки взяты с публичного каталога https://osnovit.ru/catalog/
const SITE = "https://osnovit.ru";

const PRODUCTS = {
  ac12h: {
    name: "Мастпликс AC12 H [C1T]",
    kind: "Клей плиточный усиленный",
    desc: "Для керамической плитки и керамогранита среднего формата на стенах и полу.",
    url: "/catalog/plitochnye-klei/mastpliks-as12-h-plitochnyy-kley-usilennyy-osnovit/",
    img: "/upload/iblock/54c/mastpliks_ac12_h_kley_usilennyy_dlya_keramicheskoy_plitki_i_keramogranita_osnovit.png",
  },
  ac16: {
    name: "Максипликс AC16 [C2TE]",
    kind: "Клей плиточный профессиональный",
    desc: "Беспылевой клей для крупноформатного керамогранита, мрамора и камня на стенах.",
    url: "/catalog/plitochnye-klei/maksipliks-t-16/",
    img: "/upload/iblock/199/Maksipliks-AC16-kley-professionalnyy-bespylevoy-dlya-mramora_-granita_-keramogranita-i-naturalnogo-kamnya-Osnovit-ot-proizvoditelya-OSNOVIT.png",
  },
  ac161e: {
    name: "Максипликс AC161 E [C2TE S1]",
    kind: "Клей высокоэластичный беспылевой",
    desc: "Для крупного формата на полу, тёплых полов и деформируемых оснований.",
    url: "/catalog/plitochnye-klei/maksipliks-as16-e/",
    img: "/upload/iblock/f5c/Maksipliks-AC161-E-kley-vysokoelastichnyy-Osnovit-ot-proizvoditelya-OSNOVIT.png",
  },
  ac17w: {
    name: "Максипликс AC17 W [C2TE]",
    kind: "Клей плиточный белый",
    desc: "Белый клей для мрамора, стеклянной и мозаичной плитки: не просвечивает.",
    url: "/catalog/plitochnye-klei/belpliks-t-17/",
    img: "/upload/iblock/bac/maksipliks_as17_w_kley_professionalnyy_belyy_dlya_mramora_steklyannoy_i_mozaichnoy_plitki_osnovit.jpg",
  },
  pc211: {
    name: "Стартвэлл PC211 M",
    kind: "Штукатурка цементная",
    desc: "Выравнивание стен под плитку во влажных помещениях.",
    url: "/catalog/shtukaturki/osnovit-startvell-pc211-m-shtukaturka-tsementnaya/",
    img: "/upload/iblock/c9c/6awpfs8wu1x56l2fd6cwaj9anmqwr9nr/osnovit_startvell_pc211_m_shtukaturka_tsementnaya.png",
  },
  lp51a: {
    name: "Унконт Люкс LP51 A",
    kind: "Грунт универсальный",
    desc: "Подготовка стен перед штукатуркой и укладкой плитки.",
    url: "/catalog/gruntovki/unkont-lyuks-lp51-a/",
    img: "/upload/iblock/aa8/grunt_universalnyy_osnovit_unkont_lyuks_lp51_a.png",
  },
  lp52: {
    name: "Профиконт LP52",
    kind: "Грунт-концентрат глубокого проникновения",
    desc: "Укрепляет пористые основания пола перед наливным полом и клеем.",
    url: "/catalog/gruntovki/grunt-kontsentrat-osnovit-profikont-lp52-1-l/",
    img: "/upload/iblock/ba7/grunt_kontsentrat_glubokogo_proniknoveniya_osnovit_profikont_lp52_1_l.png",
  },
  fc40: {
    name: "Стартолайн FC40",
    kind: "Стяжка базовая",
    desc: "Черновое выравнивание пола и формирование уклона к трапу.",
    url: "/catalog/smesi-dlya-ustroystva-pola/startolayn-FC-40/",
    img: "/upload/iblock/bc5/styazhka_bazovaya_osnovit_startolayn_fc40.png",
  },
  fc42h: {
    name: "Ниплайн FC42 H",
    kind: "Наливной пол высокопрочный",
    desc: "Ровное прочное основание под плитку.",
    url: "/catalog/smesi-dlya-ustroystva-pola/niplayn-fc42-h-nalivnoy-pol-vysokoprochnyy-osnovit-/",
    img: "/upload/iblock/ed8/nalivnoy_pol_vysokoprochnyy_osnovit_niplayn_fc42_h.png",
  },
  hc62: {
    name: "Акваскрин HC62 E1K",
    kind: "Гидроизоляция эластичная однокомпонентная",
    desc: "Обмазочная гидроизоляция душевой зоны, пола и стен под плитку.",
    url: "/catalog/gidroizolyatsiya/akvaskrin-hc62-e1k-gidroizolyatsiya-elastichnaya-odnokomponentnaya-osnovit-/",
    img: "/upload/iblock/a70/mdxd1ra684set55ijocz27cudptxx7qc/akvaskrin_hc62_e1k_gidroizolyatsiya_elastichnaya_odnokomponentnaya_osnovit.png",
  },
  ha64: {
    name: "Акваскрин HA64",
    kind: "Готовая эластичная гидроизоляция",
    desc: "Готовая к применению мастика: удобно для небольших площадей и примыканий.",
    url: "/catalog/gidroizolyatsiya/gidroizolyatsiya-gotovaya-elastichnaya-osnovit-khardskrin-hac64-/",
    img: "/upload/iblock/e4a/xl8rq1ot7k428vyhnzwo2tlg10qe43i5/gidroizolyatsiya_elastichnaya_gotovaya_osnovit_akvaskrin_ha64_.png",
  },
  hb70: {
    name: "Акваскрин HB70",
    kind: "Лента гидроизоляционная армированная",
    desc: "Герметизация углов и стыков стена-пол в мокрой зоне.",
    url: "/catalog/gidroizolyatsiya/gidroizolyatsionnaya-lenta-armirovannaya-setkoy-v-korobe-osnovit-akvaskrin-hb70-10-m/",
    img: "/upload/iblock/27e/mtctmh8q9kwgir5wjdnd1wvnx6g67pk4/gidroizolyatsionnaya_lenta_armirovannaya_setkoy_v_korobe_osnovit_akvaskrin_hb70_10_m.png",
  },
  xc6e: {
    name: "Плитсэйв XC6 E",
    kind: "Затирка цветная эластичная",
    desc: "Водоотталкивающая затирка для швов на стенах и полу.",
    url: "/catalog/zatirki-i-rasshivki/plitseyv-khs6-e/",
    img: "/upload/iblock/554/d64t3e7x5qcjbqvwbe4yzo4jz1hib4wk/zatirka_elastichnaya_tsvetnaya_osnovit_plitseyv_xc6_e_2_kg.png",
  },
  xe15: {
    name: "Плитсэйв Ultra XE15 E",
    kind: "Затирка эпоксидная",
    desc: "Абсолютно водонепроницаемые швы для душевой и глянцевой плитки.",
    url: "/catalog/zatirki-i-rasshivki/zatirka-epoksidnaya-osnovit-plitseyv-ultra-xe15-e-1kg/",
    img: "/upload/iblock/7eb/zatirka_epoksidnaya_osnovit_plitseyv_ultra_xe15_e_1kg.png",
  },
  sealant: {
    name: "Плитсэйв санитарный",
    kind: "Герметик силиконовый",
    desc: "Примыкания ванны, поддона, раковины и угловые швы.",
    url: "/catalog/germetiki/germetik-sanitarnyy-silikonovyy-plitseyv/",
    img: "/upload/iblock/50a/tuii0iuz4pcbvvo3feoyd5i29qdhwf3i/germetik_sanitarnyy_silikonovyy_plitseyv.png",
  },
};

for (const p of Object.values(PRODUCTS)) {
  p.url = SITE + p.url;
  p.img = SITE + p.img;
}
