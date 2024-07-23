document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('navigateToForm').addEventListener('click', function() {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('form-content').style.display = 'block';
    });

    document.getElementById('numArticulosAccept').addEventListener('click', handleNumArticulosAccept);
    document.getElementById('shipmentAccept').addEventListener('click', handleShipmentAccept);
    document.getElementById('shipmentConfirmYes').addEventListener('click', () => handleShipmentConfirm(true));
    document.getElementById('shipmentConfirmNo').addEventListener('click', () => handleShipmentConfirm(false));
});