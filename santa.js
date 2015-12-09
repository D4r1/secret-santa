/*

  Manages the HTML elements allowing users to see which person they are associated to for a Secret Santa [1].

  Author: Christian Belin
  Date: 2015-12-09
  Version: 1.0
  History:
    1.0:
     - first version
     - added full documentation for release
     - removed names for release
     - fixed all warnings from http://codebeautify.org/jsvalidate (except the variable declaration in the loop, but we have to)
     - added a bunch of comments

  [1] https://en.wikipedia.org/wiki/Secret_Santa

*/

/*-[ Configuration ]-*/

// Participant database
// The identifiers "id" must be unique, and are linked to the derangement below.
// This is weakly typed; feel free to use non-integers if you want, as long as the type supports equality.
// The name will be displayed in the HTML form and showed to the user.
// The value is only used internally to keep track of the current selection. Must be unique.
var participants = [
    {id: 1,  name: "Displayed Name01", value: "name01"},
    {id: 2,  name: "Displayed Name02", value: "name02"},
    {id: 3,  name: "Displayed Name03", value: "name03"},
    {id: 4,  name: "Displayed Name04", value: "name04"},
    {id: 5,  name: "Displayed Name05", value: "name05"},
    {id: 6,  name: "Displayed Name06", value: "name06"},
    {id: 7,  name: "Displayed Name07", value: "name07"},
    {id: 8,  name: "Displayed Name08", value: "name08"},
    {id: 9,  name: "Displayed Name09", value: "name09"},
    {id: 10, name: "Displayed Name10", value: "name10"},
    {id: 11, name: "Displayed Name11", value: "name11"},
    {id: 12, name: "Displayed Name12", value: "name12"},
    {id: 13, name: "Displayed Name13", value: "name13"},
    {id: 14, name: "Displayed Name14", value: "name14"},
    {id: 15, name: "Displayed Name15", value: "name15"},
    {id: 16, name: "Displayed Name16", value: "name16"},
    {id: 17, name: "Displayed Name17", value: "name17"},
    {id: 18, name: "Displayed Name18", value: "name18"},
    {id: 19, name: "Displayed Name19", value: "name19"},
    {id: 20, name: "Displayed Name20", value: "name20"},
    {id: 21, name: "Displayed Name21", value: "name21"}
];

// The randomly-generated derangement (see https://en.wikipedia.org/wiki/Derangement)
// Note: see PowerShell script Generate-Derangement.ps1 to get one
var derangement = {1: 8, 2: 19, 3: 13, 4: 16, 5: 2, 6: 7, 7: 15, 8: 17, 9: 3, 10: 4, 11: 6, 12: 20, 13: 12, 14: 21, 15: 9, 16: 10, 17: 11, 18: 14, 19: 1, 20: 5, 21: 18};

// Time to show the confirmation dialog (with the name you clicked on)
var confirmDurationMilliseconds = 5000;

// Time to show the display message (with the name of your match)
var displayDurationMilliseconds = 7500;

// Tell the JavaScript checkers that we can use some browser variables
/*global
    document, window, console, setTimeout
*/

/*-[ HTML element references ]-*/

// Display blocks
var nameChooser   = document.getElementById("nameChooser");
var nameConfirmer = document.getElementById("nameConfirmer");
var matchDisplay  = document.getElementById("matchDisplay");

// Form
var formSelect    = document.getElementById("formPart");

// Confirm name
var confirmValue  = document.getElementById("confirmValue");

// Match name
var matchValue    = document.getElementById("matchValue");

/*-[ Global variables ]-*/

// Global timer variables (kept here to allow for timer overrides when the user clicks the button)
var confirmTimer;
var displayTimer;

/*-[ Initialization code ]-*/

var p, part;

// Fill in the participant list
for (p = 0; p < participants.length; p = p + 1) {

    // Create one unique option per participant
    var opt = document.createElement("option");
    part = participants[p];

    // Fill the option with the values extracted from the database
    opt.text = part.name;
    opt.value = part.value;

    // Attempt to add the option to the list (simply log on failure)
    try {
        formSelect.add(opt, null);
    } catch (ex) {
        console.log("Failed to add participant \"" + part.name + "\".");
        console.log(ex);
    }

}

/*-[ Functions ]-*/

// Global functions

// Returns a participant, based on its value (typically used to find who was selected)
function getParticipantByValue(v) {

    "use strict";

    var p, part;

    // For each participant, compare the value; if a match is found, return the match
    for (p = 0; p < participants.length; p = p + 1) {

        part = participants[p];

        if (part.value === v) {
            return part;
        }
    }

    // Default return value do detect failed matches
    return undefined;

}

// Returns a participant, based on its ID (typically used to find the match in the derangement)
function getParticipantByID(i) {

    "use strict";

    var p, part;

    // For each participant, compare the ID; if a match is found, return the match
    for (p = 0; p < participants.length; p = p + 1) {

        part = participants[p];

        if (part.id === i) {
            return part;
        }

    }

    // Default return value do detect failed matches
    return undefined;

}

// Shorthand to set the name in the confirmation message
function setNameConfirm(name) {

    "use strict";

    confirmValue.innerHTML = name;
}

function setMatchValue(name) {

    "use strict";

    matchValue.innerHTML = name;
}

// Display control functions

// Show only the chooser (dropdown)
function showChooser() {

    "use strict";

    nameChooser.style.display   = "initial";
    nameConfirmer.style.display = "none";
    matchDisplay.style.display  = "none";
}

// Show only the confirm dialog (with the cancel button)
function showConfirmer() {

    "use strict";

    nameChooser.style.display   = "none";
    nameConfirmer.style.display = "initial";
    matchDisplay.style.display  = "none";
}

// Show only the match display message
function showDisplay() {

    "use strict";

    nameChooser.style.display   = "none";
    nameConfirmer.style.display = "none";
    matchDisplay.style.display  = "initial";
}

// Event functions

// Cancel showing something, and remove the corresponding timer
function cancelShow(t) {

    "use strict";


    // Clean everything to limit possible leaks
    formSelect.value = "none";
    showChooser();
    window.clearTimeout(t);

    setMatchValue("");
    setNameConfirm("");

}
// Shorthand functions to cancel timed displays
function cancelDialog() {

    "use strict";

    cancelShow(confirmTimer);
}

function cancelDisplay() {

    "use strict";

    cancelShow(displayTimer);
}

// Show the corresponding match
function showMatch() {

    "use strict";


  // Find who was selected and who is the match in the derangement
  // Note: it might be possible to pass values between showConfirm and showMatch; to be investigated.
    var p = getParticipantByValue(formSelect.value),
        srcID = p.id,
        dstID = derangement[srcID],
        m     = getParticipantByID(dstID);

    if (p === undefined) {
        // fail
        return;
    }

  // Set the name for the display message
    setMatchValue(m.name);
  // Show the display message
    showDisplay();
  // Set the timer to show the main form again at the end of the duration
    displayTimer = setTimeout(cancelShow, displayDurationMilliseconds);
}

// Show the name confirm dialog, once a value was chosen in the list
function showConfirm() {

    "use strict";

  // Find who was selected
    var p = getParticipantByValue(formSelect.value),
        name = p.name;


    if (p === undefined) {
        // fail
        return;
    }

  // Set the name for the confirmation dialog
    setNameConfirm(name);
  // Show the confirmation dialog
    showConfirmer();
  // Set the timer to show the match at the end of the duration
    confirmTimer = setTimeout(showMatch, confirmDurationMilliseconds);

}