import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  SEED_CATEGORIES,
  SEED_SERVICES,
  SEED_CUSTOMERS,
  SEED_PROVIDERS
} from "@/scripts/seed";

export async function POST() {
  const supabase = await createServerSupabaseClient();

  try {
    // 1. Seed Categories & Services
    for (const cat of SEED_CATEGORIES) {
      const { data: catRecord } = await supabase
        .from("categories")
        .upsert(
          {
            name: cat.name,
            slug: cat.slug,
            description: cat.desc,
            icon_name: cat.icon,
            is_active: true,
          },
          { onConflict: "slug" }
        )
        .select("id")
        .single();

      if (catRecord) {
        const services = SEED_SERVICES.filter((s) => s.catSlug === cat.slug);
        for (const s of services) {
          await supabase.from("services").upsert(
            {
              category_id: catRecord.id,
              name: s.name,
              slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              estimated_base_price_lkr: s.price,
              is_active: true,
            },
            { onConflict: "slug" }
          );
        }
      }
    }

    // 2. Seed 10 Customers
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

    // 3. Seed 20 Providers
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

    // 4. Seed 10 Active Service Requests with Kurunegala focus
    const { data: allServices } = await supabase.from("services").select("id, name");
    const plumbingService = allServices?.find((s) => s.name.includes("Plumbing")) || allServices?.[0];

    const REQUESTS_DATA = [
      { title: "Plumbing: Bathroom tap is leaking", desc: "Bathroom tap has a steady drip in Kurunegala. Need prompt repair.", status: "pending_assignment", customerIdx: 1, district: "Kurunegala", city: "Kurunegala Town", budget: 2500 },
      { title: "Electrical: Tripping circuit breaker when AC runs", desc: "Main 32A breaker trips after 10 minutes of AC usage.", status: "assigned", customerIdx: 0, district: "Colombo", city: "Nugegoda", budget: 4000 },
      { title: "AC Repair: Split AC blowing warm air", desc: "Room is not cooling down. Needs refrigerant top-up.", status: "quotes_received", customerIdx: 2, district: "Gampaha", city: "Negombo", budget: 5500 },
      { title: "Cleaning: Post-tenancy deep home cleaning", desc: "Single-storey house needs floor scrubbing, bathrooms, and kitchen clean.", status: "booked", customerIdx: 3, district: "Kandy", city: "Peradeniya", budget: 8000 },
      { title: "Carpentry: Teak door lock repair", desc: "Front cylinder lock is difficult to turn and sticks.", status: "booked", customerIdx: 4, district: "Kurunegala", city: "Mawathagama", budget: 2500 },
      { title: "Plumbing: Shower mixer replacement", desc: "Old mixer tap is rusted and leaking continuously.", status: "pending_assignment", customerIdx: 5, district: "Colombo", city: "Dehiwala", budget: 3000 },
      { title: "Masonry: Replace 6 cracked ceramic tiles", desc: "Tiles cracked due to vehicle wheel pressure in veranda.", status: "assigned", customerIdx: 6, district: "Kalutara", city: "Panadura", budget: 4000 },
      { title: "Appliance: Washing machine violent vibration", desc: "Top loader drum vibrates violently on spin cycle.", status: "quotes_received", customerIdx: 7, district: "Kurunegala", city: "Kuliyapitiya", budget: 4500 },
      { title: "Painting: Damp patch repair and repaint", desc: "Scrape affected wall, apply waterproof base coat, and repaint.", status: "booked", customerIdx: 8, district: "Matara", city: "Matara Town", budget: 6000 },
      { title: "Electrical: Install ceiling fans", desc: "Hanging and speed regulator connection for 2 fans.", status: "pending_assignment", customerIdx: 9, district: "Colombo", city: "Maharagama", budget: 3500 },
    ];

    for (let i = 0; i < REQUESTS_DATA.length; i++) {
      const req = REQUESTS_DATA[i];
      const customer = SEED_CUSTOMERS[req.customerIdx];
      const requestId = `r3333333-3333-3333-3333-33333333330${i}`;

      await supabase.from("service_requests").upsert({
        id: requestId,
        customer_id: customer.id,
        service_id: plumbingService?.id || null,
        status: req.status,
        title: req.title,
        description: req.desc,
        district: req.district,
        city: req.city,
        address: customer.address,
        preferred_date: new Date().toISOString().split("T")[0],
        preferred_time_slot: "Morning (8:00 AM - 12:00 PM)",
        estimated_budget_lkr: req.budget,
        contact_name: customer.name,
        contact_phone: customer.phone,
      });

      // Populate assignments and quotes for assigned and booked requests
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
              quoted_price_lkr: req.budget,
              estimated_duration_hours: 2.0,
              proposed_date: new Date().toISOString().split("T")[0],
              proposed_time_slot: "Afternoon (12:00 PM - 4:00 PM)",
              provider_notes: "Includes all diagnostic checks. Pay directly upon completion.",
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
                agreed_price_lkr: req.budget,
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
                  comment: "Fixed the bathroom tap leak in under an hour. Arrived punctually in Kurunegala.",
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Full Fixora production dataset seeded!",
      categoriesCount: SEED_CATEGORIES.length,
      servicesCount: SEED_SERVICES.length,
      customersCount: SEED_CUSTOMERS.length,
      providersCount: SEED_PROVIDERS.length,
      requestsCount: REQUESTS_DATA.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
