import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
  return createClient(supabaseUrl, supabaseKey);
}

// 8 Categories
export const SEED_CATEGORIES = [
  { name: "Plumbing Services", slug: "plumbing", icon: "Wrench", desc: "Leaks, tap fixes, pipe installations & unclogging" },
  { name: "Electrical Works", slug: "electrical", icon: "Zap", desc: "Short circuits, wiring, breaker fixes & socket wiring" },
  { name: "AC & Refrigeration", slug: "ac-repair", icon: "Wind", desc: "AC servicing, gas filling, leak diagnostics & chiller units" },
  { name: "Cleaning & Sanitation", slug: "cleaning", icon: "Sparkles", desc: "Deep cleaning, floor scrubbing & upholstery care" },
  { name: "Carpentry & Woodwork", slug: "carpentry", icon: "Hammer", desc: "Door lock fixing, furniture repair & partition builds" },
  { name: "Masonry & Tiling", slug: "masonry", icon: "Building", desc: "Tile replacement, wall plastering & general civil jobs" },
  { name: "Painting & Waterproofing", slug: "painting", icon: "Paintbrush", desc: "Interior/exterior emulsion, damp wall coating & sealing" },
  { name: "Appliance Repairs", slug: "appliance", icon: "Tv", desc: "Washing machine, microwave, oven & inverter troubleshooting" },
];

// 20 Services
export const SEED_SERVICES = [
  { catSlug: "plumbing", name: "Pipe Leak & Burst Repair", price: 2500 },
  { catSlug: "plumbing", name: "Bathroom Tap & Shower Fitting", price: 2000 },
  { catSlug: "plumbing", name: "Drain Unclogging & Gully Clean", price: 3500 },
  { catSlug: "electrical", name: "Short Circuit & Trip Fix", price: 2500 },
  { catSlug: "electrical", name: "Ceiling Fan & Light Fixture Install", price: 1800 },
  { catSlug: "electrical", name: "Main Distribution Board (DB) Check", price: 4000 },
  { catSlug: "ac-repair", name: "Split AC Chemical Cleaning", price: 3500 },
  { catSlug: "ac-repair", name: "Refrigerant (Gas) Top-up", price: 5500 },
  { catSlug: "ac-repair", name: "AC Water Leak Troubleshooting", price: 2800 },
  { catSlug: "cleaning", name: "Full Home Deep Sanitization", price: 8000 },
  { catSlug: "cleaning", name: "Kitchen Degreasing & Hood Clean", price: 4500 },
  { catSlug: "cleaning", name: "Sofa & Mattress Shampoo Wash", price: 4000 },
  { catSlug: "carpentry", name: "Door Lock & Handle Fitting", price: 2000 },
  { catSlug: "carpentry", name: "Wooden Furniture Repair", price: 3000 },
  { catSlug: "carpentry", name: "Pantry Cupboard Hinge Repair", price: 2500 },
  { catSlug: "masonry", name: "Floor Tile Repair & Regrouting", price: 4000 },
  { catSlug: "masonry", name: "Wall Crack & Plaster Patch", price: 3500 },
  { catSlug: "painting", name: "Room Wall Painting (Labor)", price: 6000 },
  { catSlug: "painting", name: "Roof & Gutter Waterproofing", price: 7500 },
  { catSlug: "appliance", name: "Washing Machine Motor Repair", price: 4500 },
];

