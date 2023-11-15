// When the user clicks on the button,
// toggle between hiding and showing the dropdown content

function myFunction() {
    if (document.getElementById("dropdown").style.display === "block") {
        document.getElementById("dropdown").style.display = "none";
        return;
    }
    document.getElementById("dropdown").style.display = "block";
}
