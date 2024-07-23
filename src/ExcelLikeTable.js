document.addEventListener('DOMContentLoaded', () => {
    let rows = JSON.parse(localStorage.getItem('rows')) || [{ Bardcore: '', shipment: '', date: '', destination: '', quantity: 1, bloqueado: false }];
    const destinations = [
        "GAINESVILLE GA",
        "GRAND PRAIRIE TX",
        "HANNON-ONTARIO",
        "LEBANON IN",
        "LOCKBOURNE OH",
        "QUAKERTOWN PA",
        "REDLANDS CA",
        "RENO NV"
    ];
    let showAlert = false;
    let showCompletionAlert = false;
    let currentIndex = 0;
    let hasDownloaded = false;
    let articulosRegistrados = 0;
    let numArticulos = 0;
    let registroCompleto = false;
    let horaInicio = null;
    let horaFin = null;
    let isNumArticulosSet = false;
    let shipment = '';
    let shipmentToConfirm = '';
    let fileName = '';

    const saveRowsToLocalStorage = () => {
        localStorage.setItem('rows', JSON.stringify(rows));
    };

    const focusCurrentInput = () => {
        const currentInput = document.querySelector(`#input-${currentIndex}`);
        if (currentInput) {
            currentInput.focus();
        }
    };

    window.handleChange = (index, key, value) => {
        rows[index][key] = value;
        saveRowsToLocalStorage();
        renderTable();
    };

    window.handleAddRow = () => {
        const newRow = { Bardcore: '', shipment: shipment, date: '', destination: '', quantity: articulosRegistrados + 1, bloqueado: false };
        rows.push(newRow);
        currentIndex = rows.length - 1;
        saveRowsToLocalStorage();
        renderTable();
    };

    window.handleKeyPress = (index, e) => {
        if (e.key === 'Enter') {
            if (!horaInicio) {
                horaInicio = new Date();
            }

            const currentCodigo = rows[index].Bardcore;
            if (rows.some((row, idx) => row.Bardcore === currentCodigo && idx !== index)) {
                showAlertModal('EL CÓDIGO ESTÁ REPETIDO', 'Atención, código repetido');
                rows[index].Bardcore = '';
                saveRowsToLocalStorage();
                renderTable();
                return;
            }

            rows[index].bloqueado = true;
            articulosRegistrados++;
            rows[index].quantity = articulosRegistrados; // Update the quantity to reflect the current count

            if (articulosRegistrados < numArticulos) {
                handleAddRow();
            } else {
                horaFin = new Date();
                registroCompleto = true;
                showCompletionAlertModal(`HEMOS TERMINADO, EQUIPO. DESCARGA TU EXCEL.\nHEMOS COMENZADO A LA HORA: ${horaInicio.toLocaleTimeString()}\nHEMOS TERMINADO A LA HORA: ${horaFin.toLocaleTimeString()}\nNos hemos demorado ${Math.round((horaFin - horaInicio) / 1000)} segundos.`, `Hemos terminado, equipo. Nos hemos demorado ${Math.round((horaFin - horaInicio) / 1000)} segundos. Descarga tu Excel equipo Continental.`);
                enableDownloadButton();
                enableSendButton();
            }
            const utterance = new SpeechSynthesisUtterance(` ${articulosRegistrados}`);
            speechSynthesis.speak(utterance);
            saveRowsToLocalStorage();
            renderTable();
        }
    };

    window.showAlertModal = (message, speechMessage) => {
        document.getElementById('alert-message').innerText = message;
        document.getElementById('alert-modal').style.display = 'flex';
        const utterance = new SpeechSynthesisUtterance(speechMessage);
        speechSynthesis.speak(utterance);
    };

    window.closeAlert = () => {
        document.getElementById('alert-modal').style.display = 'none';
    };

    window.showCompletionAlertModal = (message, speechMessage) => {
        document.getElementById('completion-message').innerText = message;
        document.getElementById('completion-modal').style.display = 'flex';
        const utterance = new SpeechSynthesisUtterance(speechMessage);
        speechSynthesis.speak(utterance);
    };

    window.closeCompletionAlert = () => {
        document.getElementById('completion-modal').style.display = 'none';
    };

    window.enableDownloadButton = () => {
        const downloadButton = document.getElementById('exportBtn');
        downloadButton.disabled = false;
    };

    window.enableSendButton = () => {
        const sendButton = document.getElementById('sendBtn');
        sendButton.style.display = 'inline-block';
    };

    window.getCurrentDateFormatted = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
        return `${day}-${month}-${year}`;
    };

    window.exportToExcel = () => {
        if (articulosRegistrados < numArticulos) {
            showAlertModal(`Faltan artículos equipo Continental. Artículos restantes: ${numArticulos - articulosRegistrados}`, `Faltan artículos equipo Continental.`);
            return;
        }

        const worksheetData = rows.map(row => ({
            Bardcore: row.Bardcore,
            shipment: row.shipment,
            date: row.date,
            destination: row.destination,
            quantity: row.quantity,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        fileName = `${getCurrentDateFormatted()}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        hasDownloaded = true;
        localStorage.removeItem('rows');
    };

    window.sendEmail = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = () => {
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('date', getCurrentDateFormatted());

            fetch('http://localhost:3000/send-email', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(result => {
                alert(result);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al enviar el correo');
            });
        };
        fileInput.click();
    };

    window.handleAlertClose = () => {
        showAlert = false;
        renderTable();
    };

    window.handleCompletionAlertClose = () => {
        showCompletionAlert = false;
        renderTable();
    };

    window.handleReset = () => {
        const password = prompt('Ingrese la contraseña para reiniciar:');
        if (password === 'conti') {
            rows = [{ Bardcore: '', shipment: '', date: '', destination: '', quantity: 1, bloqueado: false }];
            numArticulos = 0;
            articulosRegistrados = 0;
            registroCompleto = false;
            horaInicio = null;
            horaFin = null;
            isNumArticulosSet = false;
            localStorage.removeItem('rows');
            renderTable();
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('form-content').style.display = 'none';
            document.getElementById('shipment-form').style.display = 'none';
            document.getElementById('shipment-confirmation').style.display = 'none';
            document.getElementById('table-content').style.display = 'none';
            document.querySelector('.header').classList.remove('hidden');
            document.getElementById('sendBtn').style.display = 'none';
        } else {
            showAlertModal('Contraseña incorrecta', 'Contraseña incorrecta');
        }
    };

    const handleNumArticulosAccept = () => {
        const numArticulosInput = document.getElementById('numArticulos');
        numArticulos = parseInt(numArticulosInput.value, 10);
        if (numArticulos > 0) {
            isNumArticulosSet = true;
            rows = [{ Bardcore: '', shipment: shipment, date: '', destination: '', quantity: 1, bloqueado: false }];
            document.getElementById('form-content').style.display = 'none';
            document.getElementById('shipment-form').style.display = 'block';
        } else {
            showAlertModal('Por favor, ingrese un número válido de artículos.', 'Número inválido de artículos');
        }
        saveRowsToLocalStorage();
    };

    const handleShipmentAccept = () => {
        const shipmentInput = document.getElementById('shipmentInput');
        shipment = shipmentInput.value.trim();
        if (shipment) {
            document.getElementById('shipment-form').style.display = 'none';
            document.getElementById('shipment-confirmation').style.display = 'block';
            document.getElementById('shipment-confirmation-text').innerText = `¿El código de SHIPMENT es correcto: ${shipment}?`;
        } else {
            showAlertModal('Por favor, ingrese un código de SHIPMENT válido.', 'Código de SHIPMENT inválido');
        }
    };

    const handleShipmentConfirm = (confirm) => {
        if (confirm) {
            rows = rows.map(row => ({ ...row, shipment }));
            document.getElementById('shipment-confirmation').style.display = 'none';
            document.getElementById('table-content').style.display = 'block';
            document.querySelector('.header').classList.add('hidden');
            renderTable();
            focusCurrentInput();
        } else {
            document.getElementById('shipment-confirmation').style.display = 'none';
            document.getElementById('shipment-form').style.display = 'block';
        }
        saveRowsToLocalStorage();
    };

    const renderTable = () => {
        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>BARDCORE</th>
                        <th>SHIPMENT</th>
                        <th>DATE</th>
                        <th>DESTINATION</th>
                        <th>QUANTITY</th>
                        <th>CONTADOR</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, index) => `
                        <tr key="${index}">
                            <td><input type="text" id="input-${index}" value="${row.Bardcore}" oninput="handleChange(${index}, 'Bardcore', this.value)" onkeypress="handleKeyPress(${index}, event)" ${row.bloqueado && row.Bardcore !== '' ? 'disabled' : ''}></td>
                            <td><input type="text" value="${row.shipment}" oninput="handleChange(${index}, 'shipment', this.value)" disabled></td>
                            <td><input type="date" value="${row.date}" oninput="handleChange(${index}, 'date', this.value)"></td>
                            <td>
                                <select value="${row.destination}" onchange="handleChange(${index}, 'destination', this.value)">
                                    <option value="">SELECCIONAR DESTINO</option>
                                    ${destinations.map(destination => `<option key="${destination}" value="${destination}" ${row.destination === destination ? 'selected' : ''}>${destination}</option>`).join('')}
                                </select>
                            </td>
                            <td>${row.quantity}</td>
                            <td>${numArticulos - articulosRegistrados}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        focusCurrentInput();
    };

    document.getElementById('numArticulosAccept').addEventListener('click', handleNumArticulosAccept);
    document.getElementById('shipmentAccept').addEventListener('click', handleShipmentAccept);
    document.getElementById('shipmentConfirmYes').addEventListener('click', () => handleShipmentConfirm(true));
    document.getElementById('shipmentConfirmNo').addEventListener('click', () => handleShipmentConfirm(false));
});