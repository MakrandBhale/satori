function create_new_stream() {
    let keyword = document.getElementById("stream-keyword-input").value;

    $.ajax({
        url: '/create_new_stream/' + keyword,
        method: 'POST'
    })
    .done((res) => {
        console.log(res);
    })
    .fail((err) => {
        alert(err)
    })
}

function stream(did) {

}