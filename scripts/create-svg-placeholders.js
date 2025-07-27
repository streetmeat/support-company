const fs = require('fs');
const path = require('path');

// SVG template function
function createSVG(text, bgColor, textColor, width = 400, height = 300) {
  const lines = text.split('\\n');
  const lineElements = lines.map((line, index) => {
    const y = height / 2 + (index - (lines.length - 1) / 2) * 35;
    return `<text x="${width / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-size="28" font-weight="bold" font-family="Arial, sans-serif">${line}</text>`;
  }).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="#ddd" stroke-width="2" />
  ${lineElements}
</svg>`;
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

// Placeholder configurations
const placeholders = {
  hands: {
    real: { text: 'REAL HAND', bgColor: '#e8f5e9', textColor: '#2e7d32' },
    ai: [
      { text: 'AI HAND 1\\n6 Fingers', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 2\\nWeird Pose', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 3\\nBlurry', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 4\\nWrong Size', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 5\\nMerged', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 6\\nWarped', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI HAND 7\\nGlitchy', bgColor: '#ffebee', textColor: '#c62828' },
    ]
  },
  fboy: {
    real: { text: 'REAL PERSON\\nActual Selfie', bgColor: '#e8f5e9', textColor: '#2e7d32' },
    ai: [
      { text: 'AI PERSON 1\\nToo Perfect', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 2\\nOdd Eyes', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 3\\nSmooth Skin', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 4\\nFake Hair', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 5\\nNo Flaws', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 6\\nWeird Light', bgColor: '#ffebee', textColor: '#c62828' },
      { text: 'AI PERSON 7\\nUncanny', bgColor: '#ffebee', textColor: '#c62828' },
    ]
  },
  cute: {
    real: { text: 'CUTE PUPPY\\n🐶', bgColor: '#e8f5e9', textColor: '#2e7d32' },
    ai: [
      { text: 'BORING\\nOffice Chair', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\\nCardboard Box', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\\nConcrete Wall', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\\nPlain Mug', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\\nPaperwork', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\\nParking Lot', bgColor: '#f5f5f5', textColor: '#616161' },
      { text: 'BORING\\nFiling Cabinet', bgColor: '#f5f5f5', textColor: '#616161' },
    ]
  }
};

// Generate SVG files
Object.entries(placeholders).forEach(([puzzleType, config]) => {
  // Generate real image
  const realSVG = createSVG(config.real.text, config.real.bgColor, config.real.textColor);
  const realPath = path.join(baseDir, puzzleType, 'real-1.svg');
  fs.writeFileSync(realPath, realSVG);
  console.log(`Created: ${realPath}`);

  // Generate AI/boring images
  config.ai.forEach((aiConfig, index) => {
    const aiSVG = createSVG(aiConfig.text, aiConfig.bgColor, aiConfig.textColor);
    const fileName = puzzleType === 'cute' ? `boring-${index + 1}.svg` : `ai-${index + 1}.svg`;
    const aiPath = path.join(baseDir, puzzleType, fileName);
    fs.writeFileSync(aiPath, aiSVG);
    console.log(`Created: ${aiPath}`);
  });
});

console.log('\\nSVG placeholder images created successfully!');
console.log('You can now test the puzzle flow with these images.');
console.log('\\nNote: Update the puzzles.json manifest to use .svg extensions instead of .jpg');