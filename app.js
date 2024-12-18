async function scrapeTableAndDateFromURL(url) {
    try {
        // Fetch the HTML content of the page
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the URL: ${response.statusText}`);
        }

        // Get the HTML as text
        const htmlText = await response.text();

        // Parse the HTML using a DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");

        // Find all tables in the parsed HTML
        const tables = doc.querySelectorAll("table");
        if (tables.length === 0) {
            console.error("No tables found on the page.");
            return;
        }

        // Scrape the first table
        const firstTable = tables[0];
        const rows = firstTable.querySelectorAll("tr");

        // Extract the table headers
        const headers = [];
        const headerCells = rows[0].querySelectorAll("th, td");
        headerCells.forEach(cell => headers.push(cell.textContent.trim()));

        // Add a new header for the date column
        headers.push("Date");

        // Extract the date from the page
        const dateRegex = /\(\d{2}\/\d{2}\/\d{4}\)/;
        const dateMatch = doc.body.textContent.match(dateRegex);
        const date = dateMatch ? dateMatch[0].replace(/[()]/g, "") : null;

        if (!date) {
            console.error("Date not found in the specified format.");
            return;
        }

        // Extract table rows and append the date column
        const tableData = [];
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll("td, th");
            const rowData = [];

            cells.forEach(cell => rowData.push(cell.textContent.trim()));

            // Append the date only to data rows (not the header row)
            if (rowIndex > 0) {
                rowData.push(date);
            }

            tableData.push(rowData);
        });

        // Create a "Pandas-like" representation
        const pandasLikeDataFrame = {
            headers: headers,
            rows: tableData.slice(1) // Exclude the header row
        };

        console.log("Scraped Data:", pandasLikeDataFrame);

        // Display the data as a JSON for easier readability
        console.log("Data as JSON:", JSON.stringify(pandasLikeDataFrame, null, 2));

        return pandasLikeDataFrame;
    } catch (error) {
        console.error("Error scraping the page:", error);
    }
}

// Example usage with a URL
const urlTemplate = "https://www.topyacht.net.au/results/botanybay/2024/club_series/SatBay24_25/11RGrp1.htm"
const url = urlTemplate
scrapeTableAndDateFromURL(url);
