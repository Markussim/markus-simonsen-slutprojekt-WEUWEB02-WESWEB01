async function createList() {
  let promise = await fetch("/getall");

  if (promise.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await promise.json();
    generateHtml(json);
  } else {
    alert("HTTP-Error: " + promise.status);
  }
}
createList();

function generateHtml(json) {
  json.forEach((element) => {
    console.log(element.username);
    var main = document.createElement("div");
    var title = document.createElement("div");
    var desc = document.createElement("div");
    var name = document.createElement("div");


    main.className = "card card-body";

    name.innerText = element.username;
    name.className = "card-subtitle mb-2 text-muted";
    main.appendChild(name);

    title.innerText = element.title;
    title.className = "card-title";
    main.appendChild(title);

    desc.innerText = element.posttext;
    desc.className = "card-text";
    main.appendChild(desc);

    document.getElementById("mainContent").appendChild(main);
  });
}
