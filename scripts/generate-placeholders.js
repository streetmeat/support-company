const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Helper function to create a placeholder image
function createPlaceholder(width, height, text, bgColor, textColor) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Add border
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Add text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Word wrap for longer text
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > width - 40) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // Draw lines
  const lineHeight = 30;
  const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  return canvas.toBuffer('image/jpeg');
}

// Create directories if they don't exist
const puzzleTypes = ['hands', 'fboy', 'cute'];
const baseDir = path.join(__dirname, '..', 'public', 'puzzles');

puzzleTypes.forEach(type => {
  const dir = path.join(baseDir, type);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate placeholder images
const placeholders = {
  hands: {
    real: { text: 'REAL HAND', bgColor: '#e8f5e9', textColor: '#2e7d32' },
    ai: [
      { text: 'AI HAND 1\n6 Fingers', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 2\nWeird Pose', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 3\nBlurry', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 4\nWrong Size', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 5\nMerged', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 6\nWarped', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 7\nGlitchy', bgColor: '#ffebee', textColor: '#c62828' },
    ]
  },
  fboy: {
    real: { text: 'REAL PERSON\nActual Selfie', bgColor: '#e8f5e9', textColor: '#2e7d32' },
    ai: [
      { text: 'AI PERSON 1\nToo Perfect', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 2\nOdd Eyes', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 3\nSmooth Skin', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 4\nFake Hair', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 5\nNo Flaws', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 6\nWeird Light', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 7\nUncanny', bgColor: '#ffebee', textColor: '#c62828' },
    ]
  },
  cute: {
    real: { text: 'CUTE PUPPY\n🐶', bgColor: '#e8f5e9', textColor: '#2e7d32' },
    ai: [
      { text: 'BORING\nOffice Chair', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\nCardboard Box', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\nConcrete Wall', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\nPlain Mug', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\nPaperwork', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\nParking Lot', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\nFiling Cabinet', bgColor: '#f5f5f5', textColor: '#616161' },
    ]
  }
};

// Generate images
Object.entries(placeholders).forEach(([puzzleType, config]) => {
  // Generate real image
  const realImage = createPlaceholder(400, 300, config.real.text, config.real.bgColor, config.real.textColor);
  const realPath = path.join(baseDir, puzzleType, 'real-1.jpg');
  fs.writeFileSync(realPath, realImage);
  console.log(`Created: ${realPath}`);

  // Generate AI/boring images
  config.ai.forEach((aiConfig, index) => {
    const aiImage = createPlaceholder(400, 300, aiConfig.text, aiConfig.bgColor, aiConfig.textColor);
    const fileName = puzzleType === 'cute' ? `boring-${index + 1}.jpg` : `ai-${index + 1}.jpg`;
    const aiPath = path.join(baseDir, puzzleType, fileName);
    fs.writeFileSync(aiPath, aiImage);
    console.log(`Created: ${aiPath}`);
  });
});

console.log('\nPlaceholder images created successfully!');
console.log('You can now test the puzzle flow with these images.');