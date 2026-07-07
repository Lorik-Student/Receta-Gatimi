UPDATE Recipes
SET imazhi = CASE titulli
    WHEN 'Byrek me Spinaq' THEN 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80'
    WHEN 'Tavë Kosi' THEN 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    WHEN 'Supë Lëngore' THEN 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80'
    WHEN 'Fërgesë e Tiranës' THEN 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
    WHEN 'Baklava' THEN 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=1200&q=80'
    WHEN 'Lakror me Kumpir' THEN 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80'
    WHEN 'Petulla' THEN 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80'
    WHEN 'Sallatë Turshi' THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'
    ELSE imazhi
END
WHERE (imazhi IS NULL OR imazhi = '')
  AND titulli IN (
    'Byrek me Spinaq',
    'Tavë Kosi',
    'Supë Lëngore',
    'Fërgesë e Tiranës',
    'Baklava',
    'Lakror me Kumpir',
    'Petulla',
    'Sallatë Turshi'
  );
