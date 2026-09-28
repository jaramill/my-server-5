

async function fetchOccupancyStates() {
    
    try {
        const response = await fetch(`/api/occupancy-states`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const occupancyStates = await response.json();

        return occupancyStates;
        } catch (error) {
        console.error('Error fetching occupancy states:', error);
    }
};

async function fetchCleaningStates() {
    
    try {
        const response = await fetch(`/api/cleaning-states`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const cleaningStates = await response.json();

        return cleaningStates;

        } catch (error) {
        console.error('Error fetching cleaning states:', error);
    }
};

async function fetchOccupancyByDate(dateString) {
    
    try {
        const response = await fetch(`/api/occupancy/${dateString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const occupancyByRoomId = await response.json();

        return occupancyByRoomId;

        } catch (error) {
        console.error('Error fetching occupancy:', error);
    }
};

async function fetchCleaningByDate(dateString) {
    
    try {
        const response = await fetch(`/api/cleaning/${dateString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const cleaningByRoomId = await response.json();

        return cleaningByRoomId;

        } catch (error) {
        console.error('Error fetching cleaning:', error);
    }
};

function dateToDateString(date) {
    return date.toLocaleDateString('en-US', {
        //weekday: 'short', 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}