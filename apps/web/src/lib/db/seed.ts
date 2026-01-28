import { getDb } from "./index"

// Seed data for recipes
const recipes = [
  {
    id: "1",
    slug: "honey-glazed-salmon",
    title: "Honey Glazed Salmon with Roasted Vegetables",
    description:
      "A perfectly balanced weeknight dinner that feels special. The sweet honey glaze caramelizes beautifully against the rich salmon.",
    image: "/honey-glazed-salmon-with-colorful-roasted-vegetabl.jpg",
    category: "Dinner",
    time: "35 min",
    prep_time: "10 min",
    cook_time: "25 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: JSON.stringify([
      {
        group: "For the Salmon",
        items: [
          "4 salmon fillets (6 oz each)",
          "3 tablespoons honey",
          "2 tablespoons soy sauce",
          "1 tablespoon olive oil",
          "2 cloves garlic, minced",
          "Salt and pepper to taste",
        ],
      },
      {
        group: "For the Vegetables",
        items: [
          "2 cups broccoli florets",
          "1 red bell pepper, sliced",
          "1 yellow squash, sliced",
          "2 tablespoons olive oil",
          "1 teaspoon garlic powder",
        ],
      },
    ]),
    instructions: JSON.stringify([
      {
        step: 1,
        text: "Preheat your oven to 400°F (200°C). Line a large baking sheet with parchment paper.",
      },
      {
        step: 2,
        text: "In a small bowl, whisk together honey, soy sauce, olive oil, and minced garlic to make the glaze.",
      },
      {
        step: 3,
        text: "Toss the vegetables with olive oil, garlic powder, salt, and pepper. Spread them on one side of the baking sheet.",
      },
      {
        step: 4,
        text: "Place salmon fillets on the other side of the baking sheet. Brush generously with the honey glaze.",
      },
      {
        step: 5,
        text: "Bake for 20-25 minutes, or until salmon flakes easily with a fork and vegetables are tender.",
      },
      {
        step: 6,
        text: "Brush salmon with remaining glaze before serving. Garnish with sesame seeds if desired.",
      },
    ]),
    tips: JSON.stringify([
      "For extra caramelization, broil for the last 2 minutes of cooking.",
      "You can substitute the vegetables with whatever you have on hand.",
      "Leftovers keep well in the fridge for up to 3 days.",
    ]),
    tags: JSON.stringify(["seafood", "healthy", "quick", "gluten-free option"]),
    featured: 1,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    slug: "rustic-sourdough-bread",
    title: "Rustic Sourdough Bread",
    description:
      "The ultimate guide to achieving that perfect crust and chewy interior. This recipe uses a naturally fermented starter for deep, complex flavor.",
    image: "/artisan-sourdough-bread-loaf-with-crispy-golden-cr.jpg",
    category: "Baking",
    time: "24 hrs",
    prep_time: "30 min",
    cook_time: "45 min",
    servings: 8,
    difficulty: "Hard",
    ingredients: JSON.stringify([
      {
        items: [
          "500g bread flour",
          "350g water (room temperature)",
          "100g active sourdough starter",
          "10g salt",
          "Rice flour for dusting",
        ],
      },
    ]),
    instructions: JSON.stringify([
      {
        step: 1,
        text: "Mix flour and water, let rest for 30 minutes (autolyse). This develops gluten without kneading.",
      },
      {
        step: 2,
        text: "Add starter and salt. Mix until well combined using the pincer method.",
      },
      {
        step: 3,
        text: "Perform 4-6 sets of stretch and folds over the next 3-4 hours, every 30-45 minutes.",
      },
      {
        step: 4,
        text: "Let the dough bulk ferment at room temperature until doubled, about 4-6 hours.",
      },
      {
        step: 5,
        text: "Shape the dough and place in a floured banneton. Refrigerate overnight (8-12 hours) for cold proof.",
      },
      {
        step: 6,
        text: "Preheat Dutch oven at 500°F for 1 hour. Score the dough and bake covered for 20 min, then uncovered at 450°F for 25 min.",
      },
    ]),
    tips: JSON.stringify([
      "Your starter should be at peak activity - it should have doubled and be full of bubbles.",
      "The windowpane test is your friend - if you can stretch the dough thin enough to see light through it, gluten is developed.",
      "Every oven is different, so watch your bread, not the clock.",
    ]),
    tags: JSON.stringify(["bread", "sourdough", "artisan", "fermented"]),
    featured: 1,
    created_at: "2024-01-10",
  },
  {
    id: "3",
    slug: "spring-garden-pasta",
    title: "Spring Garden Pasta",
    description:
      "Fresh asparagus, peas, and herbs tossed with al dente pasta. A celebration of spring vegetables in every bite.",
    image: "/fresh-spring-pasta-with-green-vegetables-herbs-and.jpg",
    category: "Pasta",
    time: "25 min",
    prep_time: "10 min",
    cook_time: "15 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: JSON.stringify([
      {
        items: [
          "1 lb penne or your favorite pasta",
          "1 bunch asparagus, trimmed and cut into 2-inch pieces",
          "1 cup fresh or frozen peas",
          "4 tablespoons butter",
          "3 cloves garlic, minced",
          "1 cup pasta water (reserved)",
          "1/2 cup freshly grated Parmesan",
          "1/4 cup fresh mint, chopped",
          "1/4 cup fresh basil, torn",
          "Zest of 1 lemon",
          "Salt and pepper to taste",
        ],
      },
    ]),
    instructions: JSON.stringify([
      {
        step: 1,
        text: "Bring a large pot of salted water to boil. Cook pasta according to package directions.",
      },
      {
        step: 2,
        text: "Add asparagus to the pasta water for the last 3 minutes of cooking. Add peas for the last 1 minute.",
      },
      {
        step: 3,
        text: "Reserve 1 cup pasta water, then drain pasta and vegetables.",
      },
      {
        step: 4,
        text: "In the same pot, melt butter over medium heat. Add garlic and cook until fragrant, about 30 seconds.",
      },
      {
        step: 5,
        text: "Add pasta, vegetables, and 1/2 cup pasta water. Toss to coat, adding more water if needed.",
      },
      {
        step: 6,
        text: "Remove from heat. Add Parmesan, herbs, lemon zest, salt, and pepper. Toss and serve immediately.",
      },
    ]),
    tips: JSON.stringify([
      "Don't skip the pasta water - the starch helps create a silky sauce.",
      "Add a splash of good olive oil at the end for extra richness.",
    ]),
    tags: JSON.stringify(["pasta", "vegetarian", "spring", "quick"]),
    featured: 1,
    created_at: "2024-01-08",
  },
  {
    id: "4",
    slug: "classic-french-omelette",
    title: "Classic French Omelette",
    description:
      "Silky, tender, and perfectly rolled. Master this technique and elevate your breakfast game forever.",
    image: "/perfect-french-omelette-on-white-plate-with-herbs.jpg",
    category: "Breakfast",
    time: "10 min",
    prep_time: "5 min",
    cook_time: "5 min",
    servings: 1,
    difficulty: "Medium",
    ingredients: JSON.stringify([
      {
        items: [
          "3 large eggs",
          "1 tablespoon butter",
          "1 tablespoon fresh chives, finely chopped",
          "Salt and white pepper to taste",
          "Optional: 2 tablespoons gruyère cheese, grated",
        ],
      },
    ]),
    instructions: JSON.stringify([
      {
        step: 1,
        text: "Crack eggs into a bowl. Season with salt and pepper. Beat vigorously with a fork until homogeneous.",
      },
      {
        step: 2,
        text: "Heat an 8-inch non-stick pan over medium-high heat. Add butter and swirl to coat.",
      },
      {
        step: 3,
        text: "When butter is foamy but not brown, add eggs. Immediately start stirring with a rubber spatula while shaking the pan.",
      },
      {
        step: 4,
        text: "When eggs are mostly set but still slightly wet on top, stop stirring. Let cook for 10 seconds.",
      },
      {
        step: 5,
        text: "Add cheese and chives to the center. Tilt pan and roll omelette onto itself.",
      },
      {
        step: 6,
        text: "Slide onto a warm plate, seam-side down. Rub with a little butter for shine.",
      },
    ]),
    tips: JSON.stringify([
      "The key is high heat and constant movement - the whole process takes under 2 minutes.",
      "Use a non-stick pan - this is not the time for cast iron.",
    ]),
    tags: JSON.stringify([
      "breakfast",
      "eggs",
      "french",
      "quick",
      "vegetarian",
    ]),
    featured: 0,
    created_at: "2024-01-05",
  },
  {
    id: "5",
    slug: "lemon-herb-roast-chicken",
    title: "Lemon Herb Roast Chicken",
    description:
      "Golden, crispy skin and juicy meat. This Sunday roast classic never goes out of style.",
    image: "/golden-roast-chicken-with-herbs-and-lemon-slices.jpg",
    category: "Dinner",
    time: "1 hr 30 min",
    prep_time: "15 min",
    cook_time: "1 hr 15 min",
    servings: 6,
    difficulty: "Medium",
    ingredients: JSON.stringify([
      {
        items: [
          "1 whole chicken (4-5 lbs)",
          "4 tablespoons butter, softened",
          "4 cloves garlic, minced",
          "2 tablespoons fresh thyme leaves",
          "2 tablespoons fresh rosemary, chopped",
          "2 lemons",
          "1 head of garlic, halved crosswise",
          "Salt and pepper",
          "2 tablespoons olive oil",
        ],
      },
    ]),
    instructions: JSON.stringify([
      {
        step: 1,
        text: "Remove chicken from fridge 1 hour before cooking. Preheat oven to 425°F (220°C).",
      },
      {
        step: 2,
        text: "Mix softened butter with minced garlic, thyme, rosemary, and zest of 1 lemon.",
      },
      {
        step: 3,
        text: "Pat chicken very dry with paper towels. Gently loosen skin over breast and thighs.",
      },
      {
        step: 4,
        text: "Spread herb butter under and over the skin. Season generously with salt and pepper.",
      },
      {
        step: 5,
        text: "Stuff cavity with halved garlic head and quartered lemons. Tie legs together with kitchen twine.",
      },
      {
        step: 6,
        text: "Roast for 1 hour 15 minutes, or until internal temperature reaches 165°F. Rest 15 minutes before carving.",
      },
    ]),
    tips: JSON.stringify([
      "Dry skin = crispy skin. Pat that chicken dry!",
      "Let it rest - this is when the juices redistribute for moist meat.",
    ]),
    tags: JSON.stringify(["chicken", "roast", "sunday dinner", "classic"]),
    featured: 0,
    created_at: "2024-01-03",
  },
  {
    id: "6",
    slug: "chocolate-lava-cakes",
    title: "Chocolate Lava Cakes",
    description:
      "Rich, decadent, and impressively simple. The molten center is pure chocolate magic.",
    image: "/chocolate-lava-cake-with-molten-center-on-plate.jpg",
    category: "Dessert",
    time: "25 min",
    prep_time: "10 min",
    cook_time: "15 min",
    servings: 4,
    difficulty: "Medium",
    ingredients: JSON.stringify([
      {
        items: [
          "4 oz bittersweet chocolate, chopped",
          "1/2 cup (1 stick) unsalted butter",
          "1 cup powdered sugar",
          "2 whole eggs",
          "2 egg yolks",
          "6 tablespoons all-purpose flour",
          "Butter and cocoa powder for ramekins",
          "Vanilla ice cream for serving",
        ],
      },
    ]),
    instructions: JSON.stringify([
      {
        step: 1,
        text: "Preheat oven to 425°F. Butter 4 ramekins and dust with cocoa powder.",
      },
      {
        step: 2,
        text: "Melt chocolate and butter together in microwave or double boiler. Stir until smooth.",
      },
      {
        step: 3,
        text: "Whisk in powdered sugar until smooth. Add eggs and yolks, whisk well.",
      },
      {
        step: 4,
        text: "Fold in flour until just combined. Divide batter among ramekins.",
      },
      {
        step: 5,
        text: "Bake for 12-14 minutes. Edges should be firm, center soft.",
      },
      {
        step: 6,
        text: "Let cool 1 minute, then invert onto plates. Serve immediately with ice cream.",
      },
    ]),
    tips: JSON.stringify([
      "You can prepare the batter ahead and refrigerate - just add 1-2 minutes to baking time.",
      "Don't overbake! The center should still wobble slightly when you remove from oven.",
    ]),
    tags: JSON.stringify(["dessert", "chocolate", "date night", "impressive"]),
    featured: 0,
    created_at: "2024-01-01",
  },
]

