const dotenv = require("dotenv");
const connectDB = require("../config/database");
const Catering = require("../models/Catering");
const Offer = require("../models/Offer");
const MenuItem = require("../models/MenuItem");

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing catalog data
        await Offer.deleteMany({});
        await Catering.deleteMany({});
        await MenuItem.deleteMany({});

        const caterings = await Catering.insertMany([
            // Desi
            {
                name: "Spice Symphony Catering",
                bannerImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
                description: "Authentic South Asian buffet catering for weddings and corporate events.",
                cuisine: "South Asian",
                category: "Desi",
                area: "North District",
                phone: "0300-1112233",
                rating: 4.8,
            },
            {
                name: "Delhi Darbar Events",
                bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
                description: "Royal Mughlai feasts and biryani specialists for celebrations.",
                cuisine: "Mughlai",
                category: "Desi",
                area: "North Greens",
                phone: "0302-7788990",
                rating: 4.9,
            },
            {
                name: "Punjabi Tandoor House",
                bannerImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1000&q=80",
                description: "Traditional tandoori breads, curries, and desi classics.",
                cuisine: "Punjabi",
                category: "Desi",
                area: "East Market",
                phone: "0306-1122334",
                rating: 4.6,
            },
            {
                name: "Kabab & Khana",
                bannerImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80",
                description: "Stuffed kebabs, parathas, and hearty comfort plates.",
                cuisine: "Kebab House",
                category: "Desi",
                area: "Old Bazaar",
                phone: "0311-6677889",
                rating: 4.2,
            },
            {
                name: "Tandoori Nights",
                bannerImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1000&q=80",
                description: "Slow-cooked curries and naan served hot at your venue.",
                cuisine: "North Indian",
                category: "Desi",
                area: "South Loop",
                phone: "0313-8899001",
                rating: 4.5,
            },
            {
                name: "Mumbai Street Co.",
                bannerImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
                description: "Street-style chaat, pav bhaji, and lively desi favorites.",
                cuisine: "Street Desi",
                category: "Desi",
                area: "Old Bazaar",
                phone: "0318-5566778",
                rating: 4.3,
            },
            {
                name: "Cinnamon & Spice",
                bannerImage: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=1000&q=80",
                description: "Arabic-style roasted chicken and rice platters for large groups.",
                cuisine: "Arabic",
                category: "Desi",
                area: "Tower District",
                phone: "0315-1011123",
                rating: 4.6,
            },

            // Chinese
            {
                name: "Sizzling Wok Asia",
                bannerImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1000&q=80",
                description: "Stir-fries, noodles, and dumplings with authentic Asian soul.",
                cuisine: "Chinese",
                category: "Chinese",
                area: "North District",
                phone: "0308-3344556",
                rating: 4.7,
            },
            {
                name: "Dragon Wok Express",
                bannerImage: "https://images.unsplash.com/photo-1543832923-44667a44c804?auto=format&fit=crop&w=1000&q=80",
                description: "Quick stir-fry meals and fried rice for hot event service.",
                cuisine: "Chinese",
                category: "Chinese",
                area: "Central Plaza",
                phone: "0332-1011123",
                rating: 4.4,
            },
            {
                name: "Golden Peking Kitchen",
                bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
                description: "Cantonese classics, dumplings, and banquet-style Chinese menus.",
                cuisine: "Chinese",
                category: "Chinese",
                area: "East Market",
                phone: "0333-2233344",
                rating: 4.6,
            },

            // BBQ & Grill
            {
                name: "Golden Grill House",
                bannerImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
                description: "Premium BBQ and grilled platters served fresh for large gatherings.",
                cuisine: "BBQ & Grill",
                category: "BBQ & Grill",
                area: "City Center",
                phone: "0301-4455667",
                rating: 4.6,
            },
            {
                name: "Smoky Pit BBQ",
                bannerImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
                description: "Slow-smoked ribs, brisket, and backyard barbecue spreads.",
                cuisine: "BBQ & Grill",
                category: "BBQ & Grill",
                area: "West Parks",
                phone: "0334-4455667",
                rating: 4.7,
            },
            {
                name: "Charcoal Grill Zone",
                bannerImage: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1000&q=80",
                description: "Live charcoal grilling stations and tandoori skewers.",
                cuisine: "BBQ & Grill",
                category: "BBQ & Grill",
                area: "Marina",
                phone: "0335-5566778",
                rating: 4.5,
            },

            // Fast Food
            {
                name: "Roll & Wrap Express",
                bannerImage: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=1000&q=80",
                description: "Fast, fresh rolls and wraps perfect for company lunches.",
                cuisine: "Wraps & Rolls",
                category: "Fast Food",
                area: "Tech Park",
                phone: "0314-9900112",
                rating: 4.1,
            },
            {
                name: "The Burger Barn",
                bannerImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80",
                description: "Juicy burgers and loaded fries for casual gatherings.",
                cuisine: "Burgers",
                category: "Fast Food",
                area: "City Center",
                phone: "0336-6677889",
                rating: 4.3,
            },
            {
                name: "Speedy Snacks Co.",
                bannerImage: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1000&q=80",
                description: "Pizza, sliders, and shareable platters for events on the go.",
                cuisine: "Pizza & Snacks",
                category: "Fast Food",
                area: "Tech Park",
                phone: "0337-7788990",
                rating: 4.2,
            },

            // Seafood
            {
                name: "Coastal Catch Caterers",
                bannerImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80",
                description: "Fresh seafood and coastal delicacies prepared to perfection.",
                cuisine: "Seafood",
                category: "Seafood",
                area: "Harbor Side",
                phone: "0303-2233445",
                rating: 4.5,
            },
            {
                name: "Island Seafood Co.",
                bannerImage: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=1000&q=80",
                description: "Grilled prawns, fish steaks, and coastal chowders.",
                cuisine: "Seafood",
                category: "Seafood",
                area: "Marina",
                phone: "0312-7788990",
                rating: 4.8,
            },
            {
                name: "Crab & Claw Kitchen",
                bannerImage: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=80",
                description: "Crab buffets and fresh catch platters for celebratory feasts.",
                cuisine: "Seafood",
                category: "Seafood",
                area: "Marina",
                phone: "0338-8899001",
                rating: 4.5,
            },

            // Healthy & Vegan
            {
                name: "Green Leaf Vegan Co.",
                bannerImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
                description: "Plant-based catering packed with flavor for health-conscious events.",
                cuisine: "Vegan",
                category: "Healthy & Vegan",
                area: "West Parks",
                phone: "0304-5566778",
                rating: 4.7,
            },
            {
                name: "Berry Good Bowls",
                bannerImage: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80",
                description: "Healthy grain bowls, smoothies, and light catering menus.",
                cuisine: "Healthy",
                category: "Healthy & Vegan",
                area: "Green Street",
                phone: "0316-2233344",
                rating: 4.4,
            },
            {
                name: "Pure Bowl Kitchen",
                bannerImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=80",
                description: "Nutrient-dense bowls and wraps made fresh daily.",
                cuisine: "Healthy",
                category: "Healthy & Vegan",
                area: "Green Street",
                phone: "0330-9900112",
                rating: 4.6,
            },

            // Desserts
            {
                name: "Sweet Endings Desserts",
                bannerImage: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1000&q=80",
                description: "Dessert tables, cakes, and sweet buffets for every occasion.",
                cuisine: "Desserts",
                category: "Desserts",
                area: "City Center",
                phone: "0305-8899001",
                rating: 4.4,
            },
            {
                name: "Cake & Co. Desserts",
                bannerImage: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80",
                description: "Custom cakes, cupcakes, and live dessert stations.",
                cuisine: "Desserts",
                category: "Desserts",
                area: "North District",
                phone: "0331-2233445",
                rating: 4.7,
            },

            // Continental & Mediterranean
            {
                name: "Mediterranean Bites",
                bannerImage: "https://images.unsplash.com/photo-1543832923-44667a44c804?auto=format&fit=crop&w=1000&q=80",
                description: "Fresh wraps, mezze platters, and vibrant Mediterranean flavors.",
                cuisine: "Mediterranean",
                category: "Continental & Mediterranean",
                area: "Central Plaza",
                phone: "0307-2233445",
                rating: 4.5,
            },
            {
                name: "Farm To Fork Catering",
                bannerImage: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80",
                description: "Seasonal, rustic meals crafted from local farm produce.",
                cuisine: "Farmhouse",
                category: "Continental & Mediterranean",
                area: "South Fields",
                phone: "0309-4455667",
                rating: 4.3,
            },
            {
                name: "Sunrise Continental",
                bannerImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=80",
                description: "Continental buffets and brunch spreads for elegant events.",
                cuisine: "Continental",
                category: "Continental & Mediterranean",
                area: "Riverside",
                phone: "0310-5566778",
                rating: 4.6,
            },
            {
                name: "Riviera Pasta House",
                bannerImage: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80",
                description: "Handmade pasta, rich sauces, and classic Italian antipasti.",
                cuisine: "Continental",
                category: "Continental & Mediterranean",
                area: "Riverside",
                phone: "0339-1011123",
                rating: 4.5,
            },

            // Italian
            {
                name: "Pizza Palace Catering",
                bannerImage: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80",
                description: "Wood-fired pizzas and generous Italian spreads for big events.",
                cuisine: "Italian",
                category: "Italian",
                area: "City Center",
                phone: "0340-2233344",
                rating: 4.6,
            },
            {
                name: "La Cucina Events",
                bannerImage: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80",
                description: "Family-style Italian menus with fresh breads and antipasti.",
                cuisine: "Italian",
                category: "Italian",
                area: "Green Street",
                phone: "0341-3344556",
                rating: 4.5,
            },
            {
                name: "Bella Italia Catering",
                bannerImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80",
                description: "Homestyle lasagna, risotto, and tiramisu dessert bars.",
                cuisine: "Italian",
                category: "Italian",
                area: "North District",
                phone: "0342-4455667",
                rating: 4.4,
            },

            // Breakfast & Brunch
            {
                name: "Morning Glory Brunch",
                bannerImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80",
                description: "Pancake stacks, omelet bars, and fresh pastries for morning events.",
                cuisine: "Breakfast",
                category: "Breakfast & Brunch",
                area: "East Market",
                phone: "0343-5566778",
                rating: 4.7,
            },
            {
                name: "Sunrise Spread Co.",
                bannerImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=80",
                description: "Egg stations, continental breakfasts, and juice counters.",
                cuisine: "Breakfast",
                category: "Breakfast & Brunch",
                area: "City Center",
                phone: "0344-6677889",
                rating: 4.3,
            },
            {
                name: "Brunch & Butter",
                bannerImage: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1000&q=80",
                description: "Fluffy bagels, yogurt bowls, and smoothie breakfast bars.",
                cuisine: "Brunch",
                category: "Breakfast & Brunch",
                area: "Green Street",
                phone: "0345-7788990",
                rating: 4.5,
            },

            // Street Food
            {
                name: "Snack Street Crew",
                bannerImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80",
                description: "Live bhel puri, samosas, and chaat carts at your venue.",
                cuisine: "Street Food",
                category: "Street Food",
                area: "Old Bazaar",
                phone: "0346-8899001",
                rating: 4.2,
            },
            {
                name: "Chaat Corner Express",
                bannerImage: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=80",
                description: "Popular chaat platters and tangy street snacks.",
                cuisine: "Street Food",
                category: "Street Food",
                area: "Central Plaza",
                phone: "0347-9900112",
                rating: 4.1,
            },
            {
                name: "Truck Stop Nation",
                bannerImage: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1000&q=80",
                description: "Food-truck classics and fusion street eats for festivals.",
                cuisine: "Street Food",
                category: "Street Food",
                area: "Tech Park",
                phone: "0348-1011123",
                rating: 4.3,
            },

            // Desserts (expanded)
            {
                name: "Frosted Yum Bake Shop",
                bannerImage: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80",
                description: "Artisan pastries, cookies, and dessert grazing tables.",
                cuisine: "Desserts",
                category: "Desserts",
                area: "West Parks",
                phone: "0349-2233445",
                rating: 4.6,
            },
            {
                name: "Choco Dreams Catering",
                bannerImage: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1000&q=80",
                description: "Molten cakes, chocolate fountains, and decadent sweets.",
                cuisine: "Desserts",
                category: "Desserts",
                area: "Marina",
                phone: "0350-3344556",
                rating: 4.5,
            },
            {
                name: "Coconut Cream Sweets",
                bannerImage: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1000&q=80",
                description: "Gulab jamun, jalebi, and bite-sized traditional sweets.",
                cuisine: "Desserts",
                category: "Desserts",
                area: "Old Bazaar",
                phone: "0361-4455667",
                rating: 4.4,
            },
            {
                name: "Puffy Pies & Tarts",
                bannerImage: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=1000&q=80",
                description: "Fruit tarts, cream puffs, and petit four party trays.",
                cuisine: "Desserts",
                category: "Desserts",
                area: "Riverside",
                phone: "0362-5566778",
                rating: 4.3,
            },
            {
                name: "Salted Caramel Co.",
                bannerImage: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80",
                description: "Caramel desserts, puddings, and elegant plated sweets.",
                cuisine: "Desserts",
                category: "Desserts",
                area: "City Center",
                phone: "0363-6677889",
                rating: 4.6,
            },

            // Desi (expanded)
            {
                name: "Dawat-e-Delhi",
                bannerImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=80",
                description: "Regal biryani and korma platters for royal celebrations.",
                cuisine: "Mughlai",
                category: "Desi",
                area: "North District",
                phone: "0364-7788990",
                rating: 4.7,
            },
            {
                name: "Painda Palace",
                bannerImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=80",
                description: "Lahori handis, sajji, and slow-cooked desi delicacies.",
                cuisine: "Lahori",
                category: "Desi",
                area: "South Loop",
                phone: "0365-8899001",
                rating: 4.6,
            },
            {
                name: "Zaiqa House",
                bannerImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
                description: "Home-style curries, daal, and roti buffets for families.",
                cuisine: "Desi",
                category: "Desi",
                area: "East Market",
                phone: "0366-9900112",
                rating: 4.4,
            },
            {
                name: "Tikka & More",
                bannerImage: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1000&q=80",
                description: "Charcoal chicken tikka, seekh kebabs, and liver tikka.",
                cuisine: "BBQ Desi",
                category: "Desi",
                area: "Central Plaza",
                phone: "0367-1011123",
                rating: 4.5,
            },

            // Chinese (expanded)
            {
                name: "Silk Road Noodles",
                bannerImage: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1000&q=80",
                description: "Hand-pulled noodles, dim sum, and aromatic Chinese soups.",
                cuisine: "Chinese",
                category: "Chinese",
                area: "Green Street",
                phone: "0368-2233344",
                rating: 4.6,
            },
            {
                name: "Panda Wok Mobile",
                bannerImage: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80",
                description: "Portable wok stations with noodles, rice, and chow mein.",
                cuisine: "Chinese",
                category: "Chinese",
                area: "Tech Park",
                phone: "0369-3344556",
                rating: 4.3,
            },
            {
                name: "Lantern Chinese House",
                bannerImage: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1000&q=80",
                description: "Sweet and sour dishes, fried rice, and banquet menus.",
                cuisine: "Chinese",
                category: "Chinese",
                area: "North District",
                phone: "0370-4455667",
                rating: 4.5,
            },

            // BBQ & Grill (expanded)
            {
                name: "Ember & Oak BBQ",
                bannerImage: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1000&q=80",
                description: "Wood-smoked briskets and pit-barbecue family platters.",
                cuisine: "BBQ & Grill",
                category: "BBQ & Grill",
                area: "West Parks",
                phone: "0371-5566778",
                rating: 4.7,
            },
            {
                name: "Flame Pit Caterers",
                bannerImage: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1000&q=80",
                description: "Live fire grills, skewered meats, and rooftop barbecue.",
                cuisine: "BBQ & Grill",
                category: "BBQ & Grill",
                area: "Marina",
                phone: "0372-6677889",
                rating: 4.4,
            },
            {
                name: "Kebabs Unlimited",
                bannerImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
                description: "Shish kebabs, kofta, and grilled veggie platters.",
                cuisine: "BBQ & Grill",
                category: "BBQ & Grill",
                area: "South Fields",
                phone: "0373-7788990",
                rating: 4.2,
            },

            // Fast Food (expanded)
            {
                name: "Crunchy Bites",
                bannerImage: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=80",
                description: "Fried chicken buckets and snack combos for youthful crowds.",
                cuisine: "Fast Food",
                category: "Fast Food",
                area: "Tech Park",
                phone: "0374-8899001",
                rating: 4.2,
            },
            {
                name: "Top Taco Truck",
                bannerImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
                description: "Taco bars, nachos, and shareable burrito platters.",
                cuisine: "Fast Food",
                category: "Fast Food",
                area: "City Center",
                phone: "0375-9900112",
                rating: 4.3,
            },
            {
                name: "Fry Nation",
                bannerImage: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1000&q=80",
                description: "Loaded fries, onion rings, and festive snack boards.",
                cuisine: "Fast Food",
                category: "Fast Food",
                area: "West Parks",
                phone: "0376-1011123",
                rating: 4.0,
            },

            // Seafood (expanded)
            {
                name: "Oyster Bay Catering",
                bannerImage: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=80",
                description: "Oyster bars and fresh-shell platters for elegant galas.",
                cuisine: "Seafood",
                category: "Seafood",
                area: "Marina",
                phone: "0377-2233344",
                rating: 4.6,
            },
            {
                name: "Deep Blue Fish Co.",
                bannerImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80",
                description: "Fish and chips, grilled fillets, and lemony sauces.",
                cuisine: "Seafood",
                category: "Seafood",
                area: "Harbor Side",
                phone: "0378-3344556",
                rating: 4.4,
            },
            {
                name: "Shrimp Shack",
                bannerImage: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=1000&q=80",
                description: "Garlic shrimp, prawn skewers, and spicy seafood bites.",
                cuisine: "Seafood",
                category: "Seafood",
                area: "South Side",
                phone: "0379-4455667",
                rating: 4.3,
            },

            // Healthy & Vegan (expanded)
            {
                name: "Nourish & Bloom",
                bannerImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
                description: "Colorful vegan bowls and energy-packed salads.",
                cuisine: "Vegan",
                category: "Healthy & Vegan",
                area: "Green Street",
                phone: "0380-5566778",
                rating: 4.6,
            },
            {
                name: "Leafy Sprout Catering",
                bannerImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80",
                description: "Raw salads, sprout bowls, and detox catering menus.",
                cuisine: "Healthy",
                category: "Healthy & Vegan",
                area: "West Parks",
                phone: "0381-6677889",
                rating: 4.4,
            },
            {
                name: "Tribe Organic Kitchen",
                bannerImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
                description: "Quinoa salads, lentil curries, and vegan desserts.",
                cuisine: "Vegan",
                category: "Healthy & Vegan",
                area: "Central Plaza",
                phone: "0382-7788990",
                rating: 4.5,
            },

            // Italian (expanded)
            {
                name: "Mamma Mia Trattoria",
                bannerImage: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80",
                description: "Cheesy Margheritas, pastas, and family-share Italian boards.",
                cuisine: "Italian",
                category: "Italian",
                area: "Old Bazaar",
                phone: "0383-8899001",
                rating: 4.6,
            },
            {
                name: "Roma On Wheels",
                bannerImage: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80",
                description: "Mobile wood-fired pizza and pasta stations.",
                cuisine: "Italian",
                category: "Italian",
                area: "Tech Park",
                phone: "0384-9900112",
                rating: 4.3,
            },
            {
                name: "Zazzarella Catering",
                bannerImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80",
                description: "Layered lasagne, garlic bread, and creamy alfredo.",
                cuisine: "Italian",
                category: "Italian",
                area: "City Center",
                phone: "0385-1011123",
                rating: 4.4,
            },

            // Street Food (expanded)
            {
                name: "Bazaar Bites",
                bannerImage: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=1000&q=80",
                description: "Tikki, pakoras, and hot rolls from the old bazaar.",
                cuisine: "Street Food",
                category: "Street Food",
                area: "Old Bazaar",
                phone: "0386-2233344",
                rating: 4.2,
            },
            {
                name: "Gol Gappa Gang",
                bannerImage: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80",
                description: "Puri plates and gol gappa carts for lively events.",
                cuisine: "Street Food",
                category: "Street Food",
                area: "Central Plaza",
                phone: "0387-3344556",
                rating: 4.1,
            },
            {
                name: "Roti Station",
                bannerImage: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80",
                description: "Street rolls and paratha wraps packed for the fortune.",
                cuisine: "Street Food",
                category: "Street Food",
                area: "East Market",
                phone: "0388-4455667",
                rating: 4.0,
            },

            // Breakfast & Brunch (expanded)
            {
                name: "Early Riser Cafe",
                bannerImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80",
                description: "Coffee stations, croissants, and breakfast panini.",
                cuisine: "Breakfast",
                category: "Breakfast & Brunch",
                area: "Riverside",
                phone: "0389-5566778",
                rating: 4.5,
            },
            {
                name: "Waffle World",
                bannerImage: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=1000&q=80",
                description: "Belgian waffles, French toast, and brunch bars.",
                cuisine: "Brunch",
                category: "Breakfast & Brunch",
                area: "City Center",
                phone: "0390-6677889",
                rating: 4.4,
            },
            {
                name: "Haleem House Brunch",
                bannerImage: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80",
                description: "Hot breakfast buffets with halwa puri and nihari.",
                cuisine: "Brunch",
                category: "Breakfast & Brunch",
                area: "North District",
                phone: "0391-7788990",
                rating: 4.5,
            },

            // Continental & Mediterranean (expanded)
            {
                name: "Aegean Eats",
                bannerImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
                description: "Greek salads, lamb platters, and fresh yogurt dips.",
                cuisine: "Mediterranean",
                category: "Continental & Mediterranean",
                area: "Marina",
                phone: "0392-8899001",
                rating: 4.6,
            },
            {
                name: "Eiffel Fine Dining",
                bannerImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
                description: "Elegant continental course menus for classy events.",
                cuisine: "Continental",
                category: "Continental & Mediterranean",
                area: "City Center",
                phone: "0393-9900112",
                rating: 4.7,
            },
        ]);

        const getCateringFor = (name) =>
            caterings.find((c) => c.name === name);

        // Assign availability days (rotate which days each catering works)
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        caterings.forEach((catering, index) => {
            const everyDays = index % 4 === 0;
            catering.availableDays = everyDays
                ? [...days]
                : [
                      days[(index * 2) % 7],
                      days[(index * 2 + 1) % 7],
                      days[(index * 2 + 2) % 7],
                      days[(index * 2 + 3) % 7],
                  ];

            const slug = catering.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "");
            catering.email = `${slug}@gmail.com`;
        });

        await Catering.bulkSave(caterings);

        // Menu item pools per category (each restaurant picks its own subset)
        const MENU_POOLS = {
            Desi: [
                { name: "Chicken Biryani", price: 450, minQty: 10, maxQty: 200 },
                { name: "Mutton Karahi", price: 950, minQty: 5, maxQty: 80 },
                { name: "Chicken Tikka Kebab", price: 350, minQty: 10, maxQty: 150 },
                { name: "Naan Bread", price: 50, minQty: 20, maxQty: 500 },
                { name: "Daal Makhani", price: 320, minQty: 8, maxQty: 120 },
                { name: "Beef Nihari", price: 700, minQty: 6, maxQty: 100 },
                { name: "Chicken Jalfrezi", price: 520, minQty: 6, maxQty: 110 },
                { name: "Gulab Jamun", price: 80, minQty: 12, maxQty: 300 },
            ],
            Chinese: [
                { name: "Chicken Fried Rice", price: 380, minQty: 10, maxQty: 180 },
                { name: "Beef Chow Mein", price: 420, minQty: 8, maxQty: 140 },
                { name: "Sweet & Sour Chicken", price: 520, minQty: 6, maxQty: 100 },
                { name: "Vegetable Spring Rolls", price: 200, minQty: 12, maxQty: 260 },
                { name: "Kung Pao Shrimp", price: 640, minQty: 5, maxQty: 90 },
                { name: "Chicken Manchurian", price: 450, minQty: 8, maxQty: 130 },
                { name: "Steamed Dumplings", price: 320, minQty: 10, maxQty: 200 },
                { name: "Hot & Sour Soup", price: 240, minQty: 12, maxQty: 250 },
            ],
            "BBQ & Grill": [
                { name: "Charcoal Chicken Steak", price: 480, minQty: 10, maxQty: 160 },
                { name: "Seekh Kebab Platter", price: 560, minQty: 8, maxQty: 120 },
                { name: "BBQ Beef Ribs", price: 1100, minQty: 4, maxQty: 60 },
                { name: "Grilled Corn", price: 150, minQty: 15, maxQty: 300 },
                { name: "Tandoori Half Chicken", price: 650, minQty: 6, maxQty: 110 },
                { name: "Chicken Malai Boti", price: 580, minQty: 8, maxQty: 140 },
                { name: "Lamb Chops", price: 1250, minQty: 4, maxQty: 60 },
                { name: "Mixed BBQ Platter", price: 1350, minQty: 3, maxQty: 50 },
            ],
            "Fast Food": [
                { name: "Zinger Burger", price: 350, minQty: 10, maxQty: 200 },
                { name: "Loaded Fries", price: 220, minQty: 12, maxQty: 250 },
                { name: "Chicken Sliders (Box of 4)", price: 700, minQty: 5, maxQty: 100 },
                { name: "Nuggets (10 pcs)", price: 420, minQty: 8, maxQty: 160 },
                { name: "Cheese Wrap", price: 300, minQty: 10, maxQty: 220 },
                { name: "Crispy Tenders", price: 380, minQty: 8, maxQty: 180 },
                { name: "Hot Dog", price: 250, minQty: 12, maxQty: 260 },
                { name: "Chicken Quesadilla", price: 480, minQty: 6, maxQty: 120 },
            ],
            Seafood: [
                { name: "Grilled Prawns", price: 980, minQty: 4, maxQty: 80 },
                { name: "Fish Tikka", price: 720, minQty: 6, maxQty: 120 },
                { name: "Garlic Butter Shrimp", price: 1050, minQty: 4, maxQty: 70 },
                { name: "Fish & Chips", price: 550, minQty: 8, maxQty: 140 },
                { name: "Crab Curry", price: 1250, minQty: 3, maxQty: 50 },
                { name: "Fried Calamari", price: 760, minQty: 5, maxQty: 90 },
                { name: "Grilled Fish Steak", price: 900, minQty: 5, maxQty: 100 },
                { name: "Shrimp Fried Rice", price: 650, minQty: 6, maxQty: 110 },
            ],
            "Healthy & Vegan": [
                { name: "Quinoa Power Bowl", price: 480, minQty: 6, maxQty: 120 },
                { name: "Grilled Veggie Platter", price: 400, minQty: 8, maxQty: 150 },
                { name: "Falafel Wrap", price: 320, minQty: 10, maxQty: 200 },
                { name: "Detox Smoothie", price: 250, minQty: 12, maxQty: 300 },
                { name: "Lentil & Veg Curry", price: 360, minQty: 8, maxQty: 160 },
                { name: "Hummus & Pita", price: 280, minQty: 10, maxQty: 220 },
                { name: "Rainbow Salad Bowl", price: 340, minQty: 8, maxQty: 180 },
                { name: "Veggie Burger", price: 380, minQty: 6, maxQty: 140 },
            ],
            Italian: [
                { name: "Margherita Pizza", price: 780, minQty: 4, maxQty: 90 },
                { name: "Spaghetti Carbonara", price: 620, minQty: 6, maxQty: 120 },
                { name: "Penne Arrabbiata", price: 580, minQty: 6, maxQty: 110 },
                { name: "Garlic Bread", price: 220, minQty: 12, maxQty: 240 },
                { name: "Tiramisu Slice", price: 320, minQty: 8, maxQty: 180 },
                { name: "Chicken Alfredo Pasta", price: 720, minQty: 6, maxQty: 110 },
                { name: "Bruschetta", price: 260, minQty: 10, maxQty: 220 },
                { name: "Lasagna Slice", price: 560, minQty: 6, maxQty: 100 },
            ],
            "Street Food": [
                { name: "Bhel Puri", price: 180, minQty: 12, maxQty: 280 },
                { name: "Chana Chaat", price: 160, minQty: 15, maxQty: 320 },
                { name: "Dahi Bhalla", price: 200, minQty: 12, maxQty: 250 },
                { name: "Kathi Roll", price: 280, minQty: 10, maxQty: 220 },
                { name: "Pani Puri (Plate of 8)", price: 150, minQty: 15, maxQty: 350 },
                { name: "Samosa (Per Piece)", price: 40, minQty: 30, maxQty: 500 },
                { name: "Pakora Platter", price: 220, minQty: 12, maxQty: 260 },
                { name: "Aloo Tikki", price: 120, minQty: 15, maxQty: 320 },
            ],
            "Breakfast & Brunch": [
                { name: "Pancake Stack", price: 380, minQty: 8, maxQty: 150 },
                { name: "French Toast Platter", price: 350, minQty: 8, maxQty: 140 },
                { name: "Omelet (Per Person)", price: 260, minQty: 10, maxQty: 200 },
                { name: "Halwa Puri Breakfast", price: 300, minQty: 8, maxQty: 180 },
                { name: "Fresh Juice Jug", price: 420, minQty: 6, maxQty: 120 },
                { name: "Waffle with Syrup", price: 340, minQty: 8, maxQty: 150 },
                { name: "Bagel with Cream Cheese", price: 220, minQty: 12, maxQty: 240 },
                { name: "Avocado Toast", price: 320, minQty: 8, maxQty: 160 },
            ],
            Desserts: [
                { name: "Chocolate Fudge Cake", price: 850, minQty: 3, maxQty: 60 },
                { name: "Cupcakes (Dozen)", price: 720, minQty: 2, maxQty: 50 },
                { name: "Gulab Jamun", price: 80, minQty: 12, maxQty: 300 },
                { name: "Fruit Tart", price: 320, minQty: 6, maxQty: 120 },
                { name: "Ice Cream Scoop", price: 180, minQty: 12, maxQty: 400 },
                { name: "Brownie Bite", price: 120, minQty: 15, maxQty: 300 },
                { name: "Cheesecake Slice", price: 380, minQty: 6, maxQty: 120 },
                { name: "Macarons (Box of 6)", price: 450, minQty: 4, maxQty: 80 },
            ],
            "Continental & Mediterranean": [
                { name: "Chicken Avocado Salad", price: 540, minQty: 6, maxQty: 110 },
                { name: "Herb Roasted Chicken", price: 720, minQty: 6, maxQty: 120 },
                { name: "Fettuccine Alfredo", price: 640, minQty: 6, maxQty: 110 },
                { name: "Lebanese Mezze Platter", price: 580, minQty: 6, maxQty: 100 },
                { name: "Panna Cotta", price: 340, minQty: 8, maxQty: 160 },
                { name: "Grilled Salmon", price: 980, minQty: 4, maxQty: 80 },
                { name: "Mushroom Risotto", price: 620, minQty: 6, maxQty: 110 },
                { name: "Greek Salad", price: 320, minQty: 8, maxQty: 180 },
            ],
        };

        const ITEMS_PER_MENU = 5;

        // Scale template (dollar-scale) prices down to reasonable BDT amounts
        const BDT_SCALE = 0.5;

        const menuDocs = [];

        caterings.forEach((catering, index) => {
            const pool =
                MENU_POOLS[catering.category] || MENU_POOLS.Desi;

            // Per-restaurant price factor so the same dish costs differently
            const priceFactor =
                0.85 + ((index * 7) % 10) * 0.04;

            // Pick a rotating subset so each restaurant has a different menu
            const start = index % pool.length;
            const chosen = [];

            for (let i = 0; i < ITEMS_PER_MENU; i++) {
                chosen.push(pool[(start + i) % pool.length]);
            }

            chosen.forEach((item, idx) => {
                const basePrice = Math.round(item.price * priceFactor);
                const itemJitter = (idx % 4) * 10;

                const price = Math.round(
                    (basePrice + itemJitter) * BDT_SCALE
                );

                menuDocs.push({
                    catering: catering._id,
                    name: item.name,
                    price: Math.max(1, price),
                    unit: item.unit || "item",
                    minQty: item.minQty,
                    maxQty: item.maxQty,
                });
            });
        });

        await MenuItem.insertMany(menuDocs);

        await Offer.insertMany([
            {
                catering: getCateringFor("Spice Symphony Catering"),
                title: "Wedding Feast Offer",
                description: "Get a free dessert station with every wedding buffet booking.",
                pricePerServing: 650,
                minServings: 50,
                maxServings: 500,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            {
                catering: getCateringFor("Golden Grill House"),
                title: "Corporate BBQ Combo",
                description: "20% off on all corporate barbecue catering orders above 50 people.",
                pricePerServing: 550,
                minServings: 50,
                maxServings: 400,
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            },
            {
                catering: getCateringFor("Delhi Darbar Events"),
                title: "Biryani Bonanza",
                description: "Flat 10% off on large biryani catering orders for 100+ guests.",
                pricePerServing: 420,
                minServings: 100,
                maxServings: 600,
                validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            },
            {
                catering: getCateringFor("Green Leaf Vegan Co."),
                title: "Healthy Event Deal",
                description: "Complimentary smoothie bar added to all vegan catering packages.",
                pricePerServing: 500,
                minServings: 30,
                maxServings: 300,
                validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            },
        ]);

        console.log(`✅ Seeded ${caterings.length} caterings and offers.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
};

seedData();