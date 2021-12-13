// Saving a document

// Required Validation

const mongoose = require('mongoose');

// mongodb connection through mongoose
mongoose
  .connect('mongodb://127.0.0.1:27017/homefoods')
  .then(() => console.log('connected to mongodb successfully'))
  .catch((err) => console.err('mongodb connction failed', err));

// schema of document
// Types: String, Number, Boolean, Date, Array, Buffer, ObjectID

// other validators
// Numbers have min and max validators.
// Strings have enum, match, minLength, and maxLength validators.
// String other validators: lowercase, uppercase, trim,
// get: (v) => Math.round(v), set: (v) => Math.round(v)
// function which returns boolean can be send to required property

// Custom error messages can be created
// Array syntax: min: [6, 'Must be at least 6, got {VALUE}']
// Object syntax: enum: { values: ['Coffee', 'Tea'], message: '{VALUE} is not supported' }

// Custom Validators
// const userSchema = new Schema({
//     phone: {
//       type: String,
//       validate: {
//         validator: function(v) {
//           return /\d{3}-\d{3}-\d{4}/.test(v);
//         },
//         message: props => `${props.value} is not a valid phone number!`
//       },
//       required: [true, 'User phone number required']
//     }
//   });

// Validation Errors
// Errors returned after failed validation contain an errors object
// whose values are ValidatorError objects.
// Each ValidatorError has kind, path, value, and message properties.

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: {
    type: String,
    required: true,
    // validate: {
    //   validator: function (v) {
    //     return new Promise((resolve, reject) => {
    //       resolve(false);
    //     });
    //   },
    //   message: 'Description should be more meaningful',
    // },
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['Veg', 'Non Veg'],
      message: '{VALUE} is not supported',
    },
  },
  price: {
    type: Number,
    required: function () {
      return this.isAvailable;
    },
    min: [10, 'Why any item less than 10?'],
    max: [1000, 'more than 1000, any item should not sell'],
  },
  isAvailable: Boolean,
  rating: {
    type: Number,
    required: [true, 'Please send rating'],
    validate: {
      validator: function (v) {
        return v >= 0 && v <= 5;
      },
      message: 'please send rating between 0 and 5',
    },
  },
  ingredients: [String],
});

// Model -> reepresents collection in db
const FoodItem = mongoose.model('FoodItem', foodItemSchema);

// Save record in DB
async function saveFoodItem() {
  // Validate Sync Method
  //   const foodItem = new FoodItem({
  //     price: 250,
  //     isAvailable: true,
  //     rating: 4.2,
  //     ingredients: ['mutton', 'basmathi rice', 'spices'],
  //   });

  //   if (error) {
  //     console.log(error.errors);
  //     return;
  //   } else {
  //     const result = await foodItem.save();
  //   }

  //try catch
  try {
    const foodItem = new FoodItem({
      name: 'Fish Fry',
      description: 'Delicious Food',
      category: 'Non Veg',
      price: 200,
      isAvailable: true,
      rating: 4.5,
      ingredients: ['mutton', 'basmathi rice', 'spices'],
    });
    const result = await foodItem.save();
    console.log(result);
  } catch (ex) {
    for (path in ex.errors) console.log(ex.errors[path].message);
  }
}

saveFoodItem();

// Quering records
async function getFoodItems() {
  // documents can be quered in find method
  //   const foodItems = await FoodItem.find({ name: 'Mango Pappu' });

  // Query in an object way
  //   const foodItems = await FoodItem.find()
  //     .select({ name: 1, price: 1 })
  //     .sort({ price: -1 })
  //     .limit(2);

  //   const foodItems = await FoodItem.find()
  //     .select('name price')
  //     .sort('-price')
  //     .limit(2);

  // comparision operators
  // eq (equal)
  // ne (not equal)
  // gt (greater than)
  // gte (greater thanor equal to)
  // lt (less than)
  // lte (less than or equal to)
  // in
  // nin (not in)

  //   const foodItems = await FoodItem.find({
  //     price: { $gt: 100, $lte: 150 },
  //   }).select('name price');

  //   const foodItems = await FoodItem.find({
  //     ingredients: { $in: ['chiken', 'mango'] },
  //   }).select('name price');

  // logical operators
  // or, and, nor

  //   const foodItems = await FoodItem.find()
  //     .select('name price rating')
  //     .or([
  //       { rating: { $gte: 4.5 } },
  //       { ingredients: { $in: ['chiken', 'mutton'] } },
  //     ]);

  // Regular expression
  // /pattern/
  // starts with: /^Ram/i
  // ends with: /ore$/i
  // middle: /.*or*./i

  //   const foodItems = await FoodItem.find({ name: /pappu$/i }).select(
  //     'name price rating'
  //   );

  // Count
  //   const foodItems = await FoodItem.find().select({ name: 1, price: 1 }).count();

  // Skip - Useful for Pagination
  const foodItems = await FoodItem.find().select({ name: 1, price: 1 }).skip(1);

  console.log(foodItems);
}
// getFoodItems();

// Update FoodItems
// Query first and update later
async function updateFoodItem(id, name, price) {
  // Query food item
  const foodItem = await FoodItem.findById(id);
  // check food item exists
  if (!foodItem) {
    console.log('Food Item is not presesnt');
    return;
  }
  //update data
  //   foodItem.name = name;
  //   foodItem.price = price;

  foodItem.set({
    name,
    price,
  });

  //save
  const result = await foodItem.save();
  console.log(result);
}
// updateFoodItem('61b71dfc99b7b46d32cfe5cb', 'Mudha Pappu', 70);

// Update with query
// Mongodb update operators
async function setFoodItem(id, name, price) {
  //query with update
  const result = await FoodItem.findByIdAndUpdate(
    id,
    {
      $set: { name, price },
    },
    { new: true }
  );
  console.log(result);
}
// setFoodItem('61b71dfc99b7b46d32cfe5cb', 'Pappu Curry', 60);

// Delete Item
async function deleteFoodItem(id) {
  const result = await FoodItem.findByIdAndRemove(id);
  console.log(result);
}

// deleteFoodItem('61b71dfc99b7b46d32cfe5cb');
