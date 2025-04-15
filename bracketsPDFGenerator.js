const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class BracketPDFGenerator {
  static generateDetailedBracketsPDF(filepath, categoriesWithBrackets, event) {
    return new Promise((resolve, reject) => {
      try {
        this.validateInputs(filepath, categoriesWithBrackets, event);

        const directoryPath = path.dirname(filepath);
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }

        const doc = this.createPDFDocument(event);
        const writeStream = fs.createWriteStream(filepath);
        
        doc.pipe(writeStream);

        this.renderTitleAndEventDetails(doc, event);

        categoriesWithBrackets.forEach((category, index) => {
          this.renderCategoryBracket(doc, category, index, categoriesWithBrackets.length);
        });

        doc.end();

        writeStream.on('finish', () => resolve(filepath));
        writeStream.on('error', (error) => reject(new Error(`File write error: ${error.message}`)));

      } catch (error) {
        reject(new Error(`PDF Generation Error: ${error.message}`));
      }
    });
  }

  static validateInputs(filepath, categoriesWithBrackets, event) {
    if (!filepath) {
      throw new Error('Filepath is required');
    }
    if (!Array.isArray(categoriesWithBrackets) || categoriesWithBrackets.length === 0) {
      throw new Error('Categories array is empty or invalid');
    }
    if (!event || !event.name) {
      throw new Error('Invalid event details');
    }
  }

  static createPDFDocument(event) {
    return new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 30
    });
  }

  static renderTitleAndEventDetails(doc, event) {
    // Title
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .text('Tournament Brackets', { align: 'center' })
       .fontSize(14)
       .text(event.name, { align: 'center' })
       .moveDown(0.5);

    // Event details
    doc.font('Helvetica')
       .fontSize(10)
       .text(`Date: ${this.formatDate(event.start_date)}`, { align: 'center' })
       .text(`Location: ${event.address || 'Not Specified'}`, { align: 'center' })
       .moveDown(1);
  }

  static renderCategoryBracket(doc, category, index, totalCategories) {
    if (!this.isValidBracket(category)) return;

    // Category header
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Category: ${category.name}`, { underline: true })
       .font('Helvetica')
       .fontSize(10)
       .text(`Total Participants: ${category.participantCount}`)
       .moveDown(0.5);

    // Draw the bracket
    this.drawBracket(doc, category.bracket);

    // Add page break between categories (except for the last one)
    if (index < totalCategories - 1) {
      doc.addPage();
    }
  }

  static isValidBracket(category) {
    return category.bracket && 
           category.participantCount >= 2 && 
           category.bracket.matches && 
           category.bracket.matches.length > 0;
  }

  static drawBracket(doc, bracket) {
    const pageWidth = doc.page.width - 60;
    const pageHeight = doc.page.height - 100;
    
    const matchHeight = 30;
    const matchWidth = 180;
    const horizontalSpacing = 50;
    const verticalSpacing = 10;

    // Group matches by round
    const matchesByRound = {};
    bracket.matches.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
    });

    let currentX = 50;

    // Draw each round
    for (let round = 1; round <= bracket.rounds; round++) {
      const matches = matchesByRound[round] || [];
      
      // Calculate vertical spacing
      const totalHeight = matches.length * matchHeight + (matches.length - 1) * verticalSpacing;
      const startY = (pageHeight - totalHeight) / 2;

      // Draw matches for this round
      matches.forEach((match, index) => {
        const yPosition = startY + index * (matchHeight + verticalSpacing);

        // Draw match box
        doc.rect(currentX, yPosition, matchWidth, matchHeight)
           .lineWidth(0.5)
           .stroke();

        // Draw player names
        doc.fontSize(9)
           .text(
             this.formatPlayerName(match.player1), 
             currentX + 5, 
             yPosition + 5, 
             { width: matchWidth - 10, align: 'left' }
           )
           .moveTo(currentX, yPosition + matchHeight / 2)
           .lineTo(currentX + matchWidth, yPosition + matchHeight / 2)
           .stroke()
           .text(
             this.formatPlayerName(match.player2), 
             currentX + 5, 
             yPosition + matchHeight / 2 + 5, 
             { width: matchWidth - 10, align: 'left' }
           );

        // Draw connection to next round
        // Draw connection to next round
if (match.nextMatchId && round < bracket.rounds) {
  const nextMatch = bracket.matches.find(m => m.id === match.nextMatchId);
  if (nextMatch) {
    const nextRoundMatches = matchesByRound[nextMatch.round] || [];
    const nextMatchIndex = nextRoundMatches.indexOf(nextMatch);
    const nextMatchY = startY + nextMatchIndex * (matchHeight + verticalSpacing) + matchHeight / 2;

    doc.moveTo(currentX + matchWidth, yPosition + matchHeight / 2)
       .lineTo(currentX + matchWidth + horizontalSpacing, yPosition + matchHeight / 2)
       .lineTo(currentX + matchWidth + horizontalSpacing, nextMatchY)
       .lineTo(currentX + matchWidth + horizontalSpacing + matchWidth, nextMatchY)
       .stroke();
  }
}
      });

      // Move X position for next round
      currentX += matchWidth + horizontalSpacing;
    }
  }

  static formatPlayerName(player) {
    if (!player || !player.name) return 'TBD';
    const maxLength = 25;
    return player.name.length > maxLength 
      ? player.name.substring(0, maxLength) + '...' 
      : player.name;
  }

  static formatDate(date) {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date Not Available';
    }
  }
}

function generateDetailedBracketsPDF(filepath, categoriesWithBrackets, event) {
  return BracketPDFGenerator.generateDetailedBracketsPDF(filepath, categoriesWithBrackets, event);
}

module.exports = {
  generateDetailedBracketsPDF
};