// 10 Customers
export const SEED_CUSTOMERS = [
  { id: "c1111111-1111-1111-1111-111111111101", name: "Kasun Perera", phone: "+94771234501", district: "Colombo", city: "Nugegoda", address: "14/2 Stanley Road" },
  { id: "c1111111-1111-1111-1111-111111111102", name: "Anura Bandara", phone: "+94771234502", district: "Kurunegala", city: "Kurunegala Town", address: "55 Kandy Road" },
  { id: "c1111111-1111-1111-1111-111111111103", name: "Dilani Fernando", phone: "+94771234503", district: "Gampaha", city: "Negombo", address: "88 Sea Street" },
  { id: "c1111111-1111-1111-1111-111111111104", name: "Mahesh Silva", phone: "+94771234504", district: "Kandy", city: "Peradeniya", address: "12 Hill Crest" },
  { id: "c1111111-1111-1111-1111-111111111105", name: "Nirosha Jayasuriya", phone: "+94771234505", district: "Kurunegala", city: "Mawathagama", address: "24 Temple Road" },
  { id: "c1111111-1111-1111-1111-111111111106", name: "Ranjith Kumara", phone: "+94771234506", district: "Colombo", city: "Dehiwala", address: "102 Galle Road" },
  { id: "c1111111-1111-1111-1111-111111111107", name: "Sachini Wickramasinghe", phone: "+94771234507", district: "Kalutara", city: "Panadura", address: "40 Beach Road" },
  { id: "c1111111-1111-1111-1111-111111111108", name: "Chamara Senaratne", phone: "+94771234508", district: "Kurunegala", city: "Kuliyapitiya", address: "15 Bazaar Street" },
  { id: "c1111111-1111-1111-1111-111111111109", name: "Priyanka Alwis", phone: "+94771234509", district: "Matara", city: "Matara Town", address: "78 Rahula Road" },
  { id: "c1111111-1111-1111-1111-111111111110", name: "Supun Weerakkody", phone: "+94771234510", district: "Colombo", city: "Maharagama", address: "66 High Level Road" },
];

