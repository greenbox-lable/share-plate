
-- Create donation status enum
CREATE TYPE public.donation_status AS ENUM ('pending', 'accepted', 'picked_up', 'delivered');

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  food_item TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  status public.donation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donors can insert their own donations
CREATE POLICY "Donors can create donations"
  ON public.donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id);

-- Donors can view their own donations
CREATE POLICY "Donors can view own donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (auth.uid() = donor_id);

-- NGOs can view pending donations (to accept) and donations they accepted
CREATE POLICY "NGOs can view available and own donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (
    status = 'pending' 
    OR ngo_id = auth.uid()
  );

-- NGOs can accept pending donations (update ngo_id and status)
CREATE POLICY "NGOs can accept donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (status = 'pending' OR ngo_id = auth.uid())
  WITH CHECK (ngo_id = auth.uid());

-- Volunteers can view accepted donations (to pick up) and donations assigned to them
CREATE POLICY "Volunteers can view pickup requests"
  ON public.donations FOR SELECT
  TO authenticated
  USING (
    status = 'accepted'
    OR volunteer_id = auth.uid()
  );

-- Volunteers can claim and update donations
CREATE POLICY "Volunteers can update assigned donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (status = 'accepted' OR volunteer_id = auth.uid())
  WITH CHECK (volunteer_id = auth.uid());

-- Donors can update their own pending donations
CREATE POLICY "Donors can update own pending donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id AND status = 'pending')
  WITH CHECK (auth.uid() = donor_id);

-- Updated_at trigger
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for donations
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
