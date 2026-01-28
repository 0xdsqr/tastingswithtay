-- Seed data for Tastings with Tay
-- Run this in your database studio (192.168.50.38:5432/tastingswithtay)

-- ============================================
-- RECIPES
-- ============================================

INSERT INTO recipes (id, title, slug, description, category, difficulty, prep_time, cook_time, servings, ingredients, instructions, tips, image, published, featured, view_count) VALUES
(gen_random_uuid(), 'Honey Glazed Salmon with Roasted Vegetables', 'honey-glazed-salmon', 'A perfectly balanced weeknight dinner that feels special. The sweet honey glaze caramelizes beautifully against the rich salmon.', 'Dinner', 'Easy', 10, 25, 4, 
  '[{"group": "For the Salmon", "items": ["4 salmon fillets (6 oz each)", "3 tablespoons honey", "2 tablespoons soy sauce", "1 tablespoon olive oil", "2 cloves garlic, minced", "Salt and pepper to taste"]}, {"group": "For the Vegetables", "items": ["2 cups broccoli florets", "1 red bell pepper, sliced", "1 yellow squash, sliced", "2 tablespoons olive oil", "1 teaspoon garlic powder"]}]'::jsonb,
  '[{"step": 1, "text": "Preheat your oven to 400°F (200°C). Line a large baking sheet with parchment paper."}, {"step": 2, "text": "In a small bowl, whisk together honey, soy sauce, olive oil, and minced garlic to make the glaze."}, {"step": 3, "text": "Toss the vegetables with olive oil, garlic powder, salt, and pepper. Spread them on one side of the baking sheet."}, {"step": 4, "text": "Place salmon fillets on the other side of the baking sheet. Brush generously with the honey glaze."}, {"step": 5, "text": "Bake for 20-25 minutes, or until salmon flakes easily with a fork and vegetables are tender."}, {"step": 6, "text": "Brush salmon with remaining glaze before serving. Garnish with sesame seeds if desired."}]'::jsonb,
  ARRAY['For extra caramelization, broil for the last 2 minutes of cooking.', 'You can substitute the vegetables with whatever you have on hand.', 'Leftovers keep well in the fridge for up to 3 days.'],
  '/honey-glazed-salmon-with-colorful-roasted-vegetabl.jpg', true, true, 0),

(gen_random_uuid(), 'Rustic Sourdough Bread', 'rustic-sourdough-bread', 'The ultimate guide to achieving that perfect crust and chewy interior. This recipe uses a naturally fermented starter for deep, complex flavor.', 'Baking', 'Hard', 30, 45, 8,
  '[{"items": ["500g bread flour", "350g water (room temperature)", "100g active sourdough starter", "10g salt", "Rice flour for dusting"]}]'::jsonb,
  '[{"step": 1, "text": "Mix flour and water, let rest for 30 minutes (autolyse). This develops gluten without kneading."}, {"step": 2, "text": "Add starter and salt. Mix until well combined using the pincer method."}, {"step": 3, "text": "Perform 4-6 sets of stretch and folds over the next 3-4 hours, every 30-45 minutes."}, {"step": 4, "text": "Let the dough bulk ferment at room temperature until doubled, about 4-6 hours."}, {"step": 5, "text": "Shape the dough and place in a floured banneton. Refrigerate overnight (8-12 hours) for cold proof."}, {"step": 6, "text": "Preheat Dutch oven at 500°F for 1 hour. Score the dough and bake covered for 20 min, then uncovered at 450°F for 25 min."}]'::jsonb,
  ARRAY['Your starter should be at peak activity - it should have doubled and be full of bubbles.', 'The windowpane test is your friend - if you can stretch the dough thin enough to see light through it, gluten is developed.', 'Every oven is different, so watch your bread, not the clock.'],
  '/artisan-sourdough-bread-loaf-with-crispy-golden-cr.jpg', true, true, 0),

