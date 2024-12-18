const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const urlTemplate = "https://www.topyacht.net.au/results/botanybay/2024/club_series/SatBay24_25/11RGrp1.htm";
const targetUrl = urlTemplate;

async function scrapeTableAndDateFromURL(url) {
    try {
        const response = await fetch(proxyUrl + url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the URL: ${response.statusText}`);
        }

        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");

        // Scrape logic (same as before)
        const tables = doc.querySelectorAll("table");
        if (tables.length === 0) return { error: "No tables found on the page." };

        const firstTable = tables[0];
        const rows = firstTable.querySelectorAll("tr");

        const headers = [];
        rows[0].querySelectorAll("th, td").forEach(cell => headers.push(cell.textContent.trim()));
        headers.push("Date");

        const dateRegex = /\(\d{2}\/\d{2}\/\d{4}\)/;
        const dateMatch = doc.body.textContent.match(dateRegex);
        const date = dateMatch ? dateMatch[0].replace(/[()]/g, "") : "Date not found";

        const tableData = [];
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll("td, th");
            const rowData = [];
            cells.forEach(cell => rowData.push(cell.textContent.trim()));

            if (rowIndex > 0) rowData.push(date);
            tableData.push(rowData);
        });

        const pandasLikeDataFrame = {
            headers: headers,
            rows: tableData.slice(1),
        };

        return pandasLikeDataFrame;
    } catch (error) {
        return { error: error.message };
    }
}


// Example usage with a URL
scrapeTableAndDateFromURL(targetUrl).then(result => console.log(result));