// Seed data for wines
const wines = [
  {
    id: "chateau-margaux-2018",
    name: "Château Margaux",
    winery: "Château Margaux",
    region: "Margaux, Bordeaux",
    country: "France",
    year: 2018,
    type: "Red",
    grape: "Cabernet Sauvignon, Merlot",
    rating: 5,
    notes:
      "An absolutely stunning wine with incredible depth and complexity. Dark fruit, violet, and subtle oak notes dance on the palate. The tannins are silky smooth, leading to a finish that lasts for minutes. One of my all-time favorites for special occasions.",
    aromas: JSON.stringify(["Blackcurrant", "Violet", "Cedar", "Tobacco"]),
    pairings: JSON.stringify(["Filet Mignon", "Lamb Rack", "Aged Cheeses"]),
    image: "/elegant-red-wine-glass-with-bordeaux-on-white-linen.jpg",
    price: "$$$$$",
    occasion: "Special Celebration",
  },
  {
    id: "cloudy-bay-sauvignon-2023",
    name: "Sauvignon Blanc",
    winery: "Cloudy Bay",
    region: "Marlborough",
    country: "New Zealand",
    year: 2023,
    type: "White",
    grape: "Sauvignon Blanc",
    rating: 4,
    notes:
      "Crisp, zesty, and absolutely refreshing. This is my go-to summer wine. Bright citrus and passion fruit with a mineral finish. Perfect for afternoon sipping on the patio or paired with fresh seafood.",
    aromas: JSON.stringify(["Citrus", "Passion Fruit", "Grass", "Mineral"]),
    pairings: JSON.stringify(["Grilled Fish", "Goat Cheese Salad", "Oysters"]),
    image: "/crisp-white-wine-glass-with-vineyard-background.jpg",
    price: "$$",
    occasion: "Everyday Enjoyment",
  },
  {
    id: "whispering-angel-rose-2023",
    name: "Whispering Angel",
    winery: "Château d'Esclans",
    region: "Provence",
    country: "France",
    year: 2023,
    type: "Rosé",
    grape: "Grenache, Rolle",
    rating: 4,
    notes:
      "The quintessential Provence rosé. Pale salmon color with delicate strawberry and white peach notes. Dry and elegant with beautiful acidity. Makes every moment feel like a vacation in the South of France.",
    aromas: JSON.stringify([
      "Strawberry",
      "White Peach",
      "Rose Petal",
      "Citrus",
    ]),
    pairings: JSON.stringify([
      "Mediterranean Salad",
      "Grilled Salmon",
      "Light Pasta",
    ]),
    image: "/rose-wine-glass-with-summer-light-setting.jpg",
    price: "$$",
    occasion: "Summer Gatherings",
  },
  {
    id: "dom-perignon-2012",
    name: "Dom Pérignon",
    winery: "Moët & Chandon",
    region: "Champagne",
    country: "France",
    year: 2012,
    type: "Sparkling",
    grape: "Chardonnay, Pinot Noir",
    rating: 5,
    notes:
      "Pure elegance in a glass. Incredibly fine bubbles carry notes of brioche, citrus, and white flowers. Complex yet approachable, with a creamy texture and endless finish. Worth every penny for milestone moments.",
    aromas: JSON.stringify([
      "Brioche",
      "Lemon Zest",
      "White Flowers",
      "Almond",
    ]),
    pairings: JSON.stringify(["Caviar", "Lobster", "Celebration Cake"]),
    image: "/champagne-flute-with-golden-bubbles-celebration.jpg",
    price: "$$$$$",
    occasion: "Milestone Celebrations",
  },
  {
    id: "caymus-cabernet-2021",
    name: "Cabernet Sauvignon",
    winery: "Caymus Vineyards",
    region: "Napa Valley",
    country: "USA",
    year: 2021,
    type: "Red",
    grape: "Cabernet Sauvignon",
    rating: 4,
    notes:
      "Rich, bold, and unapologetically Napa. Dark cherry, cocoa, and vanilla create a luscious, full-bodied experience. Soft tannins make it approachable now, but it will age beautifully. My pick for steakhouse dinners.",
    aromas: JSON.stringify(["Dark Cherry", "Cocoa", "Vanilla", "Oak"]),
    pairings: JSON.stringify(["Ribeye Steak", "BBQ Ribs", "Dark Chocolate"]),
    image: "/napa-valley-red-wine-with-vineyard-sunset.jpg",
    price: "$$$",
    occasion: "Date Night",
  },
  {
    id: "riesling-spatlese-2022",
    name: "Riesling Spätlese",
    winery: "Dr. Loosen",
    region: "Mosel",
    country: "Germany",
    year: 2022,
    type: "White",
    grape: "Riesling",
    rating: 5,
    notes:
      "A masterclass in balance. Off-dry with electric acidity that makes your mouth water. Green apple, apricot, and slate minerality. Incredibly versatile with food - from spicy Thai to creamy desserts. A personal obsession.",
    aromas: JSON.stringify(["Green Apple", "Apricot", "Slate", "Honey"]),
    pairings: JSON.stringify(["Spicy Thai", "Pork Belly", "Apple Tart"]),
    image: "/german-riesling-wine-glass-mosel-valley.jpg",
    price: "$$",
    occasion: "Food Pairing Adventures",
  },
]

