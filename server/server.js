import app from './app.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🏰 Life RPG Server running at http://localhost:${PORT}`);
  console.log(`⚔️  Ready for real-world questing and adventure!`);
  console.log(`==================================================\n`);
});
