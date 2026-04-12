
export const generateNodeScript = (date: string, impact: string) => {
  return `/**
 * Investing.com Economic Calendar Scraper
 * Generated for Date: ${date} | Impact: ${impact}
 */

const axios = require('axios');
const cheerio = require('cheerio');
const URLSearchParams = require('url').URLSearchParams;

// --- CONFIGURATION ---
const DATE = '${date}';
const SELECTED_IMPACT = '${impact}'; // High, Medium, Low
// ---------------------

async function fetchEconomicCalendar() {
  console.log(\`🚀 Fetching economic data for \${DATE}...\`);
  
  const params = new URLSearchParams();
  params.append('dateFrom', DATE);
  params.append('dateTo', DATE);
  params.append('timeZone', '55');

  try {
    const response = await axios({
      method: 'post',
      url: 'https://www.investing.com/economic-calendar/',
      data: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.37 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.37',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html, */*; q=0.01',
        'Origin': 'https://www.investing.com',
        'Referer': 'https://www.investing.com/economic-calendar/'
      }
    });

    const $ = cheerio.load(response.data);
    const events = [];

    // Table mapping
    $('#economicCalendarData tbody tr.eventRowId').each((index, element) => {
      const time = $(element).find('.time').text().trim();
      const currency = $(element).find('.flagCur').text().trim();
      const eventName = $(element).find('.event').text().trim();
      
      // Determine Impact
      const bullishIcons = $(element).find('.sentiment i.grayFullBullishIcon').length;
      let impactLevel = 'Low';
      if (bullishIcons === 3) impactLevel = 'High';
      else if (bullishIcons === 2) impactLevel = 'Medium';
      else if (bullishIcons === 1) impactLevel = 'Low';

      // Filter by user selection
      if (impactLevel === SELECTED_IMPACT) {
        events.push({
          time,
          currency,
          name: eventName,
          impact: impactLevel
        });
      }
    });

    if (events.length === 0) {
      console.log(\`❌ No events found matching impact: \${SELECTED_IMPACT}\`);
      return;
    }

    console.log(\`✅ Found \${events.length} events. Generating report...\\n\`);
    
    // Output Formatting
    console.log(\`📊 أهم الأخبار الاقتصادية في \${DATE}\\n\`);

    events.forEach(event => {
      let analysis = 'حدث اقتصادي عام قد يؤدي إلى تحركات في أسعار العملات.';
      
      if (event.name.includes('Interest')) {
        analysis = 'هذا الخبر مرتبط بأسعار الفائدة وقد يسبب تقلبات قوية في السوق.';
      } else if (event.name.includes('CPI')) {
        analysis = 'بيانات التضخم التي تؤثر بشكل مباشر على السياسة النقدية.';
      } else if (event.name.includes('GDP')) {
        analysis = 'مؤشر رئيسي لنمو الناتج المحلي الإجمالي وقوة الاقتصاد.';
      } else if (event.name.includes('Employment')) {
        analysis = 'مؤشر على قوة سوق العمل والتوظيف.';
      }

      console.log(\`📌 \${event.name}\`);
      console.log(\`💱 \${event.currency}\`);
      console.log(\`⏰ \${event.time}\`);
      console.log(\`⚠️ \${event.impact}\`);
      console.log(\`🔎 \${analysis}\`);
      console.log('------------------------------');
    });

    console.log('⚠️ المحتوى لأغراض تعليمية فقط.');

  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    if (error.response && error.response.status === 403) {
      console.log('💡 Investing.com might be blocking the request. Try running from a different IP or updating the User-Agent.');
    }
  }
}

fetchEconomicCalendar();

/*
HOW TO RUN:
1. Ensure Node.js is installed.
2. Initialize project:
   npm init -y
3. Install dependencies:
   npm install axios cheerio
4. Save this code as 'calendar.js'.
5. Run the script:
   node calendar.js
*/
`;
};