// Seed data for products
const products = [
  {
    id: "1",
    slug: "ceramic-mixing-bowl-set",
    name: "Ceramic Mixing Bowl Set",
    description:
      "A beautiful set of three nesting bowls, perfect for prep work and serving.",
    long_description:
      "These handcrafted ceramic mixing bowls are as functional as they are beautiful. The set includes three sizes that nest perfectly for storage. The matte cream finish complements any kitchen aesthetic, and the weighted bottoms keep them stable during mixing. Dishwasher and microwave safe.",
    price: 6800, // $68.00 in cents
    compare_at_price: null,
    image: "/elegant-cream-ceramic-mixing-bowls-stacked-kitchen.jpg",
    images: JSON.stringify([
      "/elegant-cream-ceramic-mixing-bowls-stacked-kitchen.jpg",
    ]),
    category: "Kitchenware",
    tags: JSON.stringify(["bowls", "ceramic", "kitchen essentials"]),
    in_stock: 1,
    featured: 1,
    details: JSON.stringify([
      "Set of 3 nesting bowls (small, medium, large)",
      "Handcrafted ceramic with matte cream finish",
      "Weighted bottoms for stability",
      "Dishwasher and microwave safe",
      'Dimensions: 6", 8", 10" diameter',
    ]),
  },
  {
    id: "2",
    slug: "linen-kitchen-towels",
    name: "Linen Kitchen Towels",
    description:
      "Soft, absorbent, and beautifully minimal. A set of four in natural tones.",
    long_description:
      "Made from 100% European flax linen, these kitchen towels get softer with every wash. The natural fibers are highly absorbent and quick-drying. Perfect for drying dishes, covering dough, or as a beautiful accent in your kitchen. Set of four in complementary natural tones.",
    price: 3400, // $34.00
    compare_at_price: null,
    image: "/natural-linen-kitchen-towels-folded-neatly.jpg",
    images: JSON.stringify(["/natural-linen-kitchen-towels-folded-neatly.jpg"]),
    category: "Linens",
    tags: JSON.stringify(["towels", "linen", "natural"]),
    in_stock: 1,
    featured: 1,
    details: JSON.stringify([
      "Set of 4 towels",
      "100% European flax linen",
      'Dimensions: 18" x 28" each',
      "Pre-washed for softness",
      "Gets softer with each wash",
      "Machine washable",
    ]),
  },
  {
    id: "3",
    slug: "olive-wood-serving-board",
    name: "Olive Wood Serving Board",
    description: "Each board is unique, with beautiful natural grain patterns.",
    long_description:
      "Hand-carved from sustainably sourced Mediterranean olive wood, each serving board is one-of-a-kind with unique grain patterns and warm honey tones. Perfect for cheese boards, charcuterie, or as a stunning centerpiece. The natural oils in olive wood make it naturally antibacterial and long-lasting.",
    price: 5200, // $52.00
    compare_at_price: null,
    image: "/beautiful-olive-wood-cutting-board-with-grain.jpg",
    images: JSON.stringify([
      "/beautiful-olive-wood-cutting-board-with-grain.jpg",
    ]),
    category: "Serveware",
    tags: JSON.stringify(["cutting board", "wood", "serving"]),
    in_stock: 1,
    featured: 1,
    details: JSON.stringify([
      "Hand-carved from Mediterranean olive wood",
      "Sustainably sourced",
      "Naturally antibacterial",
      'Approximate size: 14" x 8"',
      "Each piece is unique",
      "Hand wash recommended",
    ]),
  },
  {
    id: "4",
    slug: "copper-measuring-cups",
    name: "Copper Measuring Cups",
    description:
      "Rose gold copper cups that are as precise as they are pretty.",
    long_description:
      "These stunning copper measuring cups bring warmth and elegance to your kitchen. The set includes 1 cup, 1/2 cup, 1/3 cup, and 1/4 cup sizes. The long handles keep your hands away from ingredients, and the copper develops a beautiful patina over time. Comes with a leather hanging strap.",
    price: 4500, // $45.00
    compare_at_price: null,
    image: "/placeholder.jpg",
    images: JSON.stringify(["/placeholder.jpg"]),
    category: "Kitchenware",
    tags: JSON.stringify(["measuring", "copper", "baking"]),
    in_stock: 1,
    featured: 0,
    details: JSON.stringify([
      "Set of 4 cups (1 cup, 1/2 cup, 1/3 cup, 1/4 cup)",
      "Solid copper with rose gold finish",
      "Long handles for easy grip",
      "Includes leather hanging strap",
      "Hand wash only",
    ]),
  },
  {
    id: "5",
    slug: "marble-salt-cellar",
    name: "Marble Salt Cellar",
    description:
      "Keep your finishing salt within reach with this elegant marble cellar.",
    long_description:
      "Carved from genuine white marble with subtle gray veining, this salt cellar is the perfect home for your favorite finishing salt. The swivel lid keeps salt protected while providing easy access. A beautiful addition to any countertop or table setting.",
    price: 3800, // $38.00
    compare_at_price: null,
    image: "/placeholder.jpg",
    images: JSON.stringify(["/placeholder.jpg"]),
    category: "Serveware",
    tags: JSON.stringify(["salt", "marble", "countertop"]),
    in_stock: 1,
    featured: 0,
    details: JSON.stringify([
      "Genuine white marble",
      "Swivel lid design",
      "Includes small wooden spoon",
      "Capacity: approximately 1/2 cup",
      "Hand wash only",
    ]),
  },
  {
    id: "6",
    slug: "brass-kitchen-timer",
    name: "Brass Kitchen Timer",
    description: "A classic mechanical timer with a satisfying ring.",
    long_description:
      "Step away from your phone and embrace the analog charm of this brass kitchen timer. The 60-minute dial is easy to read, and the mechanical ring is satisfying without being jarring. No batteries needed—just wind and cook. Weighted base keeps it stable on any surface.",
    price: 2900, // $29.00
    compare_at_price: null,
    image: "/placeholder.jpg",
    images: JSON.stringify(["/placeholder.jpg"]),
    category: "Kitchenware",
    tags: JSON.stringify(["timer", "brass", "vintage"]),
    in_stock: 0,
    featured: 0,
    details: JSON.stringify([
      "Solid brass construction",
      "60-minute mechanical dial",
      "No batteries required",
      "Weighted base",
      'Dimensions: 3" diameter',
    ]),
  },
]

