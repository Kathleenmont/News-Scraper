// scrape function
function scrape() {
  location.href = "/scrape";
}

// onclick for scrape button
$(document).on("click", ".scrape", function() {
    // call scrape function
    scrape();
});

// add to saved artivles list
$(document).on("click", ".save-button", function() {
  // grabbing the id number
  const id = $(this).data("id");
  // changing saved to be true
  const savedState = {
    saved: true
  };
  // ajax put call to update server
  $.ajax("/api/saved/" + id, {
    type: "PUT",
    data: savedState
  }).then(function() {
    // when finished reload page
    location.reload();
  });
});

// button to save a note 
$(document).on("click", ".save-note", function() {
  // grabbing the id number
  const noteId = $(this).data("id");
  // sending saved note info
  const savedNote = {
    title: "notes " + noteId,
    body: $(".note-text")
      .val()
      .trim()
  };
  // post to update server with note data
  $.ajax("/articles/" + noteId, {
    type: "POST",
    data: savedNote
  }).then(function(data) {
    // after empty modal content 
    $(".modal-content").empty();
    // reload page
    location.reload();
  });
});

// on click event for the notes pop up modal
$(document).on("click", ".notes-button", function() {
  // Empty the notes from the note section
  $(".modal-title").text("");
  $(".modal-body").text("");
  // store the notes button id reference to article
  var thisId = $(this).attr("data-id");
  // through the DOM assign data id to the text and save note elements
  $("#modal-text").attr("data-id", thisId);
  $(".save-note").attr("data-id", thisId);
  // show modal
  jQuery.noConflict();
  $("#exampleModal").modal("show");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // after, add the note information to the page
    .then(function(data) {
      // If there's a note in the article
      if (data.note) {
        // Place the id number of the article in the title input
        $(".modal-title").text(data.note.title);
        // Place the body of the note in the body extarea
        $(".modal-body")
          .text(data.note.body)
          // create a delete button next to the old note - with id
          .append(
            `<button class='btn btn-danger delete' data-id=${
              data.note._id
            }> delete </button>`
          );
      }
    });
});

// on click event for delete button for old notes
$(document).on("click", ".delete", function() {
  // grabbing the id number
  var id = $(this).data("id");
  // delete call to server
  $.ajax("/articles/" + id, {
    type: "DELETE"
  }).then(function(data) {
    // empty the modal
    $(".modal-content").empty();
    // reload the page
    location.reload();
  });
});
