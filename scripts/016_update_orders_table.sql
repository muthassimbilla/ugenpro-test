-- Add payment details columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_last_4_digits VARCHAR(4) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(100) DEFAULT NULL;

-- Update order_status check constraint to include 'confirmed'
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_order_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_order_status_check 
CHECK (order_status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled'));

-- Create admin policy to view and update all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );
