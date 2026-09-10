-- ============================================================================
-- FIXORA - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is an approved provider
CREATE OR REPLACE FUNCTION public.is_approved_provider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.providers
    WHERE id = auth.uid() AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Publicly readable profiles (needed to show provider/customer names, ratings)
CREATE POLICY "Profiles are publicly readable"
ON public.profiles FOR SELECT
USING (true);

-- Users can insert their own profile on sign-up
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins full access
CREATE POLICY "Admins full access on profiles"
ON public.profiles FOR ALL
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES & SERVICES
-- ----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
ON public.categories FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage categories"
ON public.categories FOR ALL
USING (public.is_admin());

CREATE POLICY "Services are publicly readable"
ON public.services FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage services"
ON public.services FOR ALL
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. PROVIDERS & SERVICE AREAS
-- ----------------------------------------------------------------------------
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

-- Public can see approved providers
CREATE POLICY "Approved providers are publicly viewable"
ON public.providers FOR SELECT
USING (status = 'approved' OR auth.uid() = id OR public.is_admin());

-- Provider can register/update their own profile
CREATE POLICY "Providers can insert their own record"
ON public.providers FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Providers can update their own record"
ON public.providers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins full access on providers"
ON public.providers FOR ALL
USING (public.is_admin());

-- Provider services
CREATE POLICY "Provider services are publicly readable"
ON public.provider_services FOR SELECT
USING (true);

CREATE POLICY "Providers manage their own services"
ON public.provider_services FOR ALL
USING (auth.uid() = provider_id OR public.is_admin());

-- Service areas
CREATE POLICY "Service areas are publicly readable"
ON public.service_areas FOR SELECT
USING (true);

CREATE POLICY "Providers manage their own areas"
ON public.service_areas FOR ALL
USING (auth.uid() = provider_id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. SERVICE REQUESTS & IMAGES
-- ----------------------------------------------------------------------------
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_images ENABLE ROW LEVEL SECURITY;

-- Customers can view their own requests
CREATE POLICY "Customers can view own requests"
ON public.service_requests FOR SELECT
USING (
  auth.uid() = customer_id 
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.request_assignments ra
    WHERE ra.request_id = public.service_requests.id
    AND ra.provider_id = auth.uid()
  )
);

-- Customers can create requests
CREATE POLICY "Customers can create requests"
ON public.service_requests FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own pending requests
CREATE POLICY "Customers can update own pending requests"
ON public.service_requests FOR UPDATE
USING (auth.uid() = customer_id AND status = 'pending_assignment')
WITH CHECK (auth.uid() = customer_id);

-- Admins full access
CREATE POLICY "Admins full access on requests"
ON public.service_requests FOR ALL
USING (public.is_admin());

-- Request images: viewable if parent request is viewable
CREATE POLICY "Request images viewable by request participants"
ON public.request_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = request_images.request_id
    AND (
      sr.customer_id = auth.uid()
      OR public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.request_assignments ra
        WHERE ra.request_id = sr.id AND ra.provider_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Customers can upload request images"
ON public.request_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = request_images.request_id AND sr.customer_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- 5. REQUEST ASSIGNMENTS (MANUAL ADMIN MATCHING)
-- ----------------------------------------------------------------------------
ALTER TABLE public.request_assignments ENABLE ROW LEVEL SECURITY;

-- Admins full access to assign requests
CREATE POLICY "Admins manage assignments"
ON public.request_assignments FOR ALL
USING (public.is_admin());

-- Providers can see assignments directed to them
CREATE POLICY "Providers view assigned requests"
ON public.request_assignments FOR SELECT
USING (auth.uid() = provider_id);

-- ----------------------------------------------------------------------------
-- 6. PROVIDER QUOTES
-- ----------------------------------------------------------------------------
ALTER TABLE public.provider_quotes ENABLE ROW LEVEL SECURITY;

-- Providers can insert quote only if assigned to request
CREATE POLICY "Providers can create quote for assigned request"
ON public.provider_quotes FOR INSERT
WITH CHECK (
  auth.uid() = provider_id
  AND EXISTS (
    SELECT 1 FROM public.request_assignments ra
    WHERE ra.request_id = provider_quotes.request_id
    AND ra.provider_id = auth.uid()
  )
);

-- Providers view/update their own quotes
CREATE POLICY "Providers view own quotes"
ON public.provider_quotes FOR SELECT
USING (
  auth.uid() = provider_id
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = provider_quotes.request_id
    AND sr.customer_id = auth.uid()
  )
);

CREATE POLICY "Providers update own pending quotes"
ON public.provider_quotes FOR UPDATE
USING (auth.uid() = provider_id AND status = 'pending')
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Admins manage quotes"
ON public.provider_quotes FOR ALL
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. BOOKINGS & STATUS HISTORY
-- ----------------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers and Providers can view their bookings"
ON public.bookings FOR SELECT
USING (
  auth.uid() = customer_id 
  OR auth.uid() = provider_id 
  OR public.is_admin()
);

-- Customer can create booking by accepting a quote
CREATE POLICY "Customers can create booking"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Customer & Provider can update booking status sequentially
CREATE POLICY "Participants update booking status"
ON public.bookings FOR UPDATE
USING (auth.uid() = customer_id OR auth.uid() = provider_id OR public.is_admin());

CREATE POLICY "Admins manage bookings"
ON public.bookings FOR ALL
USING (public.is_admin());

-- Booking status history
CREATE POLICY "Participants view booking status history"
ON public.booking_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_status_history.booking_id
    AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Participants append booking status history"
ON public.booking_status_history FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_status_history.booking_id
    AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid() OR public.is_admin())
  )
);

-- ----------------------------------------------------------------------------
-- 8. REVIEWS, NOTIFICATIONS & REPORTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Customers can create reviews for their completed bookings"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = customer_id
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = reviews.booking_id
    AND b.customer_id = auth.uid()
    AND b.status = 'completed'
  )
);

CREATE POLICY "Users read own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications read state"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users view own submitted reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "Admins manage reports"
ON public.reports FOR ALL
USING (public.is_admin());
