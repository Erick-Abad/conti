function generateExcelTable(num) {
    const table = document.createElement('table');
    const headerRow = table.insertRow(0);
    const headers = ['BARDCODE', 'SHIPMENT', 'DATE', 'DESTINATION', 'QUANTITY', 'CONTADOR'];

    headers.forEach(header => {
        const cell = document.createElement('th');
        cell.innerText = header;
        headerRow.appendChild(cell);
    });

    for (let i = 1; i <= num; i++) {
        const row = table.insertRow(i);
        headers.forEach(() => {
            const cell = row.insertCell();
            cell.innerHTML = '<input type="text">';
        });
    }

    const exportDiv = document.getElementById('exportDiv');
    exportDiv.innerHTML = '';
    exportDiv.appendChild(table);
}