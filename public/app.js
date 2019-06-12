$(document).on("click", ".save-button", function() {
  // grabbing the id number
  var id = $(this).data("id");
  // changing devoured to be true
  var savedState = {
    saved: true
  };
  console.log(savedState);
  console.log(id);
  $.ajax("/api/saved/" + id, {
    type: "PUT",
    data: savedState
  }).then(function() {
    location.reload();
  });
});

$(document).on("click", ".save-note", function() {
  // grabbing the id number
  var noteId = $(this).data("id");

  var savedNote = {
    title: "notes " + noteId,
    body: $(".note-text")
      .val()
      .trim()
  };
  console.log(savedNote);
  console.log(noteId);
  $.ajax("/articles/" + noteId, {
    type: "POST",
    data: savedNote
  }).then(function(data) {
    //   location.reload();
    console.log(data);
    console.log(savedNote);
    console.log(noteId);
    $(".modal-content").empty();
    location.reload();
  });
});

// $(".notes-button").on("click", function () {
//     $('#exampleModal').modal('show');
// })

$(document).on("click", ".notes-button", function() {
  // Empty the notes from the note section
  $(".modal-title").text("");
  $(".modal-body").text("");
  jQuery.noConflict();
  $("#exampleModal").modal("show");
  // $(".note-text").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      // $("#modal-title").text(data.note.title)

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $(".modal-title").text(data.note.title);
        // Place the body of the note in the body extarea
        $(".modal-body")
          .text(data.note.body)
          .append(
            `<button class='btn btn-danger delete' data-id=${
              data.note._id
            }> delete </button>`
          );
      }
    });
});

$(document).on("click", ".delete", function() {
  // grabbing the id number
  var id = $(this).data("id");

  console.log("this is delete id!!!!!!!!!!" + id);
  $.ajax("/articles/" + id, {
    type: "DELETE"
  }).then(function(data) {
    //   location.reload();
    console.log(data);

    $(".modal-content").empty();
    location.reload();
  });
});

function scrape() {
  location.href = "/scrape";
  
}

function home() {
  location.href = "/";
}


$(document).on("click", ".scrape", function() {
    scrape();
   setTimeout(function () { home() }, 2000);

   
});

// Click event to mark a book as read
// $(document).on("click", ".markread", function() {
//     var thisId = $(this).attr("data-id");
//     $.ajax({
//       type: "PUT",
//       url: "/markread/" + thisId
//     });
//     $(this).parents("tr").remove();
//     getRead();
//   });
