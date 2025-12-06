const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1/safe-places";

export async function createSafeSpace(address: string, capacity: number, lat: number, lng: number) {
    const body = {
        address,
        capacity,
        lat,
        lng
    };

    const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return response.json();
}

const safeSpaceService = {
    createSafeSpace,
};

export default safeSpaceService;