// 20 Fictional Providers (Kurunegala, Colombo, Kandy focus)
export const SEED_PROVIDERS = [
  { id: "p2222222-2222-2222-2222-222222222201", name: "Nimal Perera", biz: "Nimal Plumbing Works", phone: "+94711110001", nic: "198212345671", district: "Kurunegala", rating: 4.9, reviews: 34, exp: 12, bio: "Certified plumber with 12 years of residential plumbing experience in Kurunegala." },
  { id: "p2222222-2222-2222-2222-222222222202", name: "Kamal Jayawardena", biz: "Kamal Electrical Services", phone: "+94711110002", nic: "198512345672", district: "Kurunegala", rating: 4.8, reviews: 29, exp: 9, bio: "Licensed technician for domestic DBs, industrial wiring, and trip switches." },
  { id: "p2222222-2222-2222-2222-222222222203", name: "Sunil Shantha", biz: "CoolTech AC Services", phone: "+94711110003", nic: "198812345673", district: "Colombo", rating: 4.9, reviews: 45, exp: 10, bio: "Expert in inverter AC cleaning, PCB repairing, and gas re-filling." },
  { id: "p2222222-2222-2222-2222-222222222204", name: "Ruwan Prasanna", biz: "TechFix LK", phone: "+94711110004", nic: "199012345674", district: "Colombo", rating: 4.7, reviews: 18, exp: 6, bio: "Prompt handyman and electrical fault finder covering Colombo suburbs." },
  { id: "p2222222-2222-2222-2222-222222222205", name: "Dhammika Bandara", biz: "Wayamba Cleaners", phone: "+94711110005", nic: "198312345675", district: "Kurunegala", rating: 5.0, reviews: 22, exp: 8, bio: "Commercial pressure washing, water tank sanitizing, and tile deep cleaning." },
  { id: "p2222222-2222-2222-2222-222222222206", name: "Gamini Wijesinghe", biz: "Gamini Woodcraft", phone: "+94711110006", nic: "197812345676", district: "Kandy", rating: 4.6, reviews: 14, exp: 20, bio: "Master carpenter specializing in solid teak doors, locks, and roof frames." },
  { id: "p2222222-2222-2222-2222-222222222207", name: "Lasantha Dias", biz: "Express Pipe Masters", phone: "+94711110007", nic: "198712345677", district: "Colombo", rating: 4.8, reviews: 38, exp: 11, bio: "Emergency burst pipe & underground leak detection specialist." },
  { id: "p2222222-2222-2222-2222-222222222208", name: "Ajith Wickrama", biz: "Kandy Spark Electricals", phone: "+94711110008", nic: "199112345678", district: "Kandy", rating: 4.9, reviews: 27, exp: 7, bio: "Full residential wiring, earthing installation, and switchgear maintenance." },
  { id: "p2222222-2222-2222-2222-222222222209", name: "Sarath Fonseka", biz: "Lanka AC Solutions", phone: "+94711110009", nic: "198412345679", district: "Gampaha", rating: 4.7, reviews: 31, exp: 13, bio: "HVAC and split air conditioner installations with warranty." },
  { id: "p2222222-2222-2222-2222-222222222210", name: "Pradeep Kumara", biz: "PureLiving Clean Care", phone: "+94711110010", nic: "199312345680", district: "Colombo", rating: 4.9, reviews: 40, exp: 5, bio: "Eco-friendly home sanitizing, post-construction cleaning, and carpet shampoo." },
  { id: "p2222222-2222-2222-2222-222222222211", name: "Jayantha Senanayake", biz: "Heritage Timber Crafts", phone: "+94711110011", nic: "197612345681", district: "Kurunegala", rating: 4.8, reviews: 19, exp: 22, bio: "Pantry cupboard fitting, window sash replacements, and antique furniture." },
  { id: "p2222222-2222-2222-2222-222222222212", name: "Mahinda Alahakoon", biz: "Rajata Masonry Builders", phone: "+94711110012", nic: "198012345682", district: "Kurunegala", rating: 4.7, reviews: 16, exp: 15, bio: "Skilled tile fitter, retaining walls, bathroom waterproof tiling." },
  { id: "p2222222-2222-2222-2222-222222222213", name: "Chandana Rathnayake", biz: "Apex Color & Paint", phone: "+94711110013", nic: "198612345683", district: "Colombo", rating: 4.9, reviews: 26, exp: 12, bio: "Exterior weather-shield painting, damp wall injection waterproofing." },
  { id: "p2222222-2222-2222-2222-222222222214", name: "Sampath Gunawardena", biz: "QuickFix Washers & Ovens", phone: "+94711110014", nic: "199212345684", district: "Colombo", rating: 4.6, reviews: 12, exp: 6, bio: "Component-level repairs for Samsung, LG, Abans, and Singer appliances." },
  { id: "p2222222-2222-2222-2222-222222222215", name: "Anandakumar S.", biz: "Metro Plumbers Negombo", phone: "+94711110015", nic: "198912345685", district: "Gampaha", rating: 4.8, reviews: 21, exp: 9, bio: "Sump pump repairs, drainage clearing, and solar hot water connections." },
  { id: "p2222222-2222-2222-2222-222222222216", name: "Tharindu Madusanka", biz: "VoltGuard Electricals", phone: "+94711110016", nic: "199412345686", district: "Kurunegala", rating: 5.0, reviews: 15, exp: 5, bio: "Modern LED profiles, surge protectors, and solar inverter wiring." },
  { id: "p2222222-2222-2222-2222-222222222217", name: "Upul Priyantha", biz: "FrostAir Refrigeration", phone: "+94711110017", nic: "198112345687", district: "Kurunegala", rating: 4.7, reviews: 24, exp: 14, bio: "Deep freezer, refrigerator compressor overhaul, and vehicle AC gas." },
  { id: "p2222222-2222-2222-2222-222222222218", name: "Kumudu Jayalath", biz: "EcoPro Cleaning Team", phone: "+94711110018", nic: "199512345688", district: "Kandy", rating: 4.9, reviews: 17, exp: 4, bio: "Hospital-grade sanitization and domestic deep kitchen cleaning." },
  { id: "p2222222-2222-2222-2222-222222222219", name: "Harsha Karunaratne", biz: "Premier Finishes & Roof", phone: "+94711110019", nic: "198312345689", district: "Colombo", rating: 4.8, reviews: 33, exp: 16, bio: "Asbestos and zinc-aluminium roof leak waterproofing and sealant specialists." },
  { id: "p2222222-2222-2222-2222-222222222220", name: "Bandula Dissanayake", biz: "Dissa Machine Care", phone: "+94711110020", nic: "197912345690", district: "Kurunegala", rating: 4.6, reviews: 18, exp: 18, bio: "Domestic water pump winding, pressure switch repairs, and generator checks." },
];

