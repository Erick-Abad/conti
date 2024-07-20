document.addEventListener('DOMContentLoaded', function() {
    const navigateToFormButton = document.getElementById('navigateToForm');
    const crearExcelButton = document.getElementById('crearExcel');
    const volverButton = document.getElementById('volver');
    const mainContent = document.getElementById('main-content');
    const formContent = document.getElementById('form-content');
    const tableContent = document.getElementById('table-content');
    
    if (navigateToFormButton && crearExcelButton && volverButton && mainContent && formContent && tableContent) {
        navigateToFormButton.addEventListener('click', function() {
            mainContent.style.display = 'none';
            formContent.style.display = 'block';
        });

        crearExcelButton.addEventListener('click', function() {
            const numArticulos = document.getElementById('numArticulos').value;
            if (numArticulos > 0) {
                formContent.style.display = 'none';
                tableContent.style.display = 'block';
                generateExcelTable(numArticulos);
            } else {
                alert('Por favor, ingresa un número válido de artículos.');
            }
        });

        volverButton.addEventListener('click', function() {
            tableContent.style.display = 'none';
            mainContent.style.display = 'block';
        });
    } else {
        console.error('No se encontraron algunos de los elementos necesarios en el DOM.');
    }
});