export function seedDatabase(): void {
  const db = getDb()

  // Clear existing data
  db.exec("DELETE FROM recipes")
  db.exec("DELETE FROM wines")
  db.exec("DELETE FROM products")

  // Insert recipes
  const insertRecipe = db.prepare(`
    INSERT INTO recipes (id, slug, title, description, image, category, time, prep_time, cook_time, servings, difficulty, ingredients, instructions, tips, tags, featured, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  recipes.forEach((recipe) => {
    insertRecipe.run(
      recipe.id,
      recipe.slug,
      recipe.title,
      recipe.description,
      recipe.image,
      recipe.category,
      recipe.time,
      recipe.prep_time,
      recipe.cook_time,
      recipe.servings,
      recipe.difficulty,
      recipe.ingredients,
      recipe.instructions,
      recipe.tips,
      recipe.tags,
      recipe.featured,
      recipe.created_at,
    )
  })

  // Insert wines
  const insertWine = db.prepare(`
    INSERT INTO wines (id, name, winery, region, country, year, type, grape, rating, notes, aromas, pairings, image, price, occasion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  wines.forEach((wine) => {
    insertWine.run(
      wine.id,
      wine.name,
      wine.winery,
      wine.region,
      wine.country,
      wine.year,
      wine.type,
      wine.grape,
      wine.rating,
      wine.notes,
      wine.aromas,
      wine.pairings,
      wine.image,
      wine.price,
      wine.occasion,
    )
  })

  // Insert products
  const insertProduct = db.prepare(`
    INSERT INTO products (id, slug, name, description, long_description, price, compare_at_price, image, images, category, tags, in_stock, featured, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  products.forEach((product) => {
    insertProduct.run(
      product.id,
      product.slug,
      product.name,
      product.description,
      product.long_description,
      product.price,
      product.compare_at_price,
      product.image,
      product.images,
      product.category,
      product.tags,
      product.in_stock,
      product.featured,
      product.details,
    )
  })

  console.log(`Seeded database with:`)
  console.log(`  - ${recipes.length} recipes`)
  console.log(`  - ${wines.length} wines`)
  console.log(`  - ${products.length} products`)
}

// Run seed if this file is executed directly
if (import.meta.main) {
  seedDatabase()
}
