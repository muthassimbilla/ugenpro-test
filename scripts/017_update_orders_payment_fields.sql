-- Update orders table with new payment fields
-- Remove user_phone column as it's no longer needed
ALTER TABLE public.orders 
DROP COLUMN IF EXISTS user_phone;

-- Add payment_number column to store the payment number used
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_number VARCHAR(20) DEFAULT NULL;

-- Update payment_method to use specific values
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('bkash', 'nagad') OR payment_method IS NULL);

-- Create index for faster payment method queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- Add comment to explain the table structure
COMMENT ON TABLE public.orders IS 'Stores all subscription orders with payment details';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used: bkash or nagad';
COMMENT ON COLUMN public.orders.payment_number IS 'The payment number where user sent money';
COMMENT ON COLUMN public.orders.payment_last_4_digits IS 'Last 4 digits of user payment number';
COMMENT ON COLUMN public.orders.payment_transaction_id IS 'Transaction ID from payment gateway';