(gen_random_uuid(), 'Spring Garden Pasta', 'spring-garden-pasta', 'Fresh asparagus, peas, and herbs tossed with al dente pasta. A celebration of spring vegetables in every bite.', 'Pasta', 'Easy', 10, 15, 4,
  '[{"items": ["1 lb penne or your favorite pasta", "1 bunch asparagus, trimmed and cut into 2-inch pieces", "1 cup fresh or frozen peas", "4 tablespoons butter", "3 cloves garlic, minced", "1 cup pasta water (reserved)", "1/2 cup freshly grated Parmesan", "1/4 cup fresh mint, chopped", "1/4 cup fresh basil, torn", "Zest of 1 lemon", "Salt and pepper to taste"]}]'::jsonb,
  '[{"step": 1, "text": "Bring a large pot of salted water to boil. Cook pasta according to package directions."}, {"step": 2, "text": "Add asparagus to the pasta water for the last 3 minutes of cooking. Add peas for the last 1 minute."}, {"step": 3, "text": "Reserve 1 cup pasta water, then drain pasta and vegetables."}, {"step": 4, "text": "In the same pot, melt butter over medium heat. Add garlic and cook until fragrant, about 30 seconds."}, {"step": 5, "text": "Add pasta, vegetables, and 1/2 cup pasta water. Toss to coat, adding more water if needed."}, {"step": 6, "text": "Remove from heat. Add Parmesan, herbs, lemon zest, salt, and pepper. Toss and serve immediately."}]'::jsonb,
  ARRAY['Don''t skip the pasta water - the starch helps create a silky sauce.', 'Add a splash of good olive oil at the end for extra richness.'],
  '/fresh-spring-pasta-with-green-vegetables-herbs-and.jpg', true, true, 0),

(gen_random_uuid(), 'Classic French Omelette', 'classic-french-omelette', 'Silky, tender, and perfectly rolled. Master this technique and elevate your breakfast game forever.', 'Breakfast', 'Medium', 5, 5, 1,
  '[{"items": ["3 large eggs", "1 tablespoon butter", "1 tablespoon fresh chives, finely chopped", "Salt and white pepper to taste", "Optional: 2 tablespoons gruyère cheese, grated"]}]'::jsonb,
  '[{"step": 1, "text": "Crack eggs into a bowl. Season with salt and pepper. Beat vigorously with a fork until homogeneous."}, {"step": 2, "text": "Heat an 8-inch non-stick pan over medium-high heat. Add butter and swirl to coat."}, {"step": 3, "text": "When butter is foamy but not brown, add eggs. Immediately start stirring with a rubber spatula while shaking the pan."}, {"step": 4, "text": "When eggs are mostly set but still slightly wet on top, stop stirring. Let cook for 10 seconds."}, {"step": 5, "text": "Add cheese and chives to the center. Tilt pan and roll omelette onto itself."}, {"step": 6, "text": "Slide onto a warm plate, seam-side down. Rub with a little butter for shine."}]'::jsonb,
  ARRAY['The key is high heat and constant movement - the whole process takes under 2 minutes.', 'Use a non-stick pan - this is not the time for cast iron.'],
  '/perfect-french-omelette-on-white-plate-with-herbs.jpg', true, false, 0),

(gen_random_uuid(), 'Lemon Herb Roast Chicken', 'lemon-herb-roast-chicken', 'Golden, crispy skin and juicy meat. This Sunday roast classic never goes out of style.', 'Dinner', 'Medium', 15, 75, 6,
  '[{"items": ["1 whole chicken (4-5 lbs)", "4 tablespoons butter, softened", "4 cloves garlic, minced", "2 tablespoons fresh thyme leaves", "2 tablespoons fresh rosemary, chopped", "2 lemons", "1 head of garlic, halved crosswise", "Salt and pepper", "2 tablespoons olive oil"]}]'::jsonb,
  '[{"step": 1, "text": "Remove chicken from fridge 1 hour before cooking. Preheat oven to 425°F (220°C)."}, {"step": 2, "text": "Mix softened butter with minced garlic, thyme, rosemary, and zest of 1 lemon."}, {"step": 3, "text": "Pat chicken very dry with paper towels. Gently loosen skin over breast and thighs."}, {"step": 4, "text": "Spread herb butter under and over the skin. Season generously with salt and pepper."}, {"step": 5, "text": "Stuff cavity with halved garlic head and quartered lemons. Tie legs together with kitchen twine."}, {"step": 6, "text": "Roast for 1 hour 15 minutes, or until internal temperature reaches 165°F. Rest 15 minutes before carving."}]'::jsonb,
  ARRAY['Dry skin = crispy skin. Pat that chicken dry!', 'Let it rest - this is when the juices redistribute for moist meat.'],
  '/golden-roast-chicken-with-herbs-and-lemon-slices.jpg', true, false, 0),

