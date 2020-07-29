let isShowing = false;
function showFinishedNotification() {
    if(isShowing) return;
    let notificationContainer = document.getElementById("notification-container");
    notificationContainer.innerHTML = createFinishedNotification();
    let myToast = $("#myToast")
    myToast.toast('show');
    console.log("showing toast")
    isShowing = true;

    myToast.on('hide.bs.toast', function () {
        isShowing = false;
        console.log("hiding toast")
    })

}

function createFinishedNotification() {
    return `
        <div class="toast" id="myToast" style="position: absolute; top: 15px; right: 15px;border-radius: 12px" data-delay="3000" data-autohide="false">
        <div class="toast-header">
            <strong class="mr-auto" style="font-size: 18px">
                <i class='bx bxs-check-circle' style='color:#39c00d;'></i>
                <span >Results are ready!</span>
            </strong>
            <small></small>
            <a type="button" class="ml-2 mb-1" data-dismiss="toast">
                <i class='bx bx-x bx-sm'></i>
            </a>
        </div>
        <div class="toast-body">
            <div>Your recent search query completed successfully, click here to load the results.</div>
        </div>
    </div>
    `
}