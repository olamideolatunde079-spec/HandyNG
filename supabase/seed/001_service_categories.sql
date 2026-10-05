-- ============================================================
-- Seed 001: Initial service categories
-- 23 categories covering the most common artisan trades in Nigeria.
-- Font Awesome 6 icon names are stored in the icon column.
-- This seed is idempotent — safe to run multiple times.
-- ============================================================

insert into service_categories (name, slug, description, icon, is_active)
values
  ('Plumbing',            'plumbing',            'Pipe installation, repairs, and water system maintenance',      'fa-faucet',             true),
  ('Electrical',          'electrical',           'Wiring, installations, repairs, and generator work',           'fa-bolt',               true),
  ('Carpentry',           'carpentry',            'Furniture making, woodwork, and door/window fitting',          'fa-hammer',             true),
  ('Painting',            'painting',             'Interior and exterior painting and surface finishing',         'fa-paint-roller',       true),
  ('Cleaning',            'cleaning',             'Home, office, and post-construction cleaning services',        'fa-broom',              true),
  ('Mechanic',            'mechanic',             'Vehicle repairs, servicing, and diagnostics',                  'fa-car',                true),
  ('AC & Refrigeration',  'ac-refrigeration',     'Air conditioner installation, repairs, and maintenance',       'fa-wind',               true),
  ('Generator Repair',    'generator-repair',     'Generator installation, servicing, and fault diagnosis',       'fa-plug',               true),
  ('Phone Repair',        'phone-repair',         'Smartphone and tablet screen, battery, and software repairs',  'fa-mobile-screen',      true),
  ('Computer Repair',     'computer-repair',      'Laptop and desktop hardware and software repairs',             'fa-laptop',             true),
  ('Welding',             'welding',              'Metal fabrication, gates, grilles, and structural welding',    'fa-fire-flame-simple',  true),
  ('Tiling',              'tiling',               'Floor and wall tile installation and grouting',                'fa-border-all',         true),
  ('Masonry',             'masonry',              'Bricklaying, plastering, and concrete work',                   'fa-building',           true),
  ('Furniture',           'furniture',            'Custom furniture making, assembly, and repair',                'fa-couch',              true),
  ('Tailoring',           'tailoring',            'Clothing alterations, repairs, and custom sewing',             'fa-scissors',           true),
  ('Barbing',             'barbing',              'Haircuts, shaving, and beard grooming for men',                'fa-cut',                true),
  ('Hair Styling',        'hair-styling',         'Braiding, weaving, relaxing, and natural hair styling',        'fa-person-rays',        true),
  ('Makeup',              'makeup',               'Bridal, event, and everyday makeup artistry',                  'fa-star',               true),
  ('Photography',         'photography',          'Event, portrait, and product photography',                     'fa-camera',             true),
  ('Catering',            'catering',             'Food preparation and catering for events and homes',           'fa-utensils',           true),
  ('Appliance Repair',    'appliance-repair',     'Washing machine, refrigerator, and home appliance repairs',    'fa-screwdriver-wrench', true),
  ('Gardening',           'gardening',            'Lawn mowing, landscaping, and garden maintenance',             'fa-leaf',               true),
  ('Moving & Relocation', 'moving-relocation',    'Packing, loading, transportation, and unpacking services',    'fa-truck',              true)
on conflict (slug) do update
  set
    name        = excluded.name,
    description = excluded.description,
    icon        = excluded.icon,
    is_active   = excluded.is_active,
    updated_at  = now();