(gen_random_uuid(), 'Chocolate Lava Cakes', 'chocolate-lava-cakes', 'Rich, decadent, and impressively simple. The molten center is pure chocolate magic.', 'Dessert', 'Medium', 10, 15, 4,
  '[{"items": ["4 oz bittersweet chocolate, chopped", "1/2 cup (1 stick) unsalted butter", "1 cup powdered sugar", "2 whole eggs", "2 egg yolks", "6 tablespoons all-purpose flour", "Butter and cocoa powder for ramekins", "Vanilla ice cream for serving"]}]'::jsonb,
  '[{"step": 1, "text": "Preheat oven to 425°F. Butter 4 ramekins and dust with cocoa powder."}, {"step": 2, "text": "Melt chocolate and butter together in microwave or double boiler. Stir until smooth."}, {"step": 3, "text": "Whisk in powdered sugar until smooth. Add eggs and yolks, whisk well."}, {"step": 4, "text": "Fold in flour until just combined. Divide batter among ramekins."}, {"step": 5, "text": "Bake for 12-14 minutes. Edges should be firm, center soft."}, {"step": 6, "text": "Let cool 1 minute, then invert onto plates. Serve immediately with ice cream."}]'::jsonb,
  ARRAY['You can prepare the batter ahead and refrigerate - just add 1-2 minutes to baking time.', 'Don''t overbake! The center should still wobble slightly when you remove from oven.'],
  '/chocolate-lava-cake-with-molten-center-on-plate.jpg', true, false, 0);

-- ============================================
-- WINES
-- ============================================

INSERT INTO wines (id, name, slug, winery, region, country, vintage, type, grapes, rating, notes, aromas, pairings, price_range, occasion, image, published, featured) VALUES
(gen_random_uuid(), 'Château Margaux', 'chateau-margaux-2018', 'Château Margaux', 'Margaux, Bordeaux', 'France', 2018, 'Red', 'Cabernet Sauvignon, Merlot', 5,
  'An absolutely stunning wine with incredible depth and complexity. Dark fruit, violet, and subtle oak notes dance on the palate. The tannins are silky smooth, leading to a finish that lasts for minutes. One of my all-time favorites for special occasions.',
  ARRAY['Blackcurrant', 'Violet', 'Cedar', 'Tobacco'],
  ARRAY['Filet Mignon', 'Lamb Rack', 'Aged Cheeses'],
  '$$$$$', 'Special Celebration',
  '/elegant-red-wine-glass-with-bordeaux-on-white-linen.jpg', true, true),

(gen_random_uuid(), 'Sauvignon Blanc', 'cloudy-bay-sauvignon-2023', 'Cloudy Bay', 'Marlborough', 'New Zealand', 2023, 'White', 'Sauvignon Blanc', 4,
  'Crisp, zesty, and absolutely refreshing. This is my go-to summer wine. Bright citrus and passion fruit with a mineral finish. Perfect for afternoon sipping on the patio or paired with fresh seafood.',
  ARRAY['Citrus', 'Passion Fruit', 'Grass', 'Mineral'],
  ARRAY['Grilled Fish', 'Goat Cheese Salad', 'Oysters'],
  '$$', 'Everyday Enjoyment',
  '/crisp-white-wine-glass-with-vineyard-background.jpg', true, true),

(gen_random_uuid(), 'Whispering Angel', 'whispering-angel-rose-2023', 'Château d''Esclans', 'Provence', 'France', 2023, 'Rosé', 'Grenache, Rolle', 4,
  'The quintessential Provence rosé. Pale salmon color with delicate strawberry and white peach notes. Dry and elegant with beautiful acidity. Makes every moment feel like a vacation in the South of France.',
  ARRAY['Strawberry', 'White Peach', 'Rose Petal', 'Citrus'],
  ARRAY['Mediterranean Salad', 'Grilled Salmon', 'Light Pasta'],
  '$$', 'Summer Gatherings',
  '/rose-wine-glass-with-summer-light-setting.jpg', true, true),

(gen_random_uuid(), 'Dom Pérignon', 'dom-perignon-2012', 'Moët & Chandon', 'Champagne', 'France', 2012, 'Sparkling', 'Chardonnay, Pinot Noir', 5,
  'Pure elegance in a glass. Incredibly fine bubbles carry notes of brioche, citrus, and white flowers. Complex yet approachable, with a creamy texture and endless finish. Worth every penny for milestone moments.',
  ARRAY['Brioche', 'Lemon Zest', 'White Flowers', 'Almond'],
  ARRAY['Caviar', 'Lobster', 'Celebration Cake'],
  '$$$$$', 'Milestone Celebrations',
  '/champagne-flute-with-golden-bubbles-celebration.jpg', true, true),