export async function runFullSeed() {
  const supabase = getSupabaseAdmin();
  console.log("🌱 Starting Fixora Full Database Seeding...");

  // 1. Seed Categories & Services
  for (const cat of SEED_CATEGORIES) {
    const { data: catRecord } = await supabase
      .from("categories")
      .upsert({
        name: cat.name,
        slug: cat.slug,
        description: cat.desc,
        icon_name: cat.icon,
        is_active: true,
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (catRecord) {
      const services = SEED_SERVICES.filter((s) => s.catSlug === cat.slug);
      for (const s of services) {
        await supabase.from("services").upsert({
          category_id: catRecord.id,
          name: s.name,
          slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          estimated_base_price_lkr: s.price,
          is_active: true,
        }, { onConflict: "slug" });
      }
    }
  }
  console.log("✅ Categories and Services seeded.");

  // 2. Seed Customers
  for (const c of SEED_CUSTOMERS) {
    await supabase.from("profiles").upsert({
      id: c.id,
      role: "customer",
      full_name: c.name,
      email: `${c.phone.replace("+", "")}@auth.fixora.lk`,
      phone_number: c.phone,
      district: c.district,
      city: c.city,
      address_line: c.address,
      is_active: true,
    });
  }
  console.log("✅ 10 Customers seeded.");

  // 3. Seed Providers
  for (const p of SEED_PROVIDERS) {
    await supabase.from("profiles").upsert({
      id: p.id,
      role: "provider",
      full_name: p.name,
      email: `${p.phone.replace("+", "")}@auth.fixora.lk`,
      phone_number: p.phone,
      district: p.district,
      city: p.district,
      is_active: true,
    });

    await supabase.from("providers").upsert({
      id: p.id,
      business_name: p.biz,
      id_card_number: p.nic,
      bio: p.bio,
      status: "approved",
      experience_years: p.exp,
      average_rating: p.rating,
      total_reviews: p.reviews,
      completed_jobs_count: p.reviews + 4,
    });

    await supabase.from("service_areas").upsert({
      provider_id: p.id,
      district: p.district,
    });
  }
  console.log("✅ 20 Providers seeded (Kurunegala, Colombo, Kandy).");

  // 4. Seed 10 Realistic Service Requests with various states
  const { data: allServices } = await supabase.from("services").select("id, name");
  const fallbackServiceId = allServices?.[0]?.id || null;

  const REQUESTS_DATA = [
    { title: "Plumbing: Main pipe leak under kitchen sink", desc: "Water is spraying from the PVC valve joint under the sink. Need urgent repair.", status: "pending_assignment", customerIdx: 1, district: "Kurunegala", city: "Kurunegala Town", budget: 3500 },
    { title: "Electrical: Tripping circuit breaker when AC runs", desc: "Main 32A breaker trips after 10 minutes of turning on the bedroom AC.", status: "assigned", customerIdx: 0, district: "Colombo", city: "Nugegoda", budget: 4000 },
    { title: "AC Repair: Split AC blowing warm air", desc: "Filter cleaned last week but room is not cooling down. Likely needs refrigerant re-gas.", status: "quotes_received", customerIdx: 2, district: "Gampaha", city: "Negombo", budget: 6000 },
    { title: "Cleaning: Post-tenancy deep home cleaning", desc: "3 bedroom single-storey house needs floor scrubbing, bathrooms, and kitchen clean.", status: "booked", customerIdx: 3, district: "Kandy", city: "Peradeniya", budget: 12000 },
    { title: "Carpentry: Teak door lock repair and hinge alignment", desc: "Front door is sticking to the frame and cylinder lock is difficult to turn.", status: "booked", customerIdx: 4, district: "Kurunegala", city: "Mawathagama", budget: 3000 },
    { title: "Plumbing: Bathroom shower mixer replacement", desc: "Old mixer tap is rusted and leaking hot water continuously.", status: "pending_assignment", customerIdx: 5, district: "Colombo", city: "Dehiwala", budget: 3000 },
    { title: "Masonry: Replace 6 cracked ceramic tiles in veranda", desc: "Tiles cracked due to vehicle wheel pressure. Replacement tiles already purchased.", status: "assigned", customerIdx: 6, district: "Kalutara", city: "Panadura", budget: 5000 },
    { title: "Appliance: Washing machine making loud banging noise on spin cycle", desc: "Top loader drum vibrates violently. Motor or shock absorber issue.", status: "quotes_received", customerIdx: 7, district: "Kurunegala", city: "Kuliyapitiya", budget: 4500 },
    { title: "Painting: Interior wall damp patch repair and repaint", desc: "One wall affected by rain dampness. Scrape, apply waterproof base coat, and repaint.", status: "booked", customerIdx: 8, district: "Matara", city: "Matara Town", budget: 8000 },
    { title: "Electrical: Install 4 ceiling fans with speed controllers", desc: "New wiring points already laid. Only hanging and speed regulator connection needed.", status: "pending_assignment", customerIdx: 9, district: "Colombo", city: "Maharagama", budget: 4500 },
  ];

  for (let i = 0; i < REQUESTS_DATA.length; i++) {
    const req = REQUESTS_DATA[i];
    const customer = SEED_CUSTOMERS[req.customerIdx];
    const requestId = `r3333333-3333-3333-3333-33333333330${i}`;

    await supabase.from("service_requests").upsert({
      id: requestId,
      customer_id: customer.id,
      service_id: fallbackServiceId,
      status: req.status,
      title: req.title,
      description: req.desc,
      district: req.district,
      city: req.city,
      address: customer.address,
      preferred_date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split("T")[0],
      preferred_time_slot: "Morning (8:00 AM - 12:00 PM)",
      estimated_budget_lkr: req.budget,
      contact_name: customer.name,
      contact_phone: customer.phone,
    });

    if (req.status !== "pending_assignment") {
      const assignedPros = [SEED_PROVIDERS[0].id, SEED_PROVIDERS[1].id, SEED_PROVIDERS[4].id];
      for (const pId of assignedPros) {
        await supabase.from("request_assignments").upsert({
          request_id: requestId,
          provider_id: pId,
          assigned_by_admin_id: customer.id,
        });

        if (req.status === "quotes_received" || req.status === "booked") {
          const quoteId = `q4444444-4444-4444-4444-${requestId.slice(-8)}${pId.slice(-4)}`;
          await supabase.from("provider_quotes").upsert({
            id: quoteId,
            request_id: requestId,
            provider_id: pId,
            quoted_price_lkr: req.budget - 200,
            estimated_duration_hours: 2.5,
            proposed_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            proposed_time_slot: "Morning (8:00 AM - 12:00 PM)",
            provider_notes: "Includes all diagnostic checks and tools. Direct payment upon completion.",
            status: req.status === "booked" && pId === assignedPros[0] ? "accepted" : "pending",
          });

          if (req.status === "booked" && pId === assignedPros[0]) {
            const bookingId = `b5555555-5555-5555-5555-${requestId.slice(-12)}`;
            await supabase.from("bookings").upsert({
              id: bookingId,
              request_id: requestId,
              quote_id: quoteId,
              customer_id: customer.id,
              provider_id: pId,
              status: i % 2 === 0 ? "completed" : "working",
              agreed_price_lkr: req.budget - 200,
              payment_method: "direct_to_provider",
              payment_status: i % 2 === 0 ? "paid_directly" : "pending_direct_payment",
              scheduled_for: new Date().toISOString(),
            });

            if (i % 2 === 0) {
              await supabase.from("reviews").upsert({
                booking_id: bookingId,
                customer_id: customer.id,
                provider_id: pId,
                rating: 5,
                comment: "Excellent service, arrived right on time and fixed the issue cleanly. Highly recommended in Kurunegala!",
              });
            }
          }
        }
      }
    }
  }
  console.log("✅ 10 Service requests, quotes, bookings, and reviews seeded.");
  console.log("🎉 Seeding complete!");
}