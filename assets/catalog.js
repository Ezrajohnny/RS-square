(() => {
  const v = (id, flavor, size, price, entries, image, source, review, origin) => ({
    id, flavor: flavor || '', size: size || '', origin: origin || '', price, entries,
    image: image || '', imageSource: source || '', review: review || ''
  });
  const p = (id, name, brand, category, variants, featured) => ({
    id, name, brand: brand || 'Brand not specified', category, variants, featured: !!featured
  });

  window.RS_CATALOG = [
    p('allmax-creatine-monohydrate-powder','Creatine Monohydrate Powder','ALLMAX','Creatine',[
      v('allmax-creatine-powder-100g','Unflavoured','100g',379.35,[1]),
      v('allmax-creatine-powder-250g','Unflavoured','250g',690.52,[2])
    ]),
    p('allmax-gold-allwhey','Gold Allwhey','ALLMAX','Whey Protein',[
      v('allmax-gold-allwhey-chocolate-907g','Chocolate','907g (2lb)',3865.20,[3],'assets/products/allmax-gold-allwhey-chocolate-2lb.webp','https://www.allmaxnutrition.com/products/allmax-gold-allwhey-premium-whey-protein-powder'),
      v('allmax-gold-allwhey-choc-pb-18kg','Chocolate Peanut Butter','1.8kg (4lb)',7925.20,[4])
    ],true),
    p('allmax-isoflex','Isoflex','ALLMAX','Isolate Protein',[
      v('allmax-isoflex-chocolate-907g','Chocolate','907g (2lb)',5245.20,[5]),
      v('allmax-isoflex-chocolate-18kg','Chocolate','1.8kg',10225.20,[6])
    ],true),
    p('omega-3-90-capsules','Omega 3','Brand not specified','Fish Oil & Wellness',[v('omega-3-90-capsules','', '90 capsules',717.53,[7])]),
    p('vitaform-men','Vitaform Men','Brand not specified','Vitamins & Minerals',[v('vitaform-men-60-capsules','', '60 capsules',717.53,[8])]),
    p('iso-hydro','Iso Hydro','Brand not specified','Isolate Protein',[v('iso-hydro-5lb','', '5lb',6951.02,[9])]),
    p('americanz-muscles-professional-protein','Americanz Muscles Professional Protein','Americanz Muscles','Whey Protein',[v('americanz-muscles-professional-protein-5lb','', '5lb',5317.81,[10])]),
    p('stim-load','Stim Load','Brand not specified','Pre-Workout',[v('stim-load-60-servings','', '60 servings',2068.50,[11])]),
    p('instant-whey','Instant Whey','Brand not specified','Whey Protein',[v('instant-whey-1kg','', '1kg',1609.65,[12])]),
    p('cla','CLA','Brand not specified','Fish Oil & Wellness',[v('cla-60-capsules','', '60 capsules',929.25,[13])]),
    p('collagen-extreme','Collagen Extreme','Brand not specified','Fish Oil & Wellness',[v('collagen-extreme-300g','', '300g',1454.25,[14])]),
    p('creatine-extreme','Creatine Extreme','Brand not specified','Creatine',[
      v('creatine-extreme-250g','', '250g',669.38,[15]),
      v('creatine-extreme-300g','', '300g',669.38,[16])
    ]),
    p('eaa','EAA','Brand not specified','Amino Acids',[v('eaa-315g-30-servings','', '315g, 30 servings',1195.19,[17])]),
    p('glutamine-300g','Glutamine','Brand not specified','Amino Acids',[v('glutamine-300g','', '300g',804.59,[18])]),
    p('elev-iso-gold','Iso Gold','Elev','Isolate Protein',[
      v('elev-iso-gold-1kg','', '1kg',3925.30,[19]),
      v('elev-iso-gold-2kg','', '2kg',7225.20,[20])
    ],true),
    p('l-arginine','L-Arginine','Brand not specified','Amino Acids',[v('l-arginine-120-capsules','', '120 capsules',1063.00,[21])]),
    p('l-carni-blast','L-Carni Blast','Brand not specified','Other Supplements',[v('l-carni-blast-500ml','', '500ml',1479.60,[22])]),
    p('mass-matrix-with-creatine','Mass Matrix with Creatine','Brand not specified','Mass Gainers',[v('mass-matrix-with-creatine-3kg-plus-250g','', '3kg + 250g Creatine',2305.19,[23])]),
    p('elev-tri-whey','Tri Whey','Elev','Whey Protein',[
      v('elev-tri-whey-1kg','', '1kg',2785.21,[24]),
      v('elev-tri-whey-23kg','', '2.3kg',5185.20,[25])
    ]),
    p('whey-protein','Whey Protein','Brand not specified','Whey Protein',[v('whey-protein-chocolate-4lb','Chocolate','4lb',3637.80,[26])]),
    p('my-whey','My Whey','Brand not specified','Whey Protein',[v('my-whey-chocolate-2kg','Chocolate','2kg',3624.00,[27])]),
    p('creatine-blueberry','Creatine','Brand not specified','Creatine',[v('creatine-blueberry-100g','Blueberry','100g',431.55,[28])]),
    p('pp-100-whey','PP 100% Whey','Brand not specified','Whey Protein',[v('pp-100-whey-1kg','', '1kg',3549.00,[29])]),
    p('armour-whey','Armour Whey','Brand not specified','Whey Protein',[v('armour-whey-1kg','', '1kg',2100.00,[30])]),
    p('collagen-india','Collagen','Brand not specified','Fish Oil & Wellness',[v('collagen-india-250g','','250g',1818.92,[31],'','','','India')]),
    p('creatine-monohydrate-india','Creatine Monohydrate','Brand not specified','Creatine',[v('creatine-monohydrate-india-250g','','250g',1099.00,[32],'','','','India')]),
    p('low-carb-dutch-chocolate-india','Low Carb','Brand not specified','Other Supplements',[
      v('low-carb-dutch-chocolate-india-1kg','Dutch Chocolate','1kg',6928.95,[33],'','','','India'),
      v('low-carb-dutch-chocolate-india-2kg','Dutch Chocolate','2kg',13099.00,[34],'','','','India')
    ]),
    p('scatterbrain','Scatterbrain','Brand not specified','Pre-Workout',[v('scatterbrain','', '',1911.00,[35])]),
    p('shaaboom-pump','Shaaboom Pump','Brand not specified','Pre-Workout',[v('shaaboom-pump','', '',1865.02,[36])]),
    p('biozyme-iso-low-carb','Biozyme Iso Low Carb','MuscleBlaze','Isolate Protein',[v('biozyme-iso-low-carb-cookies-cream','Cookies & Cream','',5466.39,[37])]),
    p('biozyme-iso-zero-low-carb','Biozyme Iso-Zero Low Carb','MuscleBlaze','Isolate Protein',[v('biozyme-iso-zero-ice-cream-chocolate-22lb','Ice Cream Chocolate','2.2lb',5466.00,[38])]),
    p('biozyme-performance-whey','Biozyme Performance Whey','MuscleBlaze','Whey Protein',[
      v('biozyme-performance-whey-french-vanilla-22lb','French Vanilla Creme','2.2lb',3838.80,[39],'assets/products/mb-biozyme-performance-whey-french-vanilla-creme-2.2lb.jpg','https://www.muscleblaze.com/sv/muscleblaze-biozyme-performance-whey/SP-88093?navKey=VRNT-230045'),
      v('biozyme-performance-whey-magical-mango-22lb','Magical Mango','2.2lb',3838.80,[40],'assets/products/mb-biozyme-performance-whey-magical-mango-2.2lb.jpg','https://www.muscleblaze.com/sv/muscleblaze-biozyme-performance-whey/SP-88093?navKey=VRNT-166783')
    ],true),
    p('mass-gainer-xxl','Mass Gainer XXL','Brand not specified','Mass Gainers',[v('mass-gainer-xxl-chocolate-66lb','Chocolate','6.6lb',3400.00,[41])]),
    p('pre-workout-wrathx','Pre Workout WrathX','Brand not specified','Pre-Workout',[v('pre-workout-wrathx-cola-frost-270g','Cola Frost','270g',899.00,[42])]),
    p('musclepharm-product-details','MusclePharm — Product details to be confirmed','MusclePharm','Other Supplements',[v('musclepharm-product-details-to-confirm','', '',7699.00,[43])]),
    p('glutamine-250g','Glutamine','Brand not specified','Amino Acids',[v('glutamine-250g','', '250g',763.50,[44])]),
    p('creatine-monohydrate-unflavoured-250g','Creatine Monohydrate','Brand not specified','Creatine',[v('creatine-monohydrate-unflavoured-250g','Unflavoured','250g',800.63,[45])]),
    p('multivitamin','Multivitamin','Brand not specified','Vitamins & Minerals',[v('multivitamin-60-tablets','', '60 tablets',763.50,[46])]),
    p('nitrotech-whey-protein','NitroTech Whey Protein','MuscleTech','Whey Protein',[v('nitrotech-whey-protein-907g','', '907g',3599.00,[47])]),
    p('mass-extreme','Mass Extreme','Brand not specified','Mass Gainers',[v('mass-extreme-triple-chocolate-272kg','Triple Chocolate','2.72kg (6lb)',3080.99,[48])]),
    p('whey-triple-chocolate','Whey','Brand not specified','Whey Protein',[v('whey-triple-chocolate-227kg','Triple Chocolate','2.27kg (5lb)',7465.20,[49])]),
    p('bcaa-2-1-1','BCAA 2:1:1','Brand not specified','Amino Acids',[v('bcaa-2-1-1-blue-raspberry-250g','Blue Raspberry','250g',852.53,[50])]),
    p('creatine-lemon-mint','Creatine','Brand not specified','Creatine',[v('creatine-lemon-mint-250g','Lemon & Mint','250g',683.77,[51])]),
    p('creatine-monohydrate-250g','Creatine Monohydrate','Brand not specified','Creatine',[v('creatine-monohydrate-250g','', '250g',683.77,[52])]),
    p('creatine-monohydrate-unflavoured-100g','Creatine Monohydrate','Brand not specified','Creatine',[v('creatine-monohydrate-unflavoured-100g','Unflavoured','100g',380.04,[53])]),
    p('myprotein-impact-whey-isolate','Impact Whey Isolate','Myprotein','Isolate Protein',[
      v('myprotein-impact-whey-isolate-cpb-25kg','Chocolate Peanut Butter','2.5kg',10837.81,[54]),
      v('myprotein-impact-whey-isolate-matcha-latte-1kg','Matcha Latte','1kg',4837.79,[55])
    ]),
    p('myprotein-impact-whey-protein','Impact Whey Protein','Myprotein','Whey Protein',[
      v('myprotein-impact-whey-protein-chocolate-mint-1kg','Chocolate Mint','1kg',3637.80,[56]),
      v('myprotein-impact-whey-protein-chocolate-mint-25kg','Chocolate Mint','2.5kg',7057.81,[57])
    ],true),
    p('omega-3-softgels','Omega 3','Brand not specified','Fish Oil & Wellness',[v('omega-3-90-softgels','', '90 softgels',650.02,[58])]),
    p('bcaa-5000','BCAA 5000','Brand not specified','Amino Acids',[
      v('bcaa-5000-fruit-punch-india-250g','Fruit Punch','250g',1239.00,[59],'','','','India'),
      v('bcaa-5000-green-apple-india-250g','Green Apple','250g',1239.00,[60],'','','','India')
    ]),
    p('on-creatine-citrus-orange','Creatine','ON','Creatine',[
      v('on-creatine-citrus-orange-100g','Citrus Orange','100g',599.00,[61]),
      v('on-creatine-citrus-orange-250g','Citrus Orange','250g',999.00,[62,63])
    ]),
    p('fish-oil-india','Fish Oil','Brand not specified','Fish Oil & Wellness',[v('fish-oil-india-60-capsules','','60 capsules',577.50,[64],'','','','India')]),
    p('on-gold-standard-whey','Gold Standard Whey','ON','Whey Protein',[
      v('on-gold-standard-whey-17kg','', '1.7kg',7314.30,[65]),
      v('on-gold-standard-whey-rcb-907g','Double Rich Chocolate x RCB Play Bold','907g',4999.00,[76])
    ],true),
    p('on-100-whey','100% Whey','ON','Whey Protein',[
      v('on-100-whey-double-rich-chocolate-4kg','Double Rich Chocolate','4kg',18847.50,[66]),
      v('on-100-whey-double-rich-chocolate-907g','Double Rich Chocolate','907g',5311.95,[67])
    ]),
    p('on-gold-standard-pre-workout','Gold Standard Pre-Workout','ON','Pre-Workout',[
      v('on-gold-standard-preworkout-fruit-punch-15pack','Fruit Punch','15 pack',677.25,[68]),
      v('on-gold-standard-preworkout-green-apple-15pack','Green Apple','15 pack',677.25,[69,70],'','','Conflicting catalog prices: ₹677.25 (entry 69) and ₹645.00 (entry 70). Keep one Green Apple 15 pack variant at ₹677.25 pending admin review.')
    ]),
    p('l-glutamine-powder','L-Glutamine Powder','Brand not specified','Amino Acids',[v('l-glutamine-powder-india-250g','','250g',998.28,[71],'','','','India')]),
    p('serious-mass','Serious Mass','ON','Mass Gainers',[v('serious-mass-vanilla-3kg','Vanilla','3kg',4059.00,[72])]),
    p('performance-whey','Performance Whey','Brand not specified','Whey Protein',[
      v('performance-whey-chocolate-1kg','Chocolate','1kg',4156.07,[73]),
      v('performance-whey-chocolate-2kg','Chocolate','2kg',6720.00,[74])
    ]),
    p('multivitamin-for-men','Multivitamin for Men','Brand not specified','Vitamins & Minerals',[v('multivitamin-for-men-60-tablets','', '60 tablets',745.50,[75])]),
    p('nitro-whey','Nitro Whey','Brand not specified','Whey Protein',[v('nitro-whey-181kg','', '1.81kg',6577.81,[77])]),
    p('premium-whey','Premium Whey','Brand not specified','Whey Protein',[v('premium-whey-227kg','', '2.27kg',6397.80,[78])]),
    p('pre-workout-35-servings','Pre-Workout','Brand not specified','Pre-Workout',[v('pre-workout-35-servings','', '35 servings',1828.00,[79])]),
    p('king-whey-protein','King Whey Protein','Brand not specified','Whey Protein',[v('king-whey-protein-coffee-toffee-2lb','Coffee Toffee','2lb',3045.36,[80])]),
    p('pro-30-capsules','Pro','Brand not specified','Other Supplements',[v('pro-30-capsules','', '30 capsules',1977.15,[81])]),
    p('bcaa-unspecified','BCAA','Brand not specified','Amino Acids',[v('bcaa-unspecified', '', '',2045.99,[82])])
  ];
})();
