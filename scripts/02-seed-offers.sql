-- Seed sample offers for Pop Culture CLE
-- These offers will appear in the offers page when users are near the store

INSERT INTO offers (title, description, discount_percentage, free_item, geofence_enabled, active, expires_at, created_by_admin)
VALUES 
  (
    'Welcome Discount',
    'First time visitor? Enjoy 20% off your first ice cream popsicle! Show this offer at the counter.',
    20,
    false,
    true,
    true,
    NOW() + INTERVAL '90 days',
    'admin'
  ),
  (
    'Free Topping Tuesday',
    'Every Tuesday, get a free premium topping on any ice cream order. Choose from Fruity Pebbles, sprinkles, hot fudge, and more!',
    0,
    true,
    true,
    true,
    NOW() + INTERVAL '60 days',
    'admin'
  ),
  (
    'Loyalty Bonus',
    'Already have 5 stamps? Get an extra stamp free on your next visit! Just show this offer to the cashier.',
    0,
    false,
    true,
    true,
    NOW() + INTERVAL '30 days',
    'admin'
  ),
  (
    'Happy Hour Special',
    'Visit between 2-4 PM on weekdays and get 15% off any order. Beat the rush and save!',
    15,
    false,
    true,
    true,
    NOW() + INTERVAL '45 days',
    'admin'
  )
ON CONFLICT DO NOTHING;
