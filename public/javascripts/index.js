// this code runs once, immediately when the js file is pulled down
let itemArray = [];
let itemID = 1000;

let selectedCategory = "not selected";  // for my dropdown list of item category
let selectedBrand= "not selected";

// define a constructor to create Consignment item objects
var ItemObject = function ( pID,pName, pCategory,pBrand,pPrice, pOwner) {
  this.ID=pID;
  this.Name = pName;
  this.Category = pCategory;  // select list for category
  this.Brand=pBrand;
  this.Price = pPrice;
  this.Owner = pOwner;
}


// end of run once code
document.getElementById("buttonAdd").addEventListener("click", function () {
  itemID++;
  let newItem = new ItemObject( itemID=itemID,
                                document.getElementById("name").value,
                                selectedCategory,
                                selectedBrand,
                                document.getElementById("price").value,
       
                                document.getElementById("owner").value);
     addNewItem(newItem); // now post new item object to node server
     
      
  });


  // this deals with the event when the drop down changes
$(document).bind("change", "#select-category", function (event, ui) {
  selectedCategory = $('#select-category').val();
});
$(document).bind("change", "#select-brand", function (event, ui) {
  selectedBrand = $('#select-brand').val();
});

// 2 sort button events. after running these, the local array is not in the same
// order as the server array, but have no dependence on the order of items in the 2 arrays
document.getElementById("buttonSortCategory").addEventListener("click", function () {
  itemArray = itemArray.sort(compareCategory);
  createList();
});

 document.getElementById("buttonSortBrand").addEventListener("click", function () {
  itemArray = itemArray.sort(compareBrand);
  createList();
}); 


// delete button  Had trouble with spaces in titles, its an easy thing to fix
// I just didn't get the time
document.getElementById("buttonDelete").addEventListener("click", function () {
  let deleteID = document.getElementById("deleteID").value;
  // doing the call to the server right here
  fetch('users/deleteItem/' + deleteID , {
  // users/deleteItem/this is what the URL looks like sent over the network
      method: 'DELETE'
  })  
  // now wait for 1st promise, saying server was happy with request or not
  .then(responsePromise1 => responsePromise1.text()) // ask for 2nd promise when server is node
  .then(responsePromise2 =>  console.log(responsePromise2), document.location.href = "index.html#refreshPage")  // wait for data from server to be valid
  // force jump off of same page to refresh the data after delete
  .catch(function (err) {
      console.log(err);
      alert(err);
     });
});

$(document).on("pagebeforeshow", "#ListAll", function (event) {   // have to use jQuery 
  FillArrayFromServer();  // need to get fresh data
  // createList(); this can't be here, as it is not waiting for data from server
});

// leaving ListAll to force the pagebeforeshow on ListAll from within that page when delete
$(document).on("pagebeforeshow", "#refreshPage", function (event) {   
  document.location.href = "index.html#ListAll";
});

document.getElementById("buttonClear").addEventListener("click", function () {
  document.getElementById("name").value = "";
 
   document.getElementById("select-category").value = "Select a Category";
   document.getElementById("select-brand").value = "Select a Brand";
   document.getElementById("price").value = "";
   document.getElementById("owner").value ="";
});
$(document).on("pagebeforeshow", "#Consign", function (event) {   // have to use jQuery 
  document.getElementById("name").value = "";
  document.getElementById("select-category").value = "";
  document.getElementById("select-brand").value = "";
  
    document.getElementById("price").value = "";

    document.getElementById("owner").value ="";
  });

  $(document).on("pagebeforeshow", "#detailPage", function (event) {   // have to use jQuery 
    let localID= document.getElementById("IDparmHere").innerHTML;
    for(let i=0; i < itemArray.length; i++) {   
      if (localID==itemArray[i].ID){
        document.getElementById("oneID").innerHTML=itemArray[i].ID;
        document.getElementById("oneName").innerHTML =  itemArray[i].Name;
        document.getElementById("oneCategory").innerHTML =  itemArray[i].Category;
        document.getElementById("oneBrand").innerHTML =  itemArray[i].Brand;
        document.getElementById("onePrice").innerHTML =   itemArray[i].Price;
        document.getElementById("oneOwner").innerHTML=itemArray[i].Owner;
      }
            
    }  
  });

