require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const sampleQuestions = [
  {
    title: "Will the home team win this weekend's football game?",
    description: "Bet on whether the home team will win against their rivals",
    options: [
      { label: "Yes", odds: 2.1, votes: 0 },
      { label: "No", odds: 1.9, votes: 0 }
    ]
  },
  {
    title: "Which student will win the debate competition?",
    description: "Predict the winner of the annual college debate championship",
    options: [
      { label: "Alex Johnson", odds: 3.2, votes: 0 },
      { label: "Sarah Chen", odds: 2.8, votes: 0 },
      { label: "Mike Rodriguez", odds: 2.5, votes: 0 },
      { label: "Emma Wilson", odds: 4.1, votes: 0 }
    ]
  },
  {
    title: "Will the cafeteria serve pizza on Friday?",
    description: "A classic college betting question about cafeteria menu",
    options: [
      { label: "Yes", odds: 1.5, votes: 0 },
      { label: "No", odds: 2.3, votes: 0 }
    ]
  },
  {
    title: "Which professor will be late to class this week?",
    description: "Bet on which professor will arrive more than 5 minutes late",
    options: [
      { label: "Dr. Smith", odds: 1.8, votes: 0 },
      { label: "Prof. Davis", odds: 2.2, votes: 0 },
      { label: "Dr. Brown", odds: 3.0, votes: 0 },
      { label: "None of them", odds: 1.3, votes: 0 }
    ]
  },
  {
    title: "Will the library be packed during finals week?",
    description: "Predict if the library will be at 90%+ capacity",
    options: [
      { label: "Yes", odds: 1.2, votes: 0 },
      { label: "No", odds: 4.5, votes: 0 }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Insert sample questions
    const questions = await Question.insertMany(sampleQuestions);
    console.log(`Inserted ${questions.length} sample questions`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 