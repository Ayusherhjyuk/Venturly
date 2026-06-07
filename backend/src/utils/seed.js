import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import Investment from '../models/Investment.js';
import Connection from '../models/Connection.js';
import Subscription from '../models/Subscription.js';

const run = async () => {
  await connectDB();
  console.log('🌱 Seeding...');

  await Promise.all([
    User.deleteMany({}),
    Idea.deleteMany({}),
    Investment.deleteMany({}),
    Connection.deleteMany({}),
    Subscription.deleteMany({}),
  ]);

  // Admin (you) — verify investors from the admin panel
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@venturly.com',
    password: 'admin123',
    role: 'admin',
    headline: 'Venturly Administrator',
  });

  // Creators
  const creators = await User.create([
    {
      name: 'Aarav Mehta',
      email: 'aarav@creator.com',
      password: 'pass123',
      role: 'creator',
      isVerified: true,
      verificationStatus: 'verified',
      headline: 'Indie Filmmaker & Storyteller',
      bio: 'Crafting short films that move people. Looking for backers for my next documentary.',
    },
    {
      name: 'Priya Nair',
      email: 'priya@creator.com',
      password: 'pass123',
      role: 'creator',
      isVerified: true,
      verificationStatus: 'verified',
      headline: 'Climate-tech Founder',
      bio: 'Building affordable solar dryers for rural farmers.',
    },
    {
      name: 'NGO SmileBridge',
      email: 'smile@creator.com',
      password: 'pass123',
      role: 'creator',
      isVerified: true,
      verificationStatus: 'verified',
      headline: 'Charity • Education for all',
      bio: 'We fund schooling for 500+ underprivileged children.',
    },
  ]);

  // A verified investor + an unverified one
  await User.create({
    name: 'Verified Vikram',
    email: 'vikram@investor.com',
    password: 'pass123',
    role: 'investor',
    headline: 'Angel Investor',
    isVerified: true,
    verificationStatus: 'verified',
    verificationDocument: '/uploads/sample-doc.pdf',
  });
  await User.create({
    name: 'Pending Pooja',
    email: 'pooja@investor.com',
    password: 'pass123',
    role: 'investor',
    headline: 'New Investor',
    verificationStatus: 'pending',
    verificationDocument: '/uploads/sample-doc.pdf',
  });

  const lorem =
    'This project represents months of passion and research. We are building something that has never been done before in this space, combining cutting-edge technology with a deep understanding of real human needs. Every detail has been carefully considered, from the initial concept to the final execution. We believe this work has the potential to create lasting impact and we are inviting forward-thinking backers to be part of this journey from the very beginning.';

  await Idea.create([
    {
      creator: creators[0]._id,
      title: 'Echoes of the Valley — A Documentary',
      tagline: 'A feature documentary on disappearing Himalayan crafts',
      category: 'creative',
      coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80',
      backgroundImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80',
      fundingGoal: 500000,
      amountRaised: 120000,
      minInvestment: 5000,
      fundingPeriodMonths: 18,
      blocks: [
        { type: 'paragraph', text: lorem, backgroundImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=1200&q=80' },
        { type: 'paragraph', text: lorem },
        { type: 'video', url: 'https://www.youtube.com/embed/aqz-KE-bpKQ' },
        { type: 'paragraph', text: lorem },
        { type: 'link', url: 'https://example.com/pitch-deck', label: 'View full pitch deck' },
      ],
    },
    {
      creator: creators[1]._id,
      title: 'SolarDry — Affordable Solar Food Dryers',
      tagline: 'Reducing post-harvest loss for 10,000 farmers',
      category: 'innovation',
      coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
      fundingGoal: 2000000,
      amountRaised: 650000,
      minInvestment: 25000,
      fundingPeriodMonths: 24,
      blocks: [
        { type: 'paragraph', text: lorem },
        { type: 'image', url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80' },
        { type: 'paragraph', text: lorem },
        { type: 'paragraph', text: lorem },
        { type: 'link', url: 'https://example.com', label: 'Our impact report' },
      ],
    },
    {
      creator: creators[2]._id,
      title: 'Light a Future — Educate 500 Children',
      tagline: 'Charity drive for school supplies & teachers',
      category: 'charity',
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
      fundingGoal: 1000000,
      amountRaised: 430000,
      minInvestment: 1000,
      fundingPeriodMonths: 12,
      blocks: [
        { type: 'paragraph', text: lorem },
        { type: 'image', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80' },
        { type: 'paragraph', text: lorem },
      ],
    },
  ]);

  console.log('✅ Seed complete.');
  console.log('\n--- Login credentials ---');
  console.log('Admin:                admin@venturly.com / admin123');
  console.log('Creator:              aarav@creator.com / pass123');
  console.log('Verified investor:    vikram@investor.com / pass123');
  console.log('Unverified investor:  pooja@investor.com / pass123');

  await disconnectDB();
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
