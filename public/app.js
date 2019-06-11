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