function createList()
{
  // clear prior data
  var divUserList = document.getElementById("divItemList");
  while (divItemList.firstChild) {    // remove any old data so don't get duplicates
  divItemList.removeChild(divItemList.firstChild);
  };

  var ul = document.createElement('ul');  
  itemArray.forEach(function (element,) {   // use handy array forEach method
    var li = document.createElement('li');
    li.innerHTML = "<a data-transition='pop' class='oneItem' data-parm=" +
     element.ID + "  href='#home'>Review Details </a> "  
     + element.Name;
    // ok, this is weird.  If I set the href in the <a  anchor to detailPage, it messes up the success of
    // the button event that I add in the loop below.  By setting it to home, it jumps to home for a second
    // but then the button event sends it correctly to the detail page and the value of data-parm is valid.
    ul.appendChild(li);
  });
  divItemList.appendChild(ul)

    //set up an event for each new li item, if user clicks any, it writes >>that<< items data-parm into the hidden html 
    var classname = document.getElementsByClassName("oneItem");
    Array.from(classname).forEach(function (element) {
        element.addEventListener('click', function(){
            var parm = this.getAttribute("data-parm");  // passing in the record.Id
            document.getElementById("IDparmHere").innerHTML = parm;
            document.location.href = "index.html#detailPage";
        });
    });
   
};


function compareCategory(a, b) {
    // Use toUpperCase() to ignore character casing
    const itemA = a.Category.toUpperCase();
    const itemB = b.Category.toUpperCase();
  
    let comparison = 0;
    if (itemA > itemB) {
      comparison = 1;
    } else if (itemA < itemB) {
      comparison = -1;
    }
    return comparison;
  }
  

 function compareBrand(a, b) {
    // Use toUpperCase() to ignore character casing
  const itemA = a.Brand.toUpperCase();
  const itemB = b.Brand.toUpperCase();
  
  let comparison = 0;
  if (itemA > itemB) {
    comparison = 1;
  } else if (itemA < itemB) {
    comparison = -1;
  }
   return comparison;
 }


// code to exchange data with node server

function FillArrayFromServer(){
    // using fetch call to communicate with node server to get all data
    fetch('/users/itemList')
    .then(function (theResonsePromise) {  // wait for reply.  Note this one uses a normal function, not an => function
        return theResonsePromise.json();
    })
    .then(function (serverData) { // now wait for the 2nd promise, which is when data has finished being returned to client
    console.log(serverData);
    itemArray.length = 0;  // clear array
    itemArray = serverData;   // use our server json data which matches our objects in the array perfectly
    createList();  // placing this here will make it wait for data from server to be complete before re-doing the list
    })
    .catch(function (err) {
     console.log(err);
    });
};


// using fetch to push an object up to server
function addNewItem(newItem){
   
    // the required post body data is our item object passed in, newItem
    
    // create request object
    const request = new Request('/users/addItem', {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    
    // pass that request object we just created into the fetch()
    fetch(request)
        // wait for frist server promise response of "200" success (can name these returned promise objects anything you like)
        // Note this one uses an => function, not a normal function, just to show you can do either 
        .then(theResonsePromise => theResonsePromise.json())    // the .json sets up 2nd promise
        // wait for the .json promise, which is when the data is back
        .then(theResonsePromiseJson => console.log(theResonsePromiseJson), document.location.href = "#ListAll" )
        // that client console log will write out the message I added to the Repsonse on the server
        .catch(function (err) {
            console.log(err);
        });
    
}; // end of addNewUser
    
// code in this block waits untill everything had come down from server, then it runs
document.addEventListener("DOMContentLoaded", function () {

  
});