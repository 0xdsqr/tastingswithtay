import type { Recipe } from "../db/types"

// Static data for recipes - will be replaced with database calls via server functions later
export const recipes: Recipe[] = [
  {
    id: "1",
    slug: "honey-glazed-salmon",
    title: "Honey Glazed Salmon with Roasted Vegetables",
    description:
      "A perfectly balanced weeknight dinner that feels special. The sweet honey glaze caramelizes beautifully against the rich salmon.",
    image: "/honey-glazed-salmon-with-colorful-roasted-vegetabl.jpg",
    category: "Dinner",
    time: "35 min",
    prepTime: "10 min",
    cookTime: "25 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
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
    ],
    instructions: [
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
    ],
    tips: [
      "For extra caramelization, broil for the last 2 minutes of cooking.",
      "You can substitute the vegetables with whatever you have on hand.",
      "Leftovers keep well in the fridge for up to 3 days.",
    ],
    tags: ["seafood", "healthy", "quick", "gluten-free option"],
    featured: true,
    createdAt: "2024-01-15",
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
    prepTime: "30 min",
    cookTime: "45 min",
    servings: 8,
    difficulty: "Hard",
    ingredients: [
      {
        items: [
          "500g bread flour",
          "350g water (room temperature)",
          "100g active sourdough starter",
          "10g salt",
          "Rice flour for dusting",
        ],
      },
    ],
    instructions: [
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
    ],
    tips: [
      "Your starter should be at peak activity - it should have doubled and be full of bubbles.",
      "The windowpane test is your friend - if you can stretch the dough thin enough to see light through it, gluten is developed.",
      "Every oven is different, so watch your bread, not the clock.",
    ],
    tags: ["bread", "sourdough", "artisan", "fermented"],
    featured: true,
    createdAt: "2024-01-10",
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
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
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
    ],
    instructions: [
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
    ],
    tips: [
      "Don't skip the pasta water - the starch helps create a silky sauce.",
      "Add a splash of good olive oil at the end for extra richness.",
    ],
    tags: ["pasta", "vegetarian", "spring", "quick"],
    featured: true,
    createdAt: "2024-01-08",
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
    prepTime: "5 min",
    cookTime: "5 min",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      {
        items: [
          "3 large eggs",
          "1 tablespoon butter",
          "1 tablespoon fresh chives, finely chopped",
          "Salt and white pepper to taste",
          "Optional: 2 tablespoons gruyère cheese, grated",
        ],
      },
    ],
    instructions: [
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
    ],
    tips: [
      "The key is high heat and constant movement - the whole process takes under 2 minutes.",
      "Use a non-stick pan - this is not the time for cast iron.",
    ],
    tags: ["breakfast", "eggs", "french", "quick", "vegetarian"],
    featured: false,
    createdAt: "2024-01-05",
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
    prepTime: "15 min",
    cookTime: "1 hr 15 min",
    servings: 6,
    difficulty: "Medium",
    ingredients: [
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
    ],
    instructions: [
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
    ],
    tips: [
      "Dry skin = crispy skin. Pat that chicken dry!",
      "Let it rest - this is when the juices redistribute for moist meat.",
    ],
    tags: ["chicken", "roast", "sunday dinner", "classic"],
    featured: false,
    createdAt: "2024-01-03",
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
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 4,
    difficulty: "Medium",
    ingredients: [
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
    ],
    instructions: [
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
    ],
    tips: [
      "You can prepare the batter ahead and refrigerate - just add 1-2 minutes to baking time.",
      "Don't overbake! The center should still wobble slightly when you remove from oven.",
    ],
    tags: ["dessert", "chocolate", "date night", "impressive"],
    featured: false,
    createdAt: "2024-01-01",
  },
]

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug)
}

export function getRecipesByCategory(category: string): Recipe[] {
  return recipes.filter(
    (recipe) => recipe.category.toLowerCase() === category.toLowerCase(),
  )
}

export function getFeaturedRecipes(): Recipe[] {
  return recipes.filter((recipe) => recipe.featured)
}

export function getAllCategories(): string[] {
  return [...new Set(recipes.map((recipe) => recipe.category))]
}
