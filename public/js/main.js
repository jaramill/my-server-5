const currentDateString = dateToDateString(new Date());

document.addEventListener("DOMContentLoaded", async () => {
    //console.log("DOM fully parsed and ready!");
    const specificSheet = document.getElementById("theme-styles").sheet;

    const occupancyStates = await fetchOccupancyStates();
    const cleaningStates = await fetchCleaningStates();

    //let cssRules = "";
    occupancyStates.forEach(state => {
        let cssRule = "";
        cssRule += `
        .occupancy${state.id} {
            background-color:${state.background_color};`;

        if (state.border == true) {

            cssRule += `
            border: 5px solid ${state.border_color};`;
        }

        if (state.stripes == true) {

            cssRule += `
            background: repeating-linear-gradient(-45deg,
                ${state.background_color},
                ${state.background_color} 10px,
                ${state.stripes_color} 10px,
                ${state.stripes_color} 20px
            );`;
        }
        cssRule += `
        }
        `;
        specificSheet.insertRule(cssRule, specificSheet.cssRules.length);
    });

    

    //let cssRules = "";
    cleaningStates.forEach(state => {
        let cssRule = "";
        cssRule += `
        .cleaning${state.id} {
            background-color:${state.background_color};`;

        if (state.border == true) {

            cssRule += `
            border: 5px solid ${state.border_color};`;
        }

        if (state.stripes == true) {

            cssRule += `
            background: repeating-linear-gradient(-45deg,
                ${state.background_color},
                ${state.background_color} 10px,
                ${state.stripes_color} 10px,
                ${state.stripes_color} 20px
            );`;
        }
        cssRule += `
        }
        `;
        specificSheet.insertRule(cssRule, specificSheet.cssRules.length);
    });

    let occupancyDivsVertical = "";
    occupancyDivsVertical += `<div class="p-2 d-flex justify-content-center">Occupancy</div>`;
    occupancyStates.forEach(state => {
        occupancyDivsVertical += `
            <div class="d-flex align-items-center my-1">
                <div class="me-2 occupancy${state.id} border border-dark" style="width: 1rem; height: 1rem">
                </div>
                <div>${(state.state)}
                </div>
            </div>
        `;
    });
    let cleaningDivsVertical = "";
    cleaningDivsVertical += `<div class="p-2 d-flex justify-content-center">Cleaning States</div>`;
    cleaningStates.forEach(state => {
        cleaningDivsVertical += `
            <div class="d-flex align-items-center my-1">
                <div class="me-2 cleaning${state.id} border border-dark" style="width: 1rem; height: 1rem">
                </div>
                <div>${(state.state)}
                </div>
            </div>
        `;
    });


    let occupancyDivsHorizontal = "";
    occupancyDivsHorizontal += `<div class="m-2 d-flex justify-content-center">`;
    occupancyStates.forEach(state => {
        occupancyDivsHorizontal += `
            <div class="mx-2">
                <button type="button" class="btn btn-outline-dark">
                    <span class="occupancy${state.id}">${(state.state)}</span>
                </button>
            </div>    
        `;
    });

    occupancyDivsHorizontal += `</div>`
    document.getElementById("occupancy-menu").innerHTML = occupancyDivsHorizontal; 

    let cleaningDivsHorizontal = "";
    cleaningDivsHorizontal += `<div class="p-2 d-flex justify-content-center">`;
    cleaningStates.forEach(state => {
        cleaningDivsHorizontal += `
             <div class="mx-2">
                <button type="button" class="btn btn-outline-dark">
                    <span class="cleaning${state.id}">${(state.state)}</span>
                </button>
            </div>  
        `;
    });
    cleaningDivsHorizontal += `</div>`

    document.getElementById("cleaning-menu").innerHTML = cleaningDivsHorizontal; 

    document.getElementById("legend-contents").innerHTML = `
        <div class="row">
            <div class="col">
                ${occupancyDivsVertical}
            </div>
            <div class="col">
                ${cleaningDivsVertical}
            </div>
        </div>
        `;


    // document.getElementById("popoverContentTemplate").innerHTML = legendDivs;

    // // Initialize all popovers on the page

    // const popoverButton = document.getElementById('myPopoverBtn');
    // const contentTemplate = document.getElementById('popoverContentTemplate');

    // new bootstrap.Popover(popoverButton, {
    //     trigger: 'focus',
    //     html: true,
    //     title: 'States',
    //     content: contentTemplate.innerHTML,
    //     sanitize: false // Optional: Disable if Bootstrap strips out complex custom elements
    // });

    const selectedDate = new Date();

    const prevButtons = document.querySelectorAll('.prevButton');
    prevButtons.forEach(prevButton => {
        prevButton.addEventListener('click', () => {
            changeDate(selectedDate, -1);

        });
    });
    const nextButtons = document.querySelectorAll('.nextButton');
    nextButtons.forEach(nextButton => {
        nextButton.addEventListener('click', () => {
            changeDate(selectedDate, 1);

        });
    });

    document.getElementById("changeOccupancy").addEventListener('click', () => {
        const mapButtons = document.querySelectorAll('.-button');
        mapButtons.forEach((button) => {
            button.classList.toggle('d-none');
        });
        const mapCheckboxes = document.querySelectorAll('.map-room-checkbox');
        mapCheckboxes.forEach((button) => {
            button.classList.toggle('d-none');
        });

    });

    document.getElementById("changeCleaning").addEventListener('click', () => {
        const mapButtons = document.querySelectorAll('.-button');
        mapButtons.forEach((button) => {
            button.classList.toggle('d-none');
        });
        const mapCheckboxes = document.querySelectorAll('.map-room-checkbox');
        mapCheckboxes.forEach((button) => {
            button.classList.toggle('d-none');
        });

    });

    document.getElementById("assignToUser").addEventListener('click', () => {
        const mapButtons = document.querySelectorAll('.-button');
        mapButtons.forEach((button) => {
            button.classList.toggle('d-none');
        });
        const mapCheckboxes = document.querySelectorAll('.map-room-checkbox');
        mapCheckboxes.forEach((button) => {
            button.classList.toggle('d-none');
        });

    });

    updateDateDisplay(selectedDate);

    let occupancyResponse = await fetchOccupancyByDate(dateToDateString(selectedDate));
    let cleaningResponse = await fetchCleaningByDate(dateToDateString(selectedDate));
    renderRooms(true);

    function renderRooms(fadeBetweenRefreshes) {
        const roomIdByLayoutRoomId = { 1: "Room_1", 2: "Room_2", 3: "Room_3", 4: "Room_4", 5: "Room_5", 6: "Room_6", 7: "Room_7", 8: "Room_8", 9: "Room_9", 10: "Room_10", 11: "Room_11", 12: "Room_12", 13: "Room_13", 14: "Room_14", 16: "Room_16", 17: "Room_17", 18: "Room_18", 19: "Room_19", 20: "Room_20", 21: "Room_21", 22: "Room_22", 23: "Room_23", 24: "Room_24", 25: "Room_25", 26: "Room_26", 28: "Room_28", 29: "Room_29", 30: "Room_30", 31: "Room_31", 32: "Room_32", 33: "Room_33", 34: "Room_34", 35: "Room_35", 36: "Room_36", "ST": "Room_27" };

        const francisPlace2ndFloorLayout = [["Francis Place, 2nd Floor"], [12, 10, 8, 6, 5, "-"], [11, 9, 7, "-", 3, 4], ["-", "-", "-", "-", 1, 2]];
        const marianHall1stFloorLayout = [["Marian Hall, 1st Floor"], [24, 22, 20, 18, "-", 16], [23, 21, 19, 17, "-", "HK"], ["-", "-", "-", "-", 13, 14]];
        const marianHall2ndFloorLayout = [["Marian Hall, 2nd Floor"], [36, 34, 32, 30, "-", 28], [35, 33, 31, 29, "-", "ST"], ["-", "-", "-", "-", 25, 26]];

        const francisPlace2ndFloorList = ["Francis Place, 2nd Floor", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const marianHall1stFloorList = ["Marian Hall, 1st Floor", 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        const marianHall2ndFloorList = ["Marian Hall, 2nd Floor", 25, 26, "ST", 28, 29, 30, 31, 32, 33, 34, 35];

        if (!occupancyResponse.exists) {
            const alertElement = document.getElementById("alert-element");
            if (alertElement) {
                alertElement.classList.remove('d-none');
                document.getElementById('alert-text').innerText = "No occupancy data found for this date in database, please upload a csv file or update occupancy manually."
            }

        }

        const mapViewDiv = document.getElementById('mapViewContents');
        const listViewDiv = document.getElementById("listViewContents")
        if (fadeBetweenRefreshes) {

            mapViewDiv.classList.add('fading');
            listViewDiv.classList.add('fading');

            setTimeout(() => {
                mapViewDiv.innerHTML = renderRoomsMapMode([francisPlace2ndFloorLayout, marianHall1stFloorLayout, marianHall2ndFloorLayout], roomIdByLayoutRoomId);
                listViewDiv.innerHTML = renderRoomsListMode([francisPlace2ndFloorList, marianHall1stFloorList, marianHall2ndFloorList], roomIdByLayoutRoomId);

                // 3. Remove class to trigger fade-in transition
                mapViewDiv.classList.remove('fading');
                listViewDiv.classList.remove('fading');
            }, 300); // match this to your initial state duration if needed

        } else {
            mapViewDiv.innerHTML = renderRoomsMapMode([francisPlace2ndFloorLayout, marianHall1stFloorLayout, marianHall2ndFloorLayout], roomIdByLayoutRoomId);
            listViewDiv.innerHTML = renderRoomsListMode([francisPlace2ndFloorList, marianHall1stFloorList, marianHall2ndFloorList], roomIdByLayoutRoomId);

        }
    }

    function renderRoomsListMode(layouts, roomIdByLayoutRoomId) {
        let html = "";

        html += `
            <div class="row">
            `;
        layouts.forEach((layout, layoutIndex) => {

            const header = layout[0];
            const cells = layout.splice(1);

            html += `
                <div class="col-sm"> 
            `;
            html += `
                    <div class="row">
                        <div class="col h-100">
                                <button class="btn btn-outline-dark d-flex h-100 w-100 align-items-center justify-content-between" 
                                    type="button" 
                                    data-bs-toggle="collapse" 
                                    data-bs-target="#collapse${layoutIndex}" 
                                    aria-expanded="false" 
                                    aria-controls="collapse${layoutIndex}">
                                    <span class="fs-6">${header}</span>
                                    <span class="toggle-icon"></span>
                                </button>  
                            
                        </div>   
                    </div>
                    <div class="collapse show" id="collapse${layoutIndex}">
                    
                        <table id="table${layoutIndex}" class="table table-bordered mb-0">
                            <thead>
                                <tr>
                                    <th class="w-auto" scope="col">Room</th>
                                    <th scope="col">Occupancy</th>
                                    <th scope="col">Cleaning</th>
                                </tr>
                            </thead>
                            <tbody>
                        `;

            cells.forEach((cell, index) => {
                let occupancyStatusId = "Undefined";
                let cleaningStatusId = "Undefined";
                 
                const roomId = roomIdByLayoutRoomId[cell];
                if (occupancyResponse.exists) {
                    occupancyStatusId = occupancyResponse.data[roomId];
                }
                if (cleaningResponse.exists) {
                    cleaningStatusId = cleaningResponse.data[roomId];
                }
                html += ` 
                                <tr>
                                    <td id="${roomId}" style="height: 55px;">
                                        <p class="fs-4 mb-1">${cell}</p>
                                    </td>
                                    <td id="${roomId}occupancy" class="p-0 position-relative">
                                        <div class="occupancy${occupancyStatusId} w-100 h-100">
                                            TEST
                                        </div>
                                    </td> 
                                    <td id="${roomId}cleaning">
                                        <div class="cleaning${cleaningStatusId}">
                                            TEST
                                        </div>
                                    </td>                
                                </tr>
                                `;
            });
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>`;
        });
        html += `
            </div>`;

        return html;

    };
    function renderRoomsMapMode(layouts, roomIdByLayoutRoomId) {
        let html = "";
        layouts.forEach((layout) => {
            layout.forEach((element) => {

                if (element.length == 6) {

                    html += `
                    <div class="row gx-0 gx-md-3" style="height: 55px;">
                    `;

                    element.forEach(cell => {
                        html += makeCellHtml(cell, roomIdByLayoutRoomId);
                    });
                    html += `
                    </div>`;

                } else if (element.length == 1) {
                    // header
                    html += `
                    <div class="row">
                        <div class="d-block d-md-none">
                            <hr>
                        </div>
                        <h6 class="d-none d-md-block my-2">${element}</h6>
                    </div>
                    `;
                }
            });
        });
        return html;

        function makeCellHtml(cell, roomIdByLayoutRoomId) {

            let cellHtml = "";

            if (cell == "HK") {
                cellHtml = `
                                <div class="col-2" style=" border: 1px solid; margin-top: -1px; margin-left: -1px">
                                </div>
                            `;
            } else if (cell !== "-") {

                let roomId = roomIdByLayoutRoomId[cell];
                let occupancyStatusId = "Undefined";
                let cleaningStatusId = "Undefined";

                if (occupancyResponse.exists) {
                    occupancyStatusId = occupancyResponse.data[roomId];
                }
                if (cleaningResponse.exists) {
                    cleaningStatusId = cleaningResponse.data[roomId];
                }
                cellHtml = `
                                <div id="${roomId}" class="col-2 position-relative" style="border: 1px solid; margin-top: -1px; margin-left: -1px">
                                    <div class="position-absolute top-0 start-0 w-100 h-100 occupancy${occupancyStatusId}" id="${roomId}occupancy">
                                    </div>
                                    <div class="dropdown position-absolute top-0 start-0 w-100 h-100 d-flex p-2">
                                        <div class="w-100 h-100 cleaning${cleaningStatusId}" id="${roomId}cleaning">
                                        </div>
                                    </div>
                                    <div class="dropdown position-absolute top-0 start-0 w-100 h-100 d-flex">
                                        
                                        <button class="btn btn-outline-success w-100 h-100 dropdown-toggle d-flex justify-content-center align-items-center map-room-button" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                                            <p class="fs-4 mb-1">${cell}</p>
                                        </button>
                                        <div class="dropdown-menu">
                                            <div><h6 class="dropdown-header pb-0">Select Cleaning State:</h6></div>
                                            ${makeDropdownForCleaning(cell, roomId)}
                                        </div>
                                        
                                    </div>
                                    <div class="form-check position-absolute top-0 end-0">
                                        <input class="form-check-input map-room-checkbox d-none m-1" type="checkbox" id="${cell}">
                                        <label for="room-checkbox"></label>
                                    </div>
                                </div>
                            `;
            } else {
                cellHtml = `
                                <div class="col-2" style="margin-top: -1px; margin-left: -1px">
                                </div>
                            `;
            };
            return cellHtml;
        }

        function makeDropdownForCleaning(cell, roomId) {
            let cleaningButtonsForDropdown = "";

            cleaningStates.forEach((state) => {
                cleaningButtonsForDropdown += `
            <hr>
                <div class="dropdown-item d-flex align-items-center" style="height: 2rem" role="button" onclick="changeCleaningState('${roomId}', '${state.id}')">
                    <div class="mx-1 cleaning${state.id}" style="width: 1rem; height: 1rem">
                    </div>
                    <div>
                        ${state.state}
                    </div>
                </div>

            `;
            });
            return cleaningButtonsForDropdown;
        }
    };

    // Handler to shift days and handle automatic month/year rollovers
    async function changeDate(selectedDate, daysToMove) {
        selectedDate.setDate(selectedDate.getDate() + daysToMove);
        updateDateDisplay(selectedDate);
        occupancyResponse = await fetchOccupancyByDate(dateToDateString(selectedDate));
        cleaningResponse = await fetchCleaningByDate(dateToDateString(selectedDate));
        renderRooms(true);
    }



});



// Function to render the formatted date text
async function updateDateDisplay(selectedDate) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    // Output format example: "Sun, Jul 5, 2026"
    const dateDisplays = document.querySelectorAll('.dateDisplay');
    dateDisplays.forEach(dateDisplay => {
        dateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);

    });

}

async function changeCleaningState(roomId, cleaningStateId) {

    try {
        //spinner.classList.remove("d-none");
        
        const response = await fetch(`/api/cleaning`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({currentDateString, roomId, cleaningStateId})
        });

        if (response.ok) {
            const dbResponse = await response.json();

            const [[key, value]] = Object.entries(dbResponse);
            const cleaningElement = document.getElementById(`${key}cleaning`);
            cleaningElement.classList.add(`cleaning${value}`);

        } else {
            const errData = await response.json();
            alert(`Error: ${errData.error}`);
        }
    } catch (error) {
        console.error('Error adding occupancy:', error);
    } finally{
        //spinner.classList.add("d-none");
    }


}




