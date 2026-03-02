const projectId = "gala-checkin-system";

const dummyTickets = [
    {
        name: "Cancel Test User One",
        phone: "5081111111",
        id: "CNY26-TEST1"
    },
    {
        name: "Cancel Test User Two",
        phone: "5082222222",
        id: "CNY26-TEST2"
    },
    {
        name: "Cancel Test User Three",
        phone: "5083333333",
        id: "CNY26-TEST3"
    }
];

async function createDummies() {
    for (const ticket of dummyTickets) {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reservations/${ticket.id}`;

        const body = {
            fields: {
                id: { stringValue: ticket.id },
                contactName: { stringValue: ticket.name },
                phoneNumber: { stringValue: ticket.phone },
                email: { stringValue: "test@example.com" },
                adults: { integerValue: "1" },
                children: { integerValue: "0" },
                ticketType: { stringValue: "Regular" },
                checkInStatus: { stringValue: "Registered" },
                timestamp: { stringValue: new Date().toISOString() },
                isPerformer: { booleanValue: false },
                performanceUnit: { stringValue: "" }
            }
        };

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                console.log(`Created dummy ticket: ${ticket.id}`);
            } else {
                const errorText = await response.text();
                console.error(`Failed to create ${ticket.id}:`, errorText);
            }
        } catch (e) {
            console.error(`Error with ${ticket.id}:`, e);
        }
    }
}

createDummies();
