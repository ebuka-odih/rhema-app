import { API_BASE_URL } from './apiConfig';
import { authService } from './auth';
import { FastingSession, FastingGroup } from '../types';

export const fastingService = {
    async getActiveSession(): Promise<FastingSession | null> {
        const token = await authService.getToken();
        try {
            const response = await fetch(`${API_BASE_URL}fasting/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.error('Fetch active fast error:', e);
        }
        return null;
    },

    async startFast(durationHours: number, recommendVerses: boolean, reminderInterval?: number): Promise<FastingSession> {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}fasting`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                duration_hours: durationHours,
                recommend_verses: recommendVerses,
                reminder_interval: reminderInterval
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to start fast');
        }

        return await response.json();
    },

    async endFast(sessionId: string, status: 'completed' | 'cancelled'): Promise<FastingSession> {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}fasting/${sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to end fast');
        }

        return await response.json();
    },

    async getGroups(): Promise<FastingGroup[]> {
        const token = await authService.getToken();
        try {
            const response = await fetch(`${API_BASE_URL}groups/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                return data.map((g: any) => ({
                    id: g.id.toString(),
                    name: g.name,
                    description: g.description,
                    members: g.members_count ?? (g.members?.length || 0),
                    joined: false,
                    code: g.code
                }));
            }
        } catch (e) {
            console.error('Fetch groups error:', e);
        }
        return [];
    },

    async getUserGroups(): Promise<FastingGroup[]> {
        const token = await authService.getToken();
        try {
            const response = await fetch(`${API_BASE_URL}groups`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                return data.map((g: any) => ({
                    id: g.id.toString(),
                    name: g.name,
                    description: g.description,
                    members: g.members_count ?? (g.members?.length || 0),
                    joined: true,
                    code: g.code
                }));
            }
        } catch (e) {
            console.error('Fetch user groups error:', e);
        }
        return [];
    },

    async createGroup(name: string, description: string): Promise<FastingGroup> {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, description }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create group');
        }

        const g = await response.json();
        return {
            id: g.id.toString(),
            name: g.name,
            description: g.description,
            members: g.members_count ?? (g.members?.length || 1),
            joined: true,
            code: g.code
        };
    },

    async joinGroup(code: string): Promise<FastingGroup> {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}groups/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ code: code.toUpperCase() }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to join group');
        }

        const g = await response.json();
        return {
            id: g.id.toString(),
            name: g.name,
            description: g.description,
            members: g.members_count ?? (g.members?.length || 0),
            joined: true,
            code: g.code
        };
    },

    async leaveGroup(groupId: string): Promise<void> {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}groups/${groupId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Failed to leave group');
        }
    }
};