(gen_random_uuid(), 'Cabernet Sauvignon', 'caymus-cabernet-2021', 'Caymus Vineyards', 'Napa Valley', 'USA', 2021, 'Red', 'Cabernet Sauvignon', 4,
  'Rich, bold, and unapologetically Napa. Dark cherry, cocoa, and vanilla create a luscious, full-bodied experience. Soft tannins make it approachable now, but it will age beautifully. My pick for steakhouse dinners.',
  ARRAY['Dark Cherry', 'Cocoa', 'Vanilla', 'Oak'],
  ARRAY['Ribeye Steak', 'BBQ Ribs', 'Dark Chocolate'],
  '$$$', 'Date Night',
  '/napa-valley-red-wine-with-vineyard-sunset.jpg', true, false),

(gen_random_uuid(), 'Riesling Spätlese', 'riesling-spatlese-2022', 'Dr. Loosen', 'Mosel', 'Germany', 2022, 'White', 'Riesling', 5,
  'A masterclass in balance. Off-dry with electric acidity that makes your mouth water. Green apple, apricot, and slate minerality. Incredibly versatile with food - from spicy Thai to creamy desserts. A personal obsession.',
  ARRAY['Green Apple', 'Apricot', 'Slate', 'Honey'],
  ARRAY['Spicy Thai', 'Pork Belly', 'Apple Tart'],
  '$$', 'Food Pairing Adventures',
  '/german-riesling-wine-glass-mosel-valley.jpg', true, false);

-- ============================================
-- TAGS (for recipes and wines)
-- ============================================

INSERT INTO tags (id, name, slug, type) VALUES
(gen_random_uuid(), 'Seafood', 'seafood', 'recipe'),
(gen_random_uuid(), 'Healthy', 'healthy', 'recipe'),
(gen_random_uuid(), 'Quick', 'quick', 'recipe'),
(gen_random_uuid(), 'Gluten-Free Option', 'gluten-free-option', 'recipe'),
(gen_random_uuid(), 'Bread', 'bread', 'recipe'),
(gen_random_uuid(), 'Sourdough', 'sourdough', 'recipe'),
(gen_random_uuid(), 'Artisan', 'artisan', 'recipe'),
(gen_random_uuid(), 'Fermented', 'fermented', 'recipe'),
(gen_random_uuid(), 'Pasta', 'pasta', 'recipe'),
(gen_random_uuid(), 'Vegetarian', 'vegetarian', 'recipe'),
(gen_random_uuid(), 'Spring', 'spring', 'recipe'),
(gen_random_uuid(), 'Breakfast', 'breakfast', 'recipe'),
(gen_random_uuid(), 'Eggs', 'eggs', 'recipe'),
(gen_random_uuid(), 'French', 'french', 'both'),
(gen_random_uuid(), 'Chicken', 'chicken', 'recipe'),
(gen_random_uuid(), 'Roast', 'roast', 'recipe'),
(gen_random_uuid(), 'Sunday Dinner', 'sunday-dinner', 'recipe'),
(gen_random_uuid(), 'Classic', 'classic', 'both'),
(gen_random_uuid(), 'Dessert', 'dessert', 'recipe'),
(gen_random_uuid(), 'Chocolate', 'chocolate', 'recipe'),
(gen_random_uuid(), 'Date Night', 'date-night', 'both'),
(gen_random_uuid(), 'Impressive', 'impressive', 'both'),
(gen_random_uuid(), 'Bold', 'bold', 'wine'),
(gen_random_uuid(), 'Crisp', 'crisp', 'wine'),
(gen_random_uuid(), 'Elegant', 'elegant', 'wine'),
(gen_random_uuid(), 'Celebration', 'celebration', 'wine'),
(gen_random_uuid(), 'Summer', 'summer', 'wine');

-- Verify the inserts
SELECT 'Recipes:' as table_name, count(*) as count FROM recipes
UNION ALL
SELECT 'Wines:', count(*) FROM wines
UNION ALL
SELECT 'Tags:', count(*) FROM tags;
