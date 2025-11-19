"use client";
import { useState, useEffect } from "react";
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation, useGetRestaurantSettingsQuery, useUpdateRestaurantSettingsMutation } from "../store/api/ownerApi";
import toast from "react-hot-toast";

export default function SettingsForm({ type, userId, restaurantId, branchId }) {
    const q = `${restaurantId}?branchId=${branchId}`;
    const { data: settings, isLoading, refetch: refetchResSettings } = type === 'user'
        ? useGetUserSettingsQuery(userId, { skip: !userId })
        : useGetRestaurantSettingsQuery(q, { skip: !restaurantId && !branchId });

    const [updateSettings, { isLoading: isUpdating }] = type === 'user'
        ? useUpdateUserSettingsMutation()
        : useUpdateRestaurantSettingsMutation();

    // Local form state
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (branchId) {
            refetchResSettings();
        }
    }, [branchId])

    // Initialize form data when settings are fetched
    useEffect(() => {
        if (settings) {
            setFormData({
                ...settings,
                businessHours: Array.isArray(settings.businessHours) ? settings.businessHours : [{ day: 'Monday', open: '09:00', close: '22:00' }],
            });
        } else if (type === 'user') {
            // Default user settings
            setFormData({
                notifications: { push: true, email: true, sms: false },
                preferences: { theme: 'light', language: 'en' }
            });
        } else if (type === 'restaurant') {
            // Default restaurant settings
            setFormData({
                currency: 'INR',
                taxPercent: 5,
                businessHours: [{ day: 'Monday', open: '09:00', close: '22:00' }],
                posSettings: { showItemImage: true, enableKOTSplit: true },
                branchId: branchId || ''
            });
        }
    }, [settings, type]);

    // Handle input changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle nested changes (e.g., notifications.push)
    const handleNestedChange = (parent, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    // Handle business hours changes
    const handleBusinessHourChange = (index, field, value) => {
        const newHours = [...formData.businessHours];
        newHours[index] = { ...newHours[index], [field]: value };
        setFormData((prev) => ({ ...prev, businessHours: newHours }));
    };

    const addBusinessHour = () => {
        setFormData((prev) => ({
            ...prev,
            businessHours: Array.isArray(prev.businessHours) ? [...prev.businessHours, { day: '', open: '', close: '' }] : [{ day: '', open: '', close: '' }]
        }));
    };

    const removeBusinessHour = (index) => {
        const newHours = formData.businessHours.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, businessHours: newHours }));
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { [type === 'user' ? 'userId' : 'restaurantId']: type === 'user' ? userId : restaurantId, ...formData };
            await updateSettings(payload).unwrap();
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    if (isLoading) return <div className="text-center py-4">Loading settings...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'user' && (
                <>
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.notifications?.push || false}
                                onChange={(e) => handleNestedChange('notifications', 'push', e.target.checked)}
                                className="mr-2"
                            />
                            Push Notifications
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.notifications?.email || false}
                                onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
                                className="mr-2"
                            />
                            Email Notifications
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.notifications?.sms || false}
                                onChange={(e) => handleNestedChange('notifications', 'sms', e.target.checked)}
                                className="mr-2"
                            />
                            SMS Notifications
                        </label>
                    </div>

                    <h3 className="text-lg font-semibold">Preferences</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Theme</label>
                            <select
                                value={formData.preferences?.theme || 'light'}
                                onChange={(e) => handleNestedChange('preferences', 'theme', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Language</label>
                            <select
                                value={formData.preferences?.language || 'en'}
                                onChange={(e) => handleNestedChange('preferences', 'language', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                {/* Add more options as needed */}
                            </select>
                        </div>
                    </div>
                </>
            )}

            {type === 'restaurant' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <select
                                value={formData.currency || 'INR'}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="JPY">JPY</option>
                                {/* Add more currencies as needed */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tax Percent</label>
                            <input
                                type="number"
                                value={formData.taxPercent || 5}
                                onChange={(e) => handleChange('taxPercent', parseFloat(e.target.value))}
                                className="border rounded px-3 py-2 w-full"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold">Business Hours</h3>
                    {formData.businessHours?.map((hour, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-end mb-2">
                            <select
                                value={hour.day}
                                onChange={(e) => handleBusinessHourChange(index, 'day', e.target.value)}
                                className="border rounded px-2 py-1"
                            >
                                <option value="">Select Day</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                            <input
                                type="time"
                                value={hour.open}
                                onChange={(e) => handleBusinessHourChange(index, 'open', e.target.value)}
                                className="border rounded px-2 py-1"
                            />
                            <input
                                type="time"
                                value={hour.close}
                                onChange={(e) => handleBusinessHourChange(index, 'close', e.target.value)}
                                className="border rounded px-2 py-1"
                            />
                            <button
                                type="button"
                                onClick={() => removeBusinessHour(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-sm w-32"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addBusinessHour}
                        className="bg-green-500 text-white px-4 py-2 rounded text-sm"
                    >
                        Add Hour
                    </button>

                    {/* <h3 className="text-lg font-semibold">POS Settings</h3>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.posSettings?.showItemImage || false}
                                onChange={(e) => handleNestedChange('posSettings', 'showItemImage', e.target.checked)}
                                className="mr-2"
                            />
                            Show Item Image
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.posSettings?.enableKOTSplit || false}
                                onChange={(e) => handleNestedChange('posSettings', 'enableKOTSplit', e.target.checked)}
                                className="mr-2"
                            />
                            Enable KOT Split
                        </label>
                    </div> */}
                </>
            )}
<div className="space-y-2">

            <button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
</div>
        </form>
    );
